import mongoose, { Schema, Model, Document } from "mongoose";
import crypto from "crypto";

export interface IVerificationToken extends Document {
  identifier: string;
  token: string;
  type: "email-verification" | "password-reset";
  expires: Date;
}

interface IVerificationTokenModel extends Model<IVerificationToken> {
  createToken(identifier: string, type: "email-verification" | "password-reset"): Promise<string>;
  verifyToken(identifier: string, token: string, type: "email-verification" | "password-reset"): Promise<boolean>;
}

const VerificationTokenSchema = new Schema<IVerificationToken>(
  {
    identifier: { type: String, required: true },
    token: { type: String, required: true },
    type: { 
      type: String, 
      enum: ["email-verification", "password-reset"],
      required: true 
    },
    expires: { type: Date, required: true },
  },
  { timestamps: true }
);

// TTL Index: expire documents after the 'expires' date passed
VerificationTokenSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

// Static method to create a token
VerificationTokenSchema.statics.createToken = async function (
  identifier: string,
  type: "email-verification" | "password-reset"
): Promise<string> {
  // Delete any existing tokens for this user and type
  await this.deleteMany({ identifier, type });

  let token: string;
  let expires: Date;

  if (type === "email-verification") {
    // 6-digit code
    token = Math.floor(100000 + Math.random() * 900000).toString();
    // 30 minutes expiration
    expires = new Date(Date.now() + 30 * 60 * 1000);
  } else {
    // UUID for password reset
    token = crypto.randomUUID();
    // 1 hour expiration
    expires = new Date(Date.now() + 60 * 60 * 1000);
  }

  await this.create({
    identifier,
    token,
    type,
    expires,
  });

  return token;
};

// Static method to verify a token
VerificationTokenSchema.statics.verifyToken = async function (
  identifier: string,
  token: string,
  type: "email-verification" | "password-reset"
): Promise<boolean> {
  const record = await this.findOne({
    identifier,
    token,
    type,
    expires: { $gt: new Date() },
  });

  if (record) {
    // Optional: Delete token after successful verification
    await this.deleteOne({ _id: record._id });
    return true;
  }

  return false;
};

// Check if model exists to prevent overwrite in hot reload
const VerificationToken =
  (mongoose.models.VerificationToken as IVerificationTokenModel) ||
  mongoose.model<IVerificationToken, IVerificationTokenModel>(
    "VerificationToken",
    VerificationTokenSchema
  );

export default VerificationToken;
