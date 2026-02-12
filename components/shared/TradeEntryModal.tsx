"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  BarChart2,
  Brain,
  Leaf,
  Zap,
  DollarSign,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { createTrade, updateTrade } from "@/lib/actions/trades";
import { getStrategies } from "@/lib/actions/strategies";
import { tradeSchema, type TradeFormValues } from "@/lib/validations";

interface TradeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: TradeFormValues & { _id?: string }; // For editing
  onSuccess?: () => void;
}

const MOODS = [
  { id: "calm", label: "Calm", icon: Leaf },
  { id: "anxious", label: "Anxious", icon: Zap },
  { id: "confident", label: "Confident", icon: Brain },
  { id: "greedy", label: "Greedy", icon: DollarSign },
];

export default function TradeEntryModal({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}: TradeEntryModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [strategies, setStrategies] = useState<{ _id: string; name: string }[]>(
    [],
  );
  const [isVisible, setIsVisible] = useState(false);
  const [animate, setAnimate] = useState(false);
  const CLEAN_DEFAULTS: TradeFormValues = {
    symbol: "BTCUSDT",
    type: "BUY",
    strategy: "",
    entryPrice: 0,
    exitPrice: undefined,
    stopLoss: 0,
    target: undefined,
    quantity: 0,
    fees: 0,
    entryDate: new Date(),
    exitDate: undefined,
    notes: "",
    tags: [],
    emotion: "calm",
    screenshots: [],
  };

  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeSchema) as Resolver<TradeFormValues>,
    defaultValues: {
      symbol: initialData?.symbol || "BTCUSDT",
      type: initialData?.type || "BUY",
      strategy: initialData?.strategy || "",
      entryPrice: initialData?.entryPrice || 0,
      exitPrice: initialData?.exitPrice || undefined,
      stopLoss: initialData?.stopLoss || 0,
      target: initialData?.target || undefined,
      quantity: initialData?.quantity || 0,
      fees: initialData?.fees || 0,
      entryDate: initialData?.entryDate
        ? new Date(initialData.entryDate)
        : new Date(),
      exitDate: initialData?.exitDate
        ? new Date(initialData.exitDate)
        : undefined,
      notes: initialData?.notes || "",
      tags: initialData?.tags || [],
      emotion: initialData?.emotion || "calm",
    },
  });

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = form;
  const watchedValues = watch();

  // Populate form when editing
  useEffect(() => {
    if (isOpen && initialData) {
      form.reset({
        symbol: initialData.symbol,
        type: initialData.type,
        strategy: initialData.strategy,
        entryPrice: initialData.entryPrice,
        exitPrice: initialData.exitPrice,
        stopLoss: initialData.stopLoss,
        target: initialData.target,
        quantity: initialData.quantity,
        fees: initialData.fees ?? 0,
        entryDate: initialData.entryDate
          ? new Date(initialData.entryDate)
          : new Date(),
        exitDate: initialData.exitDate
          ? new Date(initialData.exitDate)
          : undefined,
        notes: initialData.notes || "",
        tags: initialData.tags || [],
        emotion: initialData.emotion || "calm",
      });
    }
  }, [isOpen, initialData]);

  // Load strategies
  useEffect(() => {
    async function loadStrategies() {
      try {
        const data = await getStrategies();
        setStrategies(data);
        if (data.length > 0 && !watchedValues.strategy && !initialData) {
          setValue("strategy", data[0]._id);
        }
      } catch (error) {
        console.error("Failed to load strategies", error);
      }
    }
    if (isOpen) {
      loadStrategies();
    }
  }, [isOpen, initialData, setValue, watchedValues.strategy]);

  // Risk Analytics
  const analytics = (() => {
    const { entryPrice, stopLoss, target, quantity, type, exitPrice } =
      watchedValues;
    if (!entryPrice || !quantity) return null;

    const isLong = type === "BUY";
    const riskPerUnit = isLong ? entryPrice - stopLoss : stopLoss - entryPrice;
    const risk = Math.abs(riskPerUnit) * quantity;

    const rewardPerUnit = target
      ? isLong
        ? target - entryPrice
        : entryPrice - target
      : null;
    const reward = rewardPerUnit ? Math.abs(rewardPerUnit) * quantity : null;
    const rr = risk > 0 && reward ? (reward / risk).toFixed(2) : null;

    // Actual P/L if exit price is provided
    const actualPnl = exitPrice
      ? isLong
        ? (exitPrice - entryPrice) * quantity
        : (entryPrice - exitPrice) * quantity
      : null;

    return { risk, reward, rr, actualPnl };
  })();

  const onSubmit = async (data: TradeFormValues) => {
    startTransition(async () => {
      try {
        let result;
        if (initialData?._id) {
          result = await updateTrade(initialData._id, {
            ...data,
            status: data.exitPrice && data.exitDate ? "CLOSED" : "OPEN",
          });
        } else {
          result = await createTrade(data);
        }

        if (result.success) {
          onClose();
          onSuccess?.();
          router.refresh();
        } else {
          alert(result.error || "Something went wrong");
        }
      } catch (error) {
        console.error("Submit error:", error);
      }
    });
  };

  // Animations & ESC key
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      const timer = setTimeout(() => setAnimate(true), 10);
      return () => clearTimeout(timer);
    } else {
      setAnimate(false);
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !initialData) {
      form.reset({ ...CLEAN_DEFAULTS });
    }
    if (!isOpen) {
      form.reset({ ...CLEAN_DEFAULTS });
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        animate ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 transform ${
          animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        } flex flex-col`}
      >
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/70 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <BarChart2 className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              Trade Entry with Risk Analytics
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form
            id="tradeEntryForm"
            onSubmit={handleSubmit(onSubmit)}
            className="p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Core Trade Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Symbol
                  </label>
                  <input
                    {...form.register("symbol")}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-primary focus:border-primary"
                    placeholder="BTCUSDT"
                  />
                  {errors.symbol && (
                    <p className="text-rose-500 text-xs mt-1">
                      {errors.symbol.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Side
                  </label>
                  <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setValue("type", "BUY")}
                      className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${
                        watchedValues.type === "BUY"
                          ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                          : "text-slate-500"
                      }`}
                    >
                      LONG
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue("type", "SELL")}
                      className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${
                        watchedValues.type === "SELL"
                          ? "bg-white dark:bg-slate-700 text-rose-600 shadow-sm"
                          : "text-slate-500"
                      }`}
                    >
                      SHORT
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Setup / Strategy
                  </label>
                  <select
                    {...form.register("strategy")}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-primary focus:border-primary"
                  >
                    {strategies.map((s) => (
                      <option
                        key={s._id}
                        value={s._id}
                        className="bg-white dark:bg-slate-900"
                      >
                        {s.name}
                      </option>
                    ))}
                  </select>
                  {errors.strategy && (
                    <p className="text-rose-500 text-xs mt-1">
                      {errors.strategy.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Entry Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                        ₹
                      </span>
                      <input
                        type="number"
                        step="any"
                        {...form.register("entryPrice", {
                          valueAsNumber: true,
                        })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-xl pl-6 pr-4 py-2.5 text-sm font-semibold focus:ring-primary focus:border-primary"
                      />
                    </div>
                    {errors.entryPrice && (
                      <p className="text-rose-500 text-xs mt-1">
                        {errors.entryPrice.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Stop Loss
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                        ₹
                      </span>
                      <input
                        type="number"
                        step="any"
                        {...form.register("stopLoss", { valueAsNumber: true })}
                        className="w-full bg-rose-50/50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30 rounded-xl pl-6 pr-4 py-2.5 text-sm font-semibold text-rose-600 focus:ring-rose-500 focus:border-rose-500"
                      />
                    </div>
                    {errors.stopLoss && (
                      <p className="text-rose-500 text-xs mt-1">
                        {errors.stopLoss.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Exit Price (Target)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                        ₹
                      </span>
                      <input
                        type="number"
                        step="any"
                        {...form.register("target", { valueAsNumber: true })}
                        className="w-full bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30 rounded-xl pl-6 pr-4 py-2.5 text-sm font-semibold text-emerald-600 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Position Size (Units)
                    </label>
                    <input
                      type="number"
                      step="any"
                      {...form.register("quantity", { valueAsNumber: true })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-primary focus:border-primary"
                    />
                    {errors.quantity && (
                      <p className="text-rose-500 text-xs mt-1">
                        {errors.quantity.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Fees
                  </label>
                  <div className="relative max-w-[200px]">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="any"
                      {...form.register("fees", { valueAsNumber: true })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-xl pl-6 pr-4 py-2.5 text-sm font-semibold focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                {initialData && (
                  <div className="pt-4 border-t border-white/5 space-y-4">
                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Close Trade Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                          Exit Price
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                            ₹
                          </span>
                          <input
                            type="number"
                            step="any"
                            {...form.register("exitPrice", {
                              valueAsNumber: true,
                            })}
                            className="w-full bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30 rounded-xl pl-6 pr-4 py-2.5 text-sm font-semibold text-emerald-600 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Price at exit"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                          Exit Date
                        </label>
                        <input
                          type="datetime-local"
                          className="w-full bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-emerald-500 focus:border-emerald-500"
                          onChange={(e) =>
                            setValue("exitDate", new Date(e.target.value))
                          }
                          defaultValue={
                            watchedValues.exitDate
                              ? new Date(
                                  watchedValues.exitDate.getTime() -
                                    watchedValues.exitDate.getTimezoneOffset() *
                                      60000,
                                )
                                  .toISOString()
                                  .slice(0, 16)
                              : ""
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Context & Analytics */}
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart2 className="w-4 h-4 text-primary" />
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Trade Analytics
                    </h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-500">
                        Potential P/L
                      </span>
                      <span
                        className={`text-sm font-black ${analytics?.reward && analytics.reward >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                      >
                        {analytics?.reward != null
                          ? `₹${analytics.reward.toLocaleString("en-IN")}`
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-500">
                        Risk/Reward
                      </span>
                      <span className="text-sm font-black text-primary">
                        {analytics?.rr ? `1:${analytics.rr}` : "N/A"}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-500">
                          Fee Impact
                        </span>
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          {analytics?.reward
                            ? `${Math.min(100, Math.max(0, ((watchedValues.fees || 0) / analytics.reward) * 100)).toFixed(2)}%`
                            : "0.00%"}{" "}
                          <span className="text-slate-400 font-medium italic">
                            of profit
                          </span>
                        </span>
                      </div>
                      <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="bg-orange-400 h-full"
                          style={{
                            width: `${
                              analytics?.reward
                                ? Math.min(
                                    100,
                                    Math.max(
                                      0,
                                      ((watchedValues.fees || 0) /
                                        analytics.reward) *
                                        100,
                                    ),
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                    Mood / Emotion
                  </label>
                  <div className="flex justify-between items-center gap-2">
                    {MOODS.map((mood) => (
                      <button
                        key={mood.id}
                        type="button"
                        onClick={() =>
                          setValue(
                            "emotion",
                            mood.id as
                              | "calm"
                              | "anxious"
                              | "confident"
                              | "greedy",
                          )
                        }
                        className={`flex flex-col items-center gap-2 group cursor-pointer`}
                      >
                        <div
                          className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                            watchedValues.emotion === mood.id
                              ? "bg-blue-50 dark:bg-blue-900/30 border-2 border-primary text-primary shadow-sm"
                              : "border-slate-200 dark:border-slate-700 text-slate-400 group-hover:bg-white group-hover:text-primary"
                          }`}
                        >
                          <mood.icon className="w-5 h-5" />
                        </div>
                        <span
                          className={`text-[10px] font-bold ${
                            watchedValues.emotion === mood.id
                              ? "text-primary"
                              : "text-slate-400"
                          }`}
                        >
                          {mood.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Notes / Journal
                  </label>
                  <textarea
                    {...form.register("notes")}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-primary focus:border-primary h-24 resize-none"
                    placeholder="Why did you take this trade?"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Tags (Market Conditions)
                  </label>
                  <div className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3 min-h-[80px]">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {["Trending", "Volatile", "Choppy", "News"].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            const currentTags = watchedValues.tags || [];
                            if (currentTags.includes(tag)) {
                              setValue(
                                "tags",
                                currentTags.filter((t) => t !== tag),
                              );
                            } else {
                              setValue("tags", [...currentTags, tag]);
                            }
                          }}
                          className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border transition-all ${
                            watchedValues.tags?.includes(tag)
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    <input
                      className="bg-transparent border-none p-0 text-sm focus:ring-0 w-full placeholder:text-slate-400"
                      placeholder="Add market tag..."
                      type="text"
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end items-center gap-4 bg-slate-50/50 dark:bg-slate-800/30">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="tradeEntryForm"
            disabled={isPending}
            className="px-8 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending
              ? "Processing..."
              : initialData
                ? "Update Trade"
                : "Log Trade"}
          </button>
        </div>
      </div>
    </div>
  );
}
