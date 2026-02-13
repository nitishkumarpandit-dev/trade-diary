import { Activity } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 font-display text-slate-900 dark:text-slate-200">
      {/* Left Pane: Imagery & Quote (Desktop Only) - Reusable Sidebar */}
      <div className="hidden lg:flex lg:w-5/12 relative flex-col justify-between p-12 bg-linear-to-br from-blue-700 via-blue-800 to-indigo-900 overflow-hidden">
        <Link href="/" className="relative z-20 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-xl shadow-blue-900/20">
            <Activity className="text-primary h-6 w-6" />
          </div>
          <span className="text-white text-2xl font-bold tracking-tight">
            TradeDiary
          </span>
        </Link>
        <div className="absolute inset-0 z-0 pointer-events-none opacity-80">
          <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-400/10 rounded-full blur-[100px]"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-3xl max-w-lg text-center shadow-[0_0_80px_-10px_rgba(255,255,255,0.2)]">
            <div className="mb-8 inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 border border-white/20">
              <span className="text-white text-4xl">❝</span>
            </div>
            <h2 className="text-white text-3xl italic leading-relaxed mb-6">
              Discipline is the bridge between goals and accomplishment.
            </h2>
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-8 bg-white/40"></div>
              <p className="text-white/90 text-sm uppercase tracking-[0.2em] font-semibold">
                Jim Rohn
              </p>
              <div className="h-px w-8 bg-white/40"></div>
            </div>
          </div>
        </div>
        <div className="relative z-20 flex justify-between items-end">
          <div className="flex gap-1.5">
            <div className="w-8 h-1.5 bg-white rounded-full"></div>
            <div className="w-2 h-1.5 bg-white/30 rounded-full"></div>
            <div className="w-2 h-1.5 bg-white/30 rounded-full"></div>
          </div>
          <p className="text-white/60 text-[10px] tracking-widest uppercase font-bold">
            Premium Trading Intelligence
          </p>
        </div>
      </div>

      {/* Right Pane: Content */}
      <div className="flex w-full lg:w-7/12 flex-col justify-center items-center px-6 py-12 bg-white dark:bg-background-dark overflow-y-auto">
        <div className="w-full max-w-[440px]">{children}</div>
      </div>
    </div>
  );
}
