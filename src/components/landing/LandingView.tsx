"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Bot,
  CalendarDays,
  LineChart,
  Zap,
  CheckCircle2,
  Lock,
  Layers,
  ChevronRight,
  BarChart3,
  TrendingUp,
} from "lucide-react";

export function LandingView() {
  return (
    <div className="min-h-screen bg-[#07080d] text-white selection:bg-purple-600 selection:text-white relative overflow-hidden flex flex-col justify-between">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-900/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-96 right-0 w-96 h-96 bg-indigo-900/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navigation */}
      <nav className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-black text-sm text-white shadow-lg shadow-purple-900/40">
            TB
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            Trading<span className="text-purple-400">Buddy</span>
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-900/30 active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl w-full mx-auto px-6 py-12 md:py-20 z-10 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold shadow-sm">
            <Zap className="h-3.5 w-3.5 text-purple-400" />
            <span>Built for Institutional Execution & Discipline</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Master your psychology. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-purple-500">
              Protect your capital.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Stop losing profits to revenge trades, over-leveraging, and lack of
            accountability. TradingBuddy is the high-performance trading journal
            equipped with risk guardrails, live macroeconomic calendars, and
            cognitive behavioral auditing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all shadow-xl shadow-purple-900/40 flex items-center justify-center gap-2.5 active:scale-95"
            >
              <span>Start Journaling Free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#141624] hover:bg-[#1a1d30] border border-[#232740] text-zinc-300 font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Access Your Journal</span>
              <ChevronRight className="h-4 w-4 text-zinc-500" />
            </Link>
          </div>
        </div>

        {/* Live Interface Teaser Card */}
        <div className="max-w-5xl mx-auto rounded-3xl bg-[#0e101a] border border-[#1e2235] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-[#1b1e30] pb-6">
            <div className="space-y-1">
              <span className="text-[11px] text-zinc-500 font-medium">
                Session Win Rate
              </span>
              <p className="text-xl font-bold font-mono text-emerald-400">
                74.2%
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-zinc-500 font-medium">
                Profit Factor
              </span>
              <p className="text-xl font-bold font-mono text-purple-400">
                2.84
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-zinc-500 font-medium">
                Discipline Index
              </span>
              <p className="text-xl font-bold font-mono text-white">96 / 100</p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-zinc-500 font-medium">
                Risk Exposure
              </span>
              <p className="text-xl font-bold font-mono text-indigo-400">
                1.25% Max
              </p>
            </div>
          </div>

          <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#141624] border border-[#202438] space-y-2">
              <div className="flex items-center gap-2 font-bold text-white">
                <ShieldCheck className="h-4 w-4 text-purple-400" />
                <span>Zero Breach Guardrails</span>
              </div>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                Configurable risk rules automatically flag revenge entries,
                lot-size violations, and session tilt.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141624] border border-[#202438] space-y-2">
              <div className="flex items-center gap-2 font-bold text-white">
                <CalendarDays className="h-4 w-4 text-purple-400" />
                <span>Live Macroeconomic Feed</span>
              </div>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                Built-in institutional calendar tracks NFP, CPI, PPI, and FOMC
                rate decisions alongside your trades.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141624] border border-[#202438] space-y-2">
              <div className="flex items-center gap-2 font-bold text-white">
                <Bot className="h-4 w-4 text-purple-400" />
                <span>Cognitive AI Coach</span>
              </div>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                Dissects emotional patterns like FOMO and anxiety to provide
                customized coaching feedback.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="pt-12 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Engineered for Serious Traders
            </h2>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Whether you trade Prop Firms (FTMO, FundingPips) or Live Broker
              accounts, we provide the tools you need.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0e101a] border border-[#1b1e30] space-y-2.5">
              <Layers className="h-5 w-5 text-purple-400" />
              <h3 className="font-bold text-sm text-white">
                Multi-Account Isolation
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Separate your challenge accounts, personal live equity, and
                swing portfolios with independent tracking.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0e101a] border border-[#1b1e30] space-y-2.5">
              <LineChart className="h-5 w-5 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">
                Execution Metrics
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Analyze win rates by market session (London, NY, Asian), asset
                symbol, or technical setup.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0e101a] border border-[#1b1e30] space-y-2.5">
              <Lock className="h-5 w-5 text-indigo-400" />
              <h3 className="font-bold text-sm text-white">
                Bank-Grade Privacy
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Row-Level Security ensures your trading strategies and execution
                journals are never sold or leaked.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0e101a] border border-[#1b1e30] space-y-2.5">
              <BarChart3 className="h-5 w-5 text-amber-400" />
              <h3 className="font-bold text-sm text-white">Behavioral DNA</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Discover which emotional state produces your highest profits and
                where you give back gains.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-purple-950/40 via-[#0e101a] to-indigo-950/30 border border-purple-500/20 text-center space-y-5">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Ready to build institutional consistency?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
            Join disciplined traders who journal with intention, respect risk
            rules, and eliminate emotion.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-xl shadow-purple-900/40 transition-all active:scale-95"
            >
              <span>Create Free Account</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto px-6 py-8 border-t border-[#1b1e30] flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500 z-10">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-purple-600 flex items-center justify-center font-black text-[10px] text-white">
            TB
          </div>
          <span>
            &copy; {new Date().getFullYear()} TradingBuddy. Built for
            high-discipline execution.
          </span>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/terms"
            className="hover:text-purple-300 transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            className="hover:text-purple-300 transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/login"
            className="hover:text-purple-300 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </footer>
    </div>
  );
}
