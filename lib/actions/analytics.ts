"use server";

import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Trade from "@/models/Trade";
import Strategy from "@/models/Strategy";
import mongoose from "mongoose";
import { unstable_cache } from "next/cache";

// Helper to calculate Max Drawdown from an array of PnL values ordered by date
function calculateMaxDrawdown(pnls: number[]) {
  let peak = 0;
  let maxDrawdown = 0;
  let runningPnl = 0;

  for (const pnl of pnls) {
    runningPnl += pnl;
    if (runningPnl > peak) peak = runningPnl;
    const drawdown = peak - runningPnl;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }
  return maxDrawdown;
}

async function getMetricsForPeriod(
  userId: mongoose.Types.ObjectId,
  from?: Date,
  to?: Date,
) {
  const matchStage: {
    userId: mongoose.Types.ObjectId;
    status: "CLOSED";
    exitDate?: { $gte: Date; $lte: Date };
  } = {
    userId: userId,
    status: "CLOSED",
  };

  if (from && to) {
    matchStage.exitDate = { $gte: from, $lte: to };
  }

  const [aggResult] = await Trade.aggregate([
    { $match: matchStage },
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: null,
              totalPnL: { $sum: "$pnl" },
              totalTrades: { $count: {} },
              winningTrades: {
                $sum: { $cond: [{ $gt: ["$pnl", 0] }, 1, 0] },
              },
              grossProfit: {
                $sum: { $cond: [{ $gt: ["$pnl", 0] }, "$pnl", 0] },
              },
              grossLoss: {
                $sum: {
                  $cond: [{ $lt: ["$pnl", 0] }, { $abs: "$pnl" }, 0],
                },
              },
            },
          },
        ],
        // Sort by exitDate for drawdown calculation
        pnlStream: [{ $sort: { exitDate: 1 } }, { $project: { pnl: 1 } }],
      },
    },
  ]);

  const totals = aggResult?.totals?.[0] || {
    totalPnL: 0,
    totalTrades: 0,
    winningTrades: 0,
    grossProfit: 0,
    grossLoss: 0,
  };

  const winRate =
    totals.totalTrades > 0
      ? (totals.winningTrades / totals.totalTrades) * 100
      : 0;

  const profitFactor =
    totals.grossLoss === 0
      ? totals.grossProfit
      : totals.grossProfit / totals.grossLoss;

  const avgProfit =
    totals.totalTrades > 0 ? totals.totalPnL / totals.totalTrades : 0;

  // Calculate Max Drawdown from sorted PnL stream
  const pnls =
    aggResult?.pnlStream?.map((t: { pnl?: number }) => t.pnl || 0) || [];
  const maxDrawdown = calculateMaxDrawdown(pnls);

  return {
    totalPnL: totals.totalPnL,
    winRate,
    maxDrawdown,
    totalTrades: totals.totalTrades,
    avgProfit,
    profitFactor,
  };
}

export async function getDashboardMetrics(dateRange?: {
  from: Date;
  to: Date;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await connectDB();
    const userId = new mongoose.Types.ObjectId(session.user.id);

    // Get current period metrics
    const currentMetrics = await getMetricsForPeriod(
      userId,
      dateRange?.from,
      dateRange?.to,
    );

    let previousMetrics = null;

    // Calculate previous period if dateRange is provided
    if (dateRange) {
      const duration = dateRange.to.getTime() - dateRange.from.getTime();
      // Previous period ends just before current period starts
      const prevTo = new Date(dateRange.from.getTime() - 1);
      // Previous period has same duration
      const prevFrom = new Date(prevTo.getTime() - duration);

      previousMetrics = await getMetricsForPeriod(userId, prevFrom, prevTo);
    }

    // Calculate changes (percentage or absolute difference)
    const calculateChange = (current: number, previous: number) => {
      if (!previousMetrics) return 0;
      if (previous === 0) return current === 0 ? 0 : 100; // Handle division by zero
      return ((current - previous) / Math.abs(previous)) * 100;
    };

    // For win rate and max drawdown, absolute difference might be more intuitive,
    // but consistency usually implies percentage change.
    // However, for percentages (Win Rate), usually "points" change is better,
    // but let's stick to percentage change of the value for consistency or
    // simple difference. Let's use simple difference for percentages?
    // User asked for "change indicators". Usually +5% means value increased by 5%.

    // Let's stick to standard percentage change formula for non-percentage values.
    // For Win Rate (0-100), a change from 50% to 60% is a 20% increase ((60-50)/50).

    return {
      ...currentMetrics,
      totalPnLChange: calculateChange(
        currentMetrics.totalPnL,
        previousMetrics?.totalPnL || 0,
      ),
      winRateChange: calculateChange(
        currentMetrics.winRate,
        previousMetrics?.winRate || 0,
      ),
      maxDrawdownChange: calculateChange(
        currentMetrics.maxDrawdown,
        previousMetrics?.maxDrawdown || 0,
      ),
      totalTradesChange: calculateChange(
        currentMetrics.totalTrades,
        previousMetrics?.totalTrades || 0,
      ),
      avgProfitChange: calculateChange(
        currentMetrics.avgProfit,
        previousMetrics?.avgProfit || 0,
      ),
      profitFactorChange: calculateChange(
        currentMetrics.profitFactor,
        previousMetrics?.profitFactor || 0,
      ),
    };
  } catch (error) {
    console.error("Get dashboard metrics error:", error);
    throw new Error("Failed to fetch dashboard metrics");
  }
}

