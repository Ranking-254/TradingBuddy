"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAccount } from "@/context/AccountContext";
import { parseMT5Report } from "@/lib/parsers/mt5Parser";
import { X, Upload, CheckCircle2, AlertCircle } from "lucide-react";

interface LogTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LogTradeModal({
  isOpen,
  onClose,
  onSuccess,
}: LogTradeModalProps) {
  const { selectedAccountId } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<"manual" | "upload">("manual");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form State for Manual Logging
  const [symbol, setSymbol] = useState("XAUUSD");
  const [side, setSide] = useState<"LONG" | "SHORT">("LONG");
  const [lotSize, setLotSize] = useState("0.10");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [pnl, setPnl] = useState("");
  const [session, setSession] = useState("NEW_YORK");
  const [strategy, setStrategy] = useState("Liquidity Sweep");
  const [emotion, setEmotion] = useState("CALM");
  const [followedRules, setFollowedRules] = useState(true);
  const [screenshotBefore, setScreenshotBefore] = useState("");
  const [notes, setNotes] = useState("");

  // Ensure SSR hydration safety for createPortal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scrolling and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  // Manual Form Submission
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId) return;
    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: selectedAccountId,
          symbol,
          side,
          lotSize,
          entryPrice,
          exitPrice,
          stopLoss: stopLoss || null,
          takeProfit: takeProfit || null,
          pnl,
          openTime: new Date().toISOString(),
          closeTime: new Date().toISOString(),
          session,
          strategy,
          emotion,
          followedRules,
          screenshotBefore: screenshotBefore || null,
          notes: notes || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to save trade");

      setStatusMsg({ type: "success", text: "Trade logged successfully!" });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 700);
    } catch (err: any) {
      setStatusMsg({
        type: "error",
        text: err.message || "An error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // MT5 File Ingestion
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedAccountId) return;

    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const text = await file.text();
      const parsedTrades = parseMT5Report(text);

      if (parsedTrades.length === 0) {
        throw new Error("No closed trades detected in this statement file.");
      }

      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: selectedAccountId,
          trades: parsedTrades,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Batch import failed");

      setStatusMsg({
        type: "success",
        text: `Successfully imported ${data.count} new trades!`,
      });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setStatusMsg({
        type: "error",
        text: err.message || "File parse failed.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[#0e101a] border border-[#1e2133] rounded-2xl sm:rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 my-auto"
      >
        {/* Sticky Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#1b1d2b] bg-[#0e101a] shrink-0">
          <div className="flex gap-1.5 p-1 bg-[#141624] rounded-xl border border-[#232536]">
            <button
              type="button"
              onClick={() => setTab("manual")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                tab === "manual"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Manual Log
            </button>
            <button
              type="button"
              onClick={() => setTab("upload")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                tab === "upload"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              MT5 Statement Sync
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-[#1a1c2b] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {statusMsg && (
          <div
            className={`mx-4 sm:mx-6 mt-3 sm:mt-4 p-3 rounded-xl flex items-center gap-2 text-xs font-medium shrink-0 ${
              statusMsg.type === "success"
                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
            }`}
          >
            {statusMsg.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6">
          {tab === "manual" && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-zinc-400">
                    Asset / Symbol
                  </label>
                  <input
                    type="text"
                    required
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-[#141624] border border-[#232536] text-sm text-white focus:outline-none focus:border-purple-500 uppercase font-mono"
                    placeholder="XAUUSD"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-zinc-400">
                    Direction
                  </label>
                  <select
                    value={side}
                    onChange={(e) => setSide(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-[#141624] border border-[#232536] text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="LONG">Long (Buy)</option>
                    <option value="SHORT">Short (Sell)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-zinc-400">
                    Lot Size
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={lotSize}
                    onChange={(e) => setLotSize(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-[#141624] border border-[#232536] text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-zinc-400">
                    Entry Price
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-[#141624] border border-[#232536] text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                    placeholder="2650.50"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-zinc-400">
                    Exit Price
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={exitPrice}
                    onChange={(e) => setExitPrice(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-[#141624] border border-[#232536] text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                    placeholder="2665.00"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-zinc-400">
                    Net P&L ($)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={pnl}
                    onChange={(e) => setPnl(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-[#141624] border border-[#232536] text-sm text-emerald-400 font-bold focus:outline-none focus:border-purple-500 font-mono"
                    placeholder="+145.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-zinc-400">
                    Stop Loss (Optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-[#141624] border border-[#232536] text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-zinc-400">
                    Take Profit (Optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-[#141624] border border-[#232536] text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              {/* Discipline & Buddy Layer */}
              <div className="p-3.5 sm:p-4 bg-[#121320] border border-[#1f2235] rounded-xl sm:rounded-2xl space-y-3">
                <p className="text-xs font-semibold text-purple-300">
                  Psychology & Discipline Metrics
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-400">
                      Strategy / Setup
                    </label>
                    <input
                      type="text"
                      value={strategy}
                      onChange={(e) => setStrategy(e.target.value)}
                      placeholder="e.g. Liquidity Sweep"
                      className="w-full mt-1 p-2 rounded-lg bg-[#181a29] border border-[#26283d] text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400">Session</label>
                    <select
                      value={session}
                      onChange={(e) => setSession(e.target.value)}
                      className="w-full mt-1 p-2 rounded-lg bg-[#181a29] border border-[#26283d] text-xs text-white"
                    >
                      <option value="LONDON">London</option>
                      <option value="NEW_YORK">New York</option>
                      <option value="ASIAN">Asian</option>
                      <option value="OVERLAP">Overlap</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400">
                      Emotional State
                    </label>
                    <select
                      value={emotion}
                      onChange={(e) => setEmotion(e.target.value)}
                      className="w-full mt-1 p-2 rounded-lg bg-[#181a29] border border-[#26283d] text-xs text-white"
                    >
                      <option value="CALM">Calm & Focused</option>
                      <option value="FOMO">FOMO / Chased</option>
                      <option value="REVENGE">Revenge / Tilted</option>
                      <option value="ANXIOUS">Anxious</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 p-2 rounded-lg bg-[#181a29] border border-[#26283d] text-xs text-zinc-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={followedRules}
                        onChange={(e) => setFollowedRules(e.target.checked)}
                        className="accent-purple-600 rounded h-4 w-4"
                      />
                      <span>Followed Rules?</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400">
                    Chart Snapshot URL (TradingView / Image Link)
                  </label>
                  <input
                    type="url"
                    value={screenshotBefore}
                    onChange={(e) => setScreenshotBefore(e.target.value)}
                    placeholder="https://www.tradingview.com/x/..."
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-[#181a29] border border-[#26283d] text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400">
                    Notes / Rationale
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What was your thesis? Any surprises or hesitations?"
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-[#181a29] border border-[#26283d] text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all disabled:opacity-50 shadow-lg shadow-purple-600/20"
                >
                  {isSubmitting ? "Logging Trade..." : "Save Trade to Journal"}
                </button>
              </div>
            </form>
          )}

          {tab === "upload" && (
            <div className="p-4 sm:p-8 space-y-4 text-center">
              <div className="border-2 border-dashed border-[#2b2d42] hover:border-purple-500 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center transition-all bg-[#121320]/50">
                <Upload className="h-10 w-10 text-purple-400 mb-3" />
                <p className="text-sm font-semibold text-white">
                  Drop your MT5 Statement here
                </p>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                  Export your Trade History from MT5 as an HTML or CSV report
                  and drop it in. Duplicate tickets will automatically be
                  skipped.
                </p>
                <label className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl cursor-pointer transition-all">
                  <span>Select File</span>
                  <input
                    type="file"
                    accept=".html,.htm,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
