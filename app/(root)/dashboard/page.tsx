import { auth } from "@/lib/auth";
import Link from "next/link";
import DashboardClient from "./DashboardClient";
import { getDashboardMetrics, getEquityCurve } from "@/lib/actions/analytics";
import { getTrades } from "@/lib/actions/trades";
import { getPsychologyInsights } from "@/lib/actions/psychology";

export default async function DashboardPage(props: {
  searchParams: Promise<{ range?: string }>;
}) {
  const searchParams = await props.searchParams;
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const range = searchParams.range || "30d";

  // Calculate date range
  const now = new Date();
  let dateRange: { from: Date; to: Date } | undefined;

  if (range === "7d") {
    const from = new Date(now);
    from.setDate(now.getDate() - 7);
    dateRange = { from, to: now };
  } else if (range === "30d") {
    const from = new Date(now);
    from.setDate(now.getDate() - 30);
    dateRange = { from, to: now };
  } else if (range === "90d") {
    const from = new Date(now);
    from.setDate(now.getDate() - 90);
    dateRange = { from, to: now };
  } else if (range === "all") {
    dateRange = undefined;
  } else {
    // Default to 30d
    const from = new Date(now);
    from.setDate(now.getDate() - 30);
    dateRange = { from, to: now };
  }

  // Fetch data in parallel
  const [metrics, equityCurve, tradesData, psychology] = await Promise.all([
    getDashboardMetrics(dateRange),
    getEquityCurve(dateRange),
    getTrades({ limit: 5, status: "OPEN" }), // Fetching recent 5 OPEN trades as requested
    getPsychologyInsights(dateRange),
  ]);

  return (
    <>
      {/* Welcome Message */}
      <div className="mb-6">
        <h2 className="text-lg font-medium text-slate-600 dark:text-slate-300">
          Welcome back, {session.user.name || "Trader"}! 👋
        </h2>
        {!session.user.emailVerified && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Please verify your email address to unlock full features.{" "}
              <Link
                href={`/verify-email?email=${encodeURIComponent(session.user.email || "")}`}
                className="underline font-semibold hover:text-yellow-800 dark:hover:text-yellow-300"
              >
                Verify now
              </Link>
            </p>
          </div>
        )}
      </div>

      <DashboardClient
        metrics={metrics}
        equityCurve={equityCurve}
        recentTrades={tradesData.trades}
        psychology={psychology}
      />
    </>
  );
}
