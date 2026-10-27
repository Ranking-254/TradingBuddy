"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useAccount } from "@/context/AccountContext";
import { Money, getCurrencySymbol } from "@/components/common/Money";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Clock, Layers, HeartHandshake, CalendarRange } from "lucide-react";

type TimeGrouping = "DAILY" | "WEEKLY" | "MONTHLY" | "WEEKDAY";

export default function AnalyticsPage() {
  const { selectedAccountId, selectedAccount } = useAccount();
  const [trades, setTrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeView, setTimeView] = useState<TimeGrouping>("DAILY");

  const currSym = getCurrencySymbol(selectedAccount?.currency);

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
      }
    } catch (err) {
      console.error("Failed to load analytics trades:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccountId]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  // Auto-refresh when new trades are logged
  useEffect(() => {
    const handleRefresh = () => fetchTrades();
    window.addEventListener("tradeLogged", handleRefresh);
    return () => window.removeEventListener("tradeLogged", handleRefresh);
  }, [fetchTrades]);

  const analytics = useMemo(() => {
    const totalTrades = trades.length;

    // 1. Session Breakdown
    const sessionMap: Record<
      string,
      { pnl: number; wins: number; total: number }
    > = {
      LONDON: { pnl: 0, wins: 0, total: 0 },
      NEW_YORK: { pnl: 0, wins: 0, total: 0 },
      ASIAN: { pnl: 0, wins: 0, total: 0 },
      OVERLAP: { pnl: 0, wins: 0, total: 0 },
    };

    // 2. Asset / Pair Breakdown
    const assetMap: Record<
      string,
      { pnl: number; wins: number; total: number }
    > = {};

    // 3. Psychology / Mindset
    const emotionMap: Record<
      string,
      { pnl: number; wins: number; total: number }
    > = {
      CALM: { pnl: 0, wins: 0, total: 0 },
      FOMO: { pnl: 0, wins: 0, total: 0 },
      REVENGE: { pnl: 0, wins: 0, total: 0 },
      ANXIOUS: { pnl: 0, wins: 0, total: 0 },
    };

    // 4. All-time Day of Week (Mon - Fri + Weekend)
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekdayMap: Record<
      string,
      { pnl: number; wins: number; total: number }
    > = {
      Mon: { pnl: 0, wins: 0, total: 0 },
      Tue: { pnl: 0, wins: 0, total: 0 },
      Wed: { pnl: 0, wins: 0, total: 0 },
      Thu: { pnl: 0, wins: 0, total: 0 },
      Fri: { pnl: 0, wins: 0, total: 0 },
      Sat: { pnl: 0, wins: 0, total: 0 },
      Sun: { pnl: 0, wins: 0, total: 0 },
    };

    // 5. Chronological Recent Days (Exact calendar dates: e.g. "Mon 26", "Tue 27")
    const dailyMap: Record<
      string,
      { pnl: number; wins: number; total: number; timestamp: number }
    > = {};

    // 6. Weekly Trend Aggregator (ISO Week)
    const weekMap: Record<
      string,
      { pnl: number; wins: number; total: number; timestamp: number }
    > = {};

    // 7. Monthly Trend Aggregator (e.g. "Oct 2026")
    const monthMap: Record<
      string,
      { pnl: number; wins: number; total: number; timestamp: number }
    > = {};

    trades.forEach((t) => {
      const isWin = t.pnl > 0;
      const rawDate = t.closeTime || t.openTime || t.createdAt;
      const date = rawDate ? new Date(rawDate) : new Date();

      // Session
      if (t.session && sessionMap[t.session]) {
        sessionMap[t.session].pnl += t.pnl;
        sessionMap[t.session].total += 1;
        if (isWin) sessionMap[t.session].wins += 1;
      }

      // Asset
      const sym = t.symbol ? t.symbol.toUpperCase() : "OTHER";
      if (!assetMap[sym]) assetMap[sym] = { pnl: 0, wins: 0, total: 0 };
      assetMap[sym].pnl += t.pnl;
      assetMap[sym].total += 1;
      if (isWin) assetMap[sym].wins += 1;

      // Emotion
      const emo = t.emotion || "CALM";
      if (!emotionMap[emo]) emotionMap[emo] = { pnl: 0, wins: 0, total: 0 };
      emotionMap[emo].pnl += t.pnl;
      emotionMap[emo].total += 1;
      if (isWin) emotionMap[emo].wins += 1;

      // Weekday profiling
      const dayName = daysOfWeek[date.getDay()];
      if (weekdayMap[dayName]) {
        weekdayMap[dayName].pnl += t.pnl;
        weekdayMap[dayName].total += 1;
        if (isWin) weekdayMap[dayName].wins += 1;
      }

      // Exact Calendar Day (e.g., "Tue 27 Oct")
      const dayKey = date.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
      const dayTimestamp = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      ).getTime();

      if (!dailyMap[dayKey]) {
        dailyMap[dayKey] = {
          pnl: 0,
          wins: 0,
          total: 0,
          timestamp: dayTimestamp,
        };
      }
      dailyMap[dayKey].pnl += t.pnl;
      dailyMap[dayKey].total += 1;
      if (isWin) dailyMap[dayKey].wins += 1;

      // ISO Week
      const startOfYear = new Date(date.getFullYear(), 0, 1);
      const pastDays = (date.getTime() - startOfYear.getTime()) / 86400000;
      const weekNum = Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
      const weekKey = `W${weekNum} '${String(date.getFullYear()).slice(-2)}`;

      if (!weekMap[weekKey]) {
        weekMap[weekKey] = {
          pnl: 0,
          wins: 0,
          total: 0,
          timestamp: date.getTime(),
        };
      }
      weekMap[weekKey].pnl += t.pnl;
      weekMap[weekKey].total += 1;
      if (isWin) weekMap[weekKey].wins += 1;

      // Month
      const monthKey = date.toLocaleString("en-US", {
        month: "short",
        year: "numeric",
      });
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = {
          pnl: 0,
          wins: 0,
          total: 0,
          timestamp: new Date(date.getFullYear(), date.getMonth(), 1).getTime(),
        };
      }
      monthMap[monthKey].pnl += t.pnl;
      monthMap[monthKey].total += 1;
      if (isWin) monthMap[monthKey].wins += 1;
    });

    const sessionData = Object.entries(sessionMap).map(([name, val]) => ({
      name,
      pnl: Math.round(val.pnl * 100) / 100,
      winRate: val.total > 0 ? Math.round((val.wins / val.total) * 100) : 0,
      total: val.total,
    }));

    const assetData = Object.entries(assetMap)
      .map(([name, val]) => ({
        name,
        pnl: Math.round(val.pnl * 100) / 100,
        winRate: val.total > 0 ? Math.round((val.wins / val.total) * 100) : 0,
        total: val.total,
      }))
      .sort((a, b) => b.pnl - a.pnl);

    const emotionData = Object.entries(emotionMap).map(([name, val]) => ({
      name,
      pnl: Math.round(val.pnl * 100) / 100,
      winRate: val.total > 0 ? Math.round((val.wins / val.total) * 100) : 0,
      total: val.total,
    }));

    const weekdayData = ["Mon", "Tue", "Wed", "Thu", "Fri"].map((d) => ({
      name: d,
      pnl: Math.round(weekdayMap[d].pnl * 100) / 100,
      winRate:
        weekdayMap[d].total > 0
          ? Math.round((weekdayMap[d].wins / weekdayMap[d].total) * 100)
          : 0,
      total: weekdayMap[d].total,
    }));

    // Sort recent days chronologically, displaying up to the last 14 trading days
    const dailyData = Object.entries(dailyMap)
      .map(([name, val]) => ({
        name,
        pnl: Math.round(val.pnl * 100) / 100,
        winRate: val.total > 0 ? Math.round((val.wins / val.total) * 100) : 0,
        total: val.total,
        timestamp: val.timestamp,
      }))
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-14);

    const weekData = Object.entries(weekMap)
      .map(([name, val]) => ({
        name,
        pnl: Math.round(val.pnl * 100) / 100,
        winRate: val.total > 0 ? Math.round((val.wins / val.total) * 100) : 0,
        total: val.total,
        timestamp: val.timestamp,
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    const monthData = Object.entries(monthMap)
      .map(([name, val]) => ({
        name,
        pnl: Math.round(val.pnl * 100) / 100,
        winRate: val.total > 0 ? Math.round((val.wins / val.total) * 100) : 0,
        total: val.total,
        timestamp: val.timestamp,
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    return {
      totalTrades,
      sessionData,
      assetData,
      emotionData,
      weekdayData,
      dailyData,
      weekData,
      monthData,
    };
  }, [trades]);

  const activeTimeData = useMemo(() => {
    if (timeView === "DAILY") return analytics.dailyData;
    if (timeView === "WEEKLY") return analytics.weekData;
    if (timeView === "MONTHLY") return analytics.monthData;
    return analytics.weekdayData;
  }, [timeView, analytics]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Performance Analytics
          </h1>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Multi-Variable Edge
          </span>
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          Deep behavioral, chronological, and statistical variance for{" "}
          <span className="text-purple-400 font-semibold">
            {selectedAccount?.name}
          </span>
        </p>
      </div>

      {/* Top Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session Expectancy */}
        <div className="p-6 rounded-2xl bg-[#0e101a] border border-[#1b1d2b]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">
                Session Expectancy ({currSym} P&amp;L)
              </h3>
            </div>
            <span className="text-xs text-zinc-500 font-mono">
              London vs NY vs Asian
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.sessionData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  stroke="#52525b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#52525b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${currSym}${v}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#141624] border border-[#26283d] p-2.5 rounded-lg text-xs shadow-xl">
                          <p className="font-bold text-white">{data.name}</p>
                          <p className="font-mono font-bold mt-1">
                            <Money amount={data.pnl} showSign colorize />
                          </p>
                          <p className="text-zinc-400 text-[10px] mt-0.5">
                            Win Rate: {data.winRate}% ({data.total} trades)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
                  {analytics.sessionData.map((entry, index) => (
                    <Cell
                      key={`session-${index}`}
                      fill={entry.pnl >= 0 ? "#10b981" : "#f43f5e"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Periodicity Chart (Daily vs Weekly vs Monthly vs Weekday) */}
        <div className="p-6 rounded-2xl bg-[#0e101a] border border-[#1b1d2b] flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <CalendarRange className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">
                {timeView === "DAILY" && "Recent Days (Yesterday & Today)"}
                {timeView === "WEEKLY" && "Weekly Realized P&L"}
                {timeView === "MONTHLY" && "Monthly Net Performance"}
                {timeView === "WEEKDAY" && "All-Time Weekday Profile"}
              </h3>
            </div>

            {/* View Switcher Pills */}
            <div className="flex items-center gap-1 p-1 bg-[#141624] border border-[#232740] rounded-xl text-[10px] font-bold">
              <button
                onClick={() => setTimeView("DAILY")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  timeView === "DAILY"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setTimeView("WEEKLY")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  timeView === "WEEKLY"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTimeView("MONTHLY")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  timeView === "MONTHLY"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setTimeView("WEEKDAY")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  timeView === "WEEKDAY"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Weekday
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            {activeTimeData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-500 text-xs">
                No trades logged for this timeframe.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activeTimeData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <XAxis
                    dataKey="name"
                    stroke="#52525b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#52525b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${currSym}${v}`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#141624] border border-[#26283d] p-2.5 rounded-lg text-xs shadow-xl">
                            <p className="font-bold text-white">{data.name}</p>
                            <p className="font-mono font-bold mt-1">
                              <Money amount={data.pnl} showSign colorize />
                            </p>
                            <p className="text-zinc-400 text-[10px] mt-0.5">
                              Win Rate: {data.winRate}% ({data.total} trades)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
                    {activeTimeData.map((entry, index) => (
                      <Cell
                        key={`period-${index}`}
                        fill={entry.pnl >= 0 ? "#10b981" : "#f43f5e"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Asset Edge & Psychology Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Table */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0e101a] border border-[#1b1d2b]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">
                Asset &amp; Pair Edge Breakdown
              </h3>
            </div>
            <span className="text-xs text-zinc-500 font-mono">
              Ranked by Net P&amp;L
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#121422] text-zinc-400 font-semibold uppercase tracking-wider border-b border-[#1b1d2b]">
                <tr>
                  <th className="py-2.5 px-3">Symbol</th>
                  <th className="py-2.5 px-3">Executions</th>
                  <th className="py-2.5 px-3">Win Rate</th>
                  <th className="py-2.5 px-3 text-right">Net P&amp;L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181a28]">
                {analytics.assetData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-zinc-500">
                      No trades recorded yet.
                    </td>
                  </tr>
                ) : (
                  analytics.assetData.map((asset) => (
                    <tr
                      key={asset.name}
                      className="hover:bg-[#141624]/60 transition-colors"
                    >
                      <td className="py-3 px-3 font-bold font-mono text-white">
                        {asset.name}
                      </td>
                      <td className="py-3 px-3 text-zinc-300 font-mono">
                        {asset.total}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-zinc-200">
                            {asset.winRate}%
                          </span>
                          <div className="w-16 h-1.5 rounded-full bg-[#1b1d2b] overflow-hidden">
                            <div
                              className="h-full bg-purple-500 rounded-full"
                              style={{ width: `${asset.winRate}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold">
                        <Money amount={asset.pnl} showSign colorize />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Psychology vs Outcome */}
        <div className="p-6 rounded-2xl bg-[#0e101a] border border-[#1b1d2b] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <HeartHandshake className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">
                Psychology vs Outcome
              </h3>
            </div>
            <p className="text-[11px] text-zinc-400 mb-4">
              How emotional states directly impact win rates and drawdown.
            </p>

            <div className="space-y-3">
              {analytics.emotionData.map((emo) => (
                <div
                  key={emo.name}
                  className="p-3 bg-[#131522] rounded-xl border border-[#1f2235]"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-200">
                      {emo.name}
                    </span>
                    <Money
                      amount={emo.pnl}
                      showSign
                      colorize
                      className="font-bold font-mono"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1">
                    <span>{emo.total} executions</span>
                    <span>Win Rate: {emo.winRate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
