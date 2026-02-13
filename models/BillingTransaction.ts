import mongoose, { Schema, Model, Document } from "mongoose";

export interface IBillingTransaction extends Document {
  userId: Schema.Types.ObjectId;
  orderId: string;
  paymentId: string;
  receipt?: string;
  amount: number;
  currency: string;
  status: string;
  method?: string;
  email?: string;
  contact?: string;
  notes?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const BillingTransactionSchema = new Schema<IBillingTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    orderId: { type: String, required: true, index: true },
    paymentId: { type: String, required: true, index: true },
    receipt: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: { type: String, required: true },
    method: { type: String },
    email: { type: String },
    contact: { type: String },
    notes: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

BillingTransactionSchema.index({ createdAt: -1 });

const BillingTransaction: Model<IBillingTransaction> =
  mongoose.models.BillingTransaction ||
  mongoose.model<IBillingTransaction>(
    "BillingTransaction",
    BillingTransactionSchema,
  );

export default BillingTransaction;
