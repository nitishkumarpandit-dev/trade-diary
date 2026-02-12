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
          <button className="w-full py-4 px-6 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
            Start Free
          </button>
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
          <button className="w-full py-4 px-6 rounded-xl font-bold bg-primary text-white hover:opacity-90 transition-opacity">
            Upgrade to Pro
          </button>
        </div>
      </div>
    </section>
  );
}
