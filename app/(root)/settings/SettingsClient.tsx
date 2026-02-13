"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import {
  User,
  CreditCard,
  Sliders,
  Camera,
  CheckCircle,
  AlertCircle,
  Loader2,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { User as NextAuthUser } from "next-auth";
import Image from "next/image";
import { userSettingsSchema, UserSettingsFormValues } from "@/lib/validations";
import { updatePreferences } from "@/lib/actions/settings";

const settingsSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.newPassword && !data.currentPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Current password is required to set a new password",
      path: ["currentPassword"],
    },
  )
  .refine(
    (data) => {
      if (data.newPassword && data.newPassword.length < 8) {
        return false;
      }
      if (data.newPassword && !/[A-Z]/.test(data.newPassword)) {
        return false;
      }
      if (data.newPassword && !/[0-9]/.test(data.newPassword)) {
        return false;
      }
      return true;
    },
    {
      message:
        "New password must be at least 8 chars, with 1 uppercase & 1 number",
      path: ["newPassword"],
    },
  );

type SettingsFormValues = z.infer<typeof settingsSchema>;

type ExtendedUser = NextAuthUser & {
  preferences?: {
    defaultStrategy?: string;
    riskPerTrade?: number;
    currency?: string;
    timezone?: string;
  };
  plan?: {
    type: "free" | "pro";
    monthlyTradesLimit: number;
    tradesUsed: number;
    resetDate: string | Date;
  };
};

interface StrategyOption {
  _id: string;
  name: string;
}

