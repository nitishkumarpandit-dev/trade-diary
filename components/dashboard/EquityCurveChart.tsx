"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface EquityCurveChartProps {
  data: { date: string | Date; value: number }[];
}

export default function EquityCurveChart({ data }: EquityCurveChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
        No data available for the selected period
      </div>
    );
  }

  const formattedData = data.map((d) => ({
    ...d,
    dateStr: new Date(d.date).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={formattedData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e2e8f0"
            className="dark:stroke-slate-700"
          />
          <XAxis
            dataKey="dateStr"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            dy={10}
            minTickGap={30}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            itemStyle={{ color: "#1e293b" }}
            formatter={(value: number | undefined) => [
              `₹${(value ?? 0).toLocaleString("en-IN")}`,
              "Equity",
            ]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
