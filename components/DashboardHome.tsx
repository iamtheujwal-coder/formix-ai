"use client";

import {
  Sparkles, Zap, Layout, CheckCircle2,
  TrendingUp, FileText, Clock, ArrowRight,
} from "lucide-react";

interface DashboardHomeProps {
  userName: string;
  totalForms: number;
  creditsRemaining: number;
  dailyLimit: number;
  plan: string;
  onQuickAction: (prompt: string) => void;
  onUpgrade: () => void;
}

const quickActions = [
  {
    title: "Workshop Registration",
    prompt: "Create a detailed registration form for an upcoming AI and Design workshop. Include dietary requirements, experience level, and session preferences.",
    icon: Sparkles,
    gradient: "from-violet-500/20 to-purple-500/10",
    border: "border-violet-500/20",
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/10",
    tag: "Popular",
  },
  {
    title: "Customer Feedback",
    prompt: "Build a 10-question customer satisfaction survey for a restaurant including star ratings for staff service, food quality, and ambiance with an NPS score.",
    icon: TrendingUp,
    gradient: "from-emerald-500/20 to-teal-500/10",
    border: "border-emerald-500/20",
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
    tag: "Business",
  },
  {
    title: "Job Application",
    prompt: "Create a professional job application form for a Senior Full-Stack Developer. Include portfolio links, years of experience, tech stack checkboxes, and availability.",
    icon: Layout,
    gradient: "from-blue-500/20 to-indigo-500/10",
    border: "border-blue-500/20",
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10",
    tag: "HR",
  },
  {
    title: "Event RSVP",
    prompt: "Design an elegant wedding RSVP form with meal choices, dietary restrictions, plus-one details, accommodation preference, and a song request field.",
    icon: CheckCircle2,
    gradient: "from-rose-500/20 to-pink-500/10",
    border: "border-rose-500/20",
    iconColor: "text-rose-400",
    iconBg: "bg-rose-500/10",
    tag: "Events",
  },
  {
    title: "Product Feedback",
    prompt: "Create a SaaS product feedback form with feature satisfaction scales, NPS question, most valuable feature dropdown, and open-ended improvement suggestions.",
    icon: FileText,
    gradient: "from-orange-500/20 to-amber-500/10",
    border: "border-orange-500/20",
    iconColor: "text-orange-400",
    iconBg: "bg-orange-500/10",
    tag: "SaaS",
  },
  {
    title: "Course Enrollment",
    prompt: "Build an online course enrollment form with student details, prior knowledge level, preferred learning schedule, payment method, and emergency contact.",
    icon: Zap,
    gradient: "from-cyan-500/20 to-sky-500/10",
    border: "border-cyan-500/20",
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/10",
    tag: "Education",
  },
];

export function DashboardHome({
  userName, totalForms, creditsRemaining, dailyLimit, plan, onQuickAction, onUpgrade
}: DashboardHomeProps) {
  const creditPct = Math.max(5, (creditsRemaining / dailyLimit) * 100);
  const firstName = userName.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-3xl mx-auto px-2 py-10 animate-in fade-in duration-500">
      {/* Greeting */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 text-[11px] font-bold text-violet-400 uppercase tracking-widest">
          <Sparkles className="h-3 w-3" />
          AI Form Builder
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
          {greeting}, {firstName} ✦
        </h1>
        <p className="text-zinc-500 font-medium text-base">
          Describe the form you need — I'll build it in seconds.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
          <p className="text-2xl font-black text-white">{totalForms}</p>
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mt-0.5">Forms</p>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
          <p className="text-2xl font-black text-white">{creditsRemaining.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mt-0.5">Words left</p>
          <div className="mt-2 h-1 w-full rounded-full bg-zinc-900 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${creditPct}%`,
                background: creditPct > 50 ? "#10b981" : creditPct > 20 ? "#f59e0b" : "#ef4444"
              }}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4 text-center">
          <p className="text-2xl font-black text-white capitalize">{plan}</p>
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mt-0.5">Plan</p>
          {plan === "free" && (
            <button
              onClick={onUpgrade}
              className="mt-2 text-[9px] font-black text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 mx-auto"
            >
              Upgrade <ArrowRight className="h-2.5 w-2.5" />
            </button>
          )}
        </div>
      </div>

      {/* Templates */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-violet-400" />
          <h2 className="text-sm font-bold text-zinc-300">Start with a template</h2>
          <span className="text-[10px] text-zinc-600 font-medium">or type your own prompt below ↓</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={() => onQuickAction(action.prompt)}
                className={`group text-left p-4 rounded-2xl border bg-gradient-to-br ${action.gradient} ${action.border} hover:brightness-110 transition-all duration-200 active:scale-[0.98] animate-in fade-in slide-in-from-bottom-1`}
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className={`h-8 w-8 rounded-xl ${action.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-4 w-4 ${action.iconColor}`} />
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${action.border} ${action.iconColor} bg-black/20`}>
                    {action.tag}
                  </span>
                </div>
                <h4 className="text-[13px] font-bold text-white mb-1 group-hover:text-white transition-colors">
                  {action.title}
                </h4>
                <p className="text-[11px] text-zinc-500 font-medium leading-relaxed line-clamp-2">
                  {action.prompt}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tip */}
      <div className="flex items-center gap-2 text-[11px] text-zinc-700 justify-center">
        <Clock className="h-3 w-3" />
        <span>Credits reset daily at midnight UTC</span>
      </div>
    </div>
  );
}
