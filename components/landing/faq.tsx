import { ChevronDown } from "lucide-react";

export function FAQ() {
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
          <details className="group bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-700">
            <summary className="flex items-center justify-between font-bold text-lg list-none">
              How does Trade Diary help improve my trading?
              <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
              Trade Diary tracks every metric of your trading journey,
              highlighting exactly where you&apos;re losing money and where your
              edge lies. By visualizing your performance, you can eliminate bad
              habits and double down on what works.
            </p>
          </details>
          <details className="group bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-700">
            <summary className="flex items-center justify-between font-bold text-lg list-none">
              Is my trading data secure?
              <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
              Absolutely. We use industry-standard bank-level encryption. Your
              trading data is private, encrypted at rest, and never shared with
              third parties.
            </p>
          </details>
          <details className="group bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-700">
            <summary className="flex items-center justify-between font-bold text-lg list-none">
              Are there any additional costs or fees?
              <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
              No hidden fees. The price you see is exactly what you pay for the
              features included in your plan.
            </p>
          </details>
        </div>
      </div>
    </section>
  );
}
