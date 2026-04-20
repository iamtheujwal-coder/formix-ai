"use client";

import { useState } from "react";
import {
  Plus, Trash2, Search, Settings, LogOut, Zap,
  FileText, ChevronRight, Sparkles, History, X
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useSidebar, FormHistory } from "@/hooks/useSidebar";

interface DashboardSidebarProps {
  onNewChat: () => void;
  onSelectForm: (form: FormHistory) => void;
  onDeleteForm: (id: string, title: string) => void;
  selectedFormId?: string;
  onUpgrade?: () => void;
  onOpenSettings?: () => void;
  userEmail?: string;
  userImage?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

function CreditRing({ value, max }: { value: number; max: number }) {
  const pct = Math.min(1, value / max);
  const r = 16;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  const color = pct > 0.5 ? "#10b981" : pct > 0.2 ? "#f59e0b" : "#ef4444";

  return (
    <svg width="40" height="40" className="shrink-0 -rotate-90">
      <circle cx="20" cy="20" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
      <circle
        cx="20" cy="20" r={r} fill="none"
        stroke={color} strokeWidth="3"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
    </svg>
  );
}

function HistoryGroup({
  label, forms, selectedFormId, onSelectForm, onDeleteForm,
}: {
  label: string;
  forms: FormHistory[];
  selectedFormId?: string;
  onSelectForm: (f: FormHistory) => void;
  onDeleteForm: (id: string, title: string) => void;
}) {
  if (!forms.length) return null;
  return (
    <div className="mb-4">
      <p className="px-3 mb-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-zinc-700">
        {label}
      </p>
      <div className="space-y-0.5">
        {forms.map((form) => (
          <div
            key={form._id}
            onClick={() => onSelectForm(form)}
            className={`group relative flex items-center gap-2.5 rounded-xl px-3 py-2 cursor-pointer transition-all ${
              selectedFormId === form._id
                ? "bg-white/[0.06] text-white"
                : "text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200"
            }`}
          >
            <div className={`h-1.5 w-1.5 rounded-full shrink-0 mt-px ${
              form.status === "published" ? "bg-emerald-400" : "bg-amber-400/60"
            }`} />
            <span className="flex-1 text-[12px] font-medium truncate leading-snug">
              {form.title}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteForm(form._id, form.title); }}
              className="opacity-0 group-hover:opacity-100 h-5 w-5 flex items-center justify-center rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-all shrink-0"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSidebar({
  onNewChat, onSelectForm, onDeleteForm, selectedFormId,
  onUpgrade, onOpenSettings, userEmail, userImage, isOpen = true, onClose
}: DashboardSidebarProps) {
  const { userData, grouped, isLoading, searchQuery, setSearchQuery, history } = useSidebar();
  const isEmpty = history.length === 0 && !isLoading;
  const noResults = history.length === 0 && searchQuery && !isLoading;

  return (
    <>
      {/* Mobile overlay */}
      {onClose && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:relative inset-y-0 left-0 z-50 md:z-auto
        flex flex-col w-[260px] border-r border-white/[0.05] bg-[#0a0a0c]
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* Logo & New Chat */}
        <div className="p-3 flex items-center gap-2 border-b border-white/[0.05]">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shrink-0">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-black text-white tracking-tight flex-1">Formix AI</span>
          <button
            onClick={onNewChat}
            className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-white transition-all"
            title="New chat"
          >
            <Plus className="h-4 w-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-white transition-all md:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-600 pointer-events-none" />
            <input
              type="text"
              placeholder="Search forms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg pl-7 pr-3 py-1.5 text-[12px] text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-violet-500/30 focus:bg-white/[0.05] transition-all"
            />
          </div>
        </div>

        {/* History */}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          {isLoading && (
            <div className="space-y-2 px-1 py-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 rounded-xl bg-white/[0.02] animate-pulse" />
              ))}
            </div>
          )}

          {noResults && (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <Search className="h-5 w-5 text-zinc-700 mb-2" />
              <p className="text-[11px] text-zinc-600 font-medium">No forms match "{searchQuery}"</p>
            </div>
          )}

          {!isLoading && isEmpty && !searchQuery && (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <div className="h-9 w-9 rounded-full bg-zinc-900 border border-white/[0.05] flex items-center justify-center mb-3">
                <History className="h-4 w-4 text-zinc-700" />
              </div>
              <p className="text-[11px] text-zinc-600 font-medium leading-relaxed">
                Your generated forms<br />will appear here.
              </p>
            </div>
          )}

          {!isLoading && !noResults && (
            <>
              <HistoryGroup label="Today" forms={grouped.today} selectedFormId={selectedFormId} onSelectForm={onSelectForm} onDeleteForm={onDeleteForm} />
              <HistoryGroup label="Yesterday" forms={grouped.yesterday} selectedFormId={selectedFormId} onSelectForm={onSelectForm} onDeleteForm={onDeleteForm} />
              <HistoryGroup label="This Week" forms={grouped.thisWeek} selectedFormId={selectedFormId} onSelectForm={onSelectForm} onDeleteForm={onDeleteForm} />
              <HistoryGroup label="Earlier" forms={grouped.earlier} selectedFormId={selectedFormId} onSelectForm={onSelectForm} onDeleteForm={onDeleteForm} />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.05] p-3 space-y-3">
          {/* Credits */}
          {!isLoading && userData && (
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-3">
              <div className="flex items-center gap-3">
                <CreditRing value={userData.creditsRemaining} max={userData.dailyLimit} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-zinc-300">
                    {userData.creditsRemaining.toLocaleString()} <span className="text-zinc-600 font-medium">/ {userData.dailyLimit.toLocaleString()} words</span>
                  </p>
                  <p className="text-[10px] text-zinc-600 font-medium capitalize">{userData.plan} Plan · Resets daily</p>
                </div>
              </div>
              {userData.plan === "free" && (
                <button
                  onClick={onUpgrade}
                  className="mt-2.5 w-full h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 text-[10px] font-black text-violet-400 hover:bg-violet-500/15 hover:text-violet-300 transition-all flex items-center justify-center gap-1.5"
                >
                  <Zap className="h-3 w-3" />
                  Upgrade to Pro
                </button>
              )}
            </div>
          )}

          {isLoading && (
            <div className="h-20 rounded-xl bg-white/[0.02] animate-pulse" />
          )}

          {/* User row */}
          <div className="flex items-center gap-2 rounded-xl hover:bg-white/[0.03] px-2 py-1.5 transition-all group">
            <div className="h-6 w-6 rounded-full bg-zinc-800 border border-white/[0.08] flex items-center justify-center text-[10px] font-bold text-zinc-400 shrink-0 overflow-hidden">
              {userImage ? (
                <img src={userImage} alt="" className="h-full w-full object-cover" />
              ) : (
                (userEmail?.[0] || "U").toUpperCase()
              )}
            </div>
            <span className="flex-1 text-[11px] text-zinc-500 truncate">{userEmail}</span>
            <button
              onClick={onOpenSettings}
              className="h-6 w-6 flex items-center justify-center rounded-md text-zinc-600 hover:text-white hover:bg-white/[0.05] transition-all opacity-0 group-hover:opacity-100"
              title="Settings"
            >
              <Settings className="h-3 w-3" />
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="h-6 w-6 flex items-center justify-center rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
              title="Sign out"
            >
              <LogOut className="h-3 w-3" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
