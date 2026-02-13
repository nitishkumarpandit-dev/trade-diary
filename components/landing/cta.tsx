"use client";
import { Rocket } from "lucide-react";
import { motion } from "framer-motion";

export function CTA({
  isAuthenticated = false,
}: {
  isAuthenticated?: boolean;
}) {
  return (
    <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div className="bg-primary rounded-2xl md:rounded-[3rem] p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/20">
        <motion.div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(1200px 600px at 10% 10%, rgba(255,255,255,0.25), transparent), radial-gradient(900px 600px at 90% 80%, rgba(255,255,255,0.15), transparent)",
          }}
          animate={{ backgroundPosition: ["0% 0%", "10% 5%", "0% 0%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeOut" }}
        />
        <h2 className="text-2xl md:text-5xl font-extrabold mb-5 md:mb-6 relative z-10">
          Ready to transform your trading?
        </h2>
        <p className="text-blue-100 text-base md:text-lg mb-8 md:mb-10 max-w-2xl mx-auto relative z-10 px-2">
          Get started with Trade Diary&apos;s powerful analytics to improve your
          trading performance today.
        </p>
        <motion.a
          href={isAuthenticated ? "/dashboard" : "/register"}
          className="bg-white text-primary w-full md:max-w-xs px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-bold text-lg md:text-xl flex items-center justify-center gap-3 mx-auto relative z-10"
          whileHover={{ scale: 1.05, y: -2 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Rocket className="w-6 h-6" />
          Start Journaling Now
        </motion.a>
      </motion.div>
    </section>
  );
}
