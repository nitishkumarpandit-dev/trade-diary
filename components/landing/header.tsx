"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { LineChart, Moon, Sun, Menu, X, LayoutDashboard } from "lucide-react";
import { User } from "next-auth";
import { motion } from "framer-motion";

interface HeaderProps {
  user?: User;
}

export function Header({ user }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800"
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <LineChart className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">TradeDiary</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
          <Link href="#" className="relative group hover:text-primary transition-colors">
            <span>Home</span>
            <motion.span
              className="absolute left-0 -bottom-1 h-0.5 bg-primary"
              initial={{ width: 0 }}
              whileHover={{ width: "100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </Link>
          <Link href="#features" className="relative group hover:text-primary transition-colors">
            <span>Features</span>
            <motion.span
              className="absolute left-0 -bottom-1 h-0.5 bg-primary"
              initial={{ width: 0 }}
              whileHover={{ width: "100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </Link>
          <Link href="#how-it-works" className="relative group hover:text-primary transition-colors">
            <span>How it Works</span>
            <motion.span
              className="absolute left-0 -bottom-1 h-0.5 bg-primary"
              initial={{ width: 0 }}
              whileHover={{ width: "100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </Link>
          <Link href="#pricing" className="relative group hover:text-primary transition-colors">
            <span>Pricing</span>
            <motion.span
              className="absolute left-0 -bottom-1 h-0.5 bg-primary"
              initial={{ width: 0 }}
              whileHover={{ width: "100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </Link>
          <Link href="#faq" className="relative group hover:text-primary transition-colors">
            <span>FAQ</span>
            <motion.span
              className="absolute left-0 -bottom-1 h-0.5 bg-primary"
              initial={{ width: 0 }}
              whileHover={{ width: "100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
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
              <motion.a
                href="/register"
                className="bg-primary hidden sm:block text-white px-5 py-2 rounded-full text-sm font-semibold shadow-lg shadow-primary/20"
                whileHover={{ scale: 1.05, boxShadow: "0 0 24px rgba(19,127,236,0.35)" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                Get Started
              </motion.a>
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
    </motion.header>
  );
}
