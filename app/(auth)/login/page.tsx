"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Activity, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleBlur = (field: "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "email") {
      if (!email) {
        setErrors((prev) => ({ ...prev, email: "Email is required" }));
      } else if (!validateEmail(email)) {
        setErrors((prev) => ({ ...prev, email: "Invalid email format" }));
      } else {
        setErrors((prev) => ({ ...prev, email: "" }));
      }
    } else if (field === "password") {
      if (!password) {
        setErrors((prev) => ({ ...prev, password: "Password is required" }));
      } else {
        setErrors((prev) => ({ ...prev, password: "" }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    setTouched({ email: true, password: true });

    if (isValid) {
      // Proceed with login logic
      console.log("Logging in...", { email, password });
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4 lg:hidden">
          <Activity className="text-primary h-8 w-8" />
          <span className="text-xl font-bold tracking-tight">Journal Pro</span>
        </div>
        <h1 className="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-tight">
          Welcome Back
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base mt-2">
          Log in to track your trades and monitor performance.
        </p>
      </div>
      {/* Form */}
      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Email Field */}
        <div className="flex flex-col gap-2">
          <label className="text-slate-900 dark:text-slate-200 text-sm font-semibold leading-normal">
            Email Address
          </label>
          <input
            className={`form-input flex w-full rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border ${
              errors.email && touched.email
                ? "border-red-500 focus:ring-red-500/50"
                : "border-slate-200 dark:border-slate-700"
            } bg-white dark:bg-slate-800/50 h-12 placeholder:text-slate-400 p-[12px] text-base`}
            placeholder="Enter your email address"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
            }}
            onBlur={() => handleBlur("email")}
          />
          {errors.email && touched.email && (
            <p className="text-red-500 text-xs font-medium flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.email}
            </p>
          )}
        </div>
        {/* Password Field */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-slate-900 dark:text-slate-200 text-sm font-semibold leading-normal">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-primary text-sm font-medium hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative flex w-full items-stretch">
            <input
              className={`form-input flex w-full rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border ${
                errors.password && touched.password
                  ? "border-red-500 focus:ring-red-500/50"
                  : "border-slate-200 dark:border-slate-700"
              } bg-white dark:bg-slate-800/50 h-12 placeholder:text-slate-400 p-[12px] pr-12 text-base`}
              placeholder="Enter your password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password)
                  setErrors((prev) => ({ ...prev, password: "" }));
              }}
              onBlur={() => handleBlur("password")}
            />
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </div>
          </div>
          {errors.password && touched.password && (
            <p className="text-red-500 text-xs font-medium flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.password}
            </p>
          )}
        </div>
        {/* Submit Button */}
        <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-primary text-white text-base font-bold leading-normal w-full hover:bg-primary/90 transition-all shadow-md shadow-primary/20">
          Sign In
        </button>
      </form>
      {/* Google Login */}
      <div className="flex flex-col items-center justify-center gap-4 mt-6">
        <div className="w-full flex items-center gap-2">
          <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
            OR
          </p>
          <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
        </div>
        <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer">
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
        </button>
      </div>
      {/* Footer */}
      <div className="text-center mt-8">
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-primary font-bold hover:underline"
          >
            Create one now
          </Link>
        </p>
      </div>
    </>
  );
}
