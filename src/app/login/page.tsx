"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Bot,
  ShieldAlert,
  Activity,
  Layers,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  X,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Forgot Password Modal State
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Google sign-in failed");
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError(null);
    setResetSuccess(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setResetSuccess(true);
    } catch (err: any) {
      setResetError(err.message || "Failed to send reset link");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080d] text-white flex flex-col justify-between p-6 md:p-12 selection:bg-purple-600 selection:text-white relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-900/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute -bottom-40 right-0 w-96 h-96 bg-indigo-900/10 rounded-full blur-[128px] pointer-events-none" />

      {/* Top Navbar */}
      <div className="flex items-center justify-between max-w-7xl w-full mx-auto z-10">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-black text-sm tracking-wider shadow-lg shadow-purple-900/40">
            TB
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            Trading<span className="text-purple-400">Buddy</span>
          </span>
        </div>
      </div>

      {/* Main Split Content */}
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center my-auto py-8 z-10">
        {/* Left Side: Real Trading Buddy Highlights */}
        <div className="lg:col-span-6 space-y-8">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Welcome <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                back.
              </span>
            </h1>
            <p className="text-sm text-zinc-400 max-w-md leading-relaxed pt-2">
              Your trading journal, risk metrics, and cognitive edge are
              waiting. Pick up right where you left off.
            </p>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md pt-2">
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#0f111d] border border-[#1b1e30] text-zinc-300 text-xs font-medium shadow-sm">
              <Bot className="h-4 w-4 text-purple-400 shrink-0" />
              <span>Interactive AI Coach</span>
            </div>
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#0f111d] border border-[#1b1e30] text-zinc-300 text-xs font-medium shadow-sm">
              <ShieldAlert className="h-4 w-4 text-purple-400 shrink-0" />
              <span>Discipline Guardrails</span>
            </div>
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#0f111d] border border-[#1b1e30] text-zinc-300 text-xs font-medium shadow-sm">
              <Activity className="h-4 w-4 text-purple-400 shrink-0" />
              <span>Equity Curve & DNA</span>
            </div>
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#0f111d] border border-[#1b1e30] text-zinc-300 text-xs font-medium shadow-sm">
              <Layers className="h-4 w-4 text-purple-400 shrink-0" />
              <span>Multi-Account MT5 Sync</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Column */}
        <div className="lg:col-span-6 flex flex-col items-center lg:items-end">
          <div className="w-full max-w-md space-y-4">
            {/* Back to Home Button directly above card */}
            <div className="flex justify-start">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to home</span>
              </Link>
            </div>

            {/* Login Card */}
            <div className="w-full bg-[#0e101a] border border-[#1b1e30] rounded-3xl p-8 shadow-2xl space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Sign in
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Enter your credentials to access your journal
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                  {errorMsg}
                </div>
              )}

              {/* Continue with Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 px-4 rounded-xl bg-[#141624] hover:bg-[#1a1d30] border border-[#232740] text-xs font-semibold text-zinc-200 transition-all flex items-center justify-center gap-2.5 shadow-sm"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-[1px] bg-[#1d2035]" />
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                  OR
                </span>
                <div className="flex-1 h-[1px] bg-[#1d2035]" />
              </div>

              {/* Email & Password Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-zinc-300">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-[#141624] border border-[#232740] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-zinc-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(email);
                        setResetSuccess(false);
                        setResetError(null);
                        setIsForgotOpen(true);
                      }}
                      className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative mt-1.5">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-[#141624] border border-[#232740] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 mt-2"
                >
                  <span>{isLoading ? "Signing in..." : "Sign in"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>

              <div className="text-center space-y-2 pt-2">
                <p className="text-xs text-zinc-400">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="text-purple-400 hover:text-purple-300 font-semibold"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </div>

            {/* Terms and Privacy Directly Below Card */}
            <p className="text-center text-[11px] text-zinc-500 px-4">
              By signing in, you agree to our{" "}
              <Link
                href="/terms"
                className="text-zinc-400 underline hover:text-purple-300 transition-colors"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-zinc-400 underline hover:text-purple-300 transition-colors"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e101a] border border-[#1b1e30] w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#1b1e30] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                  <KeyRound className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Reset Password
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    We&apos;ll email you a recovery link
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsForgotOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {resetSuccess ? (
              <div className="space-y-4 py-2 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">
                    Check your inbox
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                    We sent password recovery instructions to{" "}
                    <strong className="text-white">{resetEmail}</strong>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors mt-2"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form
                onSubmit={handlePasswordReset}
                className="space-y-4 text-xs"
              >
                {resetError && (
                  <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300">
                    {resetError}
                  </div>
                )}

                <div>
                  <label className="text-zinc-300 font-medium">
                    Account Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-[#141624] border border-[#232740] text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-[#141624] hover:bg-[#1a1d30] text-zinc-300 font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all shadow-lg shadow-purple-900/30 disabled:opacity-50"
                  >
                    {resetLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
