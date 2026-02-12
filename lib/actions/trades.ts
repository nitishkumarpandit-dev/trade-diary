"use server";

import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Trade, { ITradeDocument } from "@/models/Trade";
import User from "@/models/User";
import Strategy from "@/models/Strategy";
import { tradeSchema, TradeFormValues } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { unstable_cache } from "next/cache";
import mongoose from "mongoose";
import { z } from "zod";

export type CreateTradeInput = TradeFormValues & {
  status?: "OPEN" | "CLOSED";
  pnl?: number;
  pnlPercentage?: number;
};
export type UpdateTradeInput = Partial<TradeFormValues> & {
  status?: "OPEN" | "CLOSED";
  pnl?: number;
  pnlPercentage?: number;
};

export interface TradeFilters {
  symbol?: string;
  strategy?: string;
  status?: "OPEN" | "CLOSED";
  dateRange?: {
    from: Date;
    to: Date;
  };
  page?: number;
  limit?: number;
}

// Helper to recalculate strategy metrics
async function updateStrategyMetrics(strategyId: string, userId: string) {
  try {
    const trades = await Trade.find({
      userId,
      strategy: strategyId,
      status: "CLOSED",
    });

    const totalTrades = trades.length;
    if (totalTrades === 0) return;

    const wins = trades.filter((t) => (t.pnl || 0) > 0).length;
    const winRate = (wins / totalTrades) * 100;
    const netPnl = trades.reduce((acc, t) => acc + (t.pnl || 0), 0);

    const grossProfit = trades
      .filter((t) => (t.pnl || 0) > 0)
      .reduce((acc, t) => acc + (t.pnl || 0), 0);
    const grossLoss = trades
      .filter((t) => (t.pnl || 0) < 0)
      .reduce((acc, t) => acc + Math.abs(t.pnl || 0), 0);
    const profitFactor =
      grossLoss === 0 ? grossProfit : grossProfit / grossLoss;

    // Avg Risk Reward (assuming risk is stopLoss distance and reward is realized PnL)
    // This is an approximation. A better way is if the user logs R:R.
    // For now, let's skip complex R:R calculation or use simple PnL avg.
    // The prompt asked for "avgRiskReward".
    // We can calculate realized R:R for each trade: (Exit - Entry) / (Entry - StopLoss)
    let totalRiskReward = 0;
    let rrCount = 0;

    trades.forEach((t) => {
      const entry = t.entryPrice;
      const exit = t.exitPrice || 0;
      const stop = t.stopLoss;
      const risk = Math.abs(entry - stop);
      if (risk > 0) {
        const reward = t.type === "BUY" ? exit - entry : entry - exit;
        totalRiskReward += reward / risk;
        rrCount++;
      }
    });
    const avgRiskReward = rrCount > 0 ? totalRiskReward / rrCount : 0;

    // Max Drawdown (simplified: max drop in cumulative PnL)
    let peak = -Infinity;
    let maxDrawdown = 0;
    let runningPnl = 0;

    // Sort trades by exit date for drawdown calculation
    const sortedTrades = [...trades].sort((a, b) => {
      const dateA = a.exitDate ? new Date(a.exitDate).getTime() : 0;
      const dateB = b.exitDate ? new Date(b.exitDate).getTime() : 0;
      return dateA - dateB;
    });

    for (const trade of sortedTrades) {
      runningPnl += trade.pnl || 0;
      if (runningPnl > peak) peak = runningPnl;
      const drawdown = peak - runningPnl;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }

    await Strategy.findByIdAndUpdate(strategyId, {
      performance: {
        totalTrades,
        winRate,
        profitFactor,
        avgRiskReward,
        maxDrawdown,
        netPnl,
      },
    });
  } catch (error) {
    console.error("Failed to update strategy metrics:", error);
  }
}

export async function createTrade(data: CreateTradeInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;
    await connectDB();

    // 1. Validate Input
    const validatedData = tradeSchema.parse(data);

    // 2. Check Monthly Limits
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const now = new Date();
    // Check if reset is needed (if current date is past resetDate)
    if (user.plan.resetDate && now > user.plan.resetDate) {
      // Reset Logic: Set resetDate to next month
      const nextMonth = new Date(user.plan.resetDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      user.plan.tradesUsed = 0;
      user.plan.resetDate = nextMonth;
      await user.save();
    }

    if (user.plan.tradesUsed >= user.plan.monthlyTradesLimit) {
      throw new Error(
        "Monthly trade limit reached. Upgrade your plan for more.",
      );
    }

    // 3. Create Trade
    const newTrade = await Trade.create({
      ...validatedData,
      userId,
      status: "OPEN", // Default to OPEN unless exit details provided?
      // If exitPrice is provided, it might be a closed trade logging
    });

    // Handle case where user logs a completed trade immediately
    if (validatedData.exitPrice && validatedData.exitDate) {
      newTrade.status = "CLOSED";
      const quantity = validatedData.quantity;
      const fees = validatedData.fees || 0;

      let pnl = 0;
      if (validatedData.type === "BUY") {
        pnl =
          (validatedData.exitPrice - validatedData.entryPrice) * quantity -
          fees;
      } else {
        pnl =
          (validatedData.entryPrice - validatedData.exitPrice) * quantity -
          fees;
      }

      const costBasis = validatedData.entryPrice * quantity;
      const pnlPercentage = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

      newTrade.pnl = pnl;
      newTrade.pnlPercentage = pnlPercentage;
      await newTrade.save();

      // Update strategy metrics
      await updateStrategyMetrics(validatedData.strategy, userId);
    }

    // 4. Increment usage
    user.plan.tradesUsed += 1;
    await user.save();

    revalidatePath("/dashboard");
    revalidatePath("/trades");

    return { success: true, tradeId: newTrade._id.toString() };
  } catch (error) {
    console.error("Create trade error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create trade",
    };
  }
}

