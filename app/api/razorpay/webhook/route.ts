import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyWebhookSignature, getPlanByType } from "@/lib/razorpay";
import { PlanType } from "@/models/User";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature || !verifyWebhookSignature(body, signature)) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const email = payment.notes?.email;
      const plan = payment.notes?.plan as PlanType;

      if (!email || !plan) {
        console.error("Webhook: Missing email or plan in payment notes");
        return NextResponse.json({ status: "missing_data" });
      }

      await connectDB();
      const planConfig = getPlanByType(plan);
      const dailyLimit = planConfig?.wordsPerDay || 800;

      await User.findOneAndUpdate(
        { email },
        {
          plan: plan,
          creditsRemaining: dailyLimit,
          lastReset: new Date(),
        },
        { upsert: false }
      );

      console.log(`Webhook: Upgraded ${email} to ${plan} plan`);
      return NextResponse.json({ status: "success" });
    }

    return NextResponse.json({ status: "ignored" });
  } catch (error: unknown) {
    console.error("Razorpay Webhook Error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
