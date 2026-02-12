"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  getDashboardMetrics,
  getEquityCurve,
  getPerformanceByStrategy,
  getDailyPnLHeatmap,
  getMonthlyTrend,
} from "@/lib/actions/analytics";

interface DateRange {
  from: Date;
  to: Date;
}

interface Metrics {
  totalPnL: number;
  winRate: number;
  maxDrawdown: number;
  totalTrades: number;
  avgProfit: number;
  profitFactor: number;
  totalPnLChange?: number;
  winRateChange?: number;
  maxDrawdownChange?: number;
  totalTradesChange?: number;
  avgProfitChange?: number;
  profitFactorChange?: number;
}

interface EquityPoint {
  date: string | Date;
  value: number;
}

interface StrategyPerf {
  name: string;
  totalPnL: number;
  totalTrades: number;
  winRate: number;
}

interface DailyPnL {
  date: string;
  value: number;
  count: number;
}

interface AnalyticsClientProps {
  initialDateRange: DateRange;
  initialMetrics: Metrics;
  initialEquityCurve: EquityPoint[];
  initialPerformanceByStrategy: StrategyPerf[];
  initialDailyPnLHeatmap: DailyPnL[];
}

export default function AnalyticsClient({
  initialDateRange,
  initialMetrics,
  initialEquityCurve,
  initialPerformanceByStrategy,
  initialDailyPnLHeatmap,
}: AnalyticsClientProps) {
  const [dateRange, setDateRange] = useState<DateRange>(initialDateRange);
  const [metrics, setMetrics] = useState<Metrics>(initialMetrics);
  const [equity, setEquity] = useState<EquityPoint[]>(initialEquityCurve);
  const [byStrategy, setByStrategy] = useState<StrategyPerf[]>(
    initialPerformanceByStrategy,
  );
  const [heatmap, setHeatmap] = useState<DailyPnL[]>(initialDailyPnLHeatmap);
  const [trend, setTrend] = useState<
    Array<{ date: string; winRate: number; profitFactor: number }>
  >([]);
  const [isPending, startTransition] = useTransition();
  const hasHydrated = useRef(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!hasHydrated.current) {
      hasHydrated.current = true;
      return;
    }
    startTransition(async () => {
      const [m, e, s, h] = await Promise.all([
        getDashboardMetrics(dateRange),
        getEquityCurve(dateRange),
        getPerformanceByStrategy(),
        getDailyPnLHeatmap(dateRange.to.getMonth(), dateRange.to.getFullYear()),
      ]);
      setMetrics(m);
      setEquity(e);
      setByStrategy(s);
      setHeatmap(h);
    });
  }, [dateRange]);

  useEffect(() => {
    if (!hasHydrated.current) return;
    startTransition(async () => {
      const data = await getMonthlyTrend(dateRange);
      setTrend(data);
    });
  }, [dateRange]);

  const setQuickRange = (type: "1M" | "6M" | "1Y" | "ALL") => {
    const to = new Date();
    const from = new Date();
    if (type === "1M") from.setMonth(from.getMonth() - 1);
    else if (type === "6M") from.setMonth(from.getMonth() - 6);
    else if (type === "1Y") from.setFullYear(from.getFullYear() - 1);
    else {
      from.setFullYear(from.getFullYear() - 10);
    }
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    setDateRange({ from, to });
  };

  const formatCurrency = (v: number) => `₹${(v || 0).toLocaleString("en-IN")}`;

  const exportCSV = () => {
    const lines: string[] = [];
    lines.push("Section,Metric,Value");
    lines.push(`Top Metrics,Total P/L,${metrics.totalPnL}`);
    lines.push(`Top Metrics,Win Rate,${metrics.winRate.toFixed(2)}%`);
    lines.push(`Top Metrics,Avg Profit/Loss,${metrics.avgProfit}`);
    lines.push(`Top Metrics,Profit Factor,${metrics.profitFactor.toFixed(2)}`);
    lines.push("");
    lines.push("Equity Curve Date,Value");
    equity.forEach((p) =>
      lines.push(`${new Date(p.date).toISOString().slice(0, 10)},${p.value}`),
    );
    lines.push("");
    lines.push("Strategy,Total Trades,Win Rate,Total PnL");
    byStrategy.forEach((s) =>
      lines.push(
        `${s.name},${s.totalTrades},${s.winRate.toFixed(2)},${s.totalPnL}`,
      ),
    );
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html>
        <head>
          <title>Analytics Report</title>
          <style>
            body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding: 24px; }
            h1 { margin: 0 0 12px; }
            .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
            .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border-bottom: 1px solid #e5e7eb; padding: 6px; text-align: left; }
          </style>
        </head>
        <body>
          <h1>TradeDiary Analytics Report</h1>
          <p>Date Range: ${dateRange.from.toDateString()} - ${dateRange.to.toDateString()}</p>
          <div class="grid">
            <div class="card"><strong>Total P/L</strong><div>${formatCurrency(metrics.totalPnL)}</div></div>
            <div class="card"><strong>Win Rate</strong><div>${metrics.winRate.toFixed(2)}%</div></div>
            <div class="card"><strong>Avg Profit/Loss</strong><div>${formatCurrency(metrics.avgProfit)}</div></div>
            <div class="card"><strong>Profit Factor</strong><div>${metrics.profitFactor.toFixed(2)}</div></div>
          </div>
          <h2>Performance by Strategy</h2>
          <table>
            <thead><tr><th>Strategy</th><th>Total Trades</th><th>Win Rate</th><th>Total PnL</th></tr></thead>
            <tbody>
              ${byStrategy
                .map(
                  (s) =>
                    `<tr><td>${s.name}</td><td>${s.totalTrades}</td><td>${s.winRate.toFixed(
                      2,
                    )}%</td><td>${formatCurrency(s.totalPnL)}</td></tr>`,
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `);
    w.document.close();
    w.focus();
    w.print();
  };

  const daysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();
  const heatmapMonth = useMemo(() => {
    if (!heatmap?.length)
      return {
        year: dateRange.to.getFullYear(),
        month: dateRange.to.getMonth(),
      };
    const first = heatmap[0].date.split("-");
    return { year: Number(first[0]), month: Number(first[1]) - 1 };
  }, [heatmap, dateRange.to]);

  const heatmapCells = useMemo(() => {
    const totalDays = daysInMonth(heatmapMonth.year, heatmapMonth.month);
    const byDay: Record<number, number> = {};
    heatmap.forEach((d) => {
      const day = Number(d.date.split("-")[2]);
      byDay[day] = d.value;
    });
    return Array.from({ length: totalDays }).map((_, i) => {
      const day = i + 1;
      const value = byDay[day] || 0;
      const intensity = Math.max(-1, Math.min(1, value / 10000));
      let bg = "#e2e8f0";
      if (intensity > 0) bg = `rgba(16,185,129,${Math.min(0.9, intensity)})`;
      if (intensity < 0)
        bg = `rgba(244,63,94,${Math.min(0.9, Math.abs(intensity))})`;
      return { day, value, bg };
    });
  }, [heatmap, heatmapMonth]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Advanced performance metrics and trends
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/20"
          >
            Export CSV
          </button>
          <button
            onClick={exportPDF}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500"
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">Range:</span>
        <div className="flex gap-2">
          {["1M", "6M", "1Y", "ALL"].map((r) => (
            <button
              key={r}
              onClick={() => setQuickRange(r as "1M" | "6M" | "1Y" | "ALL")}
              className="px-3 py-1 rounded-lg text-xs border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              {r}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-slate-500">
          {dateRange.from.toLocaleDateString()} -{" "}
          {dateRange.to.toLocaleDateString()}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card-light dark:bg-card-dark">
          <p className="text-xs text-slate-500 mb-1">Total P/L</p>
          <p
            className={`text-xl font-bold ${metrics.totalPnL >= 0 ? "text-emerald-600" : "text-rose-500"}`}
          >
            {formatCurrency(metrics.totalPnL)}
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card-light dark:bg-card-dark">
          <p className="text-xs text-slate-500 mb-1">Win Rate</p>
          <p className="text-xl font-bold">{metrics.winRate.toFixed(2)}%</p>
        </div>
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card-light dark:bg-card-dark">
          <p className="text-xs text-slate-500 mb-1">Avg Profit/Loss</p>
          <p
            className={`text-xl font-bold ${metrics.avgProfit >= 0 ? "text-emerald-600" : "text-rose-500"}`}
          >
            {formatCurrency(metrics.avgProfit)}
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card-light dark:bg-card-dark">
          <p className="text-xs text-slate-500 mb-1">Profit Factor</p>
          <p className="text-xl font-bold">{metrics.profitFactor.toFixed(2)}</p>
        </div>
      </div>

      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card-light dark:bg-card-dark">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Equity Curve</h2>
        </div>
        <div className="h-64 mt-4" style={{ minWidth: 0 }}>
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={equity.map((p) => ({
                  date: new Date(p.date).toLocaleDateString(),
                  value: p.value,
                }))}
              >
                <defs>
                  <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#equityFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card-light dark:bg-card-dark">
          <h2 className="text-lg font-bold mb-4">Performance by Strategy</h2>
          <div className="h-64" style={{ minWidth: 0 }}>
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byStrategy}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalPnL" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2 pr-4 text-left">Strategy</th>
                  <th className="py-2 pr-4 text-left">Total Trades</th>
                  <th className="py-2 pr-4 text-left">Win Rate</th>
                  <th className="py-2 pr-4 text-left">Total P/L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {byStrategy.map((s) => (
                  <tr key={s.name}>
                    <td className="py-2 pr-4">{s.name}</td>
                    <td className="py-2 pr-4">{s.totalTrades}</td>
                    <td className="py-2 pr-4">{s.winRate.toFixed(2)}%</td>
                    <td
                      className={`py-2 pr-4 ${s.totalPnL >= 0 ? "text-emerald-600" : "text-rose-500"}`}
                    >
                      {formatCurrency(s.totalPnL)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card-light dark:bg-card-dark">
          <h2 className="text-lg font-bold mb-4">
            Win Rate & Profit Factor Trends
          </h2>
          <div className="h-64" style={{ minWidth: 0 }}>
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="winRate"
                    stroke="#6366f1"
                    name="Win Rate (%)"
                  />
                  <Line
                    type="monotone"
                    dataKey="profitFactor"
                    stroke="#f59e0b"
                    name="Profit Factor"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card-light dark:bg-card-dark">
        <h2 className="text-lg font-bold mb-4">Daily P&L Heatmap</h2>
        <div className="grid grid-cols-7 gap-2">
          {heatmapCells.map((cell) => (
            <div
              key={cell.day}
              className="rounded-lg p-2 text-center text-xs"
              style={{ background: cell.bg }}
            >
              <div className="font-bold">{cell.day}</div>
              <div>{formatCurrency(cell.value)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
