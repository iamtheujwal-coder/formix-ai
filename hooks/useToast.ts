"use client";

import { useState, useCallback } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ type, message, duration = 4000 }: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, type, message, duration }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  const success = useCallback(
    (message: string) => toast({ type: "success", message }),
    [toast]
  );
  const error = useCallback(
    (message: string) => toast({ type: "error", message, duration: 6000 }),
    [toast]
  );
  const warning = useCallback(
    (message: string) => toast({ type: "warning", message }),
    [toast]
  );
  const info = useCallback(
    (message: string) => toast({ type: "info", message }),
    [toast]
  );

  return { toasts, toast, success, error, warning, info, dismiss };
}
