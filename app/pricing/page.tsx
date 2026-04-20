"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import { PricingCard } from "@/components/PricingCard";
import { Loader } from "@/components/Loader";
import { CheckCircle2 } from "lucide-react";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: { email: string; name: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

const plans = [
  {
    id: "free",
    name: "Free",
    price: "Free",
    description: "For getting started",
    features: [
      "800 words per day",
      "AI-powered form generation",
      "Google Forms integration",
      "Basic question types",
      "Unlimited form submissions",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: "₹69",
    description: "For regular users",
    isPopular: true,
    features: [
      "5,000 words per day",
      "AI-powered form generation",
      "Google Forms integration",
      "All question types",
      "Priority generation speed",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹299",
    description: "For power users",
    features: [
      "20,000 words per day",
      "AI-powered form generation",
      "Google Forms integration",
      "All question types",
      "Fastest generation speed",
      "Priority support",
      "Advanced form templates",
    ],
  },
];

export default function Pricing() {
  const { data: session, status } = useSession();
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserPlan = useCallback(async () => {
    try {
      const res = await fetch("/api/user");
      if (res.ok) {
        const data = await res.json();
        setCurrentPlan(data.plan);
      }
    } catch {
      console.error("Failed to fetch user plan");
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchUserPlan();
    }
  }, [status, fetchUserPlan]);

  const handleSelectPlan = async (planId: string) => {
    if (planId === "free") return;
    if (status !== "authenticated") {
      signIn("google");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json();
        throw new Error(errData.error || "Failed to create order");
      }

      const orderData = await orderRes.json();

      const options: RazorpayOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Formix AI",
        description: `Upgrade to ${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
        order_id: orderData.orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: planId,
              }),
            });

            if (verifyRes.ok) {
              setSuccess(true);
              setCurrentPlan(planId);
              setTimeout(() => setSuccess(false), 5000);
            } else {
              const errData = await verifyRes.json();
              setError(errData.error || "Payment verification failed");
            }
          } catch {
            setError("Payment verification failed. Contact support.");
          }
          setLoading(false);
        },
        prefill: {
          email: session?.user?.email || "",
          name: session?.user?.name || "",
        },
        theme: { color: "#6366f1" },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-32 relative bg-dot-pattern">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-indigo-500/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 mx-auto max-w-3xl text-center mb-16 sm:mb-24 animate-slide-up">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6">
          Scalable pricing for <br className="hidden sm:block" />
          <span className="gradient-text">every creator</span>
        </h1>
        <p className="text-zinc-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
          Choose a plan that scales with your growth. No hidden fees, <br className="hidden sm:block" />
          cancel any time.
        </p>
      </div>

      {/* Success message */}
      {success && (
        <div className="mx-auto max-w-lg mb-10 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p>Plan upgraded successfully! Your new credits are now available.</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mx-auto max-w-lg mb-10 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="mb-8">
          <Loader text="Processing payment..." />
        </div>
      )}

      {/* Pricing Cards */}
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3 items-start">
        {plans.map((plan) => (
          <PricingCard
            key={plan.id}
            name={plan.name}
            price={plan.price}
            description={plan.description}
            features={plan.features}
            isPopular={plan.isPopular}
            isCurrent={currentPlan === plan.id}
            ctaLabel={
              plan.id === "free"
                ? "Get Started"
                : `Upgrade to ${plan.name}`
            }
            onSelect={() => handleSelectPlan(plan.id)}
            disabled={loading}
          />
        ))}
      </div>

      {/* Note */}
      <div className="mx-auto max-w-2xl mt-16 text-center">
        <p className="text-sm text-zinc-500">
          All plans include unlimited form submissions. Credits reset daily at
          midnight UTC. Need more?{" "}
          <a
            href="mailto:support@formix.ai"
            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
          >
            Contact us
          </a>
          .
        </p>
      </div>
    </div>
  );
}
