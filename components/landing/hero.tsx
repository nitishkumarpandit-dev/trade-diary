"use client";
import { Rocket, PlayCircle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24">
      <div className="absolute inset-0 gradient-blur -z-10"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.6,
                  ease: "easeOut",
                  staggerChildren: 0.12,
                },
              },
            }}
          >
            <motion.span
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
              className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6"
            >
              Trade Smarter, Not Harder
            </motion.span>
            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
              className="text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]"
            >
              India&apos;s Most Advanced <br />
              <span className="text-primary">Trading Journal</span>
            </motion.h1>
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
              className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-xl leading-relaxed"
            >
              Track, analyze, and elevate your trading performance with our
              intelligent platform designed for serious traders. Gain insights,
              spot patterns, and maximize profits.
            </motion.p>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.a
                href={"/login"}
                className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl shadow-primary/30"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <Rocket className="w-5 h-5" />
                Get Started Free
              </motion.a>
              <motion.button
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <PlayCircle className="w-5 h-5" />
                Watch Demo
              </motion.button>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            style={{ transformOrigin: "center" }}
            className="relative"
          >
            <motion.div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700">
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
                  <motion.div
                    className="w-full bg-primary/20 rounded-t-md"
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{ transformOrigin: "bottom", height: "40%" }}
                  />
                  <motion.div
                    className="w-full bg-primary/40 rounded-t-md"
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
                    style={{ transformOrigin: "bottom", height: "60%" }}
                  />
                  <motion.div
                    className="w-full bg-primary/60 rounded-t-md"
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                    style={{ transformOrigin: "bottom", height: "80%" }}
                  />
                  <motion.div
                    className="w-full bg-primary rounded-t-md"
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
                    style={{ transformOrigin: "bottom", height: "50%" }}
                  />
                  <motion.div
                    className="w-full bg-primary/80 rounded-t-md"
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                    style={{ transformOrigin: "bottom", height: "90%" }}
                  />
                  <motion.div
                    className="w-full bg-primary/30 rounded-t-md"
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.25 }}
                    style={{ transformOrigin: "bottom", height: "30%" }}
                  />
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
            </motion.div>
            <motion.div
              className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            >
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <TrendingUp className="text-white w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Profit</p>
                <p className="font-bold">+12.5% Today</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
