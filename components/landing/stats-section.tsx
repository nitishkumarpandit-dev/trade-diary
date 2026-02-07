export function StatsSection() {
  return (
    <section className="py-12 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <p className="text-3xl font-extrabold text-primary mb-1">160k+</p>
            <p className="text-sm text-slate-500 font-medium">Trades logged & analyzed</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-extrabold text-emerald-500 mb-1">2.5x</p>
            <p className="text-sm text-slate-500 font-medium">Disciplined trades</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-extrabold text-rose-500 mb-1">-63%</p>
            <p className="text-sm text-slate-500 font-medium">Emotional trades</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-extrabold text-orange-500 mb-1">6K+</p>
            <p className="text-sm text-slate-500 font-medium">Active traders</p>
          </div>
        </div>
      </div>
    </section>
  )
}
