"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAccount } from "@/context/AccountContext";
import { EditTradeModal, TradeItem } from "@/components/trades/EditTradeModal";
import { TradeDetailModal } from "@/components/trades/TradeDetailModal";
import { Money, getCurrencySymbol } from "@/components/common/Money";
import {
  Search,
  Pencil,
  Trash2,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Smile,
  Frown,
} from "lucide-react";

export default function TradesPage() {
  const { selectedAccountId, selectedAccount } = useAccount();

  const [trades, setTrades] = useState<TradeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Currency Localization
  const currSym = getCurrencySymbol(selectedAccount?.currency);

  // Filters State
  const [searchSymbol, setSearchSymbol] = useState("");
  const [sessionFilter, setSessionFilter] = useState("ALL");
  const [emotionFilter, setEmotionFilter] = useState("ALL");
  const [outcomeFilter, setOutcomeFilter] = useState<
    "ALL" | "WINNERS" | "LOSSES" | "BREACHES"
  >("ALL");

  // Edit Modal State
  const [selectedTradeToEdit, setSelectedTradeToEdit] =
    useState<TradeItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // View Trade Detail Modal State
  const [selectedTradeToView, setSelectedTradeToView] =
    useState<TradeItem | null>(null);

  // Fetch trades whenever filters or selectedAccountId change
  const fetchTrades = useCallback(async () => {
    if (!selectedAccountId) return;
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        accountId: selectedAccountId,
      });

      if (searchSymbol.trim()) params.append("symbol", searchSymbol.trim());
      if (sessionFilter !== "ALL") params.append("session", sessionFilter);
      if (emotionFilter !== "ALL") params.append("emotion", emotionFilter);
      if (outcomeFilter !== "ALL") params.append("filter", outcomeFilter);

      const res = await fetch(`/api/trades?${params.toString()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setTrades(Array.isArray(data) ? data : []);
      } else {
        setTrades([]);
      }
    } catch (err) {
      console.error("Failed to load trades:", err);
      setTrades([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedAccountId,
    searchSymbol,
    sessionFilter,
    emotionFilter,
    outcomeFilter,
  ]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  // Listen for global log trade events to auto-refresh table
  useEffect(() => {
    const handleRefresh = () => fetchTrades();
    window.addEventListener("tradeLogged", handleRefresh);
    return () => window.removeEventListener("tradeLogged", handleRefresh);
  }, [fetchTrades]);

  // Handle Delete Trade
  const handleDeleteTrade = async (trade: TradeItem) => {
    const sign = trade.pnl >= 0 ? "+" : "-";
    const formattedPnl = `${sign}${currSym}${Math.abs(trade.pnl).toFixed(2)}`;

    const confirmed = window.confirm(
      `Delete trade ${trade.symbol} (${trade.side} • ${formattedPnl})? This cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/trades/${trade.id}`, { method: "DELETE" });
      if (res.ok) {
        setTrades((prev) => prev.filter((t) => t.id !== trade.id));
      } else {
        alert("Failed to delete trade.");
      }
    } catch (err) {
      alert("Error deleting trade.");
    }
  };

  // Aggregated Stat Metrics
  const totalTrades = trades.length;
  const winners = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl < 0);
  const totalNetPnL = trades.reduce((acc, t) => acc + t.pnl, 0);
  const winRate =
    totalTrades > 0 ? ((winners.length / totalTrades) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Intelligent Trade Log
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Review, filter, edit, and dissect every execution across{" "}
          {selectedAccount?.name || "your account"}.
        </p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0e101a] border border-[#1b1d2b] space-y-1">
          <span className="text-[11px] text-zinc-400 font-medium">
            Filtered Net P&amp;L
          </span>
          <p className="text-xl font-black font-mono">
            <Money amount={totalNetPnL} showSign colorize />
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e101a] border border-[#1b1d2b] space-y-1">
          <span className="text-[11px] text-zinc-400 font-medium">
            Win Rate
          </span>
          <p className="text-xl font-black text-white font-mono">{winRate}%</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e101a] border border-[#1b1d2b] space-y-1">
          <span className="text-[11px] text-zinc-400 font-medium">
            Total Trades
          </span>
          <p className="text-xl font-black text-white font-mono">
            {totalTrades}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e101a] border border-[#1b1d2b] space-y-1">
          <span className="text-[11px] text-zinc-400 font-medium">
            W / L Ratio
          </span>
          <p className="text-xl font-black font-mono">
            <span className="text-emerald-400">{winners.length}W</span>{" "}
            <span className="text-zinc-600">/</span>{" "}
            <span className="text-rose-400">{losses.length}L</span>
          </p>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="p-4 rounded-2xl bg-[#0e101a] border border-[#1b1d2b] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="h-4 w-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by pair (e.g. XAUUSD, NAS100)..."
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#141624] border border-[#232740] text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Outcome Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-[#141624] border border-[#232740] rounded-xl text-xs font-semibold">
            <button
              onClick={() => setOutcomeFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                outcomeFilter === "ALL"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              All Trades
            </button>
            <button
              onClick={() => setOutcomeFilter("WINNERS")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                outcomeFilter === "WINNERS"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-emerald-300"
              }`}
            >
              Winners
            </button>
            <button
              onClick={() => setOutcomeFilter("LOSSES")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                outcomeFilter === "LOSSES"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-rose-300"
              }`}
            >
              Losses
            </button>
            <button
              onClick={() => setOutcomeFilter("BREACHES")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                outcomeFilter === "BREACHES"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-amber-300"
              }`}
            >
              Rule Breaches
            </button>
          </div>
        </div>

        {/* Dropdowns for Session & Emotion */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#161826]">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-zinc-500" />
            <span className="text-[11px] text-zinc-400">Session:</span>
            <select
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-[#141624] border border-[#232740] text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">All Sessions</option>
              <option value="LONDON">London</option>
              <option value="NEW_YORK">New York</option>
              <option value="ASIAN">Asian</option>
              <option value="OVERLAP">London / NY Overlap</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-400">Mindset:</span>
            <select
              value={emotionFilter}
              onChange={(e) => setEmotionFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-[#141624] border border-[#232740] text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">All Mindsets</option>
              <option value="CALM">Calm &amp; Disciplined</option>
              <option value="FOMO">FOMO</option>
              <option value="REVENGE">Revenge</option>
              <option value="ANXIOUS">Anxious</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trades Table */}
      <div className="bg-[#0e101a] border border-[#1b1d2b] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1b1d2b] bg-[#141624]/60 text-zinc-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Symbol</th>
                <th className="py-3 px-4">Side</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Entry</th>
                <th className="py-3 px-4">Exit</th>
                <th className="py-3 px-4">P&amp;L ({currSym})</th>
                <th className="py-3 px-4">Session</th>
                <th className="py-3 px-4">Mindset</th>
                <th className="py-3 px-4">Discipline</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b1d2b]">
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-zinc-500">
                    Loading trades from database...
                  </td>
                </tr>
              ) : trades.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-zinc-500">
                    No trades match your criteria. Click &ldquo;+ Log
                    Trade&rdquo; to add your first execution.
                  </td>
                </tr>
              ) : (
                trades.map((trade) => {
                  const isLong = trade.side === "LONG";

                  return (
                    <tr
                      key={trade.id}
                      className="hover:bg-[#141624]/40 transition-colors"
                    >
                      {/* Symbol */}
                      <td className="py-3.5 px-4 font-bold text-white tracking-wide">
                        {trade.symbol}
                      </td>

                      {/* Side */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            isLong
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {isLong ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          {trade.side}
                        </span>
                      </td>

                      {/* Size */}
                      <td className="py-3.5 px-4 font-mono text-zinc-300">
                        {trade.lotSize}
                      </td>

                      {/* Entry Price */}
                      <td className="py-3.5 px-4 font-mono text-zinc-400">
                        {trade.entryPrice.toLocaleString()}
                      </td>

                      {/* Exit Price */}
                      <td className="py-3.5 px-4 font-mono text-zinc-400">
                        {trade.exitPrice.toLocaleString()}
                      </td>

                      {/* Realized PnL */}
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <Money amount={trade.pnl} showSign colorize />
                      </td>

                      {/* Session */}
                      <td className="py-3.5 px-4 text-[11px] text-zinc-400 capitalize">
                        {trade.session
                          ? trade.session.replace("_", " ").toLowerCase()
                          : "-"}
                      </td>

                      {/* Emotion / Mindset */}
                      <td className="py-3.5 px-4">
                        {trade.emotion === "CALM" && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                            <Smile className="h-3 w-3" /> Calm
                          </span>
                        )}
                        {trade.emotion === "FOMO" && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                            <Flame className="h-3 w-3" /> FOMO
                          </span>
                        )}
                        {trade.emotion === "REVENGE" && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-medium">
                            <Frown className="h-3 w-3" /> Revenge
                          </span>
                        )}
                        {trade.emotion === "ANXIOUS" && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-indigo-400 font-medium">
                            <AlertTriangle className="h-3 w-3" /> Anxious
                          </span>
                        )}
                        {!trade.emotion && (
                          <span className="text-zinc-500">-</span>
                        )}
                      </td>

                      {/* Followed Rules */}
                      <td className="py-3.5 px-4">
                        {trade.followedRules ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Followed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-400 text-[11px] font-semibold">
                            <AlertTriangle className="h-3.5 w-3.5" /> Breach
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono text-zinc-500 text-[11px]">
                        {new Date(trade.closeTime).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedTradeToView(trade)}
                            title="View Full Details & Notes"
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-purple-300 hover:bg-purple-600/10 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTradeToEdit(trade);
                              setIsEditOpen(true);
                            }}
                            title="Edit Trade"
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-purple-300 hover:bg-purple-600/10 transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTrade(trade)}
                            title="Delete Trade"
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Trade Modal Component */}
      <EditTradeModal
        trade={selectedTradeToEdit}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedTradeToEdit(null);
        }}
        onSuccess={() => {
          fetchTrades();
        }}
      />

      {/* View Trade Detail Modal Component */}
      <TradeDetailModal
        trade={selectedTradeToView}
        onClose={() => setSelectedTradeToView(null)}
      />
    </div>
  );
}
