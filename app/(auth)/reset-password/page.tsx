"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Activity,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Circle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });
  const [errors, setErrors] = useState({ password: "", confirmPassword: "" });

  const isLengthValid = password.length >= 8;
  const isCaseValid = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const isSpecialValid =
    /[0-9]/.test(password) || /[^a-zA-Z0-9]/.test(password);
  const doPasswordsMatch = password === confirmPassword;

  const validateField = (field: "password" | "confirmPassword") => {
    let errorMessage = "";
    if (field === "password") {
      if (!password) {
        errorMessage = "Password is required";
      } else if (!isLengthValid || !isCaseValid || !isSpecialValid) {
        // We show detailed requirements below, so just a generic message here if needed
        // but typically we want to block submission
      }
    } else if (field === "confirmPassword") {
      if (!confirmPassword) {
        errorMessage = "Please confirm your password";
      } else if (!doPasswordsMatch) {
        errorMessage = "Passwords do not match";
      }
    }
    setErrors((prev) => ({ ...prev, [field]: errorMessage }));
    return errorMessage === "";
  };

  const handleBlur = (field: "password" | "confirmPassword") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched({ password: true, confirmPassword: true });

    const isPasswordValid = validateField("password");
    const isConfirmValid = validateField("confirmPassword");
    const isComplexityValid = isLengthValid && isCaseValid && isSpecialValid;

    if (isPasswordValid && isConfirmValid && isComplexityValid) {
      console.log("Updating password...");
    }
  };

  return (
    <>
      {/* Mobile Navigation (Logo Only) */}
      <div className="flex items-center gap-2 mb-10 lg:hidden">
        <Activity className="text-primary h-8 w-8" />
        <span className="text-xl font-bold tracking-tight">TradingJournal</span>
      </div>

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <Lock className="text-primary h-8 w-8" />
        </div>
        <h1 className="text-slate-900 dark:text-white tracking-tight text-2xl font-bold leading-tight mb-2">
          Reset Your Password
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Choose a strong password to protect your trading data and account
          security.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* New Password Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            New Password
          </label>
          <div className="relative flex items-center">
            <input
              className={`block w-full rounded-lg border ${
                errors.password && touched.password
                  ? "border-red-500 focus:ring-red-500/20"
                  : "border-slate-300 dark:border-slate-700 focus:border-primary focus:ring-primary/20"
              } bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all pr-12`}
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password)
                  setErrors((prev) => ({ ...prev, password: "" }));
              }}
              onBlur={() => handleBlur("password")}
            />
            <button
              className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && touched.password && (
            <p className="text-red-500 text-xs font-medium flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.password}
            </p>
          )}
        </div>
        {/* Password Strength/Complexity Requirements */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3 border border-slate-100 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Complexity Requirements
          </p>
          <ul className="space-y-2">
            <li
              className={`flex items-center gap-2 text-sm ${
                isLengthValid
                  ? "text-slate-600 dark:text-slate-400"
                  : "text-slate-400 dark:text-slate-500"
              }`}
            >
              {isLengthValid ? (
                <CheckCircle className="text-primary h-[18px] w-[18px]" />
              ) : (
                <Circle className="h-[18px] w-[18px]" />
              )}
              <span>At least 8 characters long</span>
            </li>
            <li
              className={`flex items-center gap-2 text-sm ${
                isCaseValid
                  ? "text-slate-600 dark:text-slate-400"
                  : "text-slate-400 dark:text-slate-500"
              }`}
            >
              {isCaseValid ? (
                <CheckCircle className="text-primary h-[18px] w-[18px]" />
              ) : (
                <Circle className="h-[18px] w-[18px]" />
              )}
              <span>One uppercase and one lowercase letter</span>
            </li>
            <li
              className={`flex items-center gap-2 text-sm ${
                isSpecialValid
                  ? "text-slate-600 dark:text-slate-400"
                  : "text-slate-400 dark:text-slate-500"
              }`}
            >
              {isSpecialValid ? (
                <CheckCircle className="text-primary h-[18px] w-[18px]" />
              ) : (
                <Circle className="h-[18px] w-[18px]" />
              )}
              <span>One number or special character</span>
            </li>
          </ul>
        </div>
        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Confirm New Password
          </label>
          <div className="relative flex items-center">
            <input
              className={`block w-full rounded-lg border ${
                errors.confirmPassword && touched.confirmPassword
                  ? "border-red-500 focus:ring-red-500/20"
                  : "border-slate-300 dark:border-slate-700 focus:border-primary focus:ring-primary/20"
              } bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all pr-12`}
              placeholder="••••••••"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword)
                  setErrors((prev) => ({ ...prev, confirmPassword: "" }));
              }}
              onBlur={() => handleBlur("confirmPassword")}
            />
            <button
              className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {/* Validation Message */}
          {errors.confirmPassword && touched.confirmPassword && (
            <div className="flex items-center gap-1.5 text-xs text-red-500 mt-1">
              <AlertCircle className="h-[14px] w-[14px]" />
              <span>{errors.confirmPassword}</span>
            </div>
          )}
        </div>
        {/* Action Button */}
        <button
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          type="submit"
        >
          Update Password
          <ArrowRight className="h-5 w-5" />
        </button>
      </form>
      {/* Back to Login Link */}
      <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-800 pt-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
          Back to Login
        </Link>
      </div>
    </>
  );
}
