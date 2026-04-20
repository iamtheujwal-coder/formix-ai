"use client";

import { AlertCircle, Loader2 } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  isLoading?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  isLoading,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/[0.08] bg-[#09090b] p-6 shadow-2xl shadow-black animate-in zoom-in-95 duration-300">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="h-6 w-6 text-red-400" />
        </div>
        
        <h3 className="mb-2 text-lg font-bold text-white tracking-tight">
          Are you absolutely sure?
        </h3>
        <p className="mb-8 text-sm text-zinc-500 leading-relaxed font-medium">
          You are about to delete <span className="text-zinc-300 font-bold">"{title}"</span>. This action is permanent and cannot be undone.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-xl bg-zinc-900 border border-white/[0.05] py-3 text-xs font-bold text-zinc-400 transition-all hover:bg-zinc-800 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 rounded-xl bg-red-500 py-3 text-xs font-bold text-white transition-all hover:bg-red-600 active:scale-95 shadow-lg shadow-red-500/20"
          >
            {isLoading ? (
              <Loader2 className="mx-auto h-4 w-4 animate-spin" />
            ) : (
              "Yes, Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
