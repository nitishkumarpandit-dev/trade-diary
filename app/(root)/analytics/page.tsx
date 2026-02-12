import {
  getDashboardMetrics,
  getEquityCurve,
  getPerformanceByStrategy,
  getDailyPnLHeatmap,
} from "@/lib/actions/analytics";
import AnalyticsClient from "./AnalyticsClient";

function getDefaultRange() {
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - 6);
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

export default async function AnalyticsPage() {
  const dateRange = getDefaultRange();
  const [metrics, equity, byStrategy, heatmap] = await Promise.all([
    getDashboardMetrics(dateRange),
    getEquityCurve(dateRange),
    getPerformanceByStrategy(),
    getDailyPnLHeatmap(dateRange.to.getMonth(), dateRange.to.getFullYear()),
  ]);

  return (
    <AnalyticsClient
      initialDateRange={dateRange}
      initialMetrics={metrics}
      initialEquityCurve={equity}
      initialPerformanceByStrategy={byStrategy}
      initialDailyPnLHeatmap={heatmap}
    />
  );
}
