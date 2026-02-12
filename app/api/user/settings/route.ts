import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";
import bcrypt from "bcryptjs";

const updateSettingsSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.newPassword && !data.currentPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Current password is required to set a new password",
      path: ["currentPassword"],
    },
  );

export async function PUT(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = updateSettingsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Invalid input",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { name, currentPassword, newPassword } = result.data;

    await connectDB();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Update name if provided
    if (name) {
      user.name = name;
    }

    // Update password if provided
    if (newPassword && currentPassword) {
      // Check if user has a password (might be OAuth user)
      if (user.password) {
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return NextResponse.json(
            { message: "Incorrect current password" },
            { status: 400 },
          );
        }
      } else {
        // If user has no password (e.g. Google auth only) and wants to set one,
        // we might require them to set a password for the first time without current password?
        // But schema requires currentPassword.
        // For now, assume if they are setting a password they must know the current one,
        // or if they don't have one (OAuth), they can't change it this way (they should use 'Forgot Password' flow or we need a 'Set Password' flow).
        // Let's assume for now this is for standard password rotation.
        return NextResponse.json(
          {
            message:
              "Cannot change password for this account type (OAuth). Please use reset password if needed.",
          },
          { status: 400 },
        );
      }

      // Hash new password - handled by pre-save hook?
      // Wait, pre-save hook hashes if modified.
      // user.password = newPassword;
      // But I should check if I need to manually hash or if the model handles it.
      // Looking at User.ts:
      // UserSchema.pre("save", async function (this: IUser) { ... if (!this.isModified("password")... this.password = await bcrypt.hash... })
      // So I just set the plain text password and save.
      user.password = newPassword;
    }

    await user.save();

    return NextResponse.json({
      message: "Settings updated successfully",
      user: {
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
