 "use client";
import { motion } from "framer-motion";

export function HowItWorks() {
  return (
    <section className="py-24 bg-white dark:bg-slate-900" id="how-it-works">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20"
      >
        <h2 className="text-4xl font-extrabold mb-4">
          How <span className="text-primary">TradeDiary</span> Works
        </h2>
        <p className="text-slate-500">
          Simple steps to transform your trading performance
        </p>
      </motion.div>
      <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-12 relative">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: "50%" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hidden md:block absolute top-12 left-[25%] h-0.5 border-t-2 border-dashed border-slate-200 dark:border-slate-700 -z-0"
        ></motion.div>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.14 } } }}
          className="flex w-full items-center justify-between gap-12"
        >
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}
            className="relative z-10 text-center flex-1"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg shadow-blue-500/30"
            >
              1
            </motion.div>
            <h4 className="text-lg font-bold mb-2">Log Your Trade</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              Quickly record all trade details including entry, exit, position
              size, and notes.
            </p>
          </motion.div>
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}
            className="relative z-10 text-center flex-1"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg shadow-blue-500/30"
            >
              2
            </motion.div>
            <h4 className="text-lg font-bold mb-2">Tag & Rate</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              Categorize trades by strategy, instrument, and rate your execution
              quality.
            </p>
          </motion.div>
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}
            className="relative z-10 text-center flex-1"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg shadow-blue-500/30"
            >
              3
            </motion.div>
            <h4 className="text-lg font-bold mb-2">Review & Improve</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              Analyze performance metrics to identify strengths and weaknesses in
              your strategy.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
