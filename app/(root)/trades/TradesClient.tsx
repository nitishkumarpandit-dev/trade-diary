"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Calendar,
  Filter,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  ArrowUpDown,
} from "lucide-react";
import TradeEntryModal from "@/components/shared/TradeEntryModal";
import { deleteTrade } from "@/lib/actions/trades";
import { toast } from "react-hot-toast";

type TradeStatus = "OPEN" | "CLOSED";
type TradeSide = "BUY" | "SELL";
type Emotion = "calm" | "anxious" | "confident" | "greedy";

interface Trade {
  _id: string;
  symbol: string;
  type: TradeSide;
  strategy: string;
  entryPrice: number;
  exitPrice?: number;
  stopLoss: number;
  target?: number;
  quantity: number;
  fees?: number;
  entryDate: string | Date;
  exitDate?: string | Date;
  pnl?: number;
  pnlPercentage?: number;
  status: TradeStatus;
  emotion?: Emotion;
  tags?: string[];
  notes?: string;
}

interface StrategyOption {
  _id: string;
  name: string;
}

interface TradesClientProps {
  initialTrades: Trade[];
  strategies: StrategyOption[];
  metadata: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function TradesClient({
  initialTrades,
  strategies,
  metadata,
}: TradesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  // Local state for filters and optimistic updates
  const [trades, setTrades] = useState<Trade[]>(initialTrades);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [strategyFilter, setStrategyFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(metadata.page);
  const [isLoading, setIsLoading] = useState(false);

  // Update trades when initialTrades change (from server)
  useEffect(() => {
    setTrades(initialTrades);
  }, [initialTrades]);

  const toInitialData = (trade: Trade) => ({
    _id: trade._id,
    symbol: trade.symbol,
    type: trade.type,
    strategy: trade.strategy,
    entryPrice: trade.entryPrice,
    exitPrice: trade.exitPrice,
    stopLoss: trade.stopLoss,
    target: trade.target,
    quantity: trade.quantity,
    fees: trade.fees ?? 0,
    entryDate: new Date(trade.entryDate),
    exitDate: trade.exitDate ? new Date(trade.exitDate) : undefined,
    tags: trade.tags ?? [],
    notes: trade.notes ?? "",
    emotion: trade.emotion ?? "calm",
  });

  const handleFilterChange = async (filters: {
    search?: string;
    status?: string;
    strategy?: string;
    page?: number;
  }) => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (filters.search) params.set("symbol", filters.search);
    if (filters.status && filters.status !== "all")
      params.set("status", filters.status);
    if (filters.strategy && filters.strategy !== "all")
      params.set("strategy", filters.strategy);
    if (filters.page) params.set("page", filters.page.toString());

    router.push(`/trades?${params.toString()}`);
    setIsLoading(false);
  };

  const onPageChange = (newPage: number) => {
    setCurrentPage(newPage);
    handleFilterChange({
      search: searchTerm,
      status: statusFilter,
      strategy: strategyFilter,
      page: newPage,
    });
  };

  const onSearch = (val: string) => {
    setSearchTerm(val);
    const timeoutId = setTimeout(() => {
      handleFilterChange({
        search: val,
        status: statusFilter,
        strategy: strategyFilter,
        page: 1,
      });
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this trade? This action cannot be undone.",
      )
    )
      return;

    // Optimistic update
    const previousTrades = [...trades];
    setTrades(trades.filter((t) => t._id !== id));

    try {
      const result = await deleteTrade(id);
      if (result.success) {
        toast.success("Trade deleted successfully", {
          icon: "🗑️",
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        });
      } else {
        setTrades(previousTrades);
        toast.error(result.error || "Failed to delete trade");
      }
    } catch (error) {
      setTrades(previousTrades);
      toast.error("An error occurred while deleting the trade");
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Entry Date",
      "Exit Date",
      "Symbol",
      "Type",
      "Strategy",
      "Entry Price",
      "Exit Price",
      "Stop Loss",
      "Target",
      "Quantity",
      "Fees",
      "P/L",
      "Status",
      "Mood",
      "Tags",
      "Notes",
    ];

    const csvData = trades.map((t) => [
      new Date(t.entryDate).toLocaleString(),
      t.exitDate ? new Date(t.exitDate).toLocaleString() : "",
      t.symbol,
      t.type,
      strategies.find((s) => s._id === t.strategy)?.name || t.strategy,
      t.entryPrice,
      t.exitPrice || "",
      t.stopLoss,
      t.target || "",
      t.quantity,
      t.fees || 0,
      t.pnl || 0,
      t.status,
      t.emotion || "",
      (t.tags || []).join(";"),
      `"${(t.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers, ...csvData].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `trades_full_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Export started");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trade History</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage and analyze your past trades
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEntryModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-blue-600 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Trade</span>
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
          >
            <Download className="w-5 h-5 text-slate-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card-light dark:bg-card-dark p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              className="w-full pl-11 h-11 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
              placeholder="Search symbol..."
              type="text"
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
          <select
            className="w-full h-11 rounded-full px-5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none text-sm appearance-none cursor-pointer"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              handleFilterChange({
                search: searchTerm,
                status: e.target.value,
                strategy: strategyFilter,
                page: 1,
              });
            }}
          >
            <option value="all">All Status</option>
            <option value="OPEN">Open Positions</option>
            <option value="CLOSED">Closed Trades</option>
          </select>
          <select
            className="w-full h-11 rounded-full px-5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none text-sm appearance-none cursor-pointer"
            value={strategyFilter}
            onChange={(e) => {
              setStrategyFilter(e.target.value);
              handleFilterChange({
                search: searchTerm,
                status: statusFilter,
                strategy: e.target.value,
                page: 1,
              });
            }}
          >
            <option value="all">All Strategies</option>
            {strategies.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              className="w-full pl-11 h-11 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm cursor-not-allowed"
              placeholder="Date range..."
              type="text"
              disabled
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                  Date
                </th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                  Symbol
                </th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                  Type
                </th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                  Entry
                </th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                  Exit
                </th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 text-right">
                  Qty
                </th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 text-right">
                  P/L
                </th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 text-center">
                  Status
                </th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {trades.length > 0 ? (
                trades.map((trade) => (
                  <tr
                    key={trade._id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {new Date(trade.entryDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 font-bold whitespace-nowrap">
                      {trade.symbol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          trade.type === "BUY"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                            : "bg-red-100 dark:bg-red-900/30 text-red-600"
                        }`}
                      >
                        {trade.type === "BUY" ? "LONG" : "SHORT"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ₹{trade.entryPrice.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {trade.exitPrice
                        ? `₹${trade.exitPrice.toLocaleString("en-IN")}`
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {trade.quantity}
                    </td>
                    <td
                      className={`px-6 py-4 font-bold text-right whitespace-nowrap ${
                        (trade.pnl || 0) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {trade.pnl !== undefined
                        ? `₹${trade.pnl.toLocaleString("en-IN")}`
                        : "--"}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          trade.status === "CLOSED"
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            : "bg-blue-100 dark:bg-blue-900/30 text-blue-600"
                        }`}
                      >
                        {trade.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedTrade(trade);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(trade._id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No trades found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-medium">
              {(metadata.page - 1) * metadata.limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(metadata.page * metadata.limit, metadata.total)}
            </span>{" "}
            of <span className="font-medium">{metadata.total}</span> results
          </p>
          <div className="flex items-center gap-2">
            <button
              className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              disabled={metadata.page <= 1 || isLoading}
              onClick={() => onPageChange(metadata.page - 1)}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from(
                { length: Math.min(5, metadata.totalPages) },
                (_, i) => {
                  const pageNum = i + 1; // Simplified for now, could be improved with sliding window
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                        metadata.page === pageNum
                          ? "bg-primary text-white shadow-sm"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                      disabled={isLoading}
                    >
                      {pageNum}
                    </button>
                  );
                },
              )}
              {metadata.totalPages > 5 && (
                <span className="px-2 text-slate-400">...</span>
              )}
            </div>

            <button
              className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              disabled={metadata.page >= metadata.totalPages || isLoading}
              onClick={() => onPageChange(metadata.page + 1)}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <TradeEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
      />

      <TradeEntryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTrade(null);
        }}
        initialData={selectedTrade ? toInitialData(selectedTrade) : undefined}
      />
    </div>
  );
}
