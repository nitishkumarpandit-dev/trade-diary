"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Link from "next/link";
import { getPsychologyInsights, getJournalEntries, getEmotionalStateVsPnL, createJournalEntry, updateJournalEntry, deleteJournalEntry } from "@/lib/actions/psychology";
import JournalEntryModal from "@/components/shared/JournalEntryModal";

type DateRange = { from: Date; to: Date };

interface Insights {
  dominantMood: string;
  topTags: string[];
  mostCommonEmotion: string;
  emotionProfitability: Array<{ _id: string; avgProfitability: number }>;
  mistakeDistribution: any[];
  mindsetScore: number;
}

interface JournalEntry {
  _id: string;
  date: string | Date;
  emotion: "calm" | "anxious" | "confident" | "greedy" | "fearful" | "disciplined";
  stressLevel?: number;
  profitability?: number;
  entry: string;
  tags?: string[];
  tradeId?: { _id: string; symbol: string; pnl?: number; status: string; type: "BUY" | "SELL" };
}

interface JournalsResponse {
  entries: JournalEntry[];
  metadata: { total: number; page: number; limit: number; totalPages: number };
}

interface EmotionPnL {
  emotion: string;
  avgPnL: number;
  avgStressLevel: number;
  count: number;
}

interface PsychologyClientProps {
  initialDateRange?: DateRange;
  initialInsights?: Insights;
  initialJournals?: JournalsResponse;
  initialEmotionVsPnl?: EmotionPnL[];
}

