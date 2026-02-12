import mongoose, { Schema, Model, Document } from "mongoose";
import { IStrategy } from "@/types";

export interface IStrategyDocument extends Omit<IStrategy, "_id">, Document {}

const StrategySchema = new Schema<IStrategyDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    assetClass: {
      type: String,
      enum: ["equity", "futures", "options", "forex", "crypto"],
      required: true,
    },
    description: { type: String },
    rules: { type: String },
    targetWinRate: { type: Number },
    minRiskReward: { type: Number },
    status: { type: String, enum: ["active", "paused"], default: "active" },
    performance: {
      totalTrades: { type: Number, default: 0 },
      winRate: { type: Number, default: 0 },
      profitFactor: { type: Number, default: 0 },
      avgRiskReward: { type: Number, default: 0 },
      maxDrawdown: { type: Number, default: 0 },
      netPnl: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

// Indexes
StrategySchema.index({ userId: 1 });
StrategySchema.index({ createdAt: -1 });

const Strategy: Model<IStrategyDocument> =
  mongoose.models.Strategy ||
  mongoose.model<IStrategyDocument>("Strategy", StrategySchema);

export default Strategy;
