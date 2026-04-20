"use client";

import { useState } from "react";
import { SendIcon, Sparkles } from "lucide-react";

interface PromptBoxProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const examplePrompts = [
  "Event registration form with name, email, and dietary preferences",
  "Job application form for software engineers",
  "Feedback form for college fest",
  "Customer satisfaction survey with ratings",
  "Workshop signup with time slot selection",
];

export function PromptBox({ onSubmit, isLoading, disabled = false }: PromptBoxProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim().length < 5 || isLoading || disabled) return;
    onSubmit(prompt.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  const wordCount = prompt
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit}
        className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden transition-all focus-within:border-violet-500/30 focus-within:shadow-lg focus-within:shadow-violet-500/5"
      >
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading || disabled}
          placeholder="Describe the form you want to create in detail..."
          className="min-h-[140px] w-full resize-none border-0 bg-transparent p-5 text-[15px] text-white placeholder:text-zinc-600 focus:outline-none disabled:opacity-40"
        />
        <div className="flex items-center justify-between border-t border-white/[0.04] px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-600">
              {wordCount} {wordCount === 1 ? "word" : "words"}
            </span>
            <span className="hidden sm:inline text-xs text-zinc-700">
              Press{" "}
              <kbd className="rounded bg-white/[0.06] px-1.5 py-0.5 text-zinc-500 font-mono text-[10px]">
                Enter
              </kbd>{" "}
              to send
            </span>
          </div>
          <button
            type="submit"
            disabled={prompt.trim().length < 5 || isLoading || disabled}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-600 px-4 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/30 hover:brightness-110 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Generate
            <SendIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>

      {/* Example prompts */}
      <div className="space-y-2.5">
        <p className="text-xs font-medium text-zinc-600 uppercase tracking-wider pl-1">
          Try an example
        </p>
        <div className="flex flex-wrap gap-2">
          {examplePrompts.map((example, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleExampleClick(example)}
              className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs text-zinc-400 transition-all hover:bg-white/[0.06] hover:text-zinc-200 hover:border-white/10"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
