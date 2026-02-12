import { Types } from "mongoose";

export interface IPreferences {
  defaultStrategy?: string;
  riskPerTrade?: number;
  currency: string;
  timezone: string;
}

export interface IPlan {
  type: "free" | "pro";
  monthlyTradesLimit: number;
  tradesUsed: number;
  resetDate: Date;
}

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  emailVerified?: Date | null;
  image?: string;
  provider: "credentials" | "google";
  accountType: "standard" | "pro";
  preferences: IPreferences;
  plan: IPlan;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITrade {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  symbol: string;
  type: "BUY" | "SELL";
  strategy: string;
  entryPrice: number;
  exitPrice?: number;
  stopLoss: number;
  target?: number;
  quantity: number;
  fees: number;
  pnl?: number;
  pnlPercentage?: number;
  status: "OPEN" | "CLOSED";
  entryDate: Date;
  exitDate?: Date;
  tags: string[];
  notes?: string;
  emotion?: "calm" | "anxious" | "confident" | "greedy";
  screenshots?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IStrategyPerformance {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  avgRiskReward: number;
  maxDrawdown: number;
  netPnl: number;
}

export interface IStrategy {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  assetClass: "equity" | "futures" | "options" | "forex" | "crypto";
  description?: string;
  rules?: string;
  targetWinRate?: number;
  minRiskReward?: number;
  status: "active" | "paused";
  performance: IStrategyPerformance;
  createdAt: Date;
  updatedAt: Date;
}

export interface IJournal {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  tradeId?: Types.ObjectId;
  date: Date;
  emotion:
    | "calm"
    | "anxious"
    | "confident"
    | "greedy"
    | "fearful"
    | "disciplined";
  stressLevel: number; // 1-10
  profitability: number;
  entry: string;
  tags: string[];
  createdAt: Date;
}
