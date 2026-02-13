 "use client";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function FAQ() {
  const items = [
    {
      q: "How does Trade Diary help improve my trading?",
      a:
        "Trade Diary tracks every metric of your trading journey, highlighting exactly where you're losing money and where your edge lies. By visualizing your performance, you can eliminate bad habits and double down on what works.",
    },
    {
      q: "Is my trading data secure?",
      a:
        "Absolutely. We use industry-standard bank-level encryption. Your trading data is private, encrypted at rest, and never shared with third parties.",
    },
    {
      q: "Are there any additional costs or fees?",
      a:
        "No hidden fees. The price you see is exactly what you pay for the features included in your plan.",
    },
  ];
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-24 bg-white dark:bg-slate-900" id="faq">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold mb-4">
            Frequently <span className="text-primary">Asked</span> Questions
          </h2>
          <p className="text-slate-500">
            Find answers to common questions about TradeDiary
          </p>
        </div>
        <div className="space-y-4">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className="bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-6 cursor-pointer"
                >
                  <span className="font-bold text-lg">{item.q}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="px-6 pb-6"
                    >
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
