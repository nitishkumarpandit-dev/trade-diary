"use server";

import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User, { IUserDocument } from "@/models/User";
import { userSettingsSchema, UserSettingsFormValues } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export async function updateUserProfile(data: { name?: string; email?: string }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await connectDB();
    const user = await User.findById(session.user.id);

    if (!user) {
      throw new Error("User not found");
    }

    if (data.name) {
      user.name = data.name;
    }

    if (data.email && data.email !== user.email) {
      // Check for email uniqueness
      const existingUser = await User.findOne({ email: data.email });
      if (existingUser) {
        throw new Error("Email already in use");
      }
      user.email = data.email;
      // In a real app, we might want to reset emailVerified to null and trigger re-verification
      // user.emailVerified = null; 
    }

    await user.save();

    revalidatePath("/dashboard/settings");

    return { success: true, user: JSON.parse(JSON.stringify(user)) };
  } catch (error) {
    console.error("Update user profile error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}

export async function updatePassword(currentPassword: string, newPassword: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await connectDB();
    const user = await User.findById(session.user.id).select("+password");

    if (!user) {
      throw new Error("User not found");
    }

    if (user.provider === "google") {
      throw new Error("Cannot change password for Google authenticated users");
    }

    if (!user.password) {
        // Should not happen for credentials users, but safety check
        throw new Error("Password not set");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new Error("Incorrect current password");
    }

    // Directly set the new password. The pre-save hook in User model will handle hashing.
    user.password = newPassword;
    await user.save();

    revalidatePath("/dashboard/settings");

    return { success: true };
  } catch (error) {
    console.error("Update password error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update password",
    };
  }
}

export async function updatePreferences(preferences: UserSettingsFormValues) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const validatedData = userSettingsSchema.parse(preferences);

    await connectDB();
    const user = await User.findById(session.user.id);

    if (!user) {
      throw new Error("User not found");
    }

    // Merge preferences
    user.preferences = {
      ...user.preferences,
      ...validatedData,
    };

    await user.save();

    revalidatePath("/dashboard/settings");

    return { success: true };
  } catch (error) {
    console.error("Update preferences error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update preferences",
    };
  }
}

export async function getUserSettings() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await connectDB();
    const user = await User.findById(session.user.id).lean();

    if (!user) {
      throw new Error("User not found");
    }

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.error("Get user settings error:", error);
    throw new Error("Failed to fetch user settings");
  }
}

export async function upgradePlan() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await connectDB();
    const user = await User.findById(session.user.id);

    if (!user) {
      throw new Error("User not found");
    }

    // In a real app, verify payment here via Stripe/etc.
    // For now, simulate upgrade

    user.plan.type = "pro";
    user.plan.monthlyTradesLimit = 1000;
    user.accountType = "pro"; // Sync accountType with plan
    
    await user.save();

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");

    return { success: true, plan: user.plan };
  } catch (error) {
    console.error("Upgrade plan error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upgrade plan",
    };
  }
}
