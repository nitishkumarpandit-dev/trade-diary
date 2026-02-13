 "use client";
import { useState } from "react";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export function Pricing({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  return (
    <section
      className="py-24 bg-background-light dark:bg-background-dark"
      id="pricing"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <h2 className="text-4xl font-extrabold mb-4">
          Simple, <span className="text-primary">Transparent</span> Pricing
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Choose the plan that fits your trading needs
        </p>
      </div>
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          <div className="mb-4">
            <h3 className="text-xl font-bold">Standard Plan</h3>
            <p className="text-sm text-slate-500">Perfect for getting started</p>
          </div>
          <ul className="space-y-4 mb-10">
            <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle className="text-emerald-500 w-5 h-5" /> 100 trade entries/month
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle className="text-emerald-500 w-5 h-5" /> Basic analytics
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle className="text-emerald-500 w-5 h-5" /> Default features
            </li>
          </ul>
          <Link
            href={isAuthenticated ? "/dashboard" : "/register"}
            className="w-full py-4 px-6 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-center block"
          >
            Start Free
          </Link>
        </div>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border-2 border-primary relative overflow-hidden shadow-2xl md:scale-105">
          <div className="absolute top-4 right-4 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
            Popular
          </div>
          <div className="mb-4">
            <h3 className="text-xl font-bold">Pro Plan</h3>
            <p className="text-sm text-slate-500">For power traders</p>
          </div>
          <ul className="space-y-4 mb-10">
            <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle className="text-emerald-500 w-5 h-5" /> Unlimited trade entries/month
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle className="text-emerald-500 w-5 h-5" /> Advanced analytics
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle className="text-emerald-500 w-5 h-5" /> Priority features
            </li>
          </ul>
          <Link
            href={isAuthenticated ? "/settings" : "/register"}
            className="w-full py-4 px-6 rounded-xl font-bold bg-primary text-white hover:opacity-90 transition-opacity text-center block"
          >
            Upgrade to Pro
          </Link>
        </div>
      </div>
      <PricingComparison />
    </section>
  );
}

function PricingComparison() {
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);
  const rows = [
    { feature: "Trade entries per month", standard: "100", pro: "Unlimited", diff: true },
    { feature: "Analytics depth", standard: "Basic", pro: "Advanced", diff: true },
    { feature: "Psychology insights", standard: "Limited", pro: "Full", diff: true },
    { feature: "Support", standard: "Community", pro: "Priority", diff: true },
    { feature: "Export CSV", standard: "Yes", pro: "Yes", diff: false },
  ];
  const visible = showDifferencesOnly ? rows.filter((r) => r.diff) : rows;
  return (
    <div className="max-w-4xl mx-auto mt-16">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Compare Plans</h3>
        <button
          onClick={() => setShowDifferencesOnly((v) => !v)}
          className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          {showDifferencesOnly ? "Show all features" : "Show differences only"}
        </button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="text-left px-4 py-3">Feature</th>
              <th className="text-left px-4 py-3">Standard</th>
              <th className="text-left px-4 py-3">Pro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {visible.map((r) => (
              <tr key={r.feature}>
                <td className="px-4 py-3">{r.feature}</td>
                <td className="px-4 py-3">
                  {r.standard === "Yes" ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : (
                    r.standard
                  )}
                </td>
                <td className="px-4 py-3">
                  {r.pro === "Yes" ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : (
                    r.pro
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