export default function SettingsClient({
  user,
  strategies = [],
}: {
  user: ExtendedUser;
  strategies?: StrategyOption[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'preferences' | 'billing'
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [prefSuccessMessage, setPrefSuccessMessage] = useState("");
  const [prefErrorMessage, setPrefErrorMessage] = useState("");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingItems, setBillingItems] = useState<
    Array<{
      id: string;
      orderId: string;
      paymentId: string;
      receipt?: string;
      amount: number;
      currency: string;
      status: string;
      method?: string;
      createdAt: string | Date;
    }>
  >([]);

  useEffect(() => {
    const load = async () => {
      try {
        setBillingLoading(true);
        const res = await fetch("/api/billing/history");
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setBillingItems(data);
        }
      } finally {
        setBillingLoading(false);
      }
    };
    load();
  }, []);

  const downloadInvoice = (item: {
    orderId: string;
    paymentId: string;
    receipt?: string;
    amount: number;
    currency: string;
    status: string;
    method?: string;
    createdAt: string | Date;
  }) => {
    const rows = [
      ["Invoice", item.receipt || item.orderId],
      ["Date", new Date(item.createdAt).toLocaleString("en-IN")],
      ["Amount", `${(item.amount / 100).toFixed(2)} ${item.currency}`],
      ["Status", item.status],
      ["Payment ID", item.paymentId],
      ["Method", item.method || "-"],
    ];
    const csv =
      "data:text/csv;charset=utf-8," +
      rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", `${item.receipt || item.orderId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: user.name || "",
      currentPassword: "",
      newPassword: "",
    },
  });

  const {
    register: registerPrefs,
    handleSubmit: handlePrefsSubmit,
    reset: resetPrefs,
    formState: { errors: prefErrors, isSubmitting: isPrefsSubmitting },
  } = useForm<UserSettingsFormValues>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      defaultStrategy: user.preferences?.defaultStrategy || "",
      riskPerTrade:
        typeof user.preferences?.riskPerTrade === "number"
          ? user.preferences?.riskPerTrade
          : undefined,
      currency: user.preferences?.currency || "USD",
      timezone: user.preferences?.timezone || "UTC",
    },
  });

  const onSubmit = async (data: SettingsFormValues) => {
    setSuccessMessage("");
    setErrorMessage("");

    // If not changing password, remove password fields from submission to avoid validation errors on backend if empty
    const payload = {
      name: data.name,
      ...(isChangingPassword && data.newPassword
        ? {
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
          }
        : {}),
    };

    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update settings");
      }

      setSuccessMessage("Settings updated successfully!");
      router.refresh(); // Refresh server components to update user name in Navbar

      // Reset password fields
      if (isChangingPassword) {
        reset({
          name: data.name,
          currentPassword: "",
          newPassword: "",
        });
        setIsChangingPassword(false);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update settings";
      setErrorMessage(message);
    }
  };

  const onSubmitPreferences = async (data: UserSettingsFormValues) => {
    setPrefSuccessMessage("");
    setPrefErrorMessage("");
    try {
      const result = await updatePreferences({
        defaultStrategy: data.defaultStrategy || undefined,
        riskPerTrade:
          typeof data.riskPerTrade === "number" ? data.riskPerTrade : undefined,
        currency: data.currency || "USD",
        timezone: data.timezone || "UTC",
      });

      if (!result?.success) {
        throw new Error(result?.error || "Failed to update preferences");
      }

      setPrefSuccessMessage("Preferences updated successfully!");
      resetPrefs(data);
      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update preferences";
      setPrefErrorMessage(message);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getResetCountdown = () => {
    if (!user.plan?.resetDate) return "-";
    const now = new Date();
    const reset = new Date(user.plan.resetDate);
    const ms = reset.getTime() - now.getTime();
    const days = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
    return `Resets in ${days} days`;
  };

  // Progress bar and related functionality removed

  return (
    <div
      className={`space-y-8 pb-20 ${isCheckoutOpen ? "blur-sm opacity-60" : ""}`}
    >
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[9998] backdrop-blur-md bg-slate-900/50" />
      )}
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Account Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Manage your account preferences and billing details.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 space-y-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 font-semibold rounded-xl transition-all ${
              activeTab === "profile"
                ? "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-primary shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
            }`}
          >
            <User className="w-5 h-5" />
            <span>Profile</span>
          </button>
          <button
            onClick={() => setActiveTab("preferences")}
            className={`w-full flex items-center gap-3 px-4 py-3 font-semibold rounded-xl transition-all ${
              activeTab === "preferences"
                ? "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-primary shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
            }`}
          >
            <Sliders className="w-5 h-5" />
            <span>Trade Preferences</span>
          </button>
          <button
            onClick={() => setActiveTab("billing")}
            className={`w-full flex items-center gap-3 px-4 py-3 font-semibold rounded-xl transition-all ${
              activeTab === "billing"
                ? "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-primary shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span>Billing</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-8">
          {activeTab === "profile" && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-lg font-bold">Profile Information</h2>
                  <p className="text-sm text-slate-500">
                    Personal details and login credentials.
                  </p>
                </div>
                <div className="p-8 space-y-8">
                  {/* Status Messages */}
                  {successMessage && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      {successMessage}
                    </div>
                  )}
                  {errorMessage && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      {errorMessage}
                    </div>
                  )}

                  {/* Profile Picture */}
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={user.name || "User"}
                            className="w-full h-full rounded-2xl object-cover"
                            width={100}
                            height={100}
                          />
                        ) : (
                          getInitials(user.name)
                        )}
                      </div>
                      {/* Upload button hidden for now as functionality not implemented */}
                      {/* <button type="button" className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 p-2 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 hover:text-primary transition-all">
                        <Camera className="w-4 h-4" />
                      </button> */}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold">Profile Picture</h4>
                      <p className="text-xs text-slate-400">
                        Profile picture upload coming soon.
                      </p>
                      {/* <div className="flex gap-2 mt-2">
                        <button type="button" className="px-4 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition-all">
                          Upload
                        </button>
                        <button type="button" className="px-4 py-1.5 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                          Remove
                        </button>
                      </div> */}
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Full Name
                      </label>
                      <input
                        {...register("name")}
                        className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-primary focus:border-primary px-4 py-2.5 outline-none border transition-colors"
                        type="text"
                      />
                      {errors.name && (
                        <p className="text-xs text-red-500">
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Email Address
                      </label>
                      <input
                        className="w-full bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none border transition-colors text-slate-500 cursor-not-allowed"
                        type="email"
                        defaultValue={user.email || ""}
                        disabled
                      />
                      <p className="text-xs text-slate-400">
                        Email cannot be changed directly.
                      </p>
                    </div>
                  </div>

                  {/* Password Section */}
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-bold">Password</h4>
                        <p className="text-sm text-slate-500">
                          Change your account password regularly.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setIsChangingPassword(!isChangingPassword)
                        }
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 font-semibold rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                      >
                        {isChangingPassword ? "Cancel" : "Change Password"}
                      </button>
                    </div>

                    {isChangingPassword && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              {...register("currentPassword")}
                              className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-primary focus:border-primary px-4 py-2.5 outline-none border transition-colors pr-10"
                              type={showCurrentPassword ? "text" : "password"}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowCurrentPassword(!showCurrentPassword)
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showCurrentPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          {errors.currentPassword && (
                            <p className="text-xs text-red-500">
                              {errors.currentPassword.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              {...register("newPassword")}
                              className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-primary focus:border-primary px-4 py-2.5 outline-none border transition-colors pr-10"
                              type={showNewPassword ? "text" : "password"}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showNewPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          {errors.newPassword && (
                            <p className="text-xs text-red-500">
                              {errors.newPassword.message}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => reset()}
                  className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  disabled={isSubmitting}
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {activeTab === "preferences" && (
            <form
              onSubmit={handlePrefsSubmit(onSubmitPreferences)}
              className="space-y-8"
            >
              <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-lg font-bold">Trade Preferences</h2>
                  <p className="text-sm text-slate-500">
                    Configure defaults applied to new trades.
                  </p>
                </div>
                <div className="p-8 space-y-8">
                  {prefSuccessMessage && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      {prefSuccessMessage}
                    </div>
                  )}
                  {prefErrorMessage && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      {prefErrorMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Default Strategy
                      </label>
                      <select
                        {...registerPrefs("defaultStrategy")}
                        className="w-full h-11 rounded-xl px-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none text-sm appearance-none cursor-pointer"
                      >
                        <option value="">None</option>
                        {strategies.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Risk Per Trade (%)
                      </label>
                      <input
                        {...registerPrefs("riskPerTrade", {
                          valueAsNumber: true,
                        })}
                        className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-primary focus:border-primary px-4 py-2.5 outline-none border transition-colors"
                        type="number"
                        min={0}
                        max={100}
                        step="any"
                        placeholder="e.g., 1.0"
                      />
                      {prefErrors.riskPerTrade && (
                        <p className="text-xs text-red-500">
                          {prefErrors.riskPerTrade.message as string}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Currency
                      </label>
                      <select
                        {...registerPrefs("currency")}
                        className="w-full h-11 rounded-xl px-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none text-sm appearance-none cursor-pointer"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="INR">INR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Timezone
                      </label>
                      <select
                        {...registerPrefs("timezone")}
                        className="w-full h-11 rounded-xl px-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none text-sm appearance-none cursor-pointer"
                      >
                        <option value="UTC">UTC</option>
                        <option value="Asia/Kolkata">Asia/Kolkata</option>
                        <option value="America/New_York">
                          America/New_York
                        </option>
                        <option value="Europe/London">Europe/London</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => resetPrefs()}
                  className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  disabled={isPrefsSubmitting}
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  disabled={isPrefsSubmitting}
                  className="px-8 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isPrefsSubmitting && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {activeTab === "billing" && (
            <div className="space-y-8">
              <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-lg font-bold">Current Subscription</h2>
                  <p className="text-sm text-slate-500">Your plan and usage</p>
                </div>
                <div className="p-8 space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="w-full space-y-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold">
                          {user.plan?.type === "pro" ? "Pro" : "Free"}
                        </h3>
                        {user.plan?.type === "pro" ? (
                          <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-[10px] font-bold uppercase rounded-lg">
                            Pro Plan – Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase rounded-lg">
                            Standard
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">Price</p>
                          <p className="font-semibold">
                            {user.plan?.type === "pro" ? "₹99/month" : "Free"}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Monthly Trade Limit</p>
                          <p className="font-semibold">
                            {user.plan?.type === "pro"
                              ? "Unlimited"
                              : `${user.plan?.monthlyTradesLimit ?? 100}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Trades Used</p>
                          <p className="font-semibold">
                            {user.plan?.tradesUsed ?? 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Reset</p>
                          <p className="font-semibold">{getResetCountdown()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        className={`px-4 py-2 font-semibold rounded-xl text-sm transition-all ${
                          user.plan?.type === "pro"
                            ? "bg-slate-200 dark:bg-slate-700 text-slate-500 cursor-not-allowed"
                            : "bg-primary text-white hover:bg-blue-600"
                        }`}
                        disabled={user.plan?.type === "pro"}
                        onClick={async () => {
                          try {
                            if (user.plan?.type === "pro") return;
                            const key = process.env
                              .NEXT_PUBLIC_RAZORPAY_KEY_ID as string;
                            if (!key) {
                              console.error("Razorpay key missing");
                              return;
                            }
                            console.debug("Creating Razorpay order");
                            setIsCheckoutOpen(true);
                            document.body.style.overflow = "hidden";
                            const orderRes = await fetch(
                              "/api/billing/razorpay/order",
                              { method: "POST" },
                            );
                            const order = await orderRes.json();
                            console.debug("Order response", {
                              status: orderRes.status,
                              body: order,
                            });
                            if (!orderRes.ok || !order?.id) {
                              console.error("Order creation failed");
                              return;
                            }
                            if (typeof window === "undefined") return;
                            const existing = document.getElementById(
                              "razorpay-js",
                            ) as HTMLScriptElement | null;
                            if (!existing) {
                              await new Promise<void>((resolve, reject) => {
                                const script = document.createElement("script");
                                script.id = "razorpay-js";
                                script.src =
                                  "https://checkout.razorpay.com/v1/checkout.js";
                                script.onload = () => resolve();
                                script.onerror = () =>
                                  reject(
                                    new Error("Failed to load Razorpay script"),
                                  );
                                document.body.appendChild(script);
                              });
                            }
                            // @ts-expect-error Razorpay is injected globally
                            const rz = new window.Razorpay({
                              key,
                              amount: order.amount,
                              currency: order.currency,
                              order_id: order.id,
                              name: "Trade Diary Pro",
                              description: "Pro plan subscription (monthly)",
                              redirect: false,
                              modal: {
                                ondismiss: () => {
                                  setIsCheckoutOpen(false);
                                  document.body.style.overflow = "";
                                },
                              },
                              handler: async (response: {
                                razorpay_payment_id: string;
                                razorpay_order_id: string;
                                razorpay_signature: string;
                              }) => {
                                console.debug("Payment success", response);
                                const verifyRes = await fetch(
                                  "/api/billing/razorpay/verify",
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify(response),
                                  },
                                );
                                console.debug("Verify response", {
                                  status: verifyRes.status,
                                });
                                if (verifyRes.ok) {
                                  setIsCheckoutOpen(false);
                                  document.body.style.overflow = "";
                                  router.refresh();
                                }
                              },
                              prefill: {
                                name: user.name || "",
                                email: user.email || "",
                              },
                              theme: {
                                color: "#2563EB",
                              },
                            });
                            rz.open();
                          } catch (e) {
                            console.error("Upgrade error", e);
                            setIsCheckoutOpen(false);
                            document.body.style.overflow = "";
                          }
                        }}
                      >
                        {user.plan?.type === "pro"
                          ? "Pro Plan – Active"
                          : "Upgrade to Pro – ₹99/month"}
                      </button>
                      {user.plan?.type !== "pro" && (
                        <p className="text-xs text-slate-500">
                          Unlock unlimited trade journaling for just ₹99/month.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div
                      className={`p-6 rounded-2xl border shadow-sm bg-card-light dark:bg-card-dark ${
                        user.plan?.type === "free"
                          ? "border-primary"
                          : "border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold">Standard Plan</h3>
                        {user.plan?.type === "free" && (
                          <span className="px-2 py-1 text-[10px] font-bold uppercase rounded-lg bg-primary/10 text-primary">
                            Current
                          </span>
                        )}
                      </div>
                      <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                        <li>100 trade entries/month</li>
                        <li>Basic analytics</li>
                        <li>Default features</li>
                      </ul>
                    </div>

                    <div className="relative p-6 rounded-2xl border-2 bg-card-light dark:bg-card-dark shadow-2xl border-primary">
                      <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-primary text-white">
                        Best Value
                      </div>
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-lg font-bold">Pro Plan</h3>
                        {user.plan?.type === "pro" ? (
                          <span className="px-2 py-1 text-[10px] font-bold uppercase rounded-lg bg-primary/10 text-primary">
                            Current Plan
                          </span>
                        ) : null}
                      </div>
                      <div className="mb-4">
                        <span className="text-3xl font-extrabold text-primary">
                          ₹99
                        </span>{" "}
                        <span className="text-slate-500">/ month</span>
                      </div>
                      <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 mb-4">
                        <li>Unlimited trade entries</li>
                        <li>Advanced analytics</li>
                        <li>Full psychology insights</li>
                        <li>Priority support</li>
                      </ul>
                      <button
                        className={`px-4 py-2 font-semibold rounded-xl text-sm transition-all ${
                          user.plan?.type === "pro"
                            ? "bg-slate-200 dark:bg-slate-700 text-slate-500 cursor-not-allowed"
                            : "bg-primary text-white hover:bg-blue-600"
                        }`}
                        disabled={user.plan?.type === "pro"}
                        onClick={async () => {
                          try {
                            if (user.plan?.type === "pro") return;
                            const key = process.env
                              .NEXT_PUBLIC_RAZORPAY_KEY_ID as string;
                            if (!key) {
                              console.error("Razorpay key missing");
                              return;
                            }
                            console.debug("Creating Razorpay order");
                            setIsCheckoutOpen(true);
                            document.body.style.overflow = "hidden";
                            const orderRes = await fetch(
                              "/api/billing/razorpay/order",
                              { method: "POST" },
                            );
                            const order = await orderRes.json();
                            console.debug("Order response", {
                              status: orderRes.status,
                              body: order,
                            });
                            if (!orderRes.ok || !order?.id) {
                              console.error("Order creation failed");
                              setIsCheckoutOpen(false);
                              document.body.style.overflow = "";
                              return;
                            }
                            if (typeof window === "undefined") return;
                            const existing = document.getElementById(
                              "razorpay-js",
                            ) as HTMLScriptElement | null;
                            if (!existing) {
                              await new Promise<void>((resolve, reject) => {
                                const script = document.createElement("script");
                                script.id = "razorpay-js";
                                script.src =
                                  "https://checkout.razorpay.com/v1/checkout.js";
                                script.onload = () => resolve();
                                script.onerror = () =>
                                  reject(
                                    new Error("Failed to load Razorpay script"),
                                  );
                                document.body.appendChild(script);
                              });
                            }
                            // @ts-expect-error Razorpay is injected globally
                            const rz = new window.Razorpay({
                              key,
                              amount: order.amount,
                              currency: order.currency,
                              order_id: order.id,
                              name: "Trade Diary Pro",
                              description: "Pro plan subscription (monthly)",
                              redirect: false,
                              modal: {
                                ondismiss: () => {
                                  setIsCheckoutOpen(false);
                                  document.body.style.overflow = "";
                                },
                              },
                              handler: async (response: {
                                razorpay_payment_id: string;
                                razorpay_order_id: string;
                                razorpay_signature: string;
                              }) => {
                                console.debug("Payment success", response);
                                const verifyRes = await fetch(
                                  "/api/billing/razorpay/verify",
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify(response),
                                  },
                                );
                                console.debug("Verify response", {
                                  status: verifyRes.status,
                                });
                                if (verifyRes.ok) {
                                  setIsCheckoutOpen(false);
                                  document.body.style.overflow = "";
                                  router.refresh();
                                }
                              },
                              prefill: {
                                name: user.name || "",
                                email: user.email || "",
                              },
                              theme: {
                                color: "#2563EB",
                              },
                            });
                            rz.open();
                          } catch (e) {
                            console.error("Upgrade error", e);
                            setIsCheckoutOpen(false);
                            document.body.style.overflow = "";
                          }
                        }}
                      >
                        {user.plan?.type === "pro"
                          ? "Current Plan"
                          : "Upgrade – ₹99/month"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing History */}
              <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-lg font-bold">Billing History</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                      <tr>
                        <th className="px-6 py-4">Invoice</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Download</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                      {billingLoading ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-6 text-center text-slate-500">
                            Loading...
                          </td>
                        </tr>
                      ) : billingItems.length > 0 ? (
                        billingItems.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4 font-medium">
                              {item.receipt || item.orderId}
                            </td>
                            <td className="px-6 py-4 text-slate-500">
                              {new Date(item.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="px-6 py-4">
                              ₹{(item.amount / 100).toLocaleString("en-IN")}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-1 text-[10px] font-bold uppercase rounded-lg ${
                                  item.status === "captured" || item.status === "paid"
                                    ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                                    : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600"
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => downloadInvoice(item)}
                                className="text-primary hover:underline"
                              >
                                CSV
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-6 text-center text-slate-500">
                            No billing records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
