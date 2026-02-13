export const runtime = "nodejs";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@/lib/auth";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      console.error("Razorpay keys missing");
      return NextResponse.json(
        { message: "Razorpay keys not configured" },
        { status: 400 },
      );
    }

    console.log("Creating Razorpay order", {
      userId: session.user.id,
      amount: 9900,
      currency: "INR",
    });
    const rp = new Razorpay({ key_id, key_secret });
    const uid = String(session.user.id).slice(-8);
    const ts = Date.now().toString().slice(-6);
    const receipt = `pro_${uid}_${ts}`;
    const order = await rp.orders.create({
      amount: 9900,
      currency: "INR",
      receipt,
      notes: {
        userId: session.user.id,
        plan: "pro_monthly",
      },
    });

    console.log("Razorpay order created", {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
    return NextResponse.json(
      {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
      { status: 200 },
    );
  } catch (error) {
    try {
      // Razorpay SDK often returns an object with 'error' containing details
      const details =
        typeof error === "object" && error !== null
          ? ((error as any).error ?? error)
          : error;
      console.error("Razorpay order error", details);
    } catch {
      console.error("Razorpay order error (stringified)", String(error));
    }
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to create order",
        details:
          typeof error === "object" && error !== null
            ? ((error as any).error ?? error)
            : String(error),
      },
      { status: 500 },
    );
  }
}
