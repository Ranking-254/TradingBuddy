"use client";

import React, { useState, useEffect } from "react";
import { X, Pencil, AlertCircle } from "lucide-react";

export interface TradeItem {
  id: string;
  symbol: string;
  side: "LONG" | "SHORT";
  lotSize: number;
  entryPrice: number;
  exitPrice: number;
  stopLoss: number | null;
  takeProfit: number | null;
  pnl: number;
  session: string | null;
  strategy: string | null;
  confluences: string[];
  followedRules: boolean;
  emotion: string | null;
  notes: string | null;
  openTime: string;
  closeTime: string;
}

interface EditTradeModalProps {
  trade: TradeItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditTradeModal({
  trade,
  isOpen,
  onClose,
  onSuccess,
}: EditTradeModalProps) {
  const [symbol, setSymbol] = useState("");
  const [side, setSide] = useState<"LONG" | "SHORT">("LONG");
  const [lotSize, setLotSize] = useState("0.1");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [pnl, setPnl] = useState("0");
  const [session, setSession] = useState("NEW_YORK");
  const [strategy, setStrategy] = useState("");
  const [confluences, setConfluences] = useState("");
  const [emotion, setEmotion] = useState("CALM");
  const [followedRules, setFollowedRules] = useState(true);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Lock background scroll and handle Escape key
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

  useEffect(() => {
    if (trade) {
      setSymbol(trade.symbol);
      setSide(trade.side);
      setLotSize(trade.lotSize.toString());
      setEntryPrice(trade.entryPrice.toString());
      setExitPrice(trade.exitPrice.toString());
      setStopLoss(trade.stopLoss ? trade.stopLoss.toString() : "");
      setTakeProfit(trade.takeProfit ? trade.takeProfit.toString() : "");
      setPnl(trade.pnl.toString());
      setSession(trade.session || "NEW_YORK");
      setStrategy(trade.strategy || "");
      setConfluences(trade.confluences ? trade.confluences.join(", ") : "");
      setEmotion(trade.emotion || "CALM");
      setFollowedRules(trade.followedRules ?? true);
      setNotes(trade.notes || "");
    }
  }, [trade]);

  if (!isOpen || !trade) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const confluencesArray = confluences
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      const res = await fetch(`/api/trades/${trade.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: symbol.toUpperCase(),
          side,
          lotSize: parseFloat(lotSize) || 0,
          entryPrice: parseFloat(entryPrice) || 0,
          exitPrice: parseFloat(exitPrice) || 0,
          stopLoss: stopLoss ? parseFloat(stopLoss) : null,
          takeProfit: takeProfit ? parseFloat(takeProfit) : null,
          pnl: parseFloat(pnl) || 0,
          session,
          strategy,
          confluences: confluencesArray,
          followedRules,
          emotion,
          notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update trade");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save changes");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[#0e101a] border border-[#1e2133] w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 my-auto"
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#1c1f30] bg-[#0e101a] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0">
              <Pencil className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Edit Trade ({trade.symbol})
              </h2>
              <p className="text-[10px] sm:text-[11px] text-zinc-400">
                Modify execution values, psychology flags, or confluences.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Row 1: Symbol, Direction, Lot Size */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-zinc-400 font-medium text-[11px]">
                  Symbol
                </label>
                <input
                  type="text"
                  required
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-[#141624] border border-[#232740] text-white uppercase font-bold focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-zinc-400 font-medium text-[11px]">
                  Side / Direction
                </label>
                <select
                  value={side}
                  onChange={(e) => setSide(e.target.value as "LONG" | "SHORT")}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-[#141624] border border-[#232740] text-white focus:outline-none focus:border-purple-500 font-medium"
                >
                  <option value="LONG">LONG (Buy)</option>
                  <option value="SHORT">SHORT (Sell)</option>
                </select>
              </div>
              <div>
                <label className="text-zinc-400 font-medium text-[11px]">
                  Lot Size
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={lotSize}
                  onChange={(e) => setLotSize(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-[#141624] border border-[#232740] text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Row 2: Price Metrics & PnL */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-zinc-400 font-medium text-[11px]">
                  Entry Price
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-[#141624] border border-[#232740] text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-zinc-400 font-medium text-[11px]">
                  Exit Price
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={exitPrice}
                  onChange={(e) => setExitPrice(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-[#141624] border border-[#232740] text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-zinc-400 font-medium text-[11px]">
                  Stop Loss
                </label>
                <input
                  type="number"
                  step="any"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  placeholder="Optional"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-[#141624] border border-[#232740] text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-zinc-400 font-medium text-[11px]">
                  Realized P&L ($)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={pnl}
                  onChange={(e) => setPnl(e.target.value)}
                  className={`w-full mt-1 px-3 py-2 rounded-xl bg-[#141624] border border-[#232740] font-mono font-bold focus:outline-none focus:border-purple-500 ${
                    parseFloat(pnl) >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                />
              </div>
            </div>

            {/* Row 3: Session & Emotion */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-400 font-medium text-[11px]">
                  Trading Session
                </label>
                <select
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-[#141624] border border-[#232740] text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="LONDON">London Session</option>
                  <option value="NEW_YORK">New York Session</option>
                  <option value="ASIAN">Asian Session</option>
                  <option value="OVERLAP">London / NY Overlap</option>
                </select>
              </div>
              <div>
                <label className="text-zinc-400 font-medium text-[11px]">
                  Psychological State
                </label>
                <select
                  value={emotion}
                  onChange={(e) => setEmotion(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-[#141624] border border-[#232740] text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="CALM">Calm & Disciplined</option>
                  <option value="FOMO">FOMO (Fear of Missing Out)</option>
                  <option value="REVENGE">Revenge Trading</option>
                  <option value="ANXIOUS">Anxious / Hesitant</option>
                </select>
              </div>
            </div>

            {/* Row 4: Confluences & Rule Compliance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-400 font-medium text-[11px]">
                  Confluences (comma-separated)
                </label>
                <input
                  type="text"
                  value={confluences}
                  onChange={(e) => setConfluences(e.target.value)}
                  placeholder="4H Order Block, FVG, Trendline"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-[#141624] border border-[#232740] text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="flex items-center sm:pt-4">
                <label className="flex items-center gap-2.5 p-2 rounded-xl bg-[#141624] border border-[#232740] w-full cursor-pointer text-zinc-300 select-none">
                  <input
                    type="checkbox"
                    checked={followedRules}
                    onChange={(e) => setFollowedRules(e.target.checked)}
                    className="h-4 w-4 rounded accent-purple-600 cursor-pointer"
                  />
                  <span className="text-[11px]">
                    Followed Plan & Guardrails
                  </span>
                </label>
              </div>
            </div>

            {/* Row 5: Notes */}
            <div>
              <label className="text-zinc-400 font-medium text-[11px]">
                Post-Execution Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What went well? Did you manage risk cleanly?"
                className="w-full mt-1 px-3 py-2 rounded-xl bg-[#141624] border border-[#232740] text-white focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1c1f30]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#141624] hover:bg-[#1a1d30] text-zinc-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-lg shadow-purple-900/30 disabled:opacity-50"
              >
                {isLoading ? "Saving changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
