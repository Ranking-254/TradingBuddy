"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAccount } from "@/context/AccountContext";
import { TradeItem } from "@/components/trades/EditTradeModal";
import { EconomicEvent } from "@/app/api/calendar/events/route";
import { Money, getCurrencySymbol } from "@/components/common/Money";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  X,
  AlertTriangle,
  CheckCircle2,
  Radio,
  Eye,
  EyeOff,
} from "lucide-react";

export default function CalendarPage() {
  const { selectedAccountId, selectedAccount } = useAccount();

  // Current viewed month date state
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [trades, setTrades] = useState<TradeItem[]>([]);
  const [macroEvents, setMacroEvents] = useState<EconomicEvent[]>([]);
  const [showEvents, setShowEvents] = useState(true); // Eye toggle state
  const [isLoading, setIsLoading] = useState(true);

  // Selected Day Details Modal
  const [selectedDayModal, setSelectedDayModal] = useState<{
    dateStr: string;
    dayNum: number;
    trades: TradeItem[];
    events: EconomicEvent[];
    netPnL: number;
  } | null>(null);

  const currSym = getCurrencySymbol(selectedAccount?.currency);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon ...
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Trailing days needed to fill the final week row (up to multiple of 7)
  const totalSlotsUsed = firstDayIndex + daysInMonth;
  const trailingDaysCount = (7 - (totalSlotsUsed % 7)) % 7;

  // 1. Fetch trades
  const fetchTrades = useCallback(async () => {
    if (!selectedAccountId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/trades?accountId=${selectedAccountId}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setTrades(Array.isArray(data) ? data : []);
      } else {
        setTrades([]);
      }
    } catch (err) {
      console.error("Failed to load trades for calendar:", err);
      setTrades([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccountId]);

  // 2. Fetch macroeconomic events for the active year and month
  const fetchMacroEvents = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/calendar/events?year=${year}&month=${month}`,
      );
      if (res.ok) {
        const data = await res.json();
        setMacroEvents(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch macro events:", err);
    }
  }, [year, month]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  useEffect(() => {
    fetchMacroEvents();
  }, [fetchMacroEvents]);

  // Month navigation
  const handlePrevMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Group trades by "YYYY-MM-DD"
  const tradesByDate = useMemo(() => {
    const map: Record<string, TradeItem[]> = {};
    trades.forEach((trade) => {
      const dateKey = new Date(trade.closeTime).toISOString().split("T")[0];
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(trade);
    });
    return map;
  }, [trades]);

  // Group macro events by "YYYY-MM-DD"
  const eventsByDate = useMemo(() => {
    const map: Record<string, EconomicEvent[]> = {};
    macroEvents.forEach((ev) => {
      const dateKey = ev.date.split("T")[0];
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(ev);
    });
    return map;
  }, [macroEvents]);

  // Monthly stats
  const monthStats = useMemo(() => {
    let totalPnL = 0;
    let greenDays = 0;
    let redDays = 0;
    let totalTradesThisMonth = 0;
    let winningTrades = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const d = String(day).padStart(2, "0");
      const m = String(month + 1).padStart(2, "0");
      const dateKey = `${year}-${m}-${d}`;
      const dayTrades = tradesByDate[dateKey] || [];

      if (dayTrades.length > 0) {
        totalTradesThisMonth += dayTrades.length;
        const dayPnL = dayTrades.reduce((acc, t) => acc + t.pnl, 0);
        totalPnL += dayPnL;
        if (dayPnL > 0) greenDays++;
        if (dayPnL < 0) redDays++;

        winningTrades += dayTrades.filter((t) => t.pnl > 0).length;
      }
    }

    const winRate =
      totalTradesThisMonth > 0
        ? ((winningTrades / totalTradesThisMonth) * 100).toFixed(1)
        : "0.0";

    return { totalPnL, greenDays, redDays, totalTradesThisMonth, winRate };
  }, [year, month, daysInMonth, tradesByDate]);

  const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-12 pt-2 px-1 sm:px-0">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-[#0e101a] border border-[#1b1d2b]">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2 sm:gap-2.5">
            <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 shrink-0" />
            <span>Interactive Trading Calendar</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
            Viewing execution variance & economic catalysts for{" "}
            <strong className="text-zinc-200">
              {selectedAccount?.name || "Account"}
            </strong>
          </p>
        </div>

        {/* Controls: Eye Toggle + Month Navigation */}
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-2.5 flex-wrap">
          {/* Show / Hide Events Button */}
          <button
            onClick={() => setShowEvents(!showEvents)}
            title={showEvents ? "Hide Economic Events" : "Show Economic Events"}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-semibold border transition-all ${
              showEvents
                ? "bg-purple-600/15 text-purple-300 border-purple-500/30 hover:bg-purple-600/25"
                : "bg-[#141624] text-zinc-500 border-[#232740] hover:text-zinc-300"
            }`}
          >
            {showEvents ? (
              <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            ) : (
              <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
            <span>Events {showEvents ? "On" : "Off"}</span>
          </button>

          {/* Month Navigation Controls */}
          <div className="flex items-center gap-1 sm:gap-2 bg-[#141624] border border-[#232740] p-1 sm:p-1.5 rounded-xl sm:rounded-2xl">
            <button
              onClick={handleToday}
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Today
            </button>
            <div className="h-3.5 sm:h-4 w-[1px] bg-[#232740]" />
            <button
              onClick={handlePrevMonth}
              title="Previous Month"
              className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <span className="text-[11px] sm:text-xs font-bold text-white px-1 sm:px-3 min-w-[105px] sm:min-w-[130px] text-center select-none truncate">
              {monthName} {year}
            </span>
            <button
              onClick={handleNextMonth}
              title="Next Month"
              className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Monthly KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#0e101a] border border-[#1b1d2b] space-y-0.5 sm:space-y-1">
          <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium">
            Month Realized P&amp;L
          </span>
          <p className="text-lg sm:text-2xl font-black font-mono truncate">
            <Money amount={monthStats.totalPnL} showSign colorize />
          </p>
        </div>

        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#0e101a] border border-[#1b1d2b] space-y-0.5 sm:space-y-1">
          <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium">
            Green vs. Red Days
          </span>
          <p className="text-lg sm:text-2xl font-black font-mono truncate">
            <span className="text-emerald-400">{monthStats.greenDays}G</span>{" "}
            <span className="text-zinc-600">/</span>{" "}
            <span className="text-rose-400">{monthStats.redDays}R</span>
          </p>
        </div>

        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#0e101a] border border-[#1b1d2b] space-y-0.5 sm:space-y-1">
          <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium">
            Month Win Rate
          </span>
          <p className="text-lg sm:text-2xl font-black text-white font-mono truncate">
            {monthStats.winRate}%
          </p>
        </div>

        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#0e101a] border border-[#1b1d2b] space-y-0.5 sm:space-y-1">
          <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium">
            Total Executions
          </span>
          <p className="text-lg sm:text-2xl font-black text-white font-mono truncate">
            {monthStats.totalTradesThisMonth} Trades
          </p>
        </div>
      </div>

      {/* Calendar Grid Container with horizontal scroll on small devices */}
      <div className="bg-[#0e101a] border border-[#1b1d2b] rounded-2xl sm:rounded-3xl p-2.5 sm:p-5 shadow-2xl space-y-3 sm:space-y-4 overflow-hidden">
        <div className="overflow-x-auto pb-1">
          <div className="min-w-[620px] sm:min-w-full space-y-2 sm:space-y-3">
            {/* Days Header */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider pb-2 border-b border-[#1b1d2b]">
              {DAYS_OF_WEEK.map((d, i) => (
                <div
                  key={d}
                  className={
                    i === 0 || i === 6 ? "text-zinc-600" : "text-zinc-400"
                  }
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Days Matrix */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {/* Previous Month Filler Days */}
              {Array.from({ length: firstDayIndex }).map((_, idx) => {
                const dayNumber = daysInPrevMonth - firstDayIndex + idx + 1;
                return (
                  <div
                    key={`prev-${idx}`}
                    onClick={handlePrevMonth}
                    className="min-h-[85px] sm:min-h-[110px] p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl bg-[#090a10]/40 border border-[#161824]/40 opacity-40 hover:opacity-75 cursor-pointer transition-opacity flex flex-col justify-between"
                    title="Go to previous month"
                  >
                    <span className="text-[11px] sm:text-xs font-mono text-zinc-500 font-bold">
                      {dayNumber}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-zinc-600 font-medium">
                      Prev
                    </span>
                  </div>
                );
              })}

              {/* Current Month Days */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const dateObj = new Date(year, month, dayNum);
                const dayOfWeek = dateObj.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                const d = String(dayNum).padStart(2, "0");
                const m = String(month + 1).padStart(2, "0");
                const dateStr = `${year}-${m}-${d}`;

                const dayTrades = tradesByDate[dateStr] || [];
                const dayEvents = eventsByDate[dateStr] || [];
                const dayPnL = dayTrades.reduce((acc, t) => acc + t.pnl, 0);
                const isTraded = dayTrades.length > 0;
                const wins = dayTrades.filter((t) => t.pnl > 0).length;
                const losses = dayTrades.filter((t) => t.pnl < 0).length;
                const hasBreach = dayTrades.some((t) => !t.followedRules);

                const todayStr = new Date().toISOString().split("T")[0];
                const isToday = dateStr === todayStr;

                return (
                  <div
                    key={dateStr}
                    onClick={() => {
                      if (isTraded || (showEvents && dayEvents.length > 0)) {
                        setSelectedDayModal({
                          dateStr,
                          dayNum,
                          trades: dayTrades,
                          events: dayEvents,
                          netPnL: dayPnL,
                        });
                      }
                    }}
                    className={`min-h-[85px] sm:min-h-[110px] p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl border transition-all flex flex-col justify-between relative group ${
                      isTraded
                        ? dayPnL >= 0
                          ? "bg-emerald-950/15 border-emerald-500/30 hover:border-emerald-400 cursor-pointer shadow-sm hover:shadow-emerald-900/20"
                          : "bg-rose-950/15 border-rose-500/30 hover:border-rose-400 cursor-pointer shadow-sm hover:shadow-rose-900/20"
                        : showEvents && dayEvents.length > 0
                          ? "bg-[#141624] border-purple-500/30 hover:border-purple-400 cursor-pointer"
                          : isWeekend
                            ? "bg-[#090a10]/50 border-[#151724] opacity-50"
                            : "bg-[#121422] border-[#1f2238] hover:border-zinc-700 cursor-default"
                    } ${isToday ? "ring-2 ring-purple-500/70" : ""}`}
                  >
                    {/* Header of Cell */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[11px] sm:text-xs font-mono font-bold ${
                          isToday
                            ? "text-purple-400 bg-purple-500/20 px-1 sm:px-1.5 py-0.5 rounded"
                            : "text-zinc-300"
                        }`}
                      >
                        {dayNum}
                      </span>

                      {hasBreach && (
                        <span
                          title="Rule Breach logged on this day"
                          className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-amber-400 animate-pulse"
                        />
                      )}
                    </div>

                    {/* Macro News Catalysts (Controlled by showEvents) */}
                    {showEvents && dayEvents.length > 0 && (
                      <div className="mt-1 space-y-0.5 sm:space-y-1">
                        {dayEvents.slice(0, 2).map((ev, i) => (
                          <div
                            key={i}
                            className="text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.5 rounded font-bold border truncate text-rose-300 bg-rose-500/15 border-rose-500/30 flex items-center gap-1"
                            title={`${ev.country}: ${ev.title}`}
                          >
                            <Radio className="h-2 w-2 sm:h-2.5 sm:w-2.5 shrink-0 text-rose-400 animate-pulse" />
                            <span className="truncate">
                              {ev.country}: {ev.title}
                            </span>
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <span className="text-[8px] sm:text-[9px] text-zinc-500 font-mono pl-0.5 block truncate">
                            +{dayEvents.length - 2} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Traded Day Outcome */}
                    {isTraded ? (
                      <div className="mt-auto pt-1 space-y-0.5">
                        <p className="text-[11px] sm:text-xs font-black font-mono truncate">
                          <Money amount={dayPnL} showSign colorize />
                        </p>
                        <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-zinc-400">
                          <span>
                            <span className="text-emerald-400 font-bold">
                              {wins}W
                            </span>
                            -
                            <span className="text-rose-400 font-bold">
                              {losses}L
                            </span>
                          </span>
                          <span className="text-zinc-500">
                            {dayTrades.length}t
                          </span>
                        </div>
                      </div>
                    ) : isWeekend ? (
                      <span className="text-[9px] sm:text-[10px] text-zinc-600 font-medium italic mt-auto">
                        Closed
                      </span>
                    ) : null}
                  </div>
                );
              })}

              {/* Next Month Filler Days (Completes the grid cleanly) */}
              {Array.from({ length: trailingDaysCount }).map((_, idx) => {
                const nextDayNum = idx + 1;
                return (
                  <div
                    key={`next-${idx}`}
                    onClick={handleNextMonth}
                    className="min-h-[85px] sm:min-h-[110px] p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl bg-[#090a10]/40 border border-[#161824]/40 opacity-40 hover:opacity-75 cursor-pointer transition-opacity flex flex-col justify-between"
                    title="Go to next month"
                  >
                    <span className="text-[11px] sm:text-xs font-mono text-zinc-500 font-bold">
                      {nextDayNum}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-zinc-600 font-medium">
                      Next
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Day Inspector Modal */}
      {selectedDayModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0e101a] border border-[#1f2235] w-full max-w-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl space-y-4 sm:space-y-6 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1b1e30] pb-3 sm:pb-4">
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CalendarIcon className="h-4 w-4 text-purple-400 shrink-0" />
                  <h3 className="text-base sm:text-lg font-bold text-white truncate">
                    Trading Audit • {selectedDayModal.dateStr}
                  </h3>
                </div>
                <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                  Performance &amp; high-impact news breakdown for{" "}
                  {selectedAccount?.name}
                </p>
              </div>

              <button
                onClick={() => setSelectedDayModal(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Daily Net P&L Summary */}
            {selectedDayModal.trades.length > 0 && (
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#141624] border border-[#232740] flex items-center justify-between">
                <div>
                  <span className="text-[10px] sm:text-[11px] text-zinc-400">
                    Day Net Outcome
                  </span>
                  <p className="text-xl sm:text-2xl font-black font-mono">
                    <Money amount={selectedDayModal.netPnL} showSign colorize />
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] sm:text-[11px] text-zinc-400">
                    Executions
                  </span>
                  <p className="text-sm sm:text-base font-bold text-white">
                    {selectedDayModal.trades.length} Positions
                  </p>
                </div>
              </div>
            )}

            {/* Macroeconomic News on this Day */}
            {selectedDayModal.events.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] sm:text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="h-3.5 w-3.5 text-rose-400 animate-pulse shrink-0" />
                  <span>High Impact Market Catalysts</span>
                </span>
                <div className="space-y-2">
                  {selectedDayModal.events.map((ev, i) => (
                    <div
                      key={i}
                      className="p-2.5 sm:p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="px-1.5 py-0.5 rounded font-black text-[9px] sm:text-[10px] bg-rose-500/20 text-rose-300">
                            {ev.country}
                          </span>
                          <span className="font-bold text-white">
                            {ev.title}
                          </span>
                        </div>
                      </div>
                      <div className="text-left sm:text-right text-[10px] sm:text-[11px] font-mono text-zinc-400">
                        {ev.forecast && <span>F: {ev.forecast} </span>}
                        {ev.previous && <span>| P: {ev.previous}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trades List */}
            {selectedDayModal.trades.length > 0 ? (
              <div className="space-y-2">
                <span className="text-[11px] sm:text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Executed Trades
                </span>
                <div className="space-y-2 max-h-56 sm:max-h-60 overflow-y-auto pr-1">
                  {selectedDayModal.trades.map((trade) => {
                    return (
                      <div
                        key={trade.id}
                        className="p-2.5 sm:p-3.5 rounded-xl bg-[#121422] border border-[#1f2238] flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5 sm:space-y-1 min-w-0 pr-2">
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <span className="font-bold text-white text-xs sm:text-sm">
                              {trade.symbol}
                            </span>
                            <span
                              className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold ${
                                trade.side === "LONG"
                                  ? "bg-emerald-500/15 text-emerald-400"
                                  : "bg-rose-500/15 text-rose-400"
                              }`}
                            >
                              {trade.side} • {trade.lotSize}L
                            </span>
                            <span className="text-zinc-500 text-[10px] sm:text-[11px] capitalize">
                              {trade.session?.toLowerCase() || "Session"}
                            </span>
                          </div>
                          <p className="text-zinc-400 text-[10px] sm:text-[11px] font-mono truncate">
                            Entry: {trade.entryPrice} ➔ Exit: {trade.exitPrice}
                          </p>
                        </div>

                        <div className="text-right space-y-0.5 sm:space-y-1 shrink-0">
                          <p className="font-black font-mono text-xs sm:text-sm">
                            <Money amount={trade.pnl} showSign colorize />
                          </p>
                          <div>
                            {trade.followedRules ? (
                              <span className="text-emerald-400 text-[9px] sm:text-[10px] inline-flex items-center gap-1">
                                <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />{" "}
                                Disciplined
                              </span>
                            ) : (
                              <span className="text-amber-400 text-[9px] sm:text-[10px] inline-flex items-center gap-1 font-bold">
                                <AlertTriangle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />{" "}
                                Rule Breach
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">
                No trades logged on this date.
              </p>
            )}

            {/* Modal Footer */}
            <div className="flex justify-end pt-2 border-t border-[#1b1e30]">
              <button
                onClick={() => setSelectedDayModal(null)}
                className="px-4 py-1.5 sm:py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
