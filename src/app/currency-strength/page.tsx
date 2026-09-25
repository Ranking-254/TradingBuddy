"use client";

import React, { useState, useEffect, useRef } from "react";
import { Activity, Layers } from "lucide-react";

const POPULAR_PAIRS = [
  { symbol: "OANDA:XAUUSD", label: "XAU/USD (Gold)" },
  { symbol: "FX:EURUSD", label: "EUR/USD" },
  { symbol: "FX:GBPUSD", label: "GBP/USD" },
  { symbol: "FX:USDJPY", label: "USD/JPY" },
  { symbol: "FX:AUDUSD", label: "AUD/USD" },
  { symbol: "FX:USDCAD", label: "USD/CAD" },
  { symbol: "FX:USDCHF", label: "USD/CHF" },
  { symbol: "FX:NZDUSD", label: "NZD/USD" },
  { symbol: "BITSTAMP:BTCUSD", label: "BTC/USD" },
];

export default function CurrencyStrengthPage() {
  const [activeSymbol, setActiveSymbol] = useState("OANDA:XAUUSD");
  const [activeLabel, setActiveLabel] = useState("XAU/USD (Gold)");

  const tvGaugeRef = useRef<HTMLDivElement>(null);
  const tvHeatmapRef = useRef<HTMLDivElement>(null);

  // Load Real-time Technical Analysis Meter
  useEffect(() => {
    if (!tvGaugeRef.current) return;
    tvGaugeRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      interval: "1h",
      width: "100%",
      isTransparent: true,
      height: 680,
      symbol: activeSymbol,
      showIntervalTabs: true,
      displayMode: "multiple",
      locale: "en",
      colorTheme: "dark",
    });

    tvGaugeRef.current.appendChild(script);
  }, [activeSymbol]);

  // Load Real-time Forex Heatmap Widget
  useEffect(() => {
    if (!tvHeatmapRef.current) return;
    tvHeatmapRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-forex-heat-map.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: 680,
      currencies: ["EUR", "USD", "JPY", "GBP", "CHF", "AUD", "CAD", "NZD"],
      isTransparent: true,
      colorTheme: "dark",
      locale: "en",
    });

    tvHeatmapRef.current.appendChild(script);
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-[#0e101a] border border-[#1b1e30]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Currency Strength &amp; Technical Gauge
            </h1>
            <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Interbank Data
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time algorithmic oscillator ratings, moving average consensus,
            and multi-currency heatmap.
          </p>
        </div>

        {/* Selected Pair Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 font-medium">Inspecting:</span>
          <select
            value={activeSymbol}
            onChange={(e) => {
              setActiveSymbol(e.target.value);
              const found = POPULAR_PAIRS.find(
                (p) => p.symbol === e.target.value,
              );
              if (found) setActiveLabel(found.label);
            }}
            className="bg-[#141624] border border-[#232740] text-white text-xs font-bold font-mono px-3 py-2 rounded-xl focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            {POPULAR_PAIRS.map((p) => (
              <option key={p.symbol} value={p.symbol}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Live Gauge & Technical Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live Speedometer & Oscillators / MAs */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0e101a] border border-[#1b1e30] space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1b1e30] pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Technical Meter • {activeLabel}
              </h2>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">
              Consensus Breakdown
            </span>
          </div>

          {/* Embedded TradingView Technical Meter Container */}
          <div className="w-full min-h-[680px] overflow-hidden rounded-xl [&_iframe]:!border-0">
            <div
              ref={tvGaugeRef}
              className="tradingview-widget-container w-full"
            />
          </div>
        </div>

        {/* Right Column: Live Global Currency Heatmap */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#0e101a] border border-[#1b1e30] space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1b1e30] pb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Live Currency Heatmap
              </h2>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">
              8 Major Baskets
            </span>
          </div>

          {/* Embedded TradingView Forex Heatmap Container */}
          <div className="w-full min-h-[680px] overflow-hidden rounded-xl [&_iframe]:!border-0">
            <div
              ref={tvHeatmapRef}
              className="tradingview-widget-container w-full"
            />
          </div>
        </div>
      </div>

      {/* Quick Pair Picker Bar */}
      <div className="p-4 rounded-2xl bg-[#0e101a] border border-[#1b1d2b]">
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2.5">
          Quick Switch Pair:
        </span>
        <div className="flex flex-wrap gap-2">
          {POPULAR_PAIRS.map((p) => {
            const isSelected = activeSymbol === p.symbol;
            return (
              <button
                key={p.symbol}
                onClick={() => {
                  setActiveSymbol(p.symbol);
                  setActiveLabel(p.label);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  isSelected
                    ? "bg-purple-600 text-white shadow-md shadow-purple-900/40"
                    : "bg-[#141624] border border-[#232740] text-zinc-400 hover:text-white hover:border-zinc-700"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
