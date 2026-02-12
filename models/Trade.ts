import mongoose, { Schema, Model, Document } from "mongoose";
import { ITrade } from "@/types";

export interface ITradeDocument extends Omit<ITrade, "_id">, Document {}

const TradeSchema = new Schema<ITradeDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    symbol: { type: String, required: true },
    type: { type: String, enum: ["BUY", "SELL"], required: true },
    strategy: { type: String, required: true },
    entryPrice: { type: Number, required: true },
    exitPrice: { type: Number },
    stopLoss: { type: Number, required: true },
    target: { type: Number },
    quantity: { type: Number, required: true },
    fees: { type: Number, default: 0 },
    pnl: { type: Number },
    pnlPercentage: { type: Number },
    status: { type: String, enum: ["OPEN", "CLOSED"], default: "OPEN" },
    entryDate: { type: Date, required: true },
    exitDate: { type: Date },
    tags: [{ type: String }],
    notes: { type: String },
    emotion: {
      type: String,
      enum: ["calm", "anxious", "confident", "greedy"],
    },
    screenshots: [{ type: String }],
  },
  { timestamps: true },
);

// Indexes
TradeSchema.index({ userId: 1 });
TradeSchema.index({ status: 1 });
TradeSchema.index({ createdAt: -1 });

const Trade: Model<ITradeDocument> =
  mongoose.models.Trade || mongoose.model<ITradeDocument>("Trade", TradeSchema);

export default Trade;
