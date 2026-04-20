"use client";

import { useState, useEffect, useRef } from "react";

interface StreamingTextProps {
  content: string;
  isStreaming: boolean;
  className?: string;
}

export function StreamingText({ content, isStreaming, className = "" }: StreamingTextProps) {
  const [displayed, setDisplayed] = useState("");
  const prevContentRef = useRef("");
  const indexRef = useRef(0);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // If content changed (new chunk arrived), animate only new characters
    const prev = prevContentRef.current;
    if (content.length > prev.length) {
      const newChars = content.slice(prev.length);
      prevContentRef.current = content;

      let localIdx = 0;
      const animate = () => {
        if (localIdx < newChars.length) {
          setDisplayed((d) => d + newChars[localIdx]);
          localIdx++;
          frameRef.current = requestAnimationFrame(animate);
        }
      };
      frameRef.current = requestAnimationFrame(animate);
    } else if (content !== prev) {
      // Content was replaced (e.g. from "Building..." to final message)
      prevContentRef.current = content;
      indexRef.current = 0;
      setDisplayed("");
      const chars = content.split("");
      const animate = () => {
        if (indexRef.current < chars.length) {
          setDisplayed((d) => d + chars[indexRef.current]);
          indexRef.current++;
          frameRef.current = requestAnimationFrame(animate);
        }
      };
      frameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [content]);

  // Parse basic markdown bold (**text**)
  const renderContent = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <span className={className}>
      {renderContent(displayed || content)}
      {isStreaming && (
        <span className="inline-block w-0.5 h-4 bg-violet-400 ml-0.5 animate-blink align-middle" />
      )}
    </span>
  );
}
