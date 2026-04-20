"use client";

import { Check, Star, Zap } from "lucide-react";

interface PricingCardProps {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  isCurrent?: boolean;
  ctaLabel: string;
  onSelect: () => void;
  disabled?: boolean;
}

export function PricingCard({
  name,
  price,
  period = "/month",
  description,
  features,
  isPopular = false,
  isCurrent = false,
  ctaLabel,
  onSelect,
  disabled = false,
}: PricingCardProps) {
  return (
    <div
      className={`group relative flex flex-col rounded-[2rem] border p-10 transition-all duration-700 glass-card animate-slide-up ${
        isPopular
          ? "border-violet-500/40 bg-gradient-to-b from-violet-500/[0.08] to-transparent shadow-[0_0_80px_-15px_rgba(139,92,246,0.2)]"
          : "border-white/[0.06] bg-white/[0.01] hover:border-white/10"
      }`}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-2 rounded-full premium-gradient px-5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-violet-500/40 animate-pulse-subtle">
            <Zap className="h-3 w-3 fill-current" />
            Most Popular
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h3 className="text-2xl font-black bg-gradient-to-r from-white via-white to-zinc-500 bg-clip-text text-transparent mb-3">
          {name}
        </h3>
        <p className="text-base font-medium text-zinc-500 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Price */}
      <div className="mb-10">
        <div className="flex items-baseline gap-2">
          <span className="text-6xl font-black tracking-tighter text-white">
            {price}
          </span>
          {price !== "Free" && (
            <span className="text-xs font-bold text-zinc-600 uppercase tracking-[0.25em] ml-1">
              {period}
            </span>
          )}
        </div>
      </div>

      {/* Features */}
      <ul className="mb-10 flex-1 space-y-5">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-4">
            <div
              className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${
                isPopular
                  ? "bg-violet-500/15 text-violet-400 border border-violet-500/20 group-hover:bg-violet-500/25"
                  : "bg-white/[0.05] text-emerald-400 border border-white/5 group-hover:bg-white/[0.08]"
              }`}
            >
              <Check className="h-3 w-3" />
            </div>
            <span className="text-sm font-semibold text-zinc-400 leading-tight group-hover:text-zinc-200 transition-colors">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={onSelect}
        disabled={disabled || isCurrent}
        className={`w-full rounded-2xl py-5 text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-300 active:scale-[0.98] ${
          isCurrent
            ? "border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 cursor-default"
            : isPopular
              ? "premium-gradient text-white shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-1 hover:brightness-110 disabled:opacity-50"
              : "border border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-white/[0.08] hover:text-white hover:-translate-y-1 disabled:opacity-50"
        }`}
      >
        {isCurrent ? "Active Plan" : ctaLabel}
      </button>
    </div>
  );
}
