"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function StatsSection() {
  const [counts, setCounts] = useState({ a: 0, b: 0, c: 0, d: 0 });
  useEffect(() => {
    const targets = { a: 160, b: 2.5, c: -63, d: 6 };
    let start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / 700, 1);
      setCounts({
        a: Math.round(targets.a * t),
        b: Math.round(targets.b * 10 * t) / 10,
        c: Math.round(targets.c * t),
        d: Math.round(targets.d * 1000 * t) / 1000,
      });
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, []);
  return (
    <section className="py-12 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}
            whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(19,127,236,0.12)" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="text-center bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700"
          >
            <p className="text-3xl font-extrabold text-primary mb-1">{counts.a}k+</p>
            <p className="text-sm text-slate-500 font-medium">Trades logged & analyzed</p>
          </motion.div>
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}
            whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(16,185,129,0.12)" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="text-center bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700"
          >
            <p className="text-3xl font-extrabold text-emerald-500 mb-1">{counts.b}x</p>
            <p className="text-sm text-slate-500 font-medium">Disciplined trades</p>
          </motion.div>
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}
            whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(244,63,94,0.12)" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="text-center bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700"
          >
            <p className="text-3xl font-extrabold text-rose-500 mb-1">{counts.c}%</p>
            <p className="text-sm text-slate-500 font-medium">Emotional trades</p>
          </motion.div>
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}
            whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(234,88,12,0.12)" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="text-center bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700"
          >
            <p className="text-3xl font-extrabold text-orange-500 mb-1">{Math.round(counts.d * 1000) / 1000}K+</p>
            <p className="text-sm text-slate-500 font-medium">Active traders</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
