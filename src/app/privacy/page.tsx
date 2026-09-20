import React from "react";
import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck, Database, Key } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | TradingBuddy",
  description: "Privacy policy and data protection practices at TradingBuddy.",
};

export default function PrivacyPage() {
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

      {/* Main Content */}
      <main className="max-w-4xl w-full mx-auto py-10 z-10 space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
            <Lock className="h-3.5 w-3.5" />
            <span>Strict Privacy & Isolation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-zinc-400 mt-2">
            Last Updated: September 2026
          </p>
        </div>

        {/* Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-[#0e101a] border border-[#1b1d2c] space-y-1.5">
            <div className="h-7 w-7 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-bold text-white">
              Zero Trading Data Reselling
            </h3>
            <p className="text-[11px] text-zinc-400 leading-normal">
              Your trade orders, strategy confluences, and balances are never
              monetized or provided to broker counterparties.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0e101a] border border-[#1b1d2c] space-y-1.5">
            <div className="h-7 w-7 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <Key className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-bold text-white">
              Encrypted Authentication
            </h3>
            <p className="text-[11px] text-zinc-400 leading-normal">
              Identity management is powered by Supabase Auth with
              industry-standard salted hashing and OAuth tokens.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0e101a] border border-[#1b1d2c] space-y-1.5">
            <div className="h-7 w-7 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <Database className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-bold text-white">Row-Level Security</h3>
            <p className="text-[11px] text-zinc-400 leading-normal">
              Database records are strictly isolated by unique user UUIDs. No
              trader can access or query another trader&apos;s records.
            </p>
          </div>
        </div>

        <div className="space-y-6 text-xs text-zinc-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">
              1. Information We Collect
            </h2>
            <p>
              We collect information you explicitly provide when registering
              (such as your email address) and trade data you record (pairs, lot
              sizes, entry/exit prices, emotional tags, and strategy notes).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">
              2. How Your Data Is Used
            </h2>
            <p>
              Your data is solely utilized to generate your personal performance
              dashboard, compute win rates and profit factors, calculate
              discipline scores, and power your interactive coaching prompts.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">
              3. Third-Party Services
            </h2>
            <p>
              We use Supabase for persistent cloud database and authentication
              storage. Supabase complies with SOC 2 Type II and GDPR data
              protection regulations. We do not store plain-text passwords or
              financial payment details.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">
              4. Your Data Rights & Deletion
            </h2>
            <p>
              You have complete control over your data. You may export your
              records or execute a complete purge of your profile, trading
              accounts, and trade history at any time via the Danger Zone on
              your Settings page.
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
            href="/terms"
            className="hover:text-purple-400 transition-colors"
          >
            Terms of Service
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
