import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldAlert, FileText, CheckCircle } from "lucide-react";

export const metadata = {
  title: "Terms of Service | TradingBuddy",
  description: "Terms and conditions for using TradingBuddy.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#07080d] text-zinc-300 flex flex-col justify-between p-6 md:p-12 selection:bg-purple-600 selection:text-white relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-900/15 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute -bottom-40 right-0 w-96 h-96 bg-indigo-900/10 rounded-full blur-[128px] pointer-events-none" />

      {/* Top Bar */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between z-10 pb-8 border-b border-[#1b1d2c]">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-black text-xs text-white shadow-lg shadow-purple-900/30">
            TB
          </div>
          <span className="font-bold text-base tracking-tight text-white">
            Trading<span className="text-purple-400">Buddy</span>
          </span>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to sign in</span>
        </Link>
      </header>

      {/* Main Document Content */}
      <main className="max-w-4xl w-full mx-auto py-10 z-10 space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-3">
            <FileText className="h-3.5 w-3.5" />
            <span>Legal Documentation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs text-zinc-400 mt-2">
            Last Updated: September 2026
          </p>
        </div>

        {/* High Risk Trading Disclaimer Callout */}
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
            <ShieldAlert className="h-4 w-4" />
            <span>Financial Risk & Performance Disclaimer</span>
          </div>
          <p className="leading-relaxed">
            TradingBuddy is an analytical journaling, behavioral audit, and
            educational performance tool. It does not execute orders on your
            behalf, provide financial advice, broker trades, or guarantee
            profit. High-leverage foreign exchange and CFD trading carries
            substantial risk of loss.
          </p>
        </div>

        <div className="space-y-6 text-xs text-zinc-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">
              1. Acceptance of Terms
            </h2>
            <p>
              By creating an account or accessing TradingBuddy, you agree to be
              bound by these Terms of Service and all applicable laws and
              regulations. If you do not agree with any part of these terms, you
              are prohibited from using or accessing this service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">
              2. User Accounts & Security
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your
              account credentials and for all activities that occur under your
              account. You agree to notify TradingBuddy immediately of any
              unauthorized access or breach of security.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">
              3. Data & Intellectual Property
            </h2>
            <p>
              You retain all ownership of the trade execution logs, notes, and
              personal data you record in TradingBuddy. We do not sell your
              trade history or proprietary strategies to third parties or
              brokers. The software interface, analytics algorithms, and brand
              assets remain the exclusive intellectual property of TradingBuddy.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">
              4. Third-Party Integrations & Market Feeds
            </h2>
            <p>
              TradingBuddy incorporates economic feeds and broker syncing
              protocols (such as MetaTrader and FairEconomy feeds). While we
              strive for uninterrupted accuracy, TradingBuddy is not liable for
              data discrepancies, news delays, or broker API downtime.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">
              5. Termination & Account Retirement
            </h2>
            <p>
              You may terminate your account at any time via the Settings page.
              We reserve the right to suspend or terminate accounts that abuse
              API endpoints, attempt unauthorized vulnerability penetration, or
              violate platform guardrails.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto pt-8 border-t border-[#1b1d2c] flex flex-wrap items-center justify-between text-[11px] text-zinc-500 z-10">
        <p>
          &copy; {new Date().getFullYear()} TradingBuddy. All rights reserved.
        </p>
        <div className="flex gap-4">
          <Link
            href="/privacy"
            className="hover:text-purple-400 transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/login"
            className="hover:text-purple-400 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </footer>
    </div>
  );
}
