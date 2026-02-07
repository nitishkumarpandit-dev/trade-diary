export function HowItWorks() {
  return (
    <section className="py-24 bg-white dark:bg-slate-900" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
        <h2 className="text-4xl font-extrabold mb-4">
          How <span className="text-primary">TradeDiary</span> Works
        </h2>
        <p className="text-slate-500">
          Simple steps to transform your trading performance
        </p>
      </div>
      <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-12 relative">
        <div className="hidden md:block absolute top-12 left-[25%] right-[25%] h-0.5 border-t-2 border-dashed border-slate-200 dark:border-slate-700 -z-0"></div>
        <div className="relative z-10 text-center flex-1">
          <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg shadow-blue-500/30">
            1
          </div>
          <h4 className="text-lg font-bold mb-2">Log Your Trade</h4>
          <p className="text-sm text-slate-500 leading-relaxed">
            Quickly record all trade details including entry, exit, position
            size, and notes.
          </p>
        </div>
        <div className="relative z-10 text-center flex-1">
          <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg shadow-blue-500/30">
            2
          </div>
          <h4 className="text-lg font-bold mb-2">Tag & Rate</h4>
          <p className="text-sm text-slate-500 leading-relaxed">
            Categorize trades by strategy, instrument, and rate your execution
            quality.
          </p>
        </div>
        <div className="relative z-10 text-center flex-1">
          <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg shadow-blue-500/30">
            3
          </div>
          <h4 className="text-lg font-bold mb-2">Review & Improve</h4>
          <p className="text-sm text-slate-500 leading-relaxed">
            Analyze performance metrics to identify strengths and weaknesses in
            your strategy.
          </p>
        </div>
      </div>
    </section>
  );
}
