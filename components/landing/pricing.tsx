"use client";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export function Pricing({
  isAuthenticated = false,
}: {
  isAuthenticated?: boolean;
}) {
  return (
    <section
      className="py-24 px-4 bg-background-light dark:bg-background-dark"
      id="pricing"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16"
      >
        <h2 className="text-4xl font-extrabold mb-4">
          Simple, <span className="text-primary">Transparent</span> Pricing
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Choose the plan that fits your trading needs
        </p>
      </motion.div>
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.12 } },
        }}
        className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8"
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            show: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.6, ease: "easeOut" },
            },
          }}
          whileHover={{
            scale: 1.02,
            boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-white dark:bg-slate-800 p-8 rounded-4xl border border-slate-200 dark:border-slate-700 relative overflow-hidden"
        >
          <div className="mb-4">
            <h3 className="text-xl font-bold">Standard Plan</h3>
            <p className="text-sm text-slate-500">
              Perfect for getting started
            </p>
          </div>
          <ul className="space-y-4 mb-10">
            <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle className="text-emerald-500 w-5 h-5" /> 100 trade
              entries/month
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle className="text-emerald-500 w-5 h-5" /> Basic
              analytics
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle className="text-emerald-500 w-5 h-5" /> Default
              features
            </li>
          </ul>
          <motion.a
            href={isAuthenticated ? "/dashboard" : "/register"}
            className="w-full py-4 px-6 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white text-center block"
            whileHover={{ scale: 1.03, y: -2 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            Start Free
          </motion.a>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          animate={{ scale: [1, 1.03, 1] }}
          className="bg-white dark:bg-slate-800 p-8 rounded-4xl border-2 border-primary relative overflow-hidden shadow-2xl md:scale-105"
        >
          <div className="absolute top-4 right-4 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
            Popular
          </div>
          <div className="mb-4">
            <h3 className="text-xl font-bold">Pro Plan</h3>
            <p className="text-sm text-slate-500">For power traders</p>
          </div>
          <ul className="space-y-4 mb-10">
            <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle className="text-emerald-500 w-5 h-5" /> Unlimited
              trade entries/month
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle className="text-emerald-500 w-5 h-5" /> Advanced
              analytics
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle className="text-emerald-500 w-5 h-5" /> Priority
              features
            </li>
          </ul>
          <motion.a
            href={isAuthenticated ? "/settings" : "/register"}
            className="w-full py-4 px-6 rounded-xl font-bold bg-primary text-white text-center block"
            whileHover={{ scale: 1.03, y: -2 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            Upgrade to Pro
          </motion.a>
          <motion.div
            className="absolute inset-0 rounded-4xl pointer-events-none"
            initial={{ boxShadow: "0 0 0 0px rgba(34,197,94,0.0)" }}
            animate={{
              boxShadow: [
                "0 0 0 0px rgba(34,197,94,0.0)",
                "0 0 0 12px rgba(34,197,94,0.08)",
                "0 0 0 0px rgba(34,197,94,0.0)",
              ],
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeOut" }}
          />
        </motion.div>
      </motion.div>
      <PricingComparison />
    </section>
  );
}

function PricingComparison() {
  const rows = [
    { feature: "Trade entries per month", standard: "100", pro: "Unlimited" },
    { feature: "Analytics depth", standard: "Basic", pro: "Advanced" },
    { feature: "Psychology insights", standard: "Limited", pro: "Full" },
    { feature: "Support", standard: "Community", pro: "Priority" },
    { feature: "Export CSV", standard: "Yes", pro: "Yes" },
    { feature: "Broker API integrations", standard: "Limited", pro: "Full" },
    { feature: "Bulk trade syncs", standard: "No", pro: "Yes" },
    { feature: "AI trade summaries", standard: "No", pro: "Yes" },
    { feature: "Custom tags & notes", standard: "Yes", pro: "Yes" },
    { feature: "Strategy backtesting", standard: "Basic", pro: "Advanced" },
  ];
  return (
    <div className="max-w-4xl mx-auto mt-16">
      <div className="flex items-center justify-start mb-4">
        <h3 className="text-xl font-bold">Compare Plans</h3>
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
            {rows.map((r) => (
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
