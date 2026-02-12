import mongoose, { Schema, Model, Document } from "mongoose";
import { IJournal } from "@/types";

export interface IJournalDocument extends Omit<IJournal, "_id">, Document {}

const JournalSchema = new Schema<IJournalDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tradeId: { type: Schema.Types.ObjectId, ref: "Trade" },
    date: { type: Date, required: true },
    emotion: {
      type: String,
      enum: [
        "calm",
        "anxious",
        "confident",
        "greedy",
        "fearful",
        "disciplined",
      ],
      required: true,
    },
    stressLevel: { type: Number, required: true, min: 1, max: 10 },
    profitability: { type: Number, required: true },
    entry: { type: String, required: true },
    tags: [{ type: String }],
  },
  { timestamps: true },
);

// Indexes
JournalSchema.index({ userId: 1 });
JournalSchema.index({ createdAt: -1 });

const Journal: Model<IJournalDocument> =
  mongoose.models.Journal ||
  mongoose.model<IJournalDocument>("Journal", JournalSchema);

export default Journal;
