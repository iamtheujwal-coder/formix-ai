"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signIn } from "next-auth/react";
import { Send, Plus, Loader2, Menu, Sparkles, ArrowUp } from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHome } from "@/components/DashboardHome";
import { ChatMessage } from "@/components/ChatMessage";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { SchemaEditor } from "@/components/SchemaEditor";
import { PricingModal } from "@/components/PricingModal";
import { SettingsModal } from "@/components/SettingsModal";
import { ToastContainer } from "@/components/Toast";
import { ConfettiEffect } from "@/components/ConfettiEffect";
import { useConversation } from "@/hooks/useConversation";
import { useSidebar } from "@/hooks/useSidebar";
import { useToast } from "@/hooks/useToast";
import { FormSchema } from "@/types/form";
import { FormHistory } from "@/hooks/useSidebar";

export default function Dashboard() {
  const { data: session, status } = useSession();

  const {
    messages,
    isGenerating,
    sendMessage,
    publishForm,
    updateMessage,
    clearConversation,
    retryMessage,
    loadHistory,
  } = useConversation();

  const {
    userData,
    refresh: refreshSidebar,
    removeForm,
  } = useSidebar();

  const { toasts, success, error: toastError, dismiss } = useToast();

  const [input, setInput] = useState("");
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Schema editor state
  const [editorSchema, setEditorSchema] = useState<FormSchema | null>(null);
  const [editorFormId, setEditorFormId] = useState<string | null>(null);
  const [editorMsgId, setEditorMsgId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Modal flags
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") signIn("google");
  }, [status]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const prompt = input.trim();
    if (!prompt || prompt.length < 5 || isGenerating) return;
    setInput("");
    await sendMessage(prompt);
    // Refresh sidebar after generation so new form appears
    setTimeout(refreshSidebar, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleNewChat = () => {
    clearConversation();
    setSelectedFormId(null);
    setInput("");
    setSidebarOpen(false);
  };

  const handleSelectForm = (form: FormHistory) => {
    setSelectedFormId(form._id);
    setSidebarOpen(false);

    const assistantContent =
      form.status === "published"
        ? `Here's your published form **"${form.title}"**. Open it using the link below.`
        : `Here's your draft form **"${form.title}"** with ${(form.schema as { questions?: unknown[] })?.questions?.length ?? "several"} questions. You can continue editing it.`;

    loadHistory(form.prompt, assistantContent, form.googleFormLink, form.status === "published");
  };

  const handleDeleteRequest = (id: string, title: string) => {
    setFormToDelete({ id, title });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!formToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/history?id=${formToDelete.id}`, { method: "DELETE" });
      if (res.ok) {
        removeForm(formToDelete.id); // Optimistic — no page reload!
        if (selectedFormId === formToDelete.id) handleNewChat();
        success("Form deleted");
      } else {
        toastError("Failed to delete form");
      }
    } catch {
      toastError("Something went wrong");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setFormToDelete(null);
    }
  };

  const handlePublish = async (msgId: string, schema: FormSchema, formId: string) => {
    setIsPublishing(true);
    await publishForm(msgId, schema, formId);
    setIsPublishing(false);

    // Check outcome by reading the updated message
    setIsPublishing(false);
    const msg = messages.find((m) => m.id === msgId);
    if (msg?.isError) {
      toastError(msg.content || "Publishing failed");
    } else {
      setShowConfetti(true);
      success("Form published to Google Forms! 🎉");
      setTimeout(refreshSidebar, 1000);
    }
  };

  const handleEditSchema = (msgId: string, schema: FormSchema, formId: string) => {
    setEditorMsgId(msgId);
    setEditorSchema({ ...schema });
    setEditorFormId(formId);
    setIsEditorOpen(true);
  };

  const handleSaveSchema = (updatedSchema: FormSchema) => {
    if (!editorMsgId) return;
    updateMessage(editorMsgId, { draftSchema: updatedSchema });
    setIsEditorOpen(false);
    success("Schema updated");
  };

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0c]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center animate-pulse">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <p className="text-sm text-zinc-600 font-medium">Loading Formix AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-56px)] bg-[#0a0a0c] text-zinc-100 overflow-hidden">
      {/* Sidebar */}
      <DashboardSidebar
        onNewChat={handleNewChat}
        onSelectForm={handleSelectForm}
        onDeleteForm={handleDeleteRequest}
        selectedFormId={selectedFormId || undefined}
        onUpgrade={() => setIsPricingOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        userEmail={session?.user?.email || ""}
        userImage={session?.user?.image || ""}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main chat area */}
      <div className="flex flex-1 flex-col min-w-0 relative">

        {/* Mobile top bar */}
        <div className="flex md:hidden items-center gap-3 px-4 py-3 border-b border-white/[0.05]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/[0.05] text-zinc-500 hover:text-white transition-all"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-black text-white">Formix AI</span>
          </div>
          <button
            onClick={handleNewChat}
            className="ml-auto h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/[0.05] text-zinc-500 hover:text-white transition-all"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Demo mode / DB error banner */}
        {userData && !userData.dbConnected && (
          <div className="mx-4 mt-3 flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2.5">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <p className="text-[11px] font-bold text-amber-400">Demo Mode</p>
            <p className="text-[11px] text-zinc-500 font-medium flex-1">
              {userData.dbError
                ? userData.dbError
                : "Database not configured — forms won't be saved."}
            </p>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-[11px] text-zinc-500 hover:text-white font-bold transition-colors shrink-0"
            >
              Fix →
            </button>
          </div>
        )}

        {/* Messages / Home */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[720px] px-4 py-8">
            {messages.length === 0 ? (
              <DashboardHome
                userName={session?.user?.name || "there"}
                totalForms={userData?.totalForms || 0}
                creditsRemaining={userData?.creditsRemaining || 0}
                dailyLimit={userData?.dailyLimit || 800}
                plan={userData?.plan || "free"}
                onQuickAction={handleQuickAction}
                onUpgrade={() => setIsPricingOpen(true)}
              />
            ) : (
              <div className="space-y-8">
                {messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    isPublishing={isPublishing}
                    onPublish={handlePublish}
                    onEditSchema={handleEditSchema}
                    onRetry={retryMessage}
                  />
                ))}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            )}
          </div>
        </div>

        {/* Input bar */}
        <div className="px-4 pb-5 pt-2 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/95 to-transparent">
          <div className="mx-auto max-w-[720px]">
            <form
              onSubmit={handleSubmit}
              className="relative flex items-end gap-2 rounded-2xl border border-white/[0.08] bg-zinc-900/80 backdrop-blur-xl p-3 shadow-2xl shadow-black/50 focus-within:border-violet-500/30 transition-colors"
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isGenerating}
                rows={1}
                placeholder="Describe your form… e.g. 'A registration form for a yoga workshop'"
                className="flex-1 resize-none bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none disabled:opacity-40 leading-relaxed py-1 px-1 min-h-[28px] max-h-[160px]"
              />
              <button
                type="submit"
                disabled={input.trim().length < 5 || isGenerating}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-500/25 transition-all hover:bg-violet-500 hover:scale-105 active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
              </button>
            </form>
            <p className="text-center text-[10px] text-zinc-700 font-medium mt-2.5">
              Formix AI can make mistakes — always review before publishing.
            </p>
          </div>
        </div>
      </div>

      {/* ── Overlays & Effects ─────────────────────── */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={formToDelete?.title || ""}
        isLoading={isDeleting}
      />

      {editorSchema && (
        <SchemaEditor
          isOpen={isEditorOpen}
          initialSchema={editorSchema}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSaveSchema}
        />
      )}

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        userEmail={session?.user?.email || ""}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userData={userData}
      />

      <ToastContainer toasts={toasts} dismiss={dismiss} />

      <ConfettiEffect
        active={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />
    </div>
  );
}
