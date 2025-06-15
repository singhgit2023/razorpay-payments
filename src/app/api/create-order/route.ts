import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request: NextRequest) {
try {
    const order = await razorpay.orders.create({
        amount: 1000,
        currency: "INR",
        receipt: "order_receipt",
        notes: {
            key1: "value1",
        }
    });
    return NextResponse.json(order);
} catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
}
}