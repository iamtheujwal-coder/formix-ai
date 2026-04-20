"use client";

import { useEffect, useRef } from "react";
import { useToast as useToastHook } from "@/hooks/useToast";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastProps = {
  toasts: ReturnType<typeof useToastHook>["toasts"];
  dismiss: (id: string) => void;
};

const icons = {
  success: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
  error: <XCircle className="h-4 w-4 text-red-400" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-400" />,
  info: <Info className="h-4 w-4 text-blue-400" />,
};

const borders = {
  success: "border-emerald-500/20 bg-emerald-500/5",
  error: "border-red-500/20 bg-red-500/5",
  warning: "border-amber-500/20 bg-amber-500/5",
  info: "border-blue-500/20 bg-blue-500/5",
};

export function ToastContainer({ toasts, dismiss }: ToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} dismiss={dismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  dismiss,
}: {
  toast: ReturnType<typeof useToastHook>["toasts"][0];
  dismiss: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Animate in
    el.style.opacity = "0";
    el.style.transform = "translateX(20px)";
    requestAnimationFrame(() => {
      el.style.transition = "all 0.3s cubic-bezier(0.16,1,0.3,1)";
      el.style.opacity = "1";
      el.style.transform = "translateX(0)";
    });
  }, []);

  return (
    <div
      ref={ref}
      className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-2xl shadow-black/50 backdrop-blur-xl min-w-[280px] max-w-[380px] ${borders[toast.type]}`}
    >
      <div className="mt-0.5 shrink-0">{icons[toast.type]}</div>
      <p className="flex-1 text-sm font-medium text-zinc-200 leading-snug">
        {toast.message}
      </p>
      <button
        onClick={() => dismiss(toast.id)}
        className="shrink-0 text-zinc-600 hover:text-zinc-400 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
