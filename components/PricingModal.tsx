"use client";

import { useState } from "react";
import { 
  X, 
  Check, 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  Loader2,
  Lock
} from "lucide-react";
import Script from "next/script";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export function PricingModal({
  isOpen,
  onClose,
  userEmail,
}: PricingModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // 1. Create Order
      const res = await fetch("/api/pay/order", { method: "POST" });
      const orderData = await res.json();

      if (!res.ok) throw new Error(orderData.error);

      // 2. Open Razorpay Checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Formix AI",
        description: "Standard Pro Plan - 5,000 Credits",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // 3. Verify Payment
          const verifyRes = await fetch("/api/pay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok) {
            alert("Payment successful! Credits added.");
            onClose();
            window.location.reload(); // Refresh to update balance
          } else {
            alert("Payment verification failed: " + verifyData.error);
          }
        },
        prefill: {
          email: userEmail,
        },
        theme: {
          color: "#8b5cf6", // Violet-500
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error("Payment failed:", error);
      alert(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/[0.08] bg-[#09090b] shadow-2xl animate-in zoom-in-95 fill-mode-both duration-300">
        
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-violet-500/20 blur-[100px] pointer-events-none" />

        <div className="p-8 pb-4 flex justify-between items-start">
          <div className="h-12 w-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <Zap className="h-6 w-6 text-violet-400" />
          </div>
          <button 
            onClick={onClose}
            className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors"
          >
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        </div>

        <div className="px-8 pb-10">
          <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Upgrade to Pro</h2>
          <p className="text-zinc-500 text-sm mb-10 leading-relaxed font-medium">
            Unlock advanced form generation and premium AI features with our most popular credit pack.
          </p>

          <div className="p-6 rounded-[28px] border border-violet-500/30 bg-violet-500/5 mb-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3">
              <Sparkles className="h-5 w-5 text-violet-400/50" />
            </div>
            
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-black text-white">₹499</span>
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest uppercase">One-time payment</span>
            </div>
            <div className="text-lg font-bold text-violet-300 mb-6 tracking-tight">5,000 Generation Credits</div>

            <ul className="space-y-4">
              {[
                "Advanced AI questions (Llama 3.3 70B)",
                "Support for large multi-page forms",
                "Priority generation & high uptime",
                "Export to Google Forms immediately",
                "Credits never expire"
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-xs font-semibold text-zinc-400 group-hover:text-zinc-300 transition-colors">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-emerald-400" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full h-14 rounded-2xl premium-gradient text-sm font-bold text-white shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Upgrade Now
              </>
            )}
          </button>
          
          <div className="mt-6 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.1em]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure Payment
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.1em]">
              <Lock className="h-3.5 w-3.5" />
              Razorpay Verified
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
