import { CheckCircle } from "lucide-react";

export function Pricing() {
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
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-2">Monthly Plan</h3>
            <p className="text-sm text-slate-500">
              Flexibility with month-to-month access
            </p>
          </div>
          <div className="flex items-baseline gap-1 mb-8">
            <span className="text-4xl font-extrabold">₹299</span>
            <span className="text-slate-500">/month</span>
          </div>
          <ul className="space-y-4 mb-10">
            <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle className="text-emerald-500 w-5 h-5" /> Unlimited
              trades
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle className="text-emerald-500 w-5 h-5" /> Advanced
              analytics
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle className="text-emerald-500 w-5 h-5" /> Risk
              management tools
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle className="text-emerald-500 w-5 h-5" /> Trade
              screenshots
            </li>
          </ul>
          <button className="w-full py-4 px-6 rounded-xl font-bold bg-primary text-white hover:opacity-90 transition-opacity">
            Choose Monthly
          </button>
        </div>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border-2 border-emerald-500 relative overflow-hidden shadow-2xl md:scale-105">
          <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
            Limited Period Offer
          </div>
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-2">Annual Plan</h3>
            <p className="text-sm text-slate-500">
              Best value with significant savings
            </p>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-4xl font-extrabold">₹999</span>
            <span className="text-slate-500">/year</span>
          </div>
          <p className="text-emerald-500 text-xs font-bold mb-8 italic">
            (Just ₹83/month)
          </p>
          <ul className="space-y-4 mb-10">
            <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
              <CheckCircle className="text-emerald-500 w-5 h-5" /> Everything in
              Monthly +
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle className="text-emerald-500 w-5 h-5" /> Priority
              Support
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle className="text-emerald-500 w-5 h-5" /> Beta Features
              Access
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle className="text-emerald-500 w-5 h-5" /> Trading
              Strategy Library
            </li>
          </ul>
          <button className="w-full py-4 px-6 rounded-xl font-bold bg-emerald-500 text-white hover:opacity-90 transition-opacity">
            Save 72% Annually
          </button>
        </div>
      </div>
    </section>
  );
}
