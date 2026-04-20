"use client";

import { useEffect, useState } from "react";

const loadingMessages = [
  "Analyzing your prompt...",
  "Designing your form schema...",
  "Adding smart questions...",
  "Structuring the layout...",
  "Almost ready...",
];

export function Loader({ text }: { text?: string }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (text) return; // Use custom text if provided
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [text]);

  const displayText = text || loadingMessages[messageIndex];

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8">
      {/* Animated dots */}
      <div className="relative flex items-center justify-center">
        <div className="absolute h-16 w-16 rounded-full bg-violet-500/20 animate-ping" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-xl shadow-violet-500/30">
          <div className="flex gap-1">
            <span
              className="h-1.5 w-1.5 rounded-full bg-white animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="h-1.5 w-1.5 rounded-full bg-white animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="h-1.5 w-1.5 rounded-full bg-white animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-zinc-300 transition-all duration-300">
          {displayText}
        </p>
        <p className="mt-1.5 text-xs text-zinc-600">This may take a moment</p>
      </div>
    </div>
  );
}
