"use client";

import React, { useState, useEffect } from "react";
import { useAccount } from "@/context/AccountContext";
import { getCurrencySymbol } from "@/components/common/Money";
import {
  BarChart2,
  Scale,
  CreditCard,
  PieChart,
  DollarSign,
  Globe,
  ChevronRight,
  X,
  Calculator,
  ArrowRightLeft,
  RotateCcw,
} from "lucide-react";

type CalculatorType =
  | "PIP"
  | "LOT_SIZE"
  | "MARGIN"
  | "POSITION_SIZE"
  | "PROFIT"
  | "CONVERTER"
  | null;

const TOOL_CARDS = [
  {
    id: "PIP" as CalculatorType,
    title: "Pip Calculator",
    desc: "Calculate pip value based on lot size, currency pair, and account currency.",
    icon: BarChart2,
  },
  {
    id: "LOT_SIZE" as CalculatorType,
    title: "Lot Size Calculator",
    desc: "Determine the appropriate lot size based on account risk percentage.",
    icon: Scale,
  },
  {
    id: "MARGIN" as CalculatorType,
    title: "Margin Calculator",
    desc: "Estimate the margin required before opening a trade.",
    icon: CreditCard,
  },
  {
    id: "POSITION_SIZE" as CalculatorType,
    title: "Position Size Calculator",
    desc: "Calculate position size using stop loss points and account balance.",
    icon: PieChart,
  },
  {
    id: "PROFIT" as CalculatorType,
    title: "Profit Calculator",
    desc: "Estimate potential profit or loss before executing your trade.",
    icon: DollarSign,
  },
  {
    id: "CONVERTER" as CalculatorType,
    title: "Live Currency Converter",
    desc: "Convert world currencies in real-time including KSh (KES), USD, EUR, GBP, BTC & Gold.",
    icon: Globe,
  },
];

