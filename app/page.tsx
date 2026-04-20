"use client";

import { useSession, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight, Sparkles, Zap, Shield, Globe,
  CheckCircle, Star, ChevronRight, Play
} from "lucide-react";

const DEMO_PROMPTS = [
  "A registration form for an AI workshop",
  "Employee satisfaction survey for Q4",
  "Wedding RSVP with meal preferences",
  "Job application for Software Engineer",
  "Customer feedback for a restaurant",
];

const DEMO_QUESTIONS = [
  { q: "What is your full name?", t: "Short text" },
  { q: "How would you rate your experience?", t: "Scale 1–5" },
  { q: "Which sessions will you attend?", t: "Checkboxes" },
  { q: "Dietary restrictions?", t: "Multiple choice" },
  { q: "Any additional comments?", t: "Paragraph" },
];

const FEATURES = [
  { icon: Sparkles, title: "Natural Language", desc: "Just describe what you need in plain English. No dragging, no dropping.", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  { icon: Globe, title: "Live Google Forms", desc: "Published directly to your Google Drive. Share instantly.", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { icon: Zap, title: "7 Question Types", desc: "Text, paragraph, MCQ, checkbox, dropdown, scale, and date — all supported.", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { icon: Shield, title: "Google OAuth", desc: "Your forms go straight into your account. We never store your data.", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
];

function AnimatedPrompt() {
  const [promptIdx, setPromptIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const target = DEMO_PROMPTS[promptIdx];
    let i = 0;
    setDisplayed("");
    setTyping(true);

    const typeInterval = setInterval(() => {
      if (i < target.length) {
        setDisplayed(target.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typeInterval);
        setTyping(false);
        setTimeout(() => {
          setPromptIdx((p) => (p + 1) % DEMO_PROMPTS.length);
        }, 2200);
      }
    }, 38);

    return () => clearInterval(typeInterval);
  }, [promptIdx]);

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-zinc-900/80 backdrop-blur-xl px-5 py-4 shadow-2xl shadow-black/50">
      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shrink-0">
        <Sparkles className="h-4 w-4 text-white" />
      </div>
      <span className="flex-1 text-sm text-zinc-300 font-medium">
        {displayed}
        {typing && <span className="inline-block w-0.5 h-4 bg-violet-400 ml-0.5 animate-blink align-middle" />}
      </span>
      <div className="h-8 w-8 rounded-xl bg-violet-600 flex items-center justify-center shrink-0">
        <ArrowRight className="h-4 w-4 text-white" />
      </div>
    </div>
  );
}

function DemoFormPreview() {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible((v) => Math.min(v + 1, DEMO_QUESTIONS.length));
    }, 600);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/50">
      <div className="px-5 py-4 border-b border-white/[0.05] flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-red-500/60" />
        <div className="h-2 w-2 rounded-full bg-amber-500/60" />
        <div className="h-2 w-2 rounded-full bg-emerald-500/60" />
        <span className="ml-2 text-[11px] text-zinc-600 font-medium">AI Workshop Registration · Google Forms</span>
      </div>
      <div className="p-5 space-y-3">
        {DEMO_QUESTIONS.map((q, i) => (
          <div
            key={i}
            className={`transition-all duration-500 ${i < visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
          >
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-[10px] font-bold text-zinc-700 mt-0.5 w-4 shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-zinc-300">{q.q}</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">{q.t}</p>
              </div>
              <CheckCircle className="h-3.5 w-3.5 text-emerald-400/60 shrink-0 mt-0.5" />
            </div>
          </div>
        ))}
        {visible >= DEMO_QUESTIONS.length && (
          <div className="flex items-center gap-2 pt-2 animate-in fade-in duration-500">
            <div className="flex-1 h-9 rounded-xl bg-emerald-500 flex items-center justify-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-white" />
              <span className="text-[11px] font-bold text-white">Published to Google Forms</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const { status } = useSession();
  const [demoVisible, setDemoVisible] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#0a0a0c] overflow-x-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(99,102,241,0.15),transparent)]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-20 right-1/4 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-28 sm:pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/8 backdrop-blur-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-black text-violet-300 uppercase tracking-widest">
                AI-Powered · Google Forms Native
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-[1.05] mb-6">
              Build forms with{" "}
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                pure AI
              </span>
            </h1>

            <p className="text-lg text-zinc-400 leading-relaxed mb-8 max-w-lg font-medium">
              Type what you need. Formix AI generates a complete Google Form with the right
              questions, types, and structure — in under 10 seconds.
            </p>

            {/* Demo prompt preview */}
            <div className="mb-8 max-w-lg">
              <AnimatedPrompt />
            </div>

            {/* Social proof bullets */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8 text-sm text-zinc-500 font-medium">
              {["800 words free daily", "No credit card needed", "Google OAuth secure", "7 question types"].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  {t}
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              {status === "authenticated" ? (
                <Link
                  href="/dashboard"
                  className="group inline-flex h-12 items-center gap-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-7 text-sm font-bold text-white shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Open Dashboard
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <button
                  onClick={() => signIn("google")}
                  className="group inline-flex h-12 items-center gap-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-7 text-sm font-bold text-white shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Start for free — Google
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
              <Link
                href="/pricing"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-6 text-sm font-medium text-zinc-400 hover:text-white hover:border-white/[0.15] hover:bg-white/[0.04] transition-all"
              >
                View pricing
              </Link>
            </div>
          </div>

          {/* Right: Live demo */}
          <div className="animate-in fade-in slide-in-from-right-4 duration-700 [animation-delay:200ms]">
            <DemoFormPreview />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative py-20 border-y border-white/[0.04] bg-white/[0.01]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">How it works</h2>
            <p className="text-zinc-500 font-medium">From thought to live form in three steps.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="absolute top-10 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent hidden md:block" />
            {[
              { step: "01", title: "Describe", desc: "Say what you need: 'A feedback form for a yoga retreat with 10 questions'.", icon: "✍️" },
              { step: "02", title: "Review & Edit", desc: "Preview all questions instantly. Edit types, options, or wording inline.", icon: "✨" },
              { step: "03", title: "Publish", desc: "One click — your form goes live in Google Forms under your account.", icon: "🚀" },
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center group animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${i * 150}ms` }}>
                <div className="h-16 w-16 rounded-2xl bg-zinc-900 border border-white/[0.08] flex items-center justify-center text-2xl mb-5 group-hover:border-violet-500/30 group-hover:bg-violet-500/5 group-hover:scale-110 transition-all duration-300 shadow-xl shadow-black/30">
                  {item.icon}
                </div>
                <div className="text-[10px] font-black text-zinc-700 uppercase tracking-widest mb-2">{item.step}</div>
                <h3 className="text-lg font-black text-white mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-500 font-medium leading-relaxed max-w-[220px]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Everything you need</h2>
            <p className="text-zinc-500 font-medium max-w-xl mx-auto">
              Built for speed, precision, and privacy.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className={`group rounded-2xl border ${f.border} bg-gradient-to-br from-white/[0.02] to-transparent p-6 hover:from-white/[0.04] transition-all duration-300 hover:-translate-y-1`}>
                  <div className={`h-10 w-10 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-5 w-5 ${f.color}`} />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5">{f.title}</h3>
                  <p className="text-[12px] text-zinc-500 leading-relaxed font-medium">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Question types showcase */}
      <section className="py-16 border-t border-white/[0.04]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">7 question types supported</h2>
            <p className="text-zinc-500 font-medium text-sm">Richer forms, better responses.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: "Short text", icon: "Aa" },
              { label: "Paragraph", icon: "¶" },
              { label: "Multiple choice", icon: "◉" },
              { label: "Checkboxes", icon: "☑" },
              { label: "Dropdown", icon: "▾" },
              { label: "Scale", icon: "↔" },
              { label: "Date picker", icon: "📅" },
            ].map((t) => (
              <div key={t.label} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.06] bg-white/[0.02] text-sm font-medium text-zinc-400">
                <span className="text-base">{t.icon}</span>
                {t.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-white/[0.04]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-transparent p-10 sm:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.12),transparent_70%)]" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                Ready to build smarter forms?
              </h2>
              <p className="text-zinc-400 mb-8 font-medium max-w-lg mx-auto">
                Start free — 800 words per day. No credit card. Your forms live in your Google account.
              </p>
              {status === "authenticated" ? (
                <Link
                  href="/dashboard"
                  className="group inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 text-sm font-bold text-white shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <button
                  onClick={() => signIn("google")}
                  className="group inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 text-sm font-bold text-white shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Get Started — It's Free
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-black text-zinc-400">Formix AI</span>
          </div>
          <div className="flex items-center gap-6 text-[11px] text-zinc-600 font-medium">
            <Link href="/pricing" className="hover:text-zinc-400 transition-colors">Pricing</Link>
            <span>© {new Date().getFullYear()} Formix AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
