import { NextResponse } from "next/server";
import { z } from "zod";
import User from "@/models/User";
import VerificationToken from "@/models/VerificationToken";
import connectDB from "@/lib/mongodb";
import { sendVerificationEmail, sendWelcomeEmail } from "@/lib/email";

// Validation schema for verification
const verifySchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().length(6, "Verification code must be 6 digits"),
});

// Validation schema for resend
const resendSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body
    const result = verifySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { 
          message: "Invalid input", 
          errors: result.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { email, code } = result.data;

    await connectDB();

    // Verify the token
    const isValid = await VerificationToken.verifyToken(
      email,
      code,
      "email-verification"
    );

    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    // Update user status
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { emailVerified: new Date() },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Send welcome email (optional, but good UX)
    // We don't await this to keep the response fast
    sendWelcomeEmail(user.email, user.name).catch(err => 
      console.error("Failed to send welcome email:", err)
    );

    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Resend verification code endpoint
export async function PUT(req: Request) {
  try {
    const body = await req.json();

    // Validate request body
    const result = resendSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { 
          message: "Invalid input", 
          errors: result.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { email } = result.data;

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email is already verified" },
        { status: 400 }
      );
    }

    // Generate new token
    const token = await VerificationToken.createToken(
      user.email,
      "email-verification"
    );

    // Send email
    const emailSent = await sendVerificationEmail(user.email, token);

    if (!emailSent) {
      return NextResponse.json(
        { message: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Verification code sent" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