export async function updateTrade(tradeId: string, data: UpdateTradeInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await connectDB();

    const trade = await Trade.findOne({
      _id: tradeId,
      userId: session.user.id,
    });
    if (!trade) {
      throw new Error("Trade not found");
    }

    // Merge data
    const updatedData = { ...data };

    // Calculate PnL if closing
    if (
      (updatedData.status === "CLOSED" ||
        (updatedData.exitPrice && updatedData.exitDate)) &&
      trade.status !== "CLOSED"
    ) {
      updatedData.status = "CLOSED";
      const entryPrice = updatedData.entryPrice ?? trade.entryPrice;
      const exitPrice = updatedData.exitPrice ?? trade.exitPrice;
      const quantity = updatedData.quantity ?? trade.quantity;
      const fees = updatedData.fees ?? trade.fees ?? 0;
      const type = updatedData.type ?? trade.type;

      if (exitPrice !== undefined && exitPrice !== null) {
        let pnl = 0;
        if (type === "BUY") {
          pnl = (exitPrice - entryPrice) * quantity - fees;
        } else {
          pnl = (entryPrice - exitPrice) * quantity - fees;
        }

        const costBasis = entryPrice * quantity;
        const pnlPercentage = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

        updatedData.pnl = pnl;
        updatedData.pnlPercentage = pnlPercentage;
      }
    }

    Object.assign(trade, updatedData);
    await trade.save();

    // Update metrics if strategy or pnl changed
    if (trade.status === "CLOSED") {
      await updateStrategyMetrics(trade.strategy, session.user.id);
    }

    revalidatePath("/dashboard");
    revalidatePath("/trades");
    revalidatePath(`/trades/${tradeId}`);

    return { success: true, trade: JSON.parse(JSON.stringify(trade)) };
  } catch (error) {
    console.error("Update trade error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update trade",
    };
  }
}

export async function deleteTrade(tradeId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await connectDB();
    const trade = await Trade.findOneAndDelete({
      _id: tradeId,
      userId: session.user.id,
    });

    if (!trade) {
      throw new Error("Trade not found");
    }

    // Update strategy metrics if it was a closed trade
    if (trade.status === "CLOSED") {
      await updateStrategyMetrics(trade.strategy, session.user.id);
    }

    // Decrement usage? Usually not, limits are "trades created".
    // If we want to be nice we could decrement, but usually limits are on "actions".
    // Let's leave usage as is.

    revalidatePath("/dashboard");
    revalidatePath("/trades");

    return { success: true };
  } catch (error) {
    console.error("Delete trade error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete trade",
    };
  }
}

export async function getTrades(filters: TradeFilters = {}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const {
      symbol,
      strategy,
      status,
      dateRange,
      page = 1,
      limit = 10,
    } = filters;
    const skip = (page - 1) * limit;

    const query: any = {
      userId: session.user.id,
    };

    if (symbol) query.symbol = { $regex: symbol, $options: "i" };
    if (strategy) query.strategy = strategy;
    if (status) query.status = status;
    if (dateRange) {
      query.entryDate = { $gte: dateRange.from, $lte: dateRange.to };
    }

    await connectDB();

    const [trades, total] = await Promise.all([
      Trade.find(query).sort({ entryDate: -1 }).skip(skip).limit(limit).lean(),
      Trade.countDocuments(query),
    ]);

    return {
      trades: JSON.parse(JSON.stringify(trades)),
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Get trades error:", error);
    throw new Error("Failed to fetch trades");
  }
}

export async function getTradeById(tradeId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await connectDB();
    const trade = await Trade.findOne({
      _id: tradeId,
      userId: session.user.id,
    }).lean();

    if (!trade) {
      throw new Error("Trade not found");
    }

    return JSON.parse(JSON.stringify(trade));
  } catch (error) {
    console.error("Get trade by ID error:", error);
    throw new Error("Failed to fetch trade");
  }
}
