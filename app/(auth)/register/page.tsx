"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Database, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";

const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms",
  }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      termsAccepted: false,
    },
  });

  const password = watch("password");

  const getStrength = (pass: string) => {
    if (!pass) return 0;
    if (pass.length < 8) return 1;
    if (pass.length < 10) return 2;
    if (
      pass.match(/[A-Z]/) &&
      pass.match(/[0-9]/) &&
      pass.match(/[^A-Za-z0-9]/)
    )
      return 4;
    if (pass.match(/[A-Z]/) && pass.match(/[0-9]/)) return 3;
    return 2;
  };

  const strength = getStrength(password || "");

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      if (error instanceof Error) {
        setServerError(error.message);
      } else {
        setServerError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Google sign in error:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        {/* Mobile Navigation (Logo Only) */}
        <div className="flex items-center gap-2 mb-10 lg:hidden justify-center">
          <Database className="text-primary h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold tracking-tight">TradeLog</span>
        </div>

        <div className="mb-10 text-left">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Create Your Account
          </h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Start your 14-day free trial today.
          </p>
        </div>

        {/* Social Sign-in */}
        <button
          onClick={handleGoogleSignIn}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
        >
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
          Sign up with Google
        </button>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
              Or continue with email
            </span>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {serverError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/20 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {serverError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900 dark:text-slate-200">
                First name
              </label>
              <input
                {...register("firstName")}
                className={`flex h-10 w-full rounded-md border ${
                  errors.firstName
                    ? "border-red-500 focus-visible:ring-red-500/50"
                    : "border-slate-200 dark:border-slate-800"
                } bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400`}
                placeholder="John"
                disabled={isLoading}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900 dark:text-slate-200">
                Last name
              </label>
              <input
                {...register("lastName")}
                className={`flex h-10 w-full rounded-md border ${
                  errors.lastName
                    ? "border-red-500 focus-visible:ring-red-500/50"
                    : "border-slate-200 dark:border-slate-800"
                } bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400`}
                placeholder="Doe"
                disabled={isLoading}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900 dark:text-slate-200">
              Email
            </label>
            <input
              {...register("email")}
              className={`flex h-10 w-full rounded-md border ${
                errors.email
                  ? "border-red-500 focus-visible:ring-red-500/50"
                  : "border-slate-200 dark:border-slate-800"
              } bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400`}
              placeholder="m@example.com"
              type="email"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900 dark:text-slate-200">
              Password
            </label>
            <div className="relative">
              <input
                {...register("password")}
                className={`flex h-10 w-full rounded-md border ${
                  errors.password
                    ? "border-red-500 focus-visible:ring-red-500/50"
                    : "border-slate-200 dark:border-slate-800"
                } bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 pr-10`}
                type={showPassword ? "text" : "password"}
                disabled={isLoading}
              />
              <button
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
                type="button"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.password.message}
              </p>
            )}
            {/* Password Strength Meter */}
            <div className="mt-3 space-y-2">
              <div className="flex h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full transition-all duration-500 ${
                    strength === 0
                      ? "bg-transparent w-0"
                      : strength === 1
                        ? "bg-red-500 w-1/4"
                        : strength === 2
                          ? "bg-yellow-500 w-2/4"
                          : strength === 3
                            ? "bg-blue-500 w-3/4"
                            : "bg-emerald-500 w-full"
                  }`}
                ></div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-right">
                Strength:{" "}
                <span
                  className={`font-medium ${
                    strength < 2
                      ? "text-red-500"
                      : strength < 3
                        ? "text-yellow-500"
                        : strength < 4
                          ? "text-blue-500"
                          : "text-emerald-500"
                  }`}
                >
                  {strength === 0
                    ? "None"
                    : strength === 1
                      ? "Weak"
                      : strength === 2
                        ? "Fair"
                        : strength === 3
                          ? "Good"
                          : "Strong"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <input
              {...register("termsAccepted")}
              className="peer h-4 w-4 shrink-0 rounded-sm border border-slate-200 border-slate-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-slate-900 data-[state=checked]:text-slate-50 mt-1 dark:border-slate-800 dark:border-slate-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300 dark:data-[state=checked]:bg-slate-50 dark:data-[state=checked]:text-slate-900 accent-blue-600"
              id="terms"
              type="checkbox"
              disabled={isLoading}
            />
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600 dark:text-slate-400 leading-normal"
              htmlFor="terms"
            >
              I agree to the{" "}
              <Link
                className="font-medium text-blue-600 hover:underline"
                href="#"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                className="font-medium text-blue-600 hover:underline"
                href="#"
              >
                Privacy Policy
              </Link>
            </label>
          </div>
          {errors.termsAccepted && (
            <p className="text-red-500 text-xs font-medium flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.termsAccepted.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            className="font-bold text-blue-600 hover:underline"
            href="/login"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