export default function QuickToolsPage() {
  const { selectedAccount } = useAccount();
  const [activeCalculator, setActiveCalculator] =
    useState<CalculatorType>(null);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Institutional Quick Tools
          </h1>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
            Precision Suite
          </span>
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          Precision margin, lot size, pip valuation, and multi-asset position
          sizing calibrated for{" "}
          <span className="text-blue-400 font-semibold">
            {selectedAccount?.name || "your account"} (
            {selectedAccount?.currency || "USD"})
          </span>
          .
        </p>
      </div>

      {/* Grid of Tool Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {TOOL_CARDS.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              className="p-5 rounded-2xl bg-[#0e101a] border border-[#1b1e30] hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-4 group shadow-xl"
            >
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveCalculator(tool.id)}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-blue-900/30"
              >
                <span>Open Calculator</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Calculator Modal Viewer */}
      {activeCalculator && (
        <CalculatorModal
          type={activeCalculator}
          onClose={() => setActiveCalculator(null)}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// CALCULATOR MODAL & FORMS
// -------------------------------------------------------------

function CalculatorModal({
  type,
  onClose,
}: {
  type: CalculatorType;
  onClose: () => void;
}) {
  const { selectedAccount } = useAccount();
  const accCurrency = selectedAccount?.currency || "USD";
  const defaultBalance = selectedAccount?.initialBalance || 10000;
  const currSym = getCurrencySymbol(accCurrency);

  // Editable Balance State (pre-filled with connected account balance)
  const [customBalance, setCustomBalance] = useState(defaultBalance.toString());

  // Pip Calculator State
  const [pipPair, setPipPair] = useState("EURUSD");
  const [pipLots, setPipLots] = useState("1.0");

  // Lot Size / Position Size State
  const [lotPair, setLotPair] = useState("EURUSD");
  const [riskPercent, setRiskPercent] = useState("1.0");
  const [stopLossPips, setStopLossPips] = useState("20");

  // Margin State
  const [marginPair, setMarginPair] = useState("EURUSD");
  const [marginLots, setMarginLots] = useState("1.0");
  const [leverage, setLeverage] = useState("100");

  // Profit State
  const [profitPair, setProfitPair] = useState("EURUSD");
  const [profitLots, setProfitLots] = useState("1.0");
  const [direction, setDirection] = useState<"BUY" | "SELL">("BUY");
  const [entryPrice, setEntryPrice] = useState("1.08500");
  const [exitPrice, setExitPrice] = useState("1.09000");

  // Inside CalculatorModal in src/app/tools/page.tsx

  const [fromAmount, setFromAmount] = useState("100");
  const [fromCurr, setFromCurr] = useState("USD");
  const [toCurr, setToCurr] = useState("KES");
  const [rates, setRates] = useState<Record<string, number>>({});
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [rateDate, setRateDate] = useState<string>("");

  // Fetch live rates whenever fromCurr changes or when modal loads
  useEffect(() => {
    if (type !== "CONVERTER") return;

    let isMounted = true;
    setIsLoadingRates(true);

    fetch(`https://open.er-api.com/v6/latest/${fromCurr}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.rates) {
          setRates(data.rates);
          setRateDate(new Date(data.time_last_update_utc).toLocaleDateString());
        }
      })
      .catch((err) => console.error("Failed to fetch live FX rates:", err))
      .finally(() => {
        if (isMounted) setIsLoadingRates(false);
      });

    return () => {
      isMounted = false;
    };
  }, [type, fromCurr]);

  // Pip Value Calculation Helper
  const calculatePipValue = (pair: string, lots: number) => {
    const isJpy = pair.includes("JPY");
    const isGold = pair === "XAUUSD";
    const isIndices = ["US30", "NAS100", "SPX500"].includes(pair);

    if (isGold) return lots * 10;
    if (isIndices) return lots * 1;
    if (isJpy) return (lots * 1000) / 150;
    return lots * 10;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0e101a] border border-[#1e2133] w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#1b1e30] pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Calculator className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {type === "PIP" && "Pip Value Calculator"}
                {type === "LOT_SIZE" && "Lot Size & Risk Calculator"}
                {type === "MARGIN" && "Required Margin Calculator"}
                {type === "POSITION_SIZE" && "Position Sizing Calculator"}
                {type === "PROFIT" && "Trade Profit / Loss Estimator"}
                {type === "CONVERTER" && "Live Currency Converter"}
              </h2>
              <span className="text-[10px] text-zinc-400 font-mono">
                Account Currency: {accCurrency} ({currSym})
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1b1e30]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 1. PIP CALCULATOR */}
        {type === "PIP" && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-400 block mb-1">
                  Currency Pair / Asset
                </label>
                <select
                  value={pipPair}
                  onChange={(e) => setPipPair(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#141624] border border-[#232740] text-white"
                >
                  <option value="EURUSD">EUR/USD</option>
                  <option value="GBPUSD">GBP/USD</option>
                  <option value="USDJPY">USD/JPY</option>
                  <option value="XAUUSD">XAU/USD (Gold)</option>
                  <option value="NAS100">NAS100</option>
                  <option value="US30">US30</option>
                </select>
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">
                  Trade Size (Lots)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={pipLots}
                  onChange={(e) => setPipLots(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#141624] border border-[#232740] text-white font-mono"
                />
              </div>
            </div>

            {/* Result Box */}
            <div className="p-4 rounded-2xl bg-[#121424] border border-blue-500/30 flex items-center justify-between">
              <span className="text-zinc-400">Value Per Pip:</span>
              <span className="text-xl font-bold font-mono text-blue-400">
                {currSym}
                {calculatePipValue(pipPair, parseFloat(pipLots) || 0).toFixed(
                  2,
                )}
              </span>
            </div>
          </div>
        )}

        {/* 2. LOT SIZE & POSITION SIZE CALCULATOR */}
        {(type === "LOT_SIZE" || type === "POSITION_SIZE") && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-400 block mb-1">Asset Pair</label>
                <select
                  value={lotPair}
                  onChange={(e) => setLotPair(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#141624] border border-[#232740] text-white"
                >
                  <option value="EURUSD">EUR/USD</option>
                  <option value="GBPUSD">GBP/USD</option>
                  <option value="USDJPY">USD/JPY</option>
                  <option value="XAUUSD">XAU/USD (Gold)</option>
                  <option value="NAS100">NAS100</option>
                  <option value="US30">US30</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-zinc-400">
                    Account Balance ({currSym})
                  </label>
                  <button
                    type="button"
                    onClick={() => setCustomBalance(defaultBalance.toString())}
                    className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
                    title="Reset to active account balance"
                  >
                    <RotateCcw className="h-2.5 w-2.5" />
                    <span>Auto ({defaultBalance.toLocaleString()})</span>
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono">
                    {currSym}
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={customBalance}
                    onChange={(e) => setCustomBalance(e.target.value)}
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-[#141624] border border-[#232740] text-white font-mono focus:outline-none focus:border-blue-500"
                    placeholder="Enter custom balance..."
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-400 block mb-1">Risk (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#141624] border border-[#232740] text-white font-mono"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">
                  Stop Loss (Pips / Points)
                </label>
                <input
                  type="number"
                  step="1"
                  value={stopLossPips}
                  onChange={(e) => setStopLossPips(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#141624] border border-[#232740] text-white font-mono"
                />
              </div>
            </div>

            {(() => {
              const numericBal = parseFloat(customBalance) || 0;
              const riskAmount =
                (numericBal * (parseFloat(riskPercent) || 0)) / 100;
              const sl = parseFloat(stopLossPips) || 1;
              const pipValFor1Lot = calculatePipValue(lotPair, 1);
              const calculatedLots = riskAmount / (sl * pipValFor1Lot);

              return (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-[#121424] border border-[#232740]">
                    <span className="text-zinc-400 block text-[10px]">
                      Total Risk at Stake
                    </span>
                    <span className="text-lg font-bold font-mono text-rose-400">
                      {currSym}
                      {riskAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#121424] border border-blue-500/30">
                    <span className="text-zinc-400 block text-[10px]">
                      Recommended Lot Size
                    </span>
                    <span className="text-lg font-bold font-mono text-blue-400">
                      {calculatedLots > 0 ? calculatedLots.toFixed(2) : "0.00"}{" "}
                      Lots
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* 3. MARGIN CALCULATOR */}
        {type === "MARGIN" && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-zinc-400 block mb-1">Pair</label>
                <select
                  value={marginPair}
                  onChange={(e) => setMarginPair(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#141624] border border-[#232740] text-white"
                >
                  <option value="EURUSD">EUR/USD</option>
                  <option value="GBPUSD">GBP/USD</option>
                  <option value="USDJPY">USD/JPY</option>
                  <option value="XAUUSD">XAU/USD</option>
                </select>
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Lot Size</label>
                <input
                  type="number"
                  step="0.01"
                  value={marginLots}
                  onChange={(e) => setMarginLots(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#141624] border border-[#232740] text-white font-mono"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">
                  Leverage (1:X)
                </label>
                <select
                  value={leverage}
                  onChange={(e) => setLeverage(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#141624] border border-[#232740] text-white font-mono"
                >
                  <option value="30">1:30</option>
                  <option value="50">1:50</option>
                  <option value="100">1:100</option>
                  <option value="200">1:200</option>
                  <option value="500">1:500</option>
                  <option value="1000">1:1000</option>
                </select>
              </div>
            </div>

            {(() => {
              const contractSize = marginPair === "XAUUSD" ? 100 : 100000;
              const notional = (parseFloat(marginLots) || 0) * contractSize;
              const reqMargin = notional / (parseFloat(leverage) || 100);

              return (
                <div className="p-4 rounded-2xl bg-[#121424] border border-blue-500/30 flex items-center justify-between">
                  <span className="text-zinc-400">Required Margin:</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {currSym}
                    {reqMargin.toFixed(2)}
                  </span>
                </div>
              );
            })()}
          </div>
        )}

        {/* 4. PROFIT / LOSS CALCULATOR */}
        {type === "PROFIT" && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-zinc-400 block mb-1">Pair</label>
                <select
                  value={profitPair}
                  onChange={(e) => setProfitPair(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#141624] border border-[#232740] text-white"
                >
                  <option value="EURUSD">EUR/USD</option>
                  <option value="GBPUSD">GBP/USD</option>
                  <option value="USDJPY">USD/JPY</option>
                  <option value="XAUUSD">XAU/USD</option>
                </select>
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Direction</label>
                <select
                  value={direction}
                  onChange={(e) =>
                    setDirection(e.target.value as "BUY" | "SELL")
                  }
                  className="w-full p-2.5 rounded-xl bg-[#141624] border border-[#232740] text-white font-semibold"
                >
                  <option value="BUY">BUY / LONG</option>
                  <option value="SELL">SELL / SHORT</option>
                </select>
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Lots</label>
                <input
                  type="number"
                  step="0.01"
                  value={profitLots}
                  onChange={(e) => setProfitLots(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#141624] border border-[#232740] text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-400 block mb-1">Entry Price</label>
                <input
                  type="number"
                  step="any"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#141624] border border-[#232740] text-white font-mono"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Exit Price</label>
                <input
                  type="number"
                  step="any"
                  value={exitPrice}
                  onChange={(e) => setExitPrice(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#141624] border border-[#232740] text-white font-mono"
                />
              </div>
            </div>

            {(() => {
              const diff =
                direction === "BUY"
                  ? (parseFloat(exitPrice) || 0) - (parseFloat(entryPrice) || 0)
                  : (parseFloat(entryPrice) || 0) -
                    (parseFloat(exitPrice) || 0);

              const multiplier = profitPair === "XAUUSD" ? 100 : 100000;
              const estPnl = diff * (parseFloat(profitLots) || 0) * multiplier;

              return (
                <div className="p-4 rounded-2xl bg-[#121424] border border-blue-500/30 flex items-center justify-between">
                  <span className="text-zinc-400">Estimated Outcome:</span>
                  <span
                    className={`text-xl font-bold font-mono ${
                      estPnl >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {estPnl >= 0 ? "+" : ""}
                    {currSym}
                    {estPnl.toFixed(2)}
                  </span>
                </div>
              );
            })()}
          </div>
        )}

        {/* 5. LIVE CURRENCY CONVERTER */}
        {/* 5. LIVE CURRENCY CONVERTER */}
        {type === "CONVERTER" && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-5 items-center gap-2">
              <div className="col-span-2">
                <label className="text-zinc-400 block mb-1">Amount</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#141624] border border-[#232740] text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="col-span-1">
                <label className="text-zinc-400 block mb-1">From</label>
                <select
                  value={fromCurr}
                  onChange={(e) => setFromCurr(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#141624] border border-[#232740] text-white font-mono"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="KES">KES (KSh)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="AUD">AUD ($)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="CHF">CHF</option>
                </select>
              </div>

              <div className="col-span-1 flex justify-center pt-5">
                <button
                  type="button"
                  onClick={() => {
                    const temp = fromCurr;
                    setFromCurr(toCurr);
                    setToCurr(temp);
                  }}
                  className="p-2 rounded-lg bg-[#141624] border border-[#232740] hover:text-white text-zinc-400 transition-colors"
                  title="Swap currencies"
                >
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="col-span-1">
                <label className="text-zinc-400 block mb-1">To</label>
                <select
                  value={toCurr}
                  onChange={(e) => setToCurr(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#141624] border border-[#232740] text-white font-mono"
                >
                  <option value="KES">KES (KSh)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="AUD">AUD ($)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="CHF">CHF</option>
                </select>
              </div>
            </div>

            {/* Live Output Card */}
            {(() => {
              const rate = rates[toCurr] || 1;
              const parsedAmount = parseFloat(fromAmount) || 0;
              const converted = parsedAmount * rate;

              return (
                <div className="p-4 rounded-2xl bg-[#121424] border border-blue-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-zinc-400 block text-[11px]">
                      Converted Outcome
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {isLoadingRates
                        ? "Fetching market rates..."
                        : `1 ${fromCurr} = ${rate.toFixed(4)} ${toCurr} ${rateDate ? `(${rateDate})` : ""}`}
                    </span>
                  </div>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {isLoadingRates ? (
                      <span className="text-zinc-500 text-sm">Updating...</span>
                    ) : (
                      `${converted.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} ${toCurr}`
                    )}
                  </span>
                </div>
              );
            })()}
          </div>
        )}
        <div className="flex justify-end pt-2 border-t border-[#1b1e30]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
