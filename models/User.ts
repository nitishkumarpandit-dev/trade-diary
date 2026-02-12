import mongoose, { Schema, Model, Document } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { IUser } from "@/types";

export interface IUserDocument extends Omit<IUser, "_id">, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateVerificationToken(): string;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false },
    emailVerified: { type: Date, default: null },
    image: { type: String },
    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },
    accountType: {
      type: String,
      enum: ["standard", "pro"],
      default: "standard",
    },
    preferences: {
      defaultStrategy: String,
      riskPerTrade: Number,
      currency: { type: String, default: "USD" },
      timezone: { type: String, default: "UTC" },
    },
    plan: {
      type: { type: String, enum: ["free", "pro"], default: "free" },
      monthlyTradesLimit: { type: Number, default: 100 },
      tradesUsed: { type: Number, default: 0 },
      resetDate: { type: Date, default: Date.now },
    },
  },
  { timestamps: true },
);

// Pre-save hook to hash password
UserSchema.pre("save", async function (this: IUserDocument) {
  if (!this.isModified("password") || !this.password) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate verification token
UserSchema.methods.generateVerificationToken = function (): string {
  return crypto.randomBytes(32).toString("hex");
};

// Check if model exists to prevent overwrite in hot reload (Next.js specific)
const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);

export default User;
