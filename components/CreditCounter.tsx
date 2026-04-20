"use client";

import { Zap, TrendingUp, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface CreditCounterProps {
  creditsRemaining: number;
  dailyLimit: number;
  plan: string;
  onUpgrade?: () => void;
}

export function CreditCounter({
  creditsRemaining,
  dailyLimit,
  plan,
  onUpgrade,
}: CreditCounterProps) {
  const usagePercent = Math.round(
    ((dailyLimit - creditsRemaining) / dailyLimit) * 100
  );
  const remainPercent = Math.max(0, Math.min(100, (creditsRemaining / dailyLimit) * 100));

  const isLow = remainPercent < 20;
  const isCritical = remainPercent < 5;

  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);

  const barColor = isCritical
    ? "bg-red-500"
    : isLow
      ? "bg-amber-500"
      : "bg-blue-500";

  return (
    <div
      className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-4 glass-card animate-slide-in-right"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              isCritical
                ? "bg-red-500/10"
                : isLow
                  ? "bg-amber-500/10"
                  : "bg-blue-500/10"
            }`}
          >
            <Zap
              className={`h-4 w-4 ${
                isCritical
                  ? "text-red-400"
                  : isLow
                    ? "text-amber-400"
                    : "text-blue-400"
              }`}
            />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">
              {planLabel} Plan
            </p>
            <p className="text-[13px] font-bold text-white">
              Usage Status
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="h-1.5 w-full rounded-full bg-white/[0.05] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
            style={{ width: `${remainPercent}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] font-bold tracking-tight">
        <span className="text-zinc-500 uppercase">
          {remainPercent}% Remaining
        </span>
        <span
          className={`${
            isCritical
              ? "text-red-400"
              : isLow
                ? "text-amber-400"
                : "text-zinc-300"
          }`}
        >
          {creditsRemaining.toLocaleString()} Words
        </span>
      </div>

      {plan === "free" && (
        <button
          onClick={onUpgrade}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white/[0.04] border border-white/[0.05] py-2 text-[10px] font-bold text-zinc-400 hover:bg-white/[0.08] hover:text-white transition-all uppercase tracking-widest cursor-pointer"
        >
          <TrendingUp className="h-3 w-3" />
          Upgrade Plan
        </button>
      )}
    </div>
  );
}
