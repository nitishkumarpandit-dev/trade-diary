"use client";

import { Calendar, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";

const ranges = [
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
  { label: "Last 90 Days", value: "90d" },
  { label: "All Time", value: "all" },
];

export default function DashboardDateSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentRange = searchParams.get("range") || "30d";
  const selectedLabel = ranges.find((r) => r.value === currentRange)?.label || "Last 30 Days";

  const handleSelect = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("range", value);
    router.push(`?${params.toString()}`);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-full md:w-auto gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors shadow-sm cursor-pointer"
      >
        <Calendar className="w-4 h-4 text-slate-400" />
        <span>{selectedLabel}</span>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 py-1">
          {ranges.map((range) => (
            <button
              key={range.value}
              onClick={() => handleSelect(range.value)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                currentRange === range.value
                  ? "text-primary font-medium bg-slate-50 dark:bg-slate-700/50"
                  : "text-slate-700 dark:text-slate-300"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
