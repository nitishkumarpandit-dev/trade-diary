import { z } from "zod";

// Trade Schema
export const tradeSchema = z
  .object({
    symbol: z.string().min(1, "Symbol is required"),
    type: z.enum(["BUY", "SELL"], {
      message: "Transaction type is required",
    }),
    strategy: z.string().min(1, "Strategy is required"),
    entryPrice: z.number().positive("Entry price must be positive"),
    exitPrice: z.number().positive("Exit price must be positive").optional(),
    stopLoss: z.number().positive("Stop loss must be positive"),
    target: z.number().positive("Target must be positive").optional(),
    quantity: z.number().positive("Quantity must be positive"),
    fees: z.number().min(0, "Fees cannot be negative").optional(),
    entryDate: z.coerce.date({ message: "Entry date is required" }),
    exitDate: z.coerce.date().optional(),
    tags: z.array(z.string()).optional(),
    notes: z.string().optional(),
    emotion: z.enum(["calm", "anxious", "confident", "greedy"]).optional(),
    screenshots: z.array(z.string()).optional(),
  })
  .superRefine((val, ctx) => {
    // Stop loss must be on the correct side of entry based on side
    if (val.type === "BUY") {
      if (val.stopLoss >= val.entryPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["stopLoss"],
          message: "For LONG, stop loss must be below entry price",
        });
      }
      if (val.target != null && val.target <= val.entryPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["target"],
          message: "For LONG, target should be above entry price",
        });
      }
    } else if (val.type === "SELL") {
      if (val.stopLoss <= val.entryPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["stopLoss"],
          message: "For SHORT, stop loss must be above entry price",
        });
      }
      if (val.target != null && val.target >= val.entryPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["target"],
          message: "For SHORT, target should be below entry price",
        });
      }
    }

    // Risk cannot be zero
    if (val.stopLoss === val.entryPrice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["stopLoss"],
        message: "Stop loss cannot equal entry price",
      });
    }

    // Exit date/price pairing rules
    if (
      val.exitDate &&
      (val.exitPrice == null || Number.isNaN(val.exitPrice))
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["exitPrice"],
        message: "Exit price is required when exit date is provided",
      });
    }
    if (val.exitPrice != null && !val.exitDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["exitDate"],
        message: "Exit date is required when exit price is provided",
      });
    }
  });

// Strategy Schema
export const strategySchema = z.object({
  name: z.string().min(1, "Strategy name is required"),
  assetClass: z.enum(["equity", "futures", "options", "forex", "crypto"], {
    message: "Asset class is required",
  }),
  description: z.string().optional(),
  rules: z.string().optional(),
  targetWinRate: z.number().min(0).max(100).optional(),
  minRiskReward: z.number().min(0).optional(),
  status: z.enum(["active", "paused"]).default("active"),
});

// Psychology Journal Schema
export const journalSchema = z.object({
  date: z.coerce.date({ message: "Date is required" }),
  emotion: z.enum(
    ["calm", "anxious", "confident", "greedy", "fearful", "disciplined"],
    { message: "Emotion is required" },
  ),
  entry: z.string().min(1, "Journal entry is required"),
  tradeId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  stressLevel: z
    .number()
    .min(1, "Stress level must be at least 1")
    .max(10, "Stress level must be at most 10")
    .optional(),
  profitability: z.number().optional(),
});

// User Settings Schema
export const userSettingsSchema = z.object({
  defaultStrategy: z.string().optional(),
  riskPerTrade: z.number().min(0).max(100).optional(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
});

// Export inferred types
export type TradeFormValues = z.infer<typeof tradeSchema>;
export type StrategyFormValues = z.infer<typeof strategySchema>;
export type JournalFormValues = z.infer<typeof journalSchema>;
export type UserSettingsFormValues = z.infer<typeof userSettingsSchema>;
