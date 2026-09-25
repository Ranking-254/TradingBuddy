"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Clock,
  Radio,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Globe2,
  Flame,
  ExternalLink,
} from "lucide-react";

interface SessionInfo {
  name: string;
  city: string;
  openUtc: number;
  closeUtc: number;
}

const SESSIONS: SessionInfo[] = [
  { name: "SYDNEY", city: "Australia", openUtc: 22, closeUtc: 7 },
  { name: "TOKYO", city: "Japan", openUtc: 0, closeUtc: 9 },
  { name: "LONDON", city: "United Kingdom", openUtc: 8, closeUtc: 17 },
  { name: "NEW YORK", city: "United States", openUtc: 13, closeUtc: 22 },
];

const WATCHLIST_SYMBOLS = [
  { symbol: "FX:EURUSD", label: "EUR/USD", category: "Forex" },
  { symbol: "FX:GBPUSD", label: "GBP/USD", category: "Forex" },
  { symbol: "FX:USDJPY", label: "USD/JPY", category: "Forex" },
  { symbol: "OANDA:XAUUSD", label: "XAU/USD (Gold)", category: "Commodities" },
  { symbol: "TVC:USOIL", label: "US Oil (WTI)", category: "Commodities" },
  { symbol: "NASDAQ:NDX", label: "NAS100", category: "Indices" },
  { symbol: "DJ:DJI", label: "US30", category: "Indices" },
  { symbol: "BITSTAMP:BTCUSD", label: "BTC/USD", category: "Crypto" },
];

function isSessionOpen(now: Date, openUtc: number, closeUtc: number): boolean {
  const currentHour = now.getUTCHours() + now.getUTCMinutes() / 60;
  if (openUtc < closeUtc) {
    return currentHour >= openUtc && currentHour < closeUtc;
  }
  return currentHour >= openUtc || currentHour < closeUtc;
}

function getCountdownText(
  now: Date,
  openUtc: number,
  closeUtc: number,
  isOpen: boolean,
): string {
  const nowMs = now.getTime();
  let target = new Date(now);
  target.setUTCMinutes(0, 0, 0);

  if (isOpen) {
    target.setUTCHours(closeUtc);
    if (target.getTime() <= nowMs) {
      target.setUTCDate(target.getUTCDate() + 1);
    }
  } else {
    target.setUTCHours(openUtc);
    if (target.getTime() <= nowMs) {
      target.setUTCDate(target.getUTCDate() + 1);
    }
  }

  const diffMs = Math.max(0, target.getTime() - nowMs);
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return isOpen
    ? `Closes in ${diffHours}h ${diffMinutes}m`
    : `Opens in ${diffHours}h ${diffMinutes}m`;
}

export default function MarketOverviewPage() {
  const [now, setNow] = useState<Date | null>(null);
  const [activeChartSymbol, setActiveChartSymbol] = useState("OANDA:XAUUSD");
  const [activeLabel, setActiveLabel] = useState("XAU/USD (Gold)");
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Live ticking clock
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // TradingView Advanced Real-Time Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;
    chartContainerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      if (typeof TradingView !== "undefined") {
        // @ts-ignore
        new TradingView.widget({
          autosize: true,
          symbol: activeChartSymbol,
          interval: "60",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#0e101a",
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          container_id: "tv_market_overview_chart",
        });
      }
    };
    chartContainerRef.current.appendChild(script);
  }, [activeChartSymbol]);

  // Session overlap summary
  const openSessionsCount = useMemo(() => {
    if (!now) return 0;
    return SESSIONS.filter((s) => isSessionOpen(now, s.openUtc, s.closeUtc))
      .length;
  }, [now]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-[#0e101a] border border-[#1b1d2b]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Market Overview
            </h1>
            <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              Global Macro
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time market sessions, active liquidity windows, and
            institutional charting terminal.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#141624] px-3 py-1.5 rounded-xl border border-[#232740] font-mono text-xs text-zinc-300">
          <Clock className="h-4 w-4 text-purple-400" />
          <span>
            {now
              ? now.toLocaleTimeString("en-GB", {
                  timeZone: "UTC",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })
              : "--:--:--"}{" "}
            UTC
          </span>
          <span className="text-[10px] ml-1 px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
            {openSessionsCount > 1 ? "Session Overlap" : "Standard"}
          </span>
        </div>
      </div>

      {/* 1. Global Market Sessions Cards */}
      <div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {SESSIONS.map((session) => {
            const isOpen = now
              ? isSessionOpen(now, session.openUtc, session.closeUtc)
              : false;
            const countdown = now
              ? getCountdownText(now, session.openUtc, session.closeUtc, isOpen)
              : "Calculating...";

            return (
              <div
                key={session.name}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-2 relative overflow-hidden ${
                  isOpen
                    ? "bg-emerald-950/15 border-emerald-500/50 shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500/30"
                    : "bg-[#0e101a] border-[#1b1d2b]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold tracking-wider text-zinc-200 uppercase font-mono block">
                      {session.name}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {session.city}
                    </span>
                  </div>

                  <span
                    className={`flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full ${
                      isOpen
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isOpen ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
                      }`}
                    />
                    <span>{isOpen ? "Open" : "Closed"}</span>
                  </span>
                </div>

                <div className="pt-2 border-t border-[#1b1d2b] flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span className="text-zinc-500 text-[10px]">Countdown:</span>
                  <span
                    className={
                      isOpen
                        ? "text-emerald-300 font-semibold"
                        : "text-zinc-400"
                    }
                  >
                    {countdown}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Terminal & Asset Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Watchlist Rail (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-3xl bg-[#0e101a] border border-[#1b1d2b] space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1b1d2b] pb-3">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-purple-400" />
              <h2 className="text-xs font-bold uppercase text-white tracking-wider">
                Institutional Watchlist
              </h2>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">
              Live Feed
            </span>
          </div>

          <div className="space-y-2">
            {WATCHLIST_SYMBOLS.map((item) => {
              const isSelected = activeChartSymbol === item.symbol;
              return (
                <button
                  key={item.symbol}
                  onClick={() => {
                    setActiveChartSymbol(item.symbol);
                    setActiveLabel(item.label);
                  }}
                  className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all text-left group ${
                    isSelected
                      ? "bg-purple-600/15 border-purple-500/50 shadow-sm"
                      : "bg-[#141624] border-[#232740] hover:border-zinc-700"
                  }`}
                >
                  <div>
                    <span className="font-mono font-bold text-xs text-white block group-hover:text-purple-300">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {item.category}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      isSelected
                        ? "bg-purple-600 text-white"
                        : "bg-[#1b1d2b] text-zinc-400 group-hover:text-zinc-200"
                    }`}
                  >
                    {isSelected ? "Active" : "Load"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Live Interactive Candlestick Chart (8 cols) */}
        <div className="lg:col-span-8 p-5 rounded-3xl bg-[#0e101a] border border-[#1b1d2b] space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1b1d2b] pb-3">
            <div className="flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-purple-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Live Chart Terminal • {activeLabel}
              </h2>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
              TradingView Cloud Engine
            </span>
          </div>

          {/* Embedded TradingView Chart Container */}
          <div className="w-full h-[540px] rounded-2xl overflow-hidden bg-[#0a0b12] border border-[#1b1d2b]">
            <div
              id="tv_market_overview_chart"
              ref={chartContainerRef}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
