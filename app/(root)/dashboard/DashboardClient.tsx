"use client";

import { useState } from "react";
import TradeEntryModal from "@/components/shared/TradeEntryModal";
import { Wallet, Star, TrendingUp, ClipboardList, Plus } from "lucide-react";
import Link from "next/link";
import EquityCurveChart from "@/components/dashboard/EquityCurveChart";
import DashboardDateSelector from "@/components/dashboard/DashboardDateSelector";

interface DashboardClientProps {
  metrics: {
    totalPnL: number;
    totalPnLChange: number;
    winRate: number;
    winRateChange: number;
    maxDrawdown: number;
    maxDrawdownChange: number;
    totalTrades: number;
    totalTradesChange: number;
    avgProfit: number;
    avgProfitChange: number;
    profitFactor: number;
    profitFactorChange: number;
  };
  equityCurve: { date: string | Date; value: number }[];
  recentTrades: {
    _id: string;
    entryDate?: string;
    date?: string;
    symbol: string;
    type?: "LONG" | "SHORT";
    side?: "LONG" | "SHORT";
    entryPrice: number;
    pnl: number | null;
    status: "OPEN" | "CLOSED";
  }[];
  psychology: {
    dominantMood: string;
    topTags: string[];
  };
}

const ChangeIndicator = ({
  value,
  inverse = false,
  suffix = "%",
}: {
  value: number;
  inverse?: boolean;
  suffix?: string;
}) => {
  if (value === 0 || isNaN(value))
    return (
      <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
        0{suffix}
      </span>
    );

  const isPositive = value > 0;
  // If inverse is true (e.g. Drawdown), Positive change is Bad (Red)
  const isGood = inverse ? !isPositive : isPositive;

  const colorClass = isGood
    ? "text-green-600 bg-green-100 dark:bg-green-900/30"
    : "text-red-600 bg-red-100 dark:bg-red-900/30";

  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}
    >
      {isPositive ? "+" : ""}
      {value.toFixed(1)}
      {suffix}
    </span>
  );
};

export default function DashboardClient({
  metrics,
  equityCurve,
  recentTrades,
  psychology,
}: DashboardClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            Trading Performance
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Review your trading activity and metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DashboardDateSelector />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Net Profit */}
        <div className="bg-card-light dark:bg-card-dark p-4 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
              <Wallet className="w-6 h-6" />
            </div>
            <ChangeIndicator value={metrics.totalPnLChange} />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Net Profit / Loss
          </p>
          <h3
            className={`text-xl md:text-2xl font-bold mt-1 ${
              metrics.totalPnL >= 0
                ? "text-slate-900 dark:text-slate-100"
                : "text-red-500"
            }`}
          >
            ₹{metrics.totalPnL.toLocaleString("en-IN")}
          </h3>
        </div>

        {/* Win Rate */}
        <div className="bg-card-light dark:bg-card-dark p-4 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl">
              <Star className="w-6 h-6" />
            </div>
            <ChangeIndicator value={metrics.winRateChange} />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Win Rate
          </p>
          <h3 className="text-xl md:text-2xl font-bold mt-1">
            {metrics.winRate.toFixed(1)}%
          </h3>
        </div>

        {/* Max Drawdown */}
        <div className="bg-card-light dark:bg-card-dark p-4 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <ChangeIndicator value={metrics.maxDrawdownChange} inverse={true} />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Max Drawdown (Abs)
          </p>
          <h3 className="text-xl md:text-2xl font-bold mt-1">
            ₹{metrics.maxDrawdown.toLocaleString("en-IN")}
          </h3>
        </div>

        {/* Total Trades */}
        <div className="bg-card-light dark:bg-card-dark p-4 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
              <ClipboardList className="w-6 h-6" />
            </div>
            <ChangeIndicator value={metrics.totalTradesChange} />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Total Trades
          </p>
          <h3 className="text-xl md:text-2xl font-bold mt-1">
            {metrics.totalTrades}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Curve */}
        <div className="lg:col-span-2 bg-card-light dark:bg-card-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Equity Curve</h3>
          <EquityCurveChart data={equityCurve} />
        </div>

        {/* Psychology Insights */}
        <div className="bg-card-light dark:bg-card-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Psychology Insights</h3>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-slate-500 mb-2">Dominant Emotion</p>
              <div className="text-2xl font-bold text-primary capitalize">
                {psychology.dominantMood}
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-2">Top Tags</p>
              <div className="flex flex-wrap gap-2">
                {psychology.topTags.length > 0 ? (
                  psychology.topTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-400">No tags yet</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Trades Table */}
      <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg font-bold">Recent Trades</h2>
          <Link
            href="/trades"
            className="text-sm font-semibold text-primary hover:text-blue-600 transition-colors"
          >
            View All Trades
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 whitespace-nowrap">
                  Date
                </th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 whitespace-nowrap">
                  Symbol
                </th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 whitespace-nowrap">
                  Side
                </th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 whitespace-nowrap">
                  Entry
                </th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 text-right whitespace-nowrap">
                  P/L
                </th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 text-center whitespace-nowrap">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {recentTrades.map((trade) => (
                <tr
                  key={trade._id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                    {trade.entryDate || trade.date
                      ? new Date(
                          trade.entryDate || trade.date!,
                        ).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })
                      : "--"}
                  </td>
                  <td className="px-6 py-4 font-bold whitespace-nowrap">
                    {trade.symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        trade.type === "LONG" || trade.side === "LONG"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                          : "bg-red-100 dark:bg-red-900/30 text-red-600"
                      }`}
                    >
                      {trade.type || trade.side}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {trade.entryPrice.toLocaleString("en-IN")}
                  </td>
                  <td
                    className={`px-6 py-4 font-bold text-right whitespace-nowrap ${
                      (trade.pnl || 0) >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {trade.pnl !== null && trade.pnl !== undefined
                      ? `${trade.pnl >= 0 ? "+" : ""}${trade.pnl.toLocaleString("en-IN")}`
                      : "--"}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        trade.status === "CLOSED"
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          : "bg-blue-100 dark:bg-blue-900/30 text-blue-600"
                      }`}
                    >
                      {trade.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentTrades.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No trades yet. Click &quot;+&quot; to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center z-[70] cursor-pointer"
      >
        <Plus className="w-8 h-8" />
      </button>

      <TradeEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
