"use client";

import { useTheme } from "next-themes";
import {
  Moon,
  Sun,
  ChevronDown,
  Menu,
  TrendingUp,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { User } from "next-auth";
import { signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

export default function Navbar({
  onMenuClick,
  user,
}: {
  onMenuClick?: () => void;
  user?: User;
}) {
  const { theme, setTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="h-[70px] border-b border-slate-200 dark:border-slate-800 bg-card-light dark:bg-card-dark flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50 transition-colors duration-300">
      <div className="flex items-center gap-4">
        <button
          className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          onClick={onMenuClick}
        >
          <Menu className="w-6 h-6" />
        </button>
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl hidden md:block font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-primary to-blue-600">
            TradeDiary
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <button
          className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="w-5 h-5 hidden dark:block" />
          <Moon className="w-5 h-5 dark:hidden" />
        </button>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 pl-2 group cursor-pointer outline-none"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {user?.name || "Guest User"}
              </p>
              <p className="text-xs text-slate-500">
                {user?.email || "Not signed in"}
              </p>
            </div>
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "User"}
                    className="w-full h-full rounded-full object-cover"
                    width={32}
                    height={32}
                  />
                ) : (
                  getInitials(user?.name)
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-card-light dark:bg-card-dark rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-800">
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </div>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 sm:hidden">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {user?.name || "Guest User"}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.email || "Not signed in"}
                </p>
              </div>

              <Link
                href="/settings"
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                onClick={() => setIsProfileOpen(false)}
              >
                <UserIcon className="w-4 h-4" />
                Profile
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
