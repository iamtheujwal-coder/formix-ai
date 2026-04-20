"use client";

import { useState, useCallback, useRef } from "react";
import { FormSchema, ConversationMessage } from "@/types/form";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  draftSchema?: FormSchema;
  formId?: string;
  formLink?: string;
  isPublished?: boolean;
  isDemo?: boolean;
  creditsRemaining?: number;
}

interface UseConversationReturn {
  messages: Message[];
  isGenerating: boolean;
  sendMessage: (prompt: string) => Promise<void>;
  publishForm: (msgId: string, schema: FormSchema, formId: string) => Promise<void>;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  clearConversation: () => void;
  retryMessage: (msgId: string) => void;
  loadHistory: (userContent: string, assistantContent: string, formLink?: string, isPublished?: boolean) => void;
}

export function useConversation(): UseConversationReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const lastPromptRef = useRef<string>("");

  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  }, []);

  const clearConversation = useCallback(() => {
    setMessages([]);
  }, []);

  // Build conversation history for multi-turn context
  const buildHistory = useCallback((msgs: Message[]): ConversationMessage[] => {
    return msgs
      .filter((m) => !m.isLoading && !m.isError && !m.isStreaming)
      .slice(-6)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));
  }, []);

  const sendMessage = useCallback(
    async (prompt: string) => {
      if (!prompt.trim() || isGenerating) return;
      lastPromptRef.current = prompt;

      const userMsgId = `u-${Date.now()}`;
      const assistantMsgId = `a-${Date.now() + 1}`;

      const userMsg: Message = { id: userMsgId, role: "user", content: prompt };
      const loadingMsg: Message = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        isLoading: true,
        isStreaming: true,
      };

      setMessages((prev) => {
        const history = buildHistory(prev);
        // Store history on ref for the fetch call
        (sendMessage as { _history?: ConversationMessage[] })._history = history;
        return [...prev, userMsg, loadingMsg];
      });

      setIsGenerating(true);

      // Small delay to allow state update before fetch
      await new Promise((r) => setTimeout(r, 20));

      const history = (sendMessage as { _history?: ConversationMessage[] })._history || [];

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, history, stream: true }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Generation failed");
        }

        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let streamedContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n").filter((l) => l.startsWith("data: "));

          for (const line of lines) {
            try {
              const payload = JSON.parse(line.slice(6));

              if (payload.error) {
                updateMessage(assistantMsgId, {
                  content: payload.error,
                  isError: true,
                  isLoading: false,
                  isStreaming: false,
                });
                setIsGenerating(false);
                return;
              }

              if (payload.delta) {
                streamedContent += payload.delta;
                // Suppress JSON characters from display; show a natural message
                const displayContent = streamedContent.includes("{")
                  ? "Building your form..."
                  : streamedContent;
                updateMessage(assistantMsgId, {
                  content: displayContent,
                  isLoading: false,
                  isStreaming: true,
                });
              }

              if (payload.done && payload.schema) {
                const schema = payload.schema as FormSchema;
                const summary = `I've built a **${schema.questions.length}-question** form: **"${schema.title}"**. Review the questions below — edit if needed, then publish to Google Forms.`;
                updateMessage(assistantMsgId, {
                  content: summary,
                  isLoading: false,
                  isStreaming: false,
                  draftSchema: schema,
                  formId: payload.formId,
                  isDemo: payload.isDemo,
                  creditsRemaining: payload.creditsRemaining,
                });
              }
            } catch {
              // Skip malformed SSE lines
            }
          }
        }
      } catch (error: unknown) {
        updateMessage(assistantMsgId, {
          content: error instanceof Error ? error.message : "Something went wrong. Please try again.",
          isLoading: false,
          isStreaming: false,
          isError: true,
        });
      } finally {
        setIsGenerating(false);
      }
    },
    [isGenerating, buildHistory, updateMessage]
  );

  const publishForm = useCallback(
    async (msgId: string, schema: FormSchema, formId: string) => {
      updateMessage(msgId, {
        isLoading: true,
        content: "Publishing your Google Form...",
        draftSchema: undefined,
      });

      try {
        const res = await fetch("/api/create-form", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...schema, formId }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Publishing failed");

        updateMessage(msgId, {
          content: `🎉 Your form **"${schema.title}"** is live and ready to share!`,
          formLink: data.link,
          isLoading: false,
          isPublished: true,
          draftSchema: undefined,
        });
      } catch (error: unknown) {
        updateMessage(msgId, {
          content: error instanceof Error ? error.message : "Publishing failed. Please try again.",
          isLoading: false,
          isError: true,
          draftSchema: schema,
          formId,
        });
      }
    },
    [updateMessage]
  );

  const retryMessage = useCallback(
    (msgId: string) => {
      setMessages((prev) => {
        const msgIndex = prev.findIndex((m) => m.id === msgId);
        const userMsg = prev.slice(0, msgIndex).reverse().find((m) => m.role === "user");
        if (userMsg) {
          setTimeout(() => sendMessage(userMsg.content), 0);
        }
        return prev.filter((m) => m.id !== msgId);
      });
    },
    [sendMessage]
  );

  const loadHistory = useCallback(
    (userContent: string, assistantContent: string, formLink?: string, isPublished?: boolean) => {
      const userMsg: Message = {
        id: `hist-u-${Date.now()}`,
        role: "user",
        content: userContent,
      };
      const assistantMsg: Message = {
        id: `hist-a-${Date.now() + 1}`,
        role: "assistant",
        content: assistantContent,
        formLink,
        isPublished,
      };
      setMessages([userMsg, assistantMsg]);
    },
    []
  );

  return { messages, isGenerating, sendMessage, publishForm, updateMessage, clearConversation, retryMessage, loadHistory };
}
