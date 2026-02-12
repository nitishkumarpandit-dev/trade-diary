"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { journalSchema, type JournalFormValues } from "@/lib/validations";
import {
  createJournalEntry,
  updateJournalEntry,
} from "@/lib/actions/psychology";
import { getTrades } from "@/lib/actions/trades";
import {
  Smile,
  Frown,
  Zap,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  X,
  Link as LinkIcon,
} from "lucide-react";

interface JournalEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: (JournalFormValues & { _id?: string }) | undefined;
  onSuccess?: () => void;
}

export default function JournalEntryModal({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}: JournalEntryModalProps) {
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [trades, setTrades] = useState<
    { _id: string; symbol: string; entryDate?: string | Date }[]
  >([]);
  const [lastNonDisciplinedEmotion, setLastNonDisciplinedEmotion] = useState<
    JournalFormValues["emotion"]
  >(
    initialData?.emotion && initialData.emotion !== "disciplined"
      ? initialData.emotion
      : "calm",
  );

  const form = useForm<JournalFormValues>({
    resolver: zodResolver(journalSchema) as Resolver<JournalFormValues>,
    defaultValues: {
      date: initialData?.date || new Date(),
      emotion: initialData?.emotion || "calm",
      stressLevel: initialData?.stressLevel || 5,
      profitability: initialData?.profitability || 0,
      entry: initialData?.entry || "",
      tradeId: initialData?.tradeId || undefined,
      tags: initialData?.tags || [],
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (isOpen) {
      const id = requestAnimationFrame(() => {
        setVisible(true);
        setTimeout(() => setAnimate(true), 10);
      });
      return () => cancelAnimationFrame(id);
    } else {
      setAnimate(false);
      const t = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    startTransition(async () => {
      try {
        const res = await getTrades({ limit: 20 });
        setTrades(res.trades || []);
      } catch {}
    });
  }, [isOpen]);

  const moods: {
    key: JournalFormValues["emotion"];
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: "calm",
      label: "Calm",
      icon: <Smile className="w-5 h-5 text-blue-600" />,
    },
    {
      key: "anxious",
      label: "Anxious",
      icon: <Frown className="w-5 h-5 text-orange-500" />,
    },
    {
      key: "confident",
      label: "Confident",
      icon: <Zap className="w-5 h-5 text-purple-500" />,
    },
    {
      key: "greedy",
      label: "Greedy",
      icon: <DollarSign className="w-5 h-5 text-yellow-600" />,
    },
    {
      key: "fearful",
      label: "Fearful",
      icon: <AlertTriangle className="w-5 h-5 text-rose-500" />,
    },
    {
      key: "disciplined",
      label: "Disciplined",
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
    },
  ];

  const selectedEmotion = form.watch("emotion");
  const stressLevel = form.watch("stressLevel") || 5;
  const tags = form.watch("tags") || [];
  const isDisciplined = selectedEmotion === "disciplined";

  const handleSelectMood = (m: JournalFormValues["emotion"]) => {
    if (m !== "disciplined") {
      setLastNonDisciplinedEmotion(m);
    }
    setValue("emotion", m);
  };

  const setRulesFollowed = () => {
    setValue("emotion", "disciplined");
    const next = Array.isArray(tags)
      ? [...tags.filter((t) => t !== "rules-broken")]
      : [];
    setValue("tags", next);
  };

  const setRulesBroken = () => {
    setValue("emotion", lastNonDisciplinedEmotion || "anxious");
    const next = Array.isArray(tags) ? [...tags] : [];
    if (!next.includes("rules-broken")) next.push("rules-broken");
    setValue("tags", next);
  };

  const onSubmit = async (data: JournalFormValues) => {
    startTransition(async () => {
      try {
        let res;
        if (initialData?._id) {
          res = await updateJournalEntry(initialData._id, data);
        } else {
          res = await createJournalEntry(data);
        }
        if (res.success) {
          onSuccess?.();
        } else {
          alert(res.error || "Failed to save entry");
        }
      } catch {}
    });
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all ${animate ? "opacity-100" : "opacity-0"}`}
    >
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-2xl bg-card-light dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all transform ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold">
              {initialData ? "Edit Journal Entry" : "Log Psychology Insight"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Track your mindset and link trades
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Mood Selection
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
                {moods.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => handleSelectMood(m.key)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      selectedEmotion === m.key
                        ? "border-primary bg-blue-50 dark:bg-blue-900/20"
                        : "border-transparent hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                    }`}
                  >
                    {m.icon}
                    <span className="text-xs font-medium capitalize">
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  Stress Level
                </label>
                <span className="text-sm font-bold text-primary">
                  {stressLevel} / 10
                </span>
              </div>
              <div className="px-2">
                <input
                  type="range"
                  min={1}
                  max={10}
                  {...register("stressLevel", { valueAsNumber: true })}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-bold uppercase">
                  <span>Low</span>
                  <span>Extreme</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Discipline Score
              </label>
              <div className="flex items-center gap-2 p-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={setRulesFollowed}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold ${
                    isDisciplined
                      ? "bg-white dark:bg-slate-700 shadow-sm text-primary"
                      : "text-slate-500"
                  }`}
                >
                  Rules Followed
                </button>
                <button
                  type="button"
                  onClick={setRulesBroken}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold ${
                    !isDisciplined
                      ? "text-slate-700 dark:text-slate-300"
                      : "text-slate-500"
                  }`}
                >
                  Rules Broken
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Date
              </label>
              <input
                type="date"
                {...register("date", { valueAsDate: true })}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.date && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.date.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Trade Link (Optional)
            </label>
            <div className="relative">
              <select
                {...register("tradeId")}
                className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                defaultValue={initialData?.tradeId || ""}
              >
                <option value="">Associate with a specific trade...</option>
                {trades.map((t) => {
                  const label = `${t.symbol}${t.entryDate ? ` (${new Date(t.entryDate).toLocaleDateString()})` : ""}`;
                  return (
                    <option key={t._id} value={t._id}>
                      {label}
                    </option>
                  );
                })}
              </select>
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Journal Entry
              </label>
              <textarea
                {...register("entry")}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all h-24 resize-none"
                placeholder="Write down your thoughts, why you entered the trade, and how you felt during the session..."
              />
              {errors.entry && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.entry.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Tags
              </label>
              <input
                placeholder="Press Enter to add tag"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val) {
                      const current = form.getValues("tags") || [];
                      setValue("tags", [...current, val]);
                      (e.target as HTMLInputElement).value = "";
                    }
                  }
                }}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {(tags || []).map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-0 border-t border-slate-100 dark:border-slate-800 mt-2 pt-6 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-8 py-2.5 text-sm font-bold text-white bg-primary hover:bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {initialData ? "Save Changes" : "Save Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
