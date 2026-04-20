import Razorpay from "razorpay";
import crypto from "crypto";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn("WARNING: Razorpay keys are missing in .env.local. Payments will fail.");
}

export const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "test_secret_placeholder",
  });
};

export const PLANS = [
  {
    id: "starter",
    name: "Starter",
    plan: "starter",
    amount: 9900, // in paise
    currency: "INR",
    wordsPerDay: 5000,
  },
  {
    id: "pro",
    name: "Professional",
    plan: "pro",
    amount: 29900, // in paise
    currency: "INR",
    wordsPerDay: 50000,
  },
];

export const getPlanByType = (type: string) => {
  return PLANS.find((p) => p.plan === type);
};

export const verifyPaymentSignature = (
  orderId: string,
  paymentId: string,
  signature: string
) => {
  const secret = process.env.RAZORPAY_KEY_SECRET || "test_secret_placeholder";
  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
};

export const verifyWebhookSignature = (body: string, signature: string) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "test_webhook_secret";
  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return generatedSignature === signature;
};
