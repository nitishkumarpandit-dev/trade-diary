"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { LineChart, Moon, Sun, Menu, X, LayoutDashboard } from "lucide-react";
import { User } from "next-auth";

interface HeaderProps {
  user?: User;
}

export function Header({ user }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <LineChart className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">TradeDiary</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
          <Link href="#" className="hover:text-primary transition-colors">
            Home
          </Link>
          <Link
            href="#features"
            className="hover:text-primary transition-colors"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="hover:text-primary transition-colors"
          >
            How it Works
          </Link>
          <Link
            href="#pricing"
            className="hover:text-primary transition-colors"
          >
            Pricing
          </Link>
          <Link href="#faq" className="hover:text-primary transition-colors">
            FAQ
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <button
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <Sun className="w-5 h-5 hidden dark:block" />
            <Moon className="w-5 h-5 block dark:hidden" />
          </button>
          {user ? (
            <Link
              href="/dashboard"
              className="hidden sm:flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-primary/20"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:block text-sm font-semibold hover:text-primary"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-primary hidden sm:block text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-primary/20"
              >
                Get Started
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark p-4 space-y-4">
          <Link
            href="#"
            className="block text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="#features"
            className="block text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary"
            onClick={() => setIsMenuOpen(false)}
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="block text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary"
            onClick={() => setIsMenuOpen(false)}
          >
            How it Works
          </Link>
          <Link
            href="#pricing"
            className="block text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary"
            onClick={() => setIsMenuOpen(false)}
          >
            Pricing
          </Link>
          <Link
            href="#faq"
            className="block text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary"
            onClick={() => setIsMenuOpen(false)}
          >
            FAQ
          </Link>
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            {user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm font-semibold mb-4 text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block text-sm font-semibold mb-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block text-sm font-semibold text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
