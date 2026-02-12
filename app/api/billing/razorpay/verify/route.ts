export const runtime = "nodejs";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error("Razorpay verify payload invalid", {
        userId: session.user.id,
      });
      return NextResponse.json(
        { message: "Invalid payment payload" },
        { status: 400 },
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error("Razorpay secret missing");
      return NextResponse.json(
        { message: "Razorpay secret not configured" },
        { status: 500 },
      );
    }

    console.log("Verifying Razorpay signature", {
      userId: session.user.id,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("Signature verification failed", {
        userId: session.user.id,
        orderId: razorpay_order_id,
      });
      return NextResponse.json(
        { message: "Signature verification failed" },
        { status: 400 },
      );
    }

    await connectDB();
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    user.plan.type = "pro";
    user.plan.monthlyTradesLimit = null as unknown as number;
    user.plan.tradesUsed = 0;
    user.plan.resetDate = new Date();
    user.accountType = "pro";
    await user.save();

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");

    console.log("User upgraded to Pro", { userId: session.user.id });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Razorpay verify error", {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to verify payment",
      },
      { status: 500 },
    );
  }
}
