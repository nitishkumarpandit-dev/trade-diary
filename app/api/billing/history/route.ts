export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import BillingTransaction from "@/models/BillingTransaction";
import mongoose, { Types } from "mongoose";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const userObjectId = new Types.ObjectId(session.user.id);
    const items = await BillingTransaction.find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return NextResponse.json(
      items.map((i) => ({
        id: i._id.toString(),
        orderId: i.orderId,
        paymentId: i.paymentId,
        receipt: i.receipt,
        amount: i.amount,
        currency: i.currency,
        status: i.status,
        method: i.method,
        createdAt: i.createdAt,
      })),
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to fetch history",
      },
      { status: 500 },
    );
  }
}
