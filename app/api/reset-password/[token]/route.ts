import { NextResponse } from "next/server";
import { z } from "zod";
import User from "@/models/User";
import VerificationToken from "@/models/VerificationToken";
import connectDB from "@/lib/mongodb";

// Validation schema
const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const body = await req.json();
    const { token } = await params;

    // Validate request body
    const result = resetPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          message: "Invalid input",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    if (!token) {
      return NextResponse.json({ message: "Missing token" }, { status: 400 });
    }

    const { password } = result.data;

    await connectDB();

    // Find the token
    const verificationToken = await VerificationToken.findOne({
      token,
      type: "password-reset",
      expires: { $gt: new Date() },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 },
      );
    }

    // Find user and update password
    const user = await User.findOne({ email: verificationToken.identifier });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Update password
    // Note: The pre-save hook in User model will hash this password
    user.password = password;
    await user.save();

    // Delete the used token
    await VerificationToken.deleteOne({ _id: verificationToken._id });

    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
