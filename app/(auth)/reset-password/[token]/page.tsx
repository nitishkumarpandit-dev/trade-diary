"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  Circle, 
  AlertCircle, 
  Loader2, 
  ArrowRight 
} from "lucide-react";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function NewPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const { token } = use(params);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  // Real-time validation states
  const isLengthValid = password?.length >= 8;
  const isCaseValid = /[A-Z]/.test(password || "");
  const isNumberValid = /[0-9]/.test(password || "");

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setServerError(null);
    try {
      const response = await fetch(`/api/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: data.password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Something went wrong");
      }

      setIsSuccess(true);
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
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
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-[400px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-800 text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="mb-6 flex justify-center">
            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full inline-flex items-center justify-center text-green-600 dark:text-green-400">
              <CheckCircle className="h-10 w-10" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Password reset successful
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            Your password has been updated successfully. You can now log in with your new password.
          </p>
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            Go to Login
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-[400px]">
        {/* Mobile Navigation (Logo Only) */}
        <div className="flex items-center gap-2 mb-10 lg:hidden justify-center">
          <Lock className="text-primary h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold tracking-tight">TradeLog</span>
        </div>

        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-6 text-blue-600 dark:text-blue-400">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            Set new password
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Please enter your new password below.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {serverError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/20 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {serverError}
            </div>
          )}

          {/* New Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900 dark:text-slate-200">
              New Password
            </label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                className={`flex h-10 w-full rounded-md border ${
                  errors.password
                    ? "border-red-500 focus-visible:ring-red-500/50"
                    : "border-slate-200 dark:border-slate-800"
                } bg-white px-3 py-2 pr-10 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400`}
                placeholder="••••••••"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3 border border-slate-100 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Password Requirements
            </p>
            <ul className="space-y-2">
              <li className={`flex items-center gap-2 text-sm transition-colors ${
                isLengthValid ? "text-slate-900 dark:text-slate-200" : "text-slate-500 dark:text-slate-400"
              }`}>
                {isLengthValid ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
                <span>At least 8 characters</span>
              </li>
              <li className={`flex items-center gap-2 text-sm transition-colors ${
                isCaseValid ? "text-slate-900 dark:text-slate-200" : "text-slate-500 dark:text-slate-400"
              }`}>
                {isCaseValid ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
                <span>At least one uppercase letter</span>
              </li>
              <li className={`flex items-center gap-2 text-sm transition-colors ${
                isNumberValid ? "text-slate-900 dark:text-slate-200" : "text-slate-500 dark:text-slate-400"
              }`}>
                {isNumberValid ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
                <span>At least one number</span>
              </li>
            </ul>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900 dark:text-slate-200">
              Confirm Password
            </label>
            <div className="relative">
              <input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                className={`flex h-10 w-full rounded-md border ${
                  errors.confirmPassword
                    ? "border-red-500 focus-visible:ring-red-500/50"
                    : "border-slate-200 dark:border-slate-800"
                } bg-white px-3 py-2 pr-10 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400`}
                placeholder="••••••••"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.confirmPassword.message}
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
                Resetting password...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
