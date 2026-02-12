import { NextResponse } from "next/server";
import { z } from "zod";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";
import { sendVerificationEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

// Validation schema
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Validate request body
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          message: "Invalid input",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { name, email, password } = result.data;

    await connectDB();

    // 2. Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 },
      );
    }

    // 3. Generate OTP and Hash Password
    // Generate 6-digit verification code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // 4. Create JWT with registration data
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const token = await new SignJWT({
      name,
      email: email.toLowerCase(),
      hashedPassword,
      otp,
      expiresAt,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("10m")
      .sign(secret);

    // 5. Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("registration_data", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 600, // 10 minutes
      path: "/",
    });

    // 6. Send verification email
    const emailSent = await sendVerificationEmail(email.toLowerCase(), otp);

    if (!emailSent) {
      console.error("Failed to send verification email to:", email);
      return NextResponse.json(
        { message: "Failed to send verification email" },
        { status: 500 },
      );
    }

    // 7. Return success response
    return NextResponse.json(
      {
        message: "Verification code sent. Please check your email.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