export default function PsychologyClient({
  initialDateRange,
  initialInsights,
  initialJournals,
  initialEmotionVsPnl,
}: PsychologyClientProps) {
  const [dateRange, setDateRange] = useState<DateRange>(
    initialDateRange || { from: new Date(new Date().setMonth(new Date().getMonth() - 1)), to: new Date() },
  );
  const [insights, setInsights] = useState<Insights>(
    initialInsights || { dominantMood: "neutral", topTags: [], mostCommonEmotion: "neutral", emotionProfitability: [], mistakeDistribution: [], mindsetScore: 0 },
  );
  const [journals, setJournals] = useState<JournalsResponse>(
    initialJournals || { entries: [], metadata: { total: 0, page: 1, limit: 10, totalPages: 0 } },
  );
  const [emotionVsPnl, setEmotionVsPnl] = useState<EmotionPnL[]>(initialEmotionVsPnl || []);
  const [filters, setFilters] = useState<{ emotion?: string; tags?: string[] }>({});
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  const hasHydrated = useRef(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!hasHydrated.current) {
      hasHydrated.current = true;
      return;
    }
    startTransition(async () => {
      const [newInsights, newJournals, newEmotion] = await Promise.all([
        getPsychologyInsights(dateRange),
        getJournalEntries({ dateRange, emotion: filters.emotion, tags: filters.tags, page: 1, limit: 10 }),
        getEmotionalStateVsPnL(),
      ]);
      setInsights(newInsights);
      setJournals(newJournals);
      setEmotionVsPnl(newEmotion);
    });
  }, [dateRange, filters.emotion, filters.tags]);

  const mindsetScore = Math.round(insights.mindsetScore);
  const rulesAdherence = useMemo(() => {
    const disciplined = journals.entries.filter((e) => e.emotion === "disciplined").length;
    const total = journals.entries.length || 1;
    return Math.round((disciplined / total) * 100);
  }, [journals]);

  const mistakeData = useMemo(() => {
    const counts: Record<string, number> = {};
    journals.entries.forEach((e) => {
      e.tags?.forEach((t) => {
        const normalized = t.toLowerCase();
        if (normalized.includes("fomo")) counts["FOMO"] = (counts["FOMO"] || 0) + 1;
        else if (normalized.includes("early")) counts["Early Exit"] = (counts["Early Exit"] || 0) + 1;
        else if (normalized.includes("overtrade")) counts["Overtrading"] = (counts["Overtrading"] || 0) + 1;
        else counts["Other"] = (counts["Other"] || 0) + 1;
      });
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return Object.entries(counts).map(([name, value]) => ({ name, value, percentage: total ? Math.round((value / total) * 100) : 0 }));
  }, [journals]);

  const scatterPoints = useMemo(() => {
    return emotionVsPnl.map((d) => ({
      x: d.avgStressLevel,
      y: d.avgPnL,
      emotion: d.emotion,
    }));
  }, [emotionVsPnl]);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  const setQuickRange = (type: "1M" | "3M") => {
    const to = new Date();
    const from = new Date();
    if (type === "1M") from.setMonth(from.getMonth() - 1);
    else from.setMonth(from.getMonth() - 3);
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    setDateRange({ from, to });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Psychology</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Understand mindset and its impact on performance</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setQuickRange("1M")} className="px-3 py-1 rounded-lg text-xs border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">Last 1M</button>
          <button onClick={() => setQuickRange("3M")} className="px-3 py-1 rounded-lg text-xs border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">Last 3M</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card-light dark:bg-card-dark">
          <p className="text-xs text-slate-500 mb-1">Mindset Score</p>
          <p className="text-3xl font-bold">{mindsetScore}<span className="text-lg text-slate-400">/100</span></p>
        </div>
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card-light dark:bg-card-dark">
          <p className="text-xs text-slate-500 mb-1">Rules Adherence</p>
          <p className="text-3xl font-bold">{rulesAdherence}%</p>
        </div>
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card-light dark:bg-card-dark">
          <p className="text-xs text-slate-500 mb-1">Common Emotion</p>
          <p className="text-3xl font-bold capitalize">{insights.mostCommonEmotion || "neutral"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card-light dark:bg-card-dark">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Emotional State vs P/L</h2>
            <div className="flex items-center gap-2">
              <select
                value={filters.emotion || ""}
                onChange={(e) => setFilters((f) => ({ ...f, emotion: e.target.value || undefined }))}
                className="px-2 py-1 rounded-lg text-xs border border-slate-200 dark:border-slate-800 bg-transparent"
              >
                <option value="">All emotions</option>
                <option value="calm">Calm</option>
                <option value="anxious">Anxious</option>
                <option value="confident">Confident</option>
                <option value="greedy">Greedy</option>
                <option value="fearful">Fearful</option>
                <option value="disciplined">Disciplined</option>
              </select>
            </div>
          </div>
          <div className="h-64 mt-4" style={{ minWidth: 0 }}>
            {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis type="number" dataKey="x" name="Stress" unit="" />
                <YAxis type="number" dataKey="y" name="Avg P/L" unit="" />
                <Tooltip />
                <Scatter data={scatterPoints} fill="#3b82f6" />
              </ScatterChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card-light dark:bg-card-dark">
          <h2 className="text-lg font-bold mb-4">Mistake Distribution</h2>
          <div className="h-64" style={{ minWidth: 0 }}>
            {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Pie data={mistakeData} dataKey="value" nameKey="name" outerRadius={120}>
                  {mistakeData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            )}
          </div>
          <div className="mt-4 space-y-2">
            {mistakeData.map((m, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span>{m.name}</span>
                <span className="text-slate-500">{m.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold">Mindset Journal</h2>
          <div className="flex items-center gap-2">
            <input
              placeholder="Filter tags"
              className="px-2 py-1 rounded-lg text-xs border border-slate-200 dark:border-slate-800 bg-transparent"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val) setFilters((f) => ({ ...f, tags: [...(f.tags || []), val] }));
                  (e.target as HTMLInputElement).value = "";
                }
              }}
            />
            <button onClick={() => setShowModal(true)} className="px-3 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-blue-600">
              New Entry
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {journals.entries.length > 0 ? (
            journals.entries.map((e) => (
              <div key={e._id} className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 capitalize">{e.emotion}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sm font-semibold">{new Date(e.date).toLocaleString()}</p>
                      {e.tags?.map((tag, idx) => (
                        <span key={`${tag}-${idx}`} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg text-[10px] font-bold uppercase">
                          {tag}
                        </span>
                      ))}
                      {e.tradeId && (
                        <span className="text-xs text-slate-400 font-medium ml-auto">
                          Trade: {e.tradeId.symbol}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                      {e.entry}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => {
                          setEditingEntry(e);
                          setShowModal(true);
                        }}
                        className="px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          await deleteJournalEntry(e._id);
                          const res = await getJournalEntries({ dateRange, emotion: filters.emotion, tags: filters.tags, page: 1, limit: 10 });
                          setJournals(res);
                        }}
                        className="px-2 py-1 text-xs rounded-lg border border-rose-300 text-rose-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500">No journal entries</div>
          )}
        </div>
        <div className="p-6">
          <Link href="/journal" className="text-sm font-semibold text-primary hover:text-blue-600">View All Entries</Link>
        </div>
      </div>

      <JournalEntryModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingEntry(null);
        }}
        initialData={
          editingEntry
            ? {
                date: new Date(editingEntry.date),
                emotion: editingEntry.emotion,
                stressLevel: editingEntry.stressLevel,
                profitability: editingEntry.profitability,
                entry: editingEntry.entry,
                tradeId: editingEntry.tradeId?._id,
                tags: editingEntry.tags,
                _id: editingEntry._id,
              }
            : undefined
        }
        onSuccess={async () => {
          setShowModal(false);
          setEditingEntry(null);
          const res = await getJournalEntries({ dateRange, emotion: filters.emotion, tags: filters.tags, page: 1, limit: 10 });
          setJournals(res);
          const ins = await getPsychologyInsights(dateRange);
          setInsights(ins);
        }}
      />
    </div>
  );
}
