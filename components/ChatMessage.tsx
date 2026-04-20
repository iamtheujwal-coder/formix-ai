"use client";

import { useState, useRef } from "react";
import { User, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { StreamingText } from "./StreamingText";
import { InlineFormCard } from "./InlineFormCard";
import { FormSchema } from "@/types/form";
import { Message } from "@/hooks/useConversation";

interface ChatMessageProps {
  message: Message;
  isPublishing: boolean;
  onPublish: (msgId: string, schema: FormSchema, formId: string) => void;
  onEditSchema: (msgId: string, schema: FormSchema, formId: string) => void;
  onRetry: (msgId: string) => void;
}

export function ChatMessage({
  message,
  isPublishing,
  onPublish,
  onEditSchema,
  onRetry,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    if (message.formLink) {
      navigator.clipboard.writeText(message.formLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-zinc-800 border border-white/[0.06] px-4 py-3 shadow-lg">
          <p className="text-sm text-zinc-100 leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Assistant avatar */}
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20">
        <Sparkles className="h-4 w-4 text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-black tracking-widest uppercase text-zinc-600">
            Formix
          </span>
        </div>

        {/* Loading state */}
        {message.isLoading && !message.isStreaming && (
          <div className="flex items-center gap-2.5 py-1">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-2 w-2 rounded-full bg-violet-500 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
            <span className="text-sm text-zinc-500 font-medium">Thinking...</span>
          </div>
        )}

        {/* Streamed/complete message */}
        {(message.content && (!message.isLoading || message.isStreaming)) && (
          <div
            className={`text-[15px] leading-relaxed font-medium ${
              message.isError ? "text-red-400" : "text-zinc-200"
            }`}
          >
            <StreamingText
              content={message.content}
              isStreaming={!!message.isStreaming}
            />
          </div>
        )}

        {/* Error retry */}
        {message.isError && (
          <button
            onClick={() => onRetry(message.id)}
            className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Try again
          </button>
        )}

        {/* Form card — draft state */}
        {message.draftSchema && !message.formLink && !message.isLoading && (
          <InlineFormCard
            schema={message.draftSchema}
            formId={message.formId || ""}
            isPublishing={isPublishing}
            isDemo={message.isDemo}
            onPublish={() =>
              onPublish(message.id, message.draftSchema!, message.formId!)
            }
            onEdit={() =>
              onEditSchema(message.id, message.draftSchema!, message.formId || "")
            }
          />
        )}

        {/* Form card — published state */}
        {message.formLink && (
          <InlineFormCard
            schema={
              message.draftSchema || {
                title: "Your Form",
                questions: [],
              }
            }
            formId={message.formId || ""}
            formLink={message.formLink}
            isPublished
            isDemo={message.isDemo}
            onPublish={() => {}}
            onEdit={() => {}}
            onCopyLink={copyLink}
            copied={copied}
          />
        )}
      </div>
    </div>
  );
}
