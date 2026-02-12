"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  TrendingUp,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setServerError(null);
    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Something went wrong");
      }

      setIsSuccess(true);
    } catch (error) {
      if (error instanceof Error) {
        setServerError(error.message);
      } else {
        setServerError("An unexpected error occurred");
      }
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center animate-in fade-in zoom-in duration-300">
        <div className="inline-flex items-center justify-center size-16 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400 mb-4">
          <CheckCircle className="h-8 w-8" />
        </div>
        <h1 className="text-slate-900 dark:text-white text-2xl font-bold leading-tight mb-2">
          Check your email
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
          We have sent a password reset link to your email address. Please check
          your inbox (and spam folder).
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-md shadow-primary/20"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>
      </div>
    );
  }

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

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
              {...register("email")}
              className={`form-input block w-full pl-10 pr-4 py-3 rounded-lg border ${
                errors.email
                  ? "border-red-500 focus:ring-red-500/20"
                  : "border-slate-200 dark:border-slate-700 focus:ring-primary/20 focus:border-primary"
              } bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all text-sm`}
              id="email"
              placeholder="name@example.com"
              type="email"
              disabled={isSubmitting}
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs font-medium flex items-center gap-1 mt-2">
              <AlertCircle className="h-4 w-4" />
              {errors.email.message}
            </p>
          )}
        </div>

        {serverError && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{serverError}</p>
          </div>
        )}

        <button
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md shadow-primary/20 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <span>Send Reset Link</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
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
