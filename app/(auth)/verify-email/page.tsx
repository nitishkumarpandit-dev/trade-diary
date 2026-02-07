"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { Mail, Activity, Clock, AlertCircle } from "lucide-react";

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

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
    e: React.KeyboardEvent<HTMLInputElement>
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault(); // Prevent default form submission if wrapped in form
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }
    
    console.log("Verifying OTP:", otpValue);
  };

  return (
    <>
      {/* Mobile Navigation (Logo Only) */}
      <div className="flex items-center gap-2 mb-10 lg:hidden">
        <Activity className="text-primary h-8 w-8" />
        <span className="text-xl font-bold tracking-tight">TradingJournal</span>
      </div>

      <div className="text-center mb-8">
        {/* Illustration Area */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 rounded-full scale-150 blur-xl"></div>
            <div className="relative bg-primary/10 p-6 rounded-full inline-flex items-center justify-center text-primary">
              <Mail className="h-16 w-16" />
            </div>
          </div>
        </div>
        {/* Header Text */}
        <h1 className="text-slate-900 dark:text-white text-3xl font-bold mb-4">
          Verify Your Email
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
          We&apos;ve sent a 6-digit verification code to{" "}
          <span className="font-semibold text-slate-900 dark:text-slate-200">
            alex.trader@example.com
          </span>
          . Please enter the code below to confirm your account.
        </p>
      </div>

      {/* OTP Input Section */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-center gap-3">
          {otp.map((val, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              className={`otp-input w-12 h-14 text-center text-xl font-bold bg-slate-50 dark:bg-slate-800 border-b-2 ${
                error
                  ? "border-red-500 focus:border-red-500"
                  : "border-slate-300 dark:border-slate-700 focus:border-primary dark:focus:border-primary"
              } rounded-lg transition-all text-slate-900 dark:text-white focus:outline-none focus:ring-0`}
              maxLength={1}
              type="text"
              value={val}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              placeholder="-"
            />
          ))}
        </div>
        {error && (
          <p className="text-red-500 text-sm font-medium flex items-center justify-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        )}
        <button 
          onClick={handleSubmit}
          className="w-full bg-primary text-white font-bold py-4 rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 cursor-pointer"
        >
          Verify Account
        </button>
      </div>

      {/* Footer Links/Timer */}
      <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-500 mb-2">
          Didn&apos;t receive the email?
        </p>
        <div className="flex items-center justify-center gap-2">
          <button
            className="text-primary font-semibold text-sm hover:underline disabled:text-slate-400 disabled:no-underline cursor-pointer"
            disabled
          >
            Resend Email
          </button>
          <span className="text-slate-400 dark:text-slate-600 text-sm">•</span>
          <span className="text-slate-600 dark:text-slate-400 text-sm font-medium flex items-center gap-1">
            <Clock className="h-4 w-4" />
            0:54
          </span>
        </div>
        <div className="mt-6">
          <Link
            href="#"
            className="text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-primary transition-colors text-xs font-medium"
          >
            Wrong email address? Change it here
          </Link>
        </div>
      </div>
    </>
  );
}
