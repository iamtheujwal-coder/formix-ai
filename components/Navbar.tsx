"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, LogOut, LayoutDashboard, Menu, X, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user")
        .then((res) => res.json())
        .then((data) => setCredits(data.creditsRemaining))
        .catch(() => {});
    }

    const handleCreditsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ credits: number }>;
      setCredits(customEvent.detail.credits);
    };

    window.addEventListener("creditsUpdated", handleCreditsUpdate);
    return () => window.removeEventListener("creditsUpdated", handleCreditsUpdate);
  }, [status]);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  const getCreditBadgeClass = () => {
    if (credits === null) return "credit-badge normal";
    if (credits > 500) return "credit-badge normal";
    if (credits > 200) return "credit-badge warning";
    return "credit-badge low";
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-effect">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 transition-all group-hover:shadow-lg group-hover:shadow-indigo-500/30">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Formix AI</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {status === "authenticated" &&
            navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 text-xs font-medium transition-all rounded-lg ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Credits */}
          {status === "authenticated" && credits !== null && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10">
              <span className="text-xs font-semibold">🔥</span>
              <span className="text-xs font-medium">{credits}</span>
              <span className="text-[10px] text-zinc-500">/ 1000</span>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {/* Sign In / User */}
          {status === "loading" && (
            <div className="h-8 w-20 animate-pulse rounded-lg bg-white/5" />
          )}

          {status === "unauthenticated" && (
            <button
              onClick={() => signIn("google")}
              className="inline-flex h-8 items-center rounded-lg bg-white px-3.5 text-xs font-semibold text-black transition-all hover:bg-zinc-200"
            >
              Sign In
            </button>
          )}

          {status === "authenticated" && (
            <>
              <div className="hidden sm:flex items-center gap-2">
                {session?.user?.image && (
                  <img
                    src={session.user.image}
                    alt=""
                    className="h-7 w-7 rounded-full border border-white/10"
                  />
                )}
              </div>
              <button
                onClick={() => signOut()}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Mobile menu button */}
          {status === "authenticated" && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && status === "authenticated" && (
        <div className="md:hidden border-t border-white/10 glass-effect">
          <nav className="flex flex-col p-2 gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all rounded-lg ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
            <div className="h-px my-1 bg-white/10" />
            <div className="px-4 py-3">
              <div className="text-xs text-zinc-500 mb-1">Daily Credits</div>
              <div className="text-sm font-semibold">
                🔥 {credits ?? "—"} / 1000
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
