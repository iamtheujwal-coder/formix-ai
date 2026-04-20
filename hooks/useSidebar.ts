"use client";

import { useState, useCallback, useEffect } from "react";

interface FormHistory {
  _id: string;
  title: string;
  status: "draft" | "published";
  prompt: string;
  schema: Record<string, unknown>;
  createdAt: string;
  googleFormLink?: string;
}

interface UserData {
  creditsRemaining: number;
  dailyLimit: number;
  plan: string;
  email: string;
  name: string;
  image?: string;
  totalForms?: number;
  dbConnected: boolean;
  dbError?: string | null;
}

interface GroupedHistory {
  today: FormHistory[];
  yesterday: FormHistory[];
  thisWeek: FormHistory[];
  earlier: FormHistory[];
}

function groupHistory(forms: FormHistory[]): GroupedHistory {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  return forms.reduce<GroupedHistory>(
    (acc, form) => {
      const d = new Date(form.createdAt);
      const formDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      if (formDay >= today) acc.today.push(form);
      else if (formDay >= yesterday) acc.yesterday.push(form);
      else if (formDay >= weekAgo) acc.thisWeek.push(form);
      else acc.earlier.push(form);
      return acc;
    },
    { today: [], yesterday: [], thisWeek: [], earlier: [] }
  );
}

export function useSidebar() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [history, setHistory] = useState<FormHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [userRes, historyRes] = await Promise.all([
        fetch("/api/user"),
        fetch("/api/history"),
      ]);
      const [userData, historyData] = await Promise.all([
        userRes.json(),
        historyRes.json(),
      ]);
      setUserData(userData);
      
      if (typeof window !== "undefined" && userData.creditsRemaining !== undefined) {
        window.dispatchEvent(
          new CustomEvent("creditsUpdated", { detail: { credits: userData.creditsRemaining } })
        );
      }
      setHistory(Array.isArray(historyData) ? historyData : []);
    } catch (error) {
      console.error("Failed to fetch sidebar data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const removeForm = useCallback((formId: string) => {
    setHistory((prev) => prev.filter((f) => f._id !== formId));
  }, []);

  const updateFormStatus = useCallback(
    (formId: string, googleFormLink: string) => {
      setHistory((prev) =>
        prev.map((f) =>
          f._id === formId
            ? { ...f, status: "published" as const, googleFormLink }
            : f
        )
      );
    },
    []
  );

  const filteredHistory = searchQuery.trim()
    ? history.filter(
        (f) =>
          f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.prompt.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : history;

  const grouped = groupHistory(filteredHistory);

  return {
    userData,
    history: filteredHistory,
    grouped,
    isLoading,
    searchQuery,
    setSearchQuery,
    refresh: fetchData,
    removeForm,
    updateFormStatus,
  };
}

export type { FormHistory, UserData };
