"use server";

import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Strategy, { IStrategyDocument } from "@/models/Strategy";
import Trade from "@/models/Trade";
import { strategySchema, StrategyFormValues } from "@/lib/validations";
import { revalidatePath, unstable_cache } from "next/cache";
import mongoose from "mongoose";

export type CreateStrategyInput = StrategyFormValues;
export type UpdateStrategyInput = Partial<StrategyFormValues>;

export async function calculateStrategyPerformance(strategyId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await connectDB();

    // Fetch all closed trades for this strategy
    const trades = await Trade.find({
      userId: session.user.id,
      strategy: strategyId,
      status: "CLOSED",
    });

    const totalTrades = trades.length;

    if (totalTrades === 0) {
      // Reset metrics if no trades
      await Strategy.findByIdAndUpdate(strategyId, {
        performance: {
          totalTrades: 0,
          winRate: 0,
          profitFactor: 0,
          avgRiskReward: 0,
          maxDrawdown: 0,
          netPnl: 0,
        },
      });
      return {
        totalTrades: 0,
        winRate: 0,
        profitFactor: 0,
        avgRiskReward: 0,
        maxDrawdown: 0,
        netPnl: 0,
      };
    }

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

    // Avg Risk Reward calculation
    let totalRiskReward = 0;
    let rrCount = 0;

    trades.forEach((t) => {
      const entry = t.entryPrice;
      const exit = t.exitPrice || 0;
      const stop = t.stopLoss;
      const risk = Math.abs(entry - stop);

      if (risk > 0) {
        const reward = t.type === "BUY" ? exit - entry : entry - exit;
        // Only consider winners for "Avg R:R for winners" as per common practice?
        // Prompt says: "avg(profit/risk) for winners"
        if (reward > 0) {
          totalRiskReward += reward / risk;
          rrCount++;
        }
      }
    });

    const avgRiskReward = rrCount > 0 ? totalRiskReward / rrCount : 0;

    // Max Drawdown
    // Sort trades by exit date
    const sortedTrades = [...trades].sort((a, b) => {
      const dateA = a.exitDate ? new Date(a.exitDate).getTime() : 0;
      const dateB = b.exitDate ? new Date(b.exitDate).getTime() : 0;
      return dateA - dateB;
    });

    let peak = 0;
    let maxDrawdown = 0;
    let runningPnl = 0;

    for (const trade of sortedTrades) {
      runningPnl += trade.pnl || 0;
      if (runningPnl > peak) peak = runningPnl;
      const drawdown = peak - runningPnl;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }

    const performance = {
      totalTrades,
      winRate,
      profitFactor,
      avgRiskReward,
      maxDrawdown,
      netPnl,
    };

    await Strategy.findByIdAndUpdate(strategyId, { performance });

    return performance;
  } catch (error) {
    console.error("Calculate strategy performance error:", error);
    // Don't throw here to avoid breaking the calling flow if used as a background task
    return null;
  }
}

export async function createStrategy(data: CreateStrategyInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await connectDB();

    // Validate input
    const validatedData = strategySchema.parse(data);

    const newStrategy = await Strategy.create({
      ...validatedData,
      userId: session.user.id,
      status: "active",
      performance: {
        totalTrades: 0,
        winRate: 0,
        profitFactor: 0,
        avgRiskReward: 0,
        maxDrawdown: 0,
        netPnl: 0,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/strategies");

    return { success: true, strategyId: newStrategy._id.toString() };
  } catch (error) {
    console.error("Create strategy error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create strategy",
    };
  }
}

export async function updateStrategy(
  strategyId: string,
  data: UpdateStrategyInput,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await connectDB();

    const strategy = await Strategy.findOne({
      _id: strategyId,
      userId: session.user.id,
    });

    if (!strategy) {
      throw new Error("Strategy not found");
    }

    // Merge data
    Object.assign(strategy, data);
    await strategy.save();

    // Recalculate performance if needed?
    // Usually manual update of strategy details doesn't affect calculated performance (which is based on trades)
    // Unless we want to trigger a recalc explicitly.
    // The prompt says "Recalculate performance if needed".
    // Changing name/description/rules doesn't affect performance.
    // So we'll skip calling calculateStrategyPerformance here unless strictly required.

    revalidatePath("/dashboard");
    revalidatePath("/strategies");
    revalidatePath(`/strategies/${strategyId}`);

    return { success: true, strategy: JSON.parse(JSON.stringify(strategy)) };
  } catch (error) {
    console.error("Update strategy error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update strategy",
    };
  }
}

export async function deleteStrategy(strategyId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await connectDB();

    // Verify ownership and check for trades
    const strategy = await Strategy.findOne({
      _id: strategyId,
      userId: session.user.id,
    });

    if (!strategy) {
      throw new Error("Strategy not found");
    }

    const tradeCount = await Trade.countDocuments({
      strategy: strategyId,
      userId: session.user.id,
    });

    if (tradeCount > 0) {
      return {
        success: false,
        error: `Cannot delete strategy with ${tradeCount} associated trades. Please delete or reassign the trades first.`,
      };
    }

    await Strategy.deleteOne({ _id: strategyId });

    revalidatePath("/dashboard");
    revalidatePath("/strategies");

    return { success: true };
  } catch (error) {
    console.error("Delete strategy error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete strategy",
    };
  }
}

export async function getStrategies() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Use unstable_cache for caching strategies
    const getCachedStrategies = unstable_cache(
      async (userId: string) => {
        await connectDB();
        const strategies = await Strategy.find({ userId })
          .sort({ createdAt: -1 })
          .lean();
        return JSON.parse(JSON.stringify(strategies));
      },
      [`strategies-${session.user.id}`],
      {
        tags: [`strategies-${session.user.id}`],
        revalidate: 3600, // Cache for 1 hour, or until invalidated
      },
    );

    const strategies = await getCachedStrategies(session.user.id);
    return strategies;
  } catch (error) {
    console.error("Get strategies error:", error);
    throw new Error("Failed to fetch strategies");
  }
}
