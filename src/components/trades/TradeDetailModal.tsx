"use client";

import React, { useEffect } from "react";
import { Money } from "@/components/common/Money";
import {
  X,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Tag,
} from "lucide-react";

interface Trade {
  id: string;
  ticketId?: string | null;
  symbol: string;
  side: "LONG" | "SHORT";
  lotSize: number;
  entryPrice: number;
  exitPrice: number;
  stopLoss?: number | null;
  takeProfit?: number | null;
  pnl: number;
  openTime: string;
  closeTime: string;
  session?: string | null;
  strategy?: string | null;
  followedRules: boolean;
  emotion?: string | null;
  notes?: string | null;
  screenshotBefore?: string | null;
}

interface TradeDetailModalProps {
  trade: Trade | null;
  onClose: () => void;
}

export function TradeDetailModal({ trade, onClose }: TradeDetailModalProps) {
  // Lock background scroll and add Escape dismiss listener
  useEffect(() => {
    if (!trade) return;

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
  }, [trade, onClose]);

  if (!trade) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[#0e101a] border border-[#1e2133] rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 my-auto"
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#1b1d2b] bg-[#0e101a] shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-base sm:text-lg font-bold text-white font-mono">
              {trade.symbol}
            </span>
            <span
              className={`text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 rounded-full ${
                trade.side === "LONG"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
              }`}
            >
              {trade.side}
            </span>
            {trade.ticketId && (
              <span className="text-[11px] sm:text-xs text-zinc-500 font-mono">
                #{trade.ticketId}
              </span>
            )}
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

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* Top Metric Cards: 2 cols on mobile, 4 cols on desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="p-2.5 sm:p-3 bg-[#131522] rounded-xl border border-[#1f2235]">
              <p className="text-[10px] text-zinc-400 font-medium uppercase">
                Net P&L
              </p>
              <p className="text-base sm:text-lg font-bold font-mono mt-1 truncate">
                <Money amount={trade.pnl} showSign colorize />
              </p>
            </div>
            <div className="p-2.5 sm:p-3 bg-[#131522] rounded-xl border border-[#1f2235]">
              <p className="text-[10px] text-zinc-400 font-medium uppercase">
                Volume
              </p>
              <p className="text-base sm:text-lg font-bold text-zinc-200 font-mono mt-1 truncate">
                {trade.lotSize} lots
              </p>
            </div>
            <div className="p-2.5 sm:p-3 bg-[#131522] rounded-xl border border-[#1f2235]">
              <p className="text-[10px] text-zinc-400 font-medium uppercase">
                Entry
              </p>
              <p className="text-xs sm:text-sm font-semibold text-zinc-300 font-mono mt-1 truncate">
                {trade.entryPrice}
              </p>
            </div>
            <div className="p-2.5 sm:p-3 bg-[#131522] rounded-xl border border-[#1f2235]">
              <p className="text-[10px] text-zinc-400 font-medium uppercase">
                Exit
              </p>
              <p className="text-xs sm:text-sm font-semibold text-zinc-300 font-mono mt-1 truncate">
                {trade.exitPrice}
              </p>
            </div>
          </div>

          {/* Psychology & Discipline Badges */}
          <div className="p-3.5 sm:p-4 bg-[#121320] border border-[#1e2030] rounded-xl sm:rounded-2xl space-y-2.5 sm:space-y-3">
            <p className="text-[11px] sm:text-xs font-semibold text-purple-300 uppercase tracking-wider">
              Execution & Psychology Context
            </p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
              <span className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-[#1a1c2b] text-zinc-300 rounded-lg border border-[#27293d]">
                <Clock className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                <span>Session: {trade.session || "Unspecified"}</span>
              </span>

              <span className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-[#1a1c2b] text-zinc-300 rounded-lg border border-[#27293d]">
                <Tag className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                <span>Setup: {trade.strategy || "Standard Execution"}</span>
              </span>

              <span
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg border ${
                  trade.followedRules
                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-300 border-rose-500/20"
                }`}
              >
                {trade.followedRules ? (
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                )}
                <span>
                  {trade.followedRules
                    ? "Plan Followed"
                    : "Rule Broken / Discretionary"}
                </span>
              </span>

              {trade.emotion && (
                <span className="px-2.5 sm:px-3 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-lg font-medium">
                  State: {trade.emotion}
                </span>
              )}
            </div>
          </div>

          {/* Chart Screenshot Section */}
          {trade.screenshotBefore && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-semibold text-zinc-400">
                  Chart Rationale
                </span>
                <a
                  href={trade.screenshotBefore}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] sm:text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  <span>Open Full Size</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="rounded-xl overflow-hidden border border-[#232536] bg-[#090a0f] max-h-72 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={trade.screenshotBefore}
                  alt="Trade Chart Setup"
                  className="w-full h-auto max-h-72 object-contain"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          {trade.notes && (
            <div className="space-y-1">
              <span className="text-[11px] sm:text-xs font-semibold text-zinc-400">
                Trader Reflection
              </span>
              <p className="text-xs text-zinc-300 p-3 sm:p-3.5 bg-[#121320] border border-[#1e2030] rounded-xl leading-relaxed whitespace-pre-wrap">
                {trade.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
