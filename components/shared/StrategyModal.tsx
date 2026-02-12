"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { strategySchema, type StrategyFormValues } from "@/lib/validations";
import { createStrategy, updateStrategy } from "@/lib/actions/strategies";

interface StrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: StrategyFormValues & { _id?: string };
  onSuccess?: () => void;
}

export default function StrategyModal({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}: StrategyModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<StrategyFormValues>({
    resolver: zodResolver(strategySchema) as Resolver<StrategyFormValues>,
    defaultValues: {
      name: initialData?.name || "",
      assetClass: initialData?.assetClass || "equity",
      description: initialData?.description || "",
      rules: initialData?.rules || "",
      targetWinRate: initialData?.targetWinRate || undefined,
      minRiskReward: initialData?.minRiskReward || undefined,
      status: initialData?.status || "active",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = form;

  useEffect(() => {
    let tShow: ReturnType<typeof setTimeout>;
    let tAnim: ReturnType<typeof setTimeout>;
    let tHide: ReturnType<typeof setTimeout>;
    if (isOpen) {
      tShow = setTimeout(() => setIsVisible(true), 0);
      tAnim = setTimeout(() => setAnimate(true), 10);
    } else {
      tAnim = setTimeout(() => setAnimate(false), 0);
      tHide = setTimeout(() => setIsVisible(false), 300);
    }
    return () => {
      clearTimeout(tShow);
      clearTimeout(tAnim);
      clearTimeout(tHide);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const onSubmit = async (data: StrategyFormValues) => {
    startTransition(async () => {
      try {
        let result;
        if (initialData?._id) {
          result = await updateStrategy(initialData._id, data);
        } else {
          result = await createStrategy(data);
        }
        if (result.success) {
          onSuccess?.();
        } else {
          alert(result.error || "Failed to save strategy");
        }
      } catch {}
    });
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        animate ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-2xl bg-[#0f1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 transform ${
          animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
          <div>
            <h2 className="text-xl font-bold text-white">
              {initialData ? "Edit Strategy" : "Create Strategy"}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Define parameters and rules
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
              Name
            </label>
            <input
              {...register("name")}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="e.g. Morning Gap Breakout"
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                Asset Class
              </label>
              <select
                {...register("assetClass")}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
              >
                <option value="equity">Equity</option>
                <option value="crypto">Crypto</option>
                <option value="forex">Forex</option>
                <option value="options">Options</option>
                <option value="futures">Futures</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                Status
              </label>
              <select
                {...register("status")}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                Target Win Rate %
              </label>
              <input
                type="number"
                step="any"
                {...register("targetWinRate", { valueAsNumber: true })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                Min R:R
              </label>
              <input
                type="number"
                step="any"
                {...register("minRiskReward", { valueAsNumber: true })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
              Description
            </label>
            <textarea
              {...register("description")}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors h-20 resize-none text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
              Rules
            </label>
            <textarea
              {...register("rules")}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors h-24 resize-none text-sm font-mono"
            />
          </div>
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold text-gray-400 bg-white/5 hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-[2] py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              {initialData ? "Save Changes" : "Create Strategy"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
