"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAccount } from "@/context/AccountContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Clock, Layers, HeartHandshake, CalendarDays } from "lucide-react";

function AnalyticsPage() {
  const { selectedAccountId, selectedAccount } = useAccount();
  const [trades, setTrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTrades = async () => {
    if (!selectedAccountId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/trades?accountId=${selectedAccountId}`);
      if (res.ok) {
        const data = await res.json();
        setTrades(data);
      }
    } catch (err) {
      console.error("Failed to load analytics trades:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, [selectedAccountId]);

  const analytics = useMemo(() => {
    const totalTrades = trades.length;

    const sessionMap: Record<
      string,
      { pnl: number; wins: number; total: number }
    > = {
      LONDON: { pnl: 0, wins: 0, total: 0 },
      NEW_YORK: { pnl: 0, wins: 0, total: 0 },
      ASIAN: { pnl: 0, wins: 0, total: 0 },
      OVERLAP: { pnl: 0, wins: 0, total: 0 },
    };

    const assetMap: Record<
      string,
      { pnl: number; wins: number; total: number }
    > = {};

    const emotionMap: Record<
      string,
      { pnl: number; wins: number; total: number }
    > = {
      CALM: { pnl: 0, wins: 0, total: 0 },
      FOMO: { pnl: 0, wins: 0, total: 0 },
      REVENGE: { pnl: 0, wins: 0, total: 0 },
      ANXIOUS: { pnl: 0, wins: 0, total: 0 },
    };

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayMap: Record<string, { pnl: number; wins: number; total: number }> =
      {
        Mon: { pnl: 0, wins: 0, total: 0 },
        Tue: { pnl: 0, wins: 0, total: 0 },
        Wed: { pnl: 0, wins: 0, total: 0 },
        Thu: { pnl: 0, wins: 0, total: 0 },
        Fri: { pnl: 0, wins: 0, total: 0 },
      };

    trades.forEach((t) => {
      const isWin = t.pnl > 0;

      if (t.session && sessionMap[t.session]) {
        sessionMap[t.session].pnl += t.pnl;
        sessionMap[t.session].total += 1;
        if (isWin) sessionMap[t.session].wins += 1;
      }

      const sym = t.symbol ? t.symbol.toUpperCase() : "OTHER";
      if (!assetMap[sym]) assetMap[sym] = { pnl: 0, wins: 0, total: 0 };
      assetMap[sym].pnl += t.pnl;
      assetMap[sym].total += 1;
      if (isWin) assetMap[sym].wins += 1;

      const emo = t.emotion || "CALM";
      if (!emotionMap[emo]) emotionMap[emo] = { pnl: 0, wins: 0, total: 0 };
      emotionMap[emo].pnl += t.pnl;
      emotionMap[emo].total += 1;
      if (isWin) emotionMap[emo].wins += 1;

      const d = new Date(t.closeTime);
      const dayName = daysOfWeek[d.getDay()];
      if (dayMap[dayName]) {
        dayMap[dayName].pnl += t.pnl;
        dayMap[dayName].total += 1;
        if (isWin) dayMap[dayName].wins += 1;
      }
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

    const dayData = Object.entries(dayMap).map(([name, val]) => ({
      name,
      pnl: Math.round(val.pnl * 100) / 100,
      winRate: val.total > 0 ? Math.round((val.wins / val.total) * 100) : 0,
      total: val.total,
    }));

    return { totalTrades, sessionData, assetData, emotionData, dayData };
  }, [trades]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
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
          Deep behavioral and statistical variance for{" "}
          <span className="text-purple-400 font-semibold">
            {selectedAccount?.name}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#0e101a] border border-[#1b1d2b]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">
                Session Expectancy ($ P&L)
              </h3>
            </div>
            <span className="text-xs text-zinc-500 font-mono">
              London vs NY vs Asian
            </span>
          </div>

          <div className="h-60 w-full">
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
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#141624] border border-[#26283d] p-2.5 rounded-lg text-xs shadow-xl">
                          <p className="font-bold text-white">{data.name}</p>
                          <p
                            className={`font-mono font-bold mt-1 ${data.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                          >
                            {data.pnl >= 0
                              ? `+$${data.pnl}`
                              : `-$${Math.abs(data.pnl)}`}
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
                      key={`cell-${index}`}
                      fill={entry.pnl >= 0 ? "#10b981" : "#f43f5e"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0e101a] border border-[#1b1d2b]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">
                Day of Week Performance
              </h3>
            </div>
            <span className="text-xs text-zinc-500 font-mono">
              Net Return per Weekday
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.dayData}
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
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#141624] border border-[#26283d] p-2.5 rounded-lg text-xs shadow-xl">
                          <p className="font-bold text-white">{data.name}</p>
                          <p
                            className={`font-mono font-bold mt-1 ${data.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                          >
                            {data.pnl >= 0
                              ? `+$${data.pnl}`
                              : `-$${Math.abs(data.pnl)}`}
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
                  {analytics.dayData.map((entry, index) => (
                    <Cell
                      key={`day-${index}`}
                      fill={entry.pnl >= 0 ? "#9333ea" : "#ef4444"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0e101a] border border-[#1b1d2b]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">
                Asset & Pair Edge Breakdown
              </h3>
            </div>
            <span className="text-xs text-zinc-500 font-mono">
              Ranked by Net P&L
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#121422] text-zinc-400 font-semibold uppercase tracking-wider border-b border-[#1b1d2b]">
                <tr>
                  <th className="py-2.5 px-3">Symbol</th>
                  <th className="py-2.5 px-3">Executions</th>
                  <th className="py-2.5 px-3">Win Rate</th>
                  <th className="py-2.5 px-3 text-right">Net P&L</th>
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
                      <td
                        className={`py-3 px-3 text-right font-mono font-bold ${asset.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                      >
                        {asset.pnl >= 0
                          ? `+$${asset.pnl.toFixed(2)}`
                          : `-$${Math.abs(asset.pnl).toFixed(2)}`}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

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
                    <span
                      className={`font-mono font-bold ${emo.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                    >
                      {emo.pnl >= 0
                        ? `+$${emo.pnl.toFixed(2)}`
                        : `-$${Math.abs(emo.pnl).toFixed(2)}`}
                    </span>
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

export default AnalyticsPage;
