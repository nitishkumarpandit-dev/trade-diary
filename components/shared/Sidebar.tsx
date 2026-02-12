"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ScrollText,
  Wand2,
  BarChart3,
  Brain,
  Settings,
  LogOut,
} from "lucide-react";
import { User as NextAuthUser } from "next-auth";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Trades", href: "/trades", icon: ScrollText },
  { name: "Strategies", href: "/strategies", icon: Wand2 },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Psychology", href: "/psychology", icon: Brain },
  { name: "Settings", href: "/settings", icon: Settings },
];

type ExtendedUser = NextAuthUser & {
  plan?: {
    type: "free" | "pro";
    monthlyTradesLimit: number;
    tradesUsed: number;
    resetDate: string | Date;
  };
};

export default function Sidebar({
  className,
  isOpen,
  onClose,
  user,
}: {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  user?: ExtendedUser;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`w-[250px] border-r border-slate-200 dark:border-slate-800 bg-card-light dark:bg-card-dark flex flex-col fixed top-[70px] bottom-0 z-50 overflow-y-auto transition-transform duration-300 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"} ${className}`}
      >
        <nav className="flex-1 px-4 space-y-1 mt-6">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  active
                    ? "text-primary bg-blue-50 dark:bg-blue-900/20"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <item.icon
                  className={`w-[22px] h-[22px] ${active ? "text-primary" : "text-slate-500"}`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              {user?.plan?.type === "pro" ? "Pro Plan" : "Free Plan"}
            </p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mb-3">
              <div
                className="bg-primary h-1.5 rounded-full"
                style={{
                  width:
                    user?.plan?.type === "pro"
                      ? "100%"
                      : `${Math.min(100, Math.round(((user?.plan?.tradesUsed ?? 0) / (user?.plan?.monthlyTradesLimit ?? 100)) * 100))}%`,
                }}
              />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
              {user?.plan?.type === "pro"
                ? "Unlimited trades"
                : `${user?.plan?.tradesUsed ?? 0}/${user?.plan?.monthlyTradesLimit ?? 100} trades`}
            </p>
            <button
              className={`w-full py-2 border rounded-lg text-xs font-semibold hover:shadow-sm transition-all ${
                user?.plan?.type === "pro"
                  ? "bg-slate-200 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 cursor-not-allowed"
                  : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100"
              }`}
              disabled={user?.plan?.type === "pro"}
            >
              {user?.plan?.type === "pro" ? "Pro Active" : "Upgrade"}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
