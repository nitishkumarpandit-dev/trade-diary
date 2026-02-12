"use client";

import { useState, useRef, useEffect, type FormEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, AlertCircle, CheckCircle, Loader2, Timer } from "lucide-react";
import { signIn } from "next-auth/react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(54); // Starting at 54s as per design
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Auto-submit when OTP is full
  useEffect(() => {
    const otpValue = otp.join("");
    if (otpValue.length === 6) {
      verifyEmail(otpValue);
    }
  }, [otp]);

  const verifyEmail = async (code: string) => {
    if (!email) {
      setError("Email address is missing");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Use signIn with code to automatically verify and login
      const result = await signIn("credentials", {
        email,
        code,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      setSuccess("Email verified successfully! Redirecting...");
      // Redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err) {
      if (err instanceof Error) {
        // Map common errors to user-friendly messages
        if (err.message === "Invalid or expired verification code") {
          setError("Invalid or expired code. Please try again.");
        } else if (err.message === "AccessDenied") {
          setError("Verification failed. Please try again.");
        } else {
          setError(err.message);
        }
      } else {
        setError("An unexpected error occurred");
      }
      setIsLoading(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    // Allow only numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    setError("");

    // Focus last filled input or the next empty one
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleResend = async () => {
    if (!canResend || !email) return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/verify-email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend code");
      }

      setSuccess("Verification code sent!");
      setCountdown(60);
      setCanResend(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-[450px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-800">
        <div className="text-center mb-8">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative bg-blue-50 dark:bg-blue-900/20 p-4 rounded-full inline-flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Mail className="h-10 w-10" />
              </div>
            </div>
          </div>

          {/* Header Text */}
          <h1 className="text-slate-900 dark:text-white text-2xl font-bold mb-3">
            Verify Your Email
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            We&apos;ve sent a 6-digit verification code to <br />
            <span className="font-semibold text-slate-900 dark:text-slate-200">
              {email || "your email address"}
            </span>
            . Please enter the code below.
          </p>
        </div>

        {/* OTP Input Section */}
        <div className="flex flex-col gap-6">
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((val, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold bg-slate-50 dark:bg-slate-800 border-2 ${
                  error
                    ? "border-red-500 focus:border-red-500"
                    : success
                      ? "border-green-500 focus:border-green-500"
                      : "border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500"
                } rounded-lg transition-all text-slate-900 dark:text-white focus:outline-none focus:ring-0`}
                maxLength={1}
                type="text"
                value={val}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                disabled={isLoading || !!success}
                placeholder="-"
              />
            ))}
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex items-center justify-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg flex items-center justify-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium animate-in fade-in slide-in-from-top-2">
              <CheckCircle className="h-4 w-4" />
              {success}
            </div>
          )}

          <button
            onClick={() => verifyEmail(otp.join(""))}
            disabled={isLoading || otp.join("").length !== 6 || !!success}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Account"
            )}
          </button>
        </div>

        {/* Footer Links/Timer */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-3">
            Didn&apos;t receive the email?
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={handleResend}
              className={`text-sm font-semibold transition-colors flex items-center gap-1 ${
                canResend
                  ? "text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  : "text-slate-400 dark:text-slate-600 cursor-not-allowed"
              }`}
              disabled={!canResend || isLoading}
            >
              Resend Email
            </button>
            {!canResend && (
              <span className="text-slate-400 dark:text-slate-600 text-sm font-medium flex items-center gap-1">
                <Timer className="h-3 w-3" />
                0:{countdown.toString().padStart(2, "0")}
              </span>
            )}
          </div>

          <div className="mt-6">
            <Link
              href="/register"
              className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-xs font-medium flex items-center justify-center gap-1"
            >
              Wrong email address? Change it here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