export async function getEquityCurve(dateRange?: { from: Date; to: Date }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await connectDB();
    const userId = new mongoose.Types.ObjectId(session.user.id);

    const matchStage: {
      userId: mongoose.Types.ObjectId;
      status: "CLOSED";
      exitDate?: { $gte: Date; $lte: Date };
    } = {
      userId: userId,
      status: "CLOSED",
    };

    if (dateRange) {
      matchStage.exitDate = { $gte: dateRange.from, $lte: dateRange.to };
    }

    const trades = await Trade.find(matchStage)
      .sort({ exitDate: 1 })
      .select("exitDate pnl")
      .lean();

    let cumulativePnL = 0;
    const equityCurve = trades.map((trade) => {
      cumulativePnL += trade.pnl || 0;
      return {
        date: trade.exitDate,
        value: cumulativePnL,
      };
    });

    return JSON.parse(JSON.stringify(equityCurve));
  } catch (error) {
    console.error("Get equity curve error:", error);
    throw new Error("Failed to fetch equity curve");
  }
}

export async function getPerformanceByStrategy() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await connectDB();
    const userId = new mongoose.Types.ObjectId(session.user.id);

    const metrics = await Trade.aggregate([
      { $match: { userId: userId, status: "CLOSED" } },
      {
        $group: {
          _id: "$strategy",
          totalPnL: { $sum: "$pnl" },
          totalTrades: { $count: {} },
          winningTrades: {
            $sum: { $cond: [{ $gt: ["$pnl", 0] }, 1, 0] },
          },
        },
      },
      // Lookup strategy name
      {
        $addFields: {
          strategyIdObj: { $toObjectId: "$_id" },
        },
      },
      {
        $lookup: {
          from: "strategies",
          localField: "strategyIdObj",
          foreignField: "_id",
          as: "strategyDetails",
        },
      },
      {
        $unwind: {
          path: "$strategyDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          name: { $ifNull: ["$strategyDetails.name", "Unknown Strategy"] },
          totalPnL: 1,
          totalTrades: 1,
          winRate: {
            $multiply: [
              { $divide: ["$winningTrades", { $ifNull: ["$totalTrades", 1] }] },
              100,
            ],
          },
        },
      },
      { $sort: { totalPnL: -1 } },
    ]);

    return metrics;
  } catch (error) {
    console.error("Get performance by strategy error:", error);
    throw new Error("Failed to fetch strategy performance");
  }
}

export async function getDailyPnLHeatmap(month?: number, year?: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await connectDB();
    const userId = new mongoose.Types.ObjectId(session.user.id);

    const now = new Date();
    const currentYear = year || now.getFullYear();
    const currentMonth = month !== undefined ? month : now.getMonth(); // 0-indexed

    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    const dailyPnL = await Trade.aggregate([
      {
        $match: {
          userId: userId,
          status: "CLOSED",
          exitDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$exitDate" },
            month: { $month: "$exitDate" },
            year: { $year: "$exitDate" },
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$exitDate" },
            },
          },
          value: { $sum: "$pnl" },
          count: { $count: {} },
        },
      },
      { $sort: { "_id.day": 1 } },
      {
        $project: {
          date: "$_id.date",
          value: 1,
          count: 1,
          _id: 0,
        },
      },
    ]);

    return dailyPnL;
  } catch (error) {
    console.error("Get daily PnL heatmap error:", error);
    throw new Error("Failed to fetch daily PnL heatmap");
  }
}

export async function getMonthlyTrend(dateRange?: { from: Date; to: Date }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await connectDB();
    const userId = new mongoose.Types.ObjectId(session.user.id);

    const match: {
      userId: mongoose.Types.ObjectId;
      status: "CLOSED";
      exitDate?: { $gte: Date; $lte: Date };
    } = { userId, status: "CLOSED" };
    if (dateRange) {
      match.exitDate = { $gte: dateRange.from, $lte: dateRange.to };
    }

    const result = await Trade.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: "$exitDate" },
            month: { $month: "$exitDate" },
          },
          totalTrades: { $count: {} },
          winningTrades: { $sum: { $cond: [{ $gt: ["$pnl", 0] }, 1, 0] } },
          grossProfit: {
            $sum: { $cond: [{ $gt: ["$pnl", 0] }, "$pnl", 0] },
          },
          grossLoss: {
            $sum: {
              $cond: [{ $lt: ["$pnl", 0] }, { $abs: "$pnl" }, 0],
            },
          },
        },
      },
      {
        $project: {
          date: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $cond: [
                  { $lt: ["$_id.month", 10] },
                  { $concat: ["0", { $toString: "$_id.month" }] },
                  { $toString: "$_id.month" },
                ],
              },
            ],
          },
          winRate: {
            $cond: [
              { $eq: ["$totalTrades", 0] },
              0,
              {
                $multiply: [
                  { $divide: ["$winningTrades", "$totalTrades"] },
                  100,
                ],
              },
            ],
          },
          profitFactor: {
            $cond: [
              { $eq: ["$grossLoss", 0] },
              "$grossProfit",
              { $divide: ["$grossProfit", "$grossLoss"] },
            ],
          },
          _id: 0,
        },
      },
      { $sort: { date: 1 } },
    ]);

    return result;
  } catch (error) {
    console.error("Get monthly trend error:", error);
    throw new Error("Failed to fetch monthly trend");
  }
}

export async function getTopTags() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await connectDB();
    const userId = new mongoose.Types.ObjectId(session.user.id);

    const tags = await Trade.aggregate([
      { $match: { userId: userId } },
      { $unwind: "$tags" },
      {
        $group: {
          _id: "$tags",
          count: { $count: {} },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          tag: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    return tags;
  } catch (error) {
    console.error("Get top tags error:", error);
    throw new Error("Failed to fetch top tags");
  }
}
