import { BarChart2, CheckCircle, Bot, Zap } from "lucide-react";

export function Features() {
  return (
    <section
      className="py-24 bg-background-light dark:bg-background-dark"
      id="features"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <span className="text-primary text-sm font-bold tracking-widest uppercase">
          Features
        </span>
        <h2 className="text-4xl font-extrabold mt-4 mb-6">
          Everything You Need to Document & Improve Your Trades
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Powerful features to help traders track performance, refine
          strategies, and grow consistently.
        </p>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-shadow group">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <BarChart2 className="text-primary w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-4">Advanced Analytics</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
            Gain powerful trading insights with detailed reports and
            visualizations.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <CheckCircle className="text-emerald-500 w-4 h-4" /> Win rate by
              strategy, market, etc.
            </li>
            <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <CheckCircle className="text-emerald-500 w-4 h-4" /> Profit factor
              & expectancy analysis
            </li>
            <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <CheckCircle className="text-emerald-500 w-4 h-4" /> 35+ in-depth
              performance reports
            </li>
          </ul>
        </div>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-shadow group">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Bot className="text-orange-500 w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-4">AI Summariser</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
            Let AI instantly analyse your trades and spot patterns you missed.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <CheckCircle className="text-emerald-500 w-4 h-4" />{" "}
              Auto-generated trade summaries
            </li>
            <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <CheckCircle className="text-emerald-500 w-4 h-4" /> Performance
              insights in plain English
            </li>
            <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <CheckCircle className="text-emerald-500 w-4 h-4" /> Strength &
              weakness detection
            </li>
          </ul>
        </div>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-shadow group">
          <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Zap className="text-rose-500 w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-4">Fast Trade Entry</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
            Log trades effortlessly so you can focus on trading, not data entry.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <CheckCircle className="text-emerald-500 w-4 h-4" /> One-click
              trade entry
            </li>
            <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <CheckCircle className="text-emerald-500 w-4 h-4" /> Broker API
              Integrations
            </li>
            <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <CheckCircle className="text-emerald-500 w-4 h-4" /> Bulk trade
              Syncs
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
