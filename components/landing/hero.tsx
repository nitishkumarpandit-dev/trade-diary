import { Rocket, PlayCircle, TrendingUp } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24">
      <div className="absolute inset-0 gradient-blur -z-10"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
              Trade Smarter, Not Harder
            </span>
            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              India&apos;s Most Advanced <br />
              <span className="text-primary">Trading Journal</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-xl leading-relaxed">
              Track, analyze, and elevate your trading performance with our
              intelligent platform designed for serious traders. Gain insights,
              spot patterns, and maximize profits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={"/login"}
                className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/30"
              >
                <Rocket className="w-5 h-5" />
                Get Started Free
              </Link>
              <button className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-8 py-4 rounded-xl font-bold text-lg hover:border-primary transition-all flex items-center justify-center gap-2">
                <PlayCircle className="w-5 h-5" />
                Watch Demo
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold">Performance Overview</h3>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-48 w-full bg-slate-50 dark:bg-slate-900 rounded-xl relative overflow-hidden flex items-end px-4 gap-2">
                  <div className="w-full bg-primary/20 h-[40%] rounded-t-md"></div>
                  <div className="w-full bg-primary/40 h-[60%] rounded-t-md"></div>
                  <div className="w-full bg-primary/60 h-[80%] rounded-t-md"></div>
                  <div className="w-full bg-primary h-[50%] rounded-t-md"></div>
                  <div className="w-full bg-primary/80 h-[90%] rounded-t-md"></div>
                  <div className="w-full bg-primary/30 h-[30%] rounded-t-md"></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                    <p className="text-[10px] uppercase font-bold text-blue-500 mb-1">
                      Win Rate
                    </p>
                    <p className="text-xl font-bold">64.2%</p>
                  </div>
                  <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20">
                    <p className="text-[10px] uppercase font-bold text-indigo-500 mb-1">
                      P/L
                    </p>
                    <p className="text-xl font-bold">+$4.2k</p>
                  </div>
                  <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                    <p className="text-[10px] uppercase font-bold text-emerald-500 mb-1">
                      Trades
                    </p>
                    <p className="text-xl font-bold">142</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <TrendingUp className="text-white w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Profit</p>
                <p className="font-bold">+12.5% Today</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
