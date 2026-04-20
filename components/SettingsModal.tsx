"use client";

import { 
  X, 
  Settings, 
  Mail, 
  ShieldCheck, 
  CreditCard, 
  Database, 
  AlertTriangle,
  LogOut,
  ChevronRight,
  Globe
} from "lucide-react";
import { signOut } from "next-auth/react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    email: string;
    name: string;
    plan: string;
    creditsRemaining: number;
    dbConnected: boolean;
    dbError?: string | null;
    totalForms?: number;
  } | null;
}

export function SettingsModal({ isOpen, onClose, userData }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2-xl overflow-hidden rounded-3xl border border-white/[0.08] bg-[#09090b] shadow-2xl shadow-black/50 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.05] bg-white/[0.02] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Account Settings</h2>
              <p className="text-[11px] text-zinc-500 font-medium">Manage your subscription and profile</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-white/[0.05] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Section: Profile */}
          <div>
            <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-4">Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-white/[0.05] bg-white/[0.02] flex items-center gap-4">
                <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-white/[0.1] bg-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                  {userData?.name?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{userData?.name || "User"}</p>
                  <p className="text-[11px] text-zinc-500">{userData?.email}</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl border border-white/[0.05] bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-zinc-500" />
                  <span className="text-xs font-bold text-zinc-300">Region</span>
                </div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Global (US-West)</span>
              </div>
            </div>
          </div>

          {/* Section: Subscription & System */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Plan Info */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Active Plan</h3>
              <div className="relative group">
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 blur transition duration-500" />
                <div className="relative p-5 rounded-2xl border border-white/[0.08] bg-[#111114]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {userData?.plan?.toUpperCase()} Plan
                    </span>
                  </div>
                  <p className="text-xl font-bold text-white mb-1">
                    {userData?.plan === "pro" ? "Professional" : userData?.plan === "starter" ? "Starter" : "Free Forever"}
                  </p>
                  <p className="text-[11px] text-zinc-500 font-medium">Next refill: Tomorrow at 00:00 UTC</p>
                  
                  <div className="mt-6 pt-6 border-t border-white/[0.05]">
                    <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-white text-black py-2.5 text-xs font-bold hover:bg-zinc-200 transition-all">
                      Manage Subscription
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">System Connectivity</h3>
              <div className="space-y-3">
                {/* Database Connectivity */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                  userData?.dbConnected 
                    ? 'border-emerald-500/10 bg-emerald-500/[0.02]' 
                    : 'border-amber-500/10 bg-amber-500/[0.02]'
                }`}>
                  <div className="flex items-center gap-3">
                    <Database className={`h-4 w-4 ${userData?.dbConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
                    <div>
                      <p className="text-xs font-bold text-white">Database status</p>
                      <p className="text-[10px] text-zinc-500">{userData?.dbConnected ? 'Live Connection' : 'Demo Mode (Storage Locked)'}</p>
                    </div>
                  </div>
                  {!userData?.dbConnected && <AlertTriangle className="h-4 w-4 text-amber-500 animate-pulse" />}
                </div>

                {/* API Status */}
                <div className="p-4 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.02] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <div>
                      <p className="text-xs font-bold text-white">AI Engine (LLaMA/Groq)</p>
                      <p className="text-[10px] text-zinc-500">Operationally Healthy</p>
                    </div>
                  </div>
                </div>
              </div>

              {!userData?.dbConnected && (
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-3">
                  <div className="flex items-center gap-2 text-amber-500">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <p className="text-[10px] font-bold uppercase tracking-wider">Connection Rescue</p>
                  </div>
                  
                  {userData?.dbError?.includes("ECONNREFUSED") ? (
                    <div className="space-y-2">
                      <p className="text-[11px] text-zinc-300 leading-relaxed font-medium">
                        Your internet/DNS is blocking the standard MongoDB address.
                      </p>
                      <ul className="text-[10px] text-zinc-500 space-y-1.5 list-disc pl-4 font-medium">
                        <li>Go to <strong className="text-zinc-300">Quick Start</strong> in Atlas Dashboard</li>
                        <li>Add <strong className="text-zinc-300">0.0.0.0/0</strong> to your IP Access List</li>
                        <li>If that fails, use the <strong className="text-zinc-300">"Standard Connection String"</strong> in your Atlas settings.</li>
                      </ul>
                    </div>
                  ) : (
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-medium italic">
                      In Demo Mode, form history is session-only. Update your MongoDB credentials in <code className="bg-white/5 px-1 rounded text-amber-400">.env.local</code> to enable full persistence.
                    </p>
                  )}
                  
                  <div className="pt-2 border-t border-white/5">
                    <a 
                      href="https://www.mongodb.com/docs/atlas/security-whitelist/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-amber-500/80 hover:text-amber-500 flex items-center gap-1"
                    >
                      View White-listing Guide <ChevronRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-white/[0.05]">
             <button className="text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-2">
                <ShieldCheck className="h-3 w-3" />
                Privacy Policy
             </button>
             <button 
               onClick={() => signOut({ callbackUrl: "/" })}
               className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all"
             >
               <LogOut className="h-3.5 w-3.5" />
               Sign Out
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
