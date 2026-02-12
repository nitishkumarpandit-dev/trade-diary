import { NextResponse } from "next/server";
import { z } from "zod";
import User from "@/models/User";
import VerificationToken from "@/models/VerificationToken";
import connectDB from "@/lib/mongodb";
import { sendPasswordResetEmail } from "@/lib/email";

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body
    const result = forgotPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          message: "Invalid input",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { email } = result.data;

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });

    // We always return a success message for security reasons (to prevent email enumeration)
    // But we only actually send the email if the user exists
    if (user) {
      // Generate password reset token
      const token = await VerificationToken.createToken(
        user.email,
        "password-reset",
      );

      // Create reset URL
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const resetUrl = `${appUrl}/reset-password/${token}`;

      // Send email
      await sendPasswordResetEmail(user.email, resetUrl);
    }

    return NextResponse.json(
      {
        message:
          "If an account exists with this email, you will receive a password reset link.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
