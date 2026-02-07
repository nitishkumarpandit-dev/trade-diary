"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleBlur = () => {
    setTouched(true);
    if (!email) {
      setError("Email is required");
    } else if (!validateEmail(email)) {
      setError("Invalid email format");
    } else {
      setError("");
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Invalid email format");
      return;
    }

    setError("");
    console.log("Sending reset link to:", email);
  };

  return (
    <>
      {/* Mobile Navigation (Logo Only) */}
      <div className="flex items-center gap-2 mb-10 lg:hidden">
        <TrendingUp className="text-primary h-8 w-8" />
        <span className="text-xl font-bold tracking-tight">TradingJournal</span>
      </div>

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center size-16 bg-primary/10 rounded-full text-primary mb-4">
          <Lock className="h-8 w-8" />
        </div>
        <h1 className="text-slate-900 dark:text-white text-2xl font-bold leading-tight">
          Reset your password
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 leading-relaxed">
          Enter the email address associated with your account and we&apos;ll
          send you a link to reset your password.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label
            className="block text-slate-900 dark:text-slate-200 text-sm font-semibold mb-2"
            htmlFor="email"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="h-5 w-5" />
            </div>
            <input
              className={`form-input block w-full pl-10 pr-4 py-3 rounded-lg border ${
                error && touched
                  ? "border-red-500 focus:ring-red-500/20"
                  : "border-slate-200 dark:border-slate-700 focus:ring-primary/20 focus:border-primary"
              } bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all text-sm`}
              id="email"
              name="email"
              placeholder="name@example.com"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              onBlur={handleBlur}
            />
          </div>
          {error && touched && (
            <p className="text-red-500 text-xs font-medium flex items-center gap-1 mt-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          )}
        </div>
        <button
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md shadow-primary/20 cursor-pointer"
          type="submit"
        >
          <span>Send Reset Link</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>
      </div>
    </>
  );
}
