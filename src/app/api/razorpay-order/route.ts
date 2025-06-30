// API route to create a Razorpay order
"use server"
import { NextRequest, NextResponse } from 'next/server';

// If not already installed, run: npm install razorpay
import Razorpay from 'razorpay';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { amount, orderId } = body;

  if (!amount || !orderId) {
    return NextResponse.json({ error: 'Missing amount or orderId' }, { status: 400 });
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  try {
    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency: 'INR',
      receipt: orderId,
      payment_capture: 1,
    };
    const order = await razorpay.orders.create(options);
    return NextResponse.json({ orderId: order.id });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'An unknown error occurred' }, { status: 500 });
  }
}
