"use server";

import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Journal, { IJournalDocument } from "@/models/Journal";
import Trade from "@/models/Trade";
import { journalSchema, JournalFormValues } from "@/lib/validations";
import { revalidatePath, unstable_cache } from "next/cache";
import mongoose from "mongoose";

export type CreateJournalInput = JournalFormValues;
export type UpdateJournalInput = Partial<JournalFormValues>;

export interface JournalFilters {
  dateRange?: {
    from: Date;
    to: Date;
  };
  emotion?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

export async function createJournalEntry(data: CreateJournalInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await connectDB();

    const validatedData = journalSchema.parse(data);

    // Provide defaults for required Mongoose fields if missing
    // Assuming stressLevel default 5 (neutral) and profitability 0 if not provided
    const entryData = {
      ...validatedData,
      userId: session.user.id,
      stressLevel: validatedData.stressLevel ?? 5,
      profitability: validatedData.profitability ?? 0,
    };

    const newEntry = await Journal.create(entryData);

    revalidatePath("/dashboard");
    revalidatePath("/journal");

    return { success: true, entryId: newEntry._id.toString() };
  } catch (error) {
    console.error("Create journal entry error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create journal entry",
    };
  }
}

export async function getJournalEntries(filters: JournalFilters = {}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const { dateRange, emotion, tags, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {
      userId: session.user.id,
    };

    if (dateRange) {
      query.date = { $gte: dateRange.from, $lte: dateRange.to };
    }
    if (emotion) {
      query.emotion = emotion;
    }
    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    await connectDB();

    const [entries, total] = await Promise.all([
      Journal.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .populate("tradeId", "symbol pnl status type") // Populate basic trade info
        .lean(),
      Journal.countDocuments(query),
    ]);

    return {
      entries: JSON.parse(JSON.stringify(entries)),
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Get journal entries error:", error);
    throw new Error("Failed to fetch journal entries");
  }
}

export async function updateJournalEntry(
  entryId: string,
  data: UpdateJournalInput,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await connectDB();

    const entry = await Journal.findOne({
      _id: entryId,
      userId: session.user.id,
    });

    if (!entry) {
      throw new Error("Journal entry not found");
    }

    Object.assign(entry, data);
    await entry.save();

    revalidatePath("/dashboard");
    revalidatePath("/journal");

    return { success: true, entry: JSON.parse(JSON.stringify(entry)) };
  } catch (error) {
    console.error("Update journal entry error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update journal entry",
    };
  }
}

export async function deleteJournalEntry(entryId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await connectDB();

    const result = await Journal.deleteOne({
      _id: entryId,
      userId: session.user.id,
    });

    if (result.deletedCount === 0) {
      throw new Error("Journal entry not found");
    }

    revalidatePath("/dashboard");
    revalidatePath("/journal");

    return { success: true };
  } catch (error) {
    console.error("Delete journal entry error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete journal entry",
    };
  }
}

export async function getPsychologyInsights(dateRange?: {
  from: Date;
  to: Date;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await connectDB();
    const userId = new mongoose.Types.ObjectId(session.user.id);

    const matchStage: Record<string, any> = { userId };
    if (dateRange) {
      matchStage.date = { $gte: dateRange.from, $lte: dateRange.to };
    }

    const insights = await Journal.aggregate([
      { $match: matchStage },
      {
        $facet: {
          emotionCounts: [
            { $group: { _id: "$emotion", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 },
          ],
          emotionProfitability: [
            {
              $group: {
                _id: "$emotion",
                avgProfitability: { $avg: "$profitability" },
              },
            },
            { $sort: { avgProfitability: -1 } },
          ],
          topTags: [
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
          ],
          mindset: [
            {
              $group: {
                _id: null,
                totalEntries: { $sum: 1 },
                disciplinedCount: {
                  $sum: { $cond: [{ $eq: ["$emotion", "disciplined"] }, 1, 0] },
                },
              },
            },
          ],
        },
      },
    ]);

    const result = insights[0];

    // Calculate mindset score (percentage of disciplined entries)
    const totalEntries = result.mindset[0]?.totalEntries || 0;
    const disciplinedCount = result.mindset[0]?.disciplinedCount || 0;
    const mindsetScore =
      totalEntries > 0 ? (disciplinedCount / totalEntries) * 100 : 0;

    // If no journal data, fallback to trades-based insights
    const hasJournalData =
      (result.emotionCounts && result.emotionCounts.length > 0) ||
      (result.topTags && result.topTags.length > 0);

    if (!hasJournalData) {
      const tradeMatch: Record<string, any> = { userId };
      if (dateRange) {
        tradeMatch.entryDate = { $gte: dateRange.from, $lte: dateRange.to };
      }

      const tradeInsights = await Trade.aggregate([
        { $match: tradeMatch },
        {
          $facet: {
            emotionCounts: [
              { $match: { emotion: { $exists: true, $ne: null } } },
              { $group: { _id: "$emotion", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 1 },
            ],
            topTags: [
              { $unwind: "$tags" },
              { $group: { _id: "$tags", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 5 },
            ],
            emotionProfitability: [
              { $match: { emotion: { $exists: true, $ne: null } } },
              {
                $group: {
                  _id: "$emotion",
                  avgProfitability: { $avg: "$pnl" },
                },
              },
              { $sort: { avgProfitability: -1 } },
            ],
          },
        },
      ]);

      const t = tradeInsights[0] || {
        emotionCounts: [],
        topTags: [],
        emotionProfitability: [],
      };

      return {
        dominantMood: t.emotionCounts[0]?._id || "Neutral",
        topTags: t.topTags.map((x: { _id: string }) => x._id) || [],
        mostCommonEmotion: t.emotionCounts[0]?._id || "None",
        emotionProfitability: t.emotionProfitability,
        mistakeDistribution: [],
        mindsetScore: 0,
      };
    }

    return {
      dominantMood: result.emotionCounts[0]?._id || "Neutral",
      topTags: result.topTags.map((t: { _id: string }) => t._id) || [],
      mostCommonEmotion: result.emotionCounts[0]?._id || "None",
      emotionProfitability: result.emotionProfitability,
      mistakeDistribution: [],
      mindsetScore,
    };
  } catch (error) {
    console.error("Get psychology insights error:", error);
    throw new Error("Failed to fetch psychology insights");
  }
}

export async function getEmotionalStateVsPnL() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await connectDB();
    const userId = new mongoose.Types.ObjectId(session.user.id);

    // Query journal entries with linked trades
    const data = await Journal.aggregate([
      {
        $match: {
          userId,
          tradeId: { $exists: true, $ne: null },
        },
      },
      {
        $lookup: {
          from: "trades",
          localField: "tradeId",
          foreignField: "_id",
          as: "trade",
        },
      },
      { $unwind: "$trade" },
      {
        $group: {
          _id: "$emotion",
          avgPnL: { $avg: "$trade.pnl" },
          avgStressLevel: { $avg: "$stressLevel" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          emotion: "$_id",
          avgPnL: 1,
          avgStressLevel: 1,
          count: 1,
          _id: 0,
        },
      },
    ]);

    return data;
  } catch (error) {
    console.error("Get emotional state vs PnL error:", error);
    throw new Error("Failed to fetch emotional state vs PnL data");
  }
}
