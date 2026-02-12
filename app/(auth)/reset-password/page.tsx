"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock, Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react";

const resetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormValues) => {
    setServerError(null);
    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Something went wrong. Please try again.");
      }

      setIsSuccess(true);
    } catch (error) {
      setServerError("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-[400px]">
        {/* Mobile Navigation (Logo Only) */}
        <div className="flex items-center gap-2 mb-10 lg:hidden justify-center">
          <Lock className="text-primary h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold tracking-tight">TradeLog</span>
        </div>

        {isSuccess ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-800 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="mb-6 flex justify-center">
              <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full inline-flex items-center justify-center text-green-600 dark:text-green-400">
                <CheckCircle className="h-10 w-10" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Check your email
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              If an account exists with that email, we&apos;ve sent password reset instructions to it.
            </p>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-6 text-blue-600 dark:text-blue-400">
                <Lock className="h-8 w-8" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                Reset password
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Enter your email and we&apos;ll send you a link to reset your password.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {serverError && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/20 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {serverError}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900 dark:text-slate-200">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-slate-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    {...register("email")}
                    type="email"
                    className={`flex h-10 w-full rounded-md border ${
                      errors.email
                        ? "border-red-500 focus-visible:ring-red-500/50"
                        : "border-slate-200 dark:border-slate-800"
                    } bg-white pl-10 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400`}
                    placeholder="name@example.com"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  "Send reset link"
                )}
              </button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
