"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Trade {
  id: string;
  symbol: string;
  side: "LONG" | "SHORT";
  entryPrice: number;
  exitPrice: number | null;
  stopLoss: number;
  quantity: number;
  fees: number;
  pnl: number | null;
  roi: number | null;
  date: string;
  status: "OPEN" | "CLOSED";
  setup?: string;
  notes?: string;
  tags?: string[];
  mood?: string;
}

export interface Strategy {
  id: string;
  name: string;
  assetClass: string;
  status: "ACTIVE" | "PAUSED";
  targetWinRate?: number;
  minRR?: string;
  description?: string;
  rules?: string;
}

interface TradeContextType {
  trades: Trade[];
  strategies: Strategy[];
  addTrade: (
    trade: Omit<Trade, "id" | "date" | "status" | "pnl" | "roi">,
  ) => void;
  deleteTrade: (id: string) => void;
  addStrategy: (strategy: Omit<Strategy, "id">) => void;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export const useTrades = () => {
  const context = useContext(TradeContext);
  if (!context) {
    throw new Error("useTrades must be used within a TradeProvider");
  }
  return context;
};

export const TradeProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize with some mock data
  const [trades, setTrades] = useState<Trade[]>([
    {
      id: "1",
      symbol: "RELIANCE",
      side: "LONG",
      entryPrice: 2845.2,
      exitPrice: 2872.5,
      stopLoss: 2830.0,
      quantity: 50,
      fees: 15.0,
      pnl: 1365.0,
      roi: 0.96,
      date: new Date(1726272000000).toISOString(), // 2 days ago
      status: "CLOSED",
      tags: ["Trending", "Breakout"],
      mood: "Calm",
      notes: "Good volume breakout",
      setup: "Trend Following",
    },
    {
      id: "2",
      symbol: "NIFTY 23500 CE",
      side: "SHORT",
      entryPrice: 124.5,
      exitPrice: 145.2,
      stopLoss: 110.0,
      quantity: 150,
      fees: 40.0,
      pnl: -3105.0,
      roi: -16.6,
      date: new Date(1726272000000).toISOString(), // 3 days ago
      status: "CLOSED",
      tags: ["Reversal"],
      mood: "Anxious",
      notes: "Exited too late",
      setup: "Mean Reversion",
    },
    {
      id: "3",
      symbol: "TCS",
      side: "LONG",
      entryPrice: 3912.0,
      exitPrice: 3955.0,
      stopLoss: 3880.0,
      quantity: 20,
      fees: 20.0,
      pnl: 860.0,
      roi: 1.1,
      date: new Date(1726272000000).toISOString(), // 4 days ago
      status: "CLOSED",
      tags: ["Range Bound"],
      mood: "Confident",
      notes: "Quick scalp",
      setup: "Scalping",
    },
    {
      id: "4",
      symbol: "HDFCBANK",
      side: "LONG",
      entryPrice: 1520.0,
      exitPrice: null,
      stopLoss: 1500.0,
      quantity: 100,
      fees: 0,
      pnl: null,
      roi: null,
      date: new Date().toISOString(), // Today
      status: "OPEN",
      tags: ["Trending"],
      mood: "Calm",
      setup: "Trend Following",
    },
  ]);

  const [strategies, setStrategies] = useState<Strategy[]>([
    {
      id: "1",
      name: "Trend Following",
      assetClass: "Equity",
      status: "ACTIVE",
      targetWinRate: 50,
      minRR: "1:2",
      description: "Ride the trend until it bends.",
      rules: "Entry on pullback to EMA 20.",
    },
    {
      id: "2",
      name: "Mean Reversion",
      assetClass: "Options",
      status: "ACTIVE",
      targetWinRate: 60,
      minRR: "1:1.5",
      description: "Fade extreme moves.",
    },
    {
      id: "3",
      name: "Scalping",
      assetClass: "Equity",
      status: "ACTIVE",
      targetWinRate: 70,
      minRR: "1:1",
    },
  ]);

  const addTrade = (
    tradeData: Omit<Trade, "id" | "date" | "status" | "pnl" | "roi">,
  ) => {
    const isClosed = tradeData.exitPrice !== null && tradeData.exitPrice > 0;

    let pnl = null;
    let roi = null;

    if (isClosed && tradeData.exitPrice) {
      const rawPnl =
        tradeData.side === "LONG"
          ? (tradeData.exitPrice - tradeData.entryPrice) * tradeData.quantity
          : (tradeData.entryPrice - tradeData.exitPrice) * tradeData.quantity;

      pnl = rawPnl - tradeData.fees;
      const invested = tradeData.entryPrice * tradeData.quantity;
      roi = (pnl / invested) * 100;
    }

    const newTrade: Trade = {
      ...tradeData,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      status: isClosed ? "CLOSED" : "OPEN",
      pnl,
      roi,
    };

    setTrades((prev) => [newTrade, ...prev]);
  };

  const deleteTrade = (id: string) => {
    setTrades((prev) => prev.filter((t) => t.id !== id));
  };

  const addStrategy = (strategyData: Omit<Strategy, "id">) => {
    const newStrategy: Strategy = {
      ...strategyData,
      id: Math.random().toString(36).substr(2, 9),
    };
    setStrategies((prev) => [...prev, newStrategy]);
  };

  return (
    <TradeContext.Provider
      value={{ trades, strategies, addTrade, deleteTrade, addStrategy }}
    >
      {children}
    </TradeContext.Provider>
  );
};
