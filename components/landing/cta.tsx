"use client";
import { Rocket } from "lucide-react";
import Link from "next/link";

export function CTA({
  isAuthenticated = false,
}: {
  isAuthenticated?: boolean;
}) {
  return (
    <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-primary rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/20">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]"></div>
        <h2 className="text-2xl md:text-5xl font-extrabold mb-6 relative z-10">
          Ready to transform your trading?
        </h2>
        <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto relative z-10">
          Get started with Trade Diary's powerful analytics to improve your
          trading performance today.
        </p>
        <Link
          href={isAuthenticated ? "/dashboard" : "/register"}
          className="bg-white text-primary px-10 py-5 rounded-2xl font-bold text-xl hover:bg-slate-100 transition-colors flex items-center gap-3 mx-auto relative z-10"
        >
          <Rocket className="w-6 h-6" />
          Start Journaling Now
        </Link>
      </div>
    </section>
  );
}
