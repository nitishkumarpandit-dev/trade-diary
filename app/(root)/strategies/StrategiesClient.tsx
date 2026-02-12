"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Activity,
  Zap,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
} from "lucide-react";
import {
  createStrategy,
  updateStrategy,
  deleteStrategy,
} from "@/lib/actions/strategies";
import StrategyModal from "@/components/shared/StrategyModal";
import { toast } from "react-hot-toast";

type AssetClass = "equity" | "futures" | "options" | "forex" | "crypto";
type StrategyStatus = "active" | "paused";

interface StrategyPerformance {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  avgRiskReward: number;
  maxDrawdown: number;
  netPnl: number;
}

interface Strategy {
  _id: string;
  name: string;
  assetClass: AssetClass;
  description?: string;
  rules?: string;
  targetWinRate?: number;
  minRiskReward?: number;
  status: StrategyStatus;
  performance: StrategyPerformance;
  createdAt: string;
  updatedAt: string;
}

interface StrategiesClientProps {
  initialStrategies: Strategy[];
}

export default function StrategiesClient({
  initialStrategies,
}: StrategiesClientProps) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(
    null,
  );
  const [strategies, setStrategies] = useState<Strategy[]>(initialStrategies);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setStrategies(initialStrategies);
  }, [initialStrategies]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this strategy? This cannot be undone.")) return;
    const prev = [...strategies];
    setStrategies(strategies.filter((s) => s._id !== id));
    try {
      const res = await deleteStrategy(id);
      if (res.success) {
        toast.success("Strategy deleted");
        router.refresh();
      } else {
        setStrategies(prev);
        toast.error(res.error || "Failed to delete strategy");
      }
    } catch {
      setStrategies(prev);
      toast.error("An error occurred");
    }
  };

  const equityCurvePoints = (perf: StrategyPerformance) => {
    const points = [
      80,
      82 - perf.maxDrawdown / 1000,
      84 + perf.winRate / 50,
      78 + perf.profitFactor,
      86 + perf.avgRiskReward,
      74 + perf.profitFactor * 0.8,
      88 + perf.winRate / 40,
      70 + perf.maxDrawdown / 200,
      92 + perf.netPnl / 10000,
    ];
    const step = 400 / (points.length - 1);
    return points
      .map((y, i) => `${i * step},${100 - Math.min(95, Math.max(5, y))}`)
      .join(" L ");
  };

  const topStrategies = useMemo(() => {
    return [...strategies].sort(
      (a, b) => (b.performance.netPnl || 0) - (a.performance.netPnl || 0),
    );
  }, [strategies]);

  const getIcon = (asset: AssetClass) => {
    if (asset === "crypto") return <Zap className="w-5 h-5" />;
    if (asset === "forex") return <Activity className="w-5 h-5" />;
    if (asset === "options") return <TrendingUp className="w-5 h-5" />;
    if (asset === "futures") return <TrendingUp className="w-5 h-5" />;
    return <TrendingUp className="w-5 h-5" />;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Strategies</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Monitor, create, and refine your trading systems
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-blue-600 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Create New Strategy</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topStrategies.map((s) => (
          <div
            key={s._id}
            className="bg-card-light dark:bg-card-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">{s.name}</h3>
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold ${
                      s.status === "active"
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    }`}
                  >
                    {s.status === "active" ? "Active" : "Paused"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 capitalize">
                  {s.assetClass}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                {getIcon(s.assetClass)}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Win Rate</p>
                <p
                  className={`text-lg font-bold ${s.performance.winRate >= 50 ? "text-emerald-600" : "text-rose-500"}`}
                >
                  {s.performance.winRate.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Profit Factor</p>
                <p className="text-lg font-bold">
                  {s.performance.profitFactor.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Total Trades</p>
                <p className="text-lg font-bold">{s.performance.totalTrades}</p>
              </div>
            </div>

            <div className="h-16 w-full mt-4">
              <svg
                className="w-full h-full"
                preserveAspectRatio="none"
                viewBox="0 0 400 100"
              >
                <path
                  d={`M ${equityCurvePoints(s.performance)}`}
                  fill="none"
                  stroke="#3b82f6"
                  strokeLinecap="round"
                  strokeWidth="3"
                />
              </svg>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() =>
                  setExpanded((prev) => ({ ...prev, [s._id]: !prev[s._id] }))
                }
                className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${expanded[s._id] ? "rotate-180" : ""}`}
                />
                <span>Details</span>
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedStrategy(s);
                    setIsEditOpen(true);
                  }}
                  className="p-2 text-slate-400 hover:text-primary transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(s._id)}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {expanded[s._id] && (
              <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">
                      Avg R:R (winners)
                    </p>
                    <p className="text-lg font-bold">
                      {s.performance.avgRiskReward.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">
                      Max Drawdown
                    </p>
                    <p className="text-lg font-bold text-rose-500">
                      {s.performance.maxDrawdown.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">
                      Net P/L
                    </p>
                    <p
                      className={`text-lg font-bold ${s.performance.netPnl >= 0 ? "text-emerald-600" : "text-rose-500"}`}
                    >
                      ₹{s.performance.netPnl.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
                {s.rules && (
                  <div className="text-sm text-slate-500">
                    <p className="font-semibold mb-1">Rules</p>
                    <p className="whitespace-pre-wrap">{s.rules}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold">Performance Matrix</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Strategy</th>
                <th className="px-6 py-4">Asset</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Win %</th>
                <th className="px-6 py-4">Profit Factor</th>
                <th className="px-6 py-4">Avg R:R</th>
                <th className="px-6 py-4">Max DD</th>
                <th className="px-6 py-4">Net P/L</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {strategies.map((s) => (
                <tr
                  key={s._id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-6 py-4 font-semibold">{s.name}</td>
                  <td className="px-6 py-4 capitalize">{s.assetClass}</td>
                  <td className="px-6 py-4">{s.performance.totalTrades}</td>
                  <td
                    className={`px-6 py-4 ${s.performance.winRate >= 50 ? "text-emerald-600" : "text-slate-600"}`}
                  >
                    {s.performance.winRate.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4">
                    {s.performance.profitFactor.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    {s.performance.avgRiskReward.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    {s.performance.maxDrawdown.toLocaleString("en-IN")}
                  </td>
                  <td
                    className={`px-6 py-4 ${s.performance.netPnl >= 0 ? "text-emerald-600" : "text-rose-500"}`}
                  >
                    ₹{s.performance.netPnl.toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        s.status === "active"
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      }`}
                    >
                      {s.status === "active" ? "Active" : "Paused"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <StrategyModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          setIsCreateOpen(false);
          router.refresh();
        }}
      />

      <StrategyModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedStrategy(null);
        }}
        initialData={selectedStrategy || undefined}
        onSuccess={() => {
          setIsEditOpen(false);
          setSelectedStrategy(null);
          router.refresh();
        }}
      />
    </div>
  );
}
