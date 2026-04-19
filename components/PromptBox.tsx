"use client";

import { useState } from "react";
import { SendIcon } from "lucide-react";

interface PromptBoxProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

export function PromptBox({ onSubmit, isLoading }: PromptBoxProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim().length < 5 || isLoading) return;
    onSubmit(prompt.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex w-full flex-col gap-2 rounded-2xl bg-white p-4 shadow-[0_0_40px_-10px_rgba(0,0,0,0.1)] border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 transition-all focus-within:ring-2 focus-within:ring-black dark:focus-within:ring-white"
    >
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        placeholder="Describe your form in detail (e.g. 'A job application form for software engineers with resume upload, past experience, and contact info')"
        className="min-h-[140px] w-full resize-none border-0 bg-transparent p-2 text-base text-zinc-900 focus:outline-none disabled:opacity-50 dark:text-zinc-100 placeholder:text-zinc-400"
      />
      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-900">
        <span className="text-xs text-zinc-500 hidden sm:inline-block">
          Press <kbd className="font-sans px-1 rounded bg-zinc-100 dark:bg-zinc-800">Enter</kbd> to send
        </span>
        <button
          type="submit"
          disabled={prompt.trim().length < 5 || isLoading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-black px-5 text-sm font-medium text-white transition-all hover:bg-zinc-800 hover:scale-[1.02] focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Generate Form
          <SendIcon className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
