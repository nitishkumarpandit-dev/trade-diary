"use client";
import { Rocket } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function CTA({
  isAuthenticated = false,
}: {
  isAuthenticated?: boolean;
}) {
  return (
    <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        className="bg-primary rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/20"
      >
        <motion.div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(1200px 600px at 10% 10%, rgba(255,255,255,0.25), transparent), radial-gradient(900px 600px at 90% 80%, rgba(255,255,255,0.15), transparent)" }}
          animate={{ backgroundPosition: ["0% 0%", "10% 5%", "0% 0%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeOut" }}
        />
        <h2 className="text-2xl md:text-5xl font-extrabold mb-6 relative z-10">
          Ready to transform your trading?
        </h2>
        <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto relative z-10">
          Get started with Trade Diary's powerful analytics to improve your
          trading performance today.
        </p>
        <motion.a
          href={isAuthenticated ? "/dashboard" : "/register"}
          className="bg-white text-primary px-10 py-5 rounded-2xl font-bold text-xl flex items-center gap-3 mx-auto relative z-10"
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
