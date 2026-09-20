"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAccount } from "@/context/AccountContext";
import { TradeItem } from "@/components/trades/EditTradeModal";
import { CashFlowModal } from "./CashFlowModal";
import { AccountTransaction } from "@/app/api/accounts/transactions/route";
import {
  Activity,
  Flame,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";

export default function DashboardContent() {
  const { selectedAccountId, selectedAccount } = useAccount();
  const [trades, setTrades] = useState<TradeItem[]>([]);
  const [transactions, setTransactions] = useState<AccountTransaction[]>([]);
  const [isCashFlowOpen, setIsCashFlowOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    balance: number;
    tradePnl: number;
    x: number;
    y: number;
  } | null>(null);

  // Fetch Trades
  const fetchTrades = useCallback(async () => {
    if (!selectedAccountId) return;
    try {
      const res = await fetch(`/api/trades?accountId=${selectedAccountId}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setTrades(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load trades:", err);
    }
  }, [selectedAccountId]);

  // Fetch Cash Flow Transactions
  const fetchTransactions = useCallback(async () => {
    if (!selectedAccountId) return;
    try {
      const res = await fetch(
        `/api/accounts/transactions?accountId=${selectedAccountId}`,
        { cache: "no-store" },
      );
      if (res.ok) {
        const data = await res.json();
        setTransactions(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load transactions:", err);
    }
  }, [selectedAccountId]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchTrades(), fetchTransactions()]).finally(() => {
      setIsLoading(false);
    });
  }, [fetchTrades, fetchTransactions]);

  // Cash flow totals
  const totalWithdrawn = useMemo(() => {
    return transactions
      .filter((t) => t.type === "WITHDRAWAL")
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const totalDeposited = useMemo(() => {
    return transactions
      .filter((t) => t.type === "DEPOSIT")
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const sortedTrades = useMemo(() => {
    return [...trades].sort(
      (a, b) =>
        new Date(a.closeTime).getTime() - new Date(b.closeTime).getTime(),
    );
  }, [trades]);

  const initialBalance = selectedAccount?.initialBalance || 10000;
  const totalNetPnL = trades.reduce((acc, t) => acc + t.pnl, 0);

  // Adjusted balance taking cash flow into account
  const currentBalance =
    initialBalance + totalNetPnL + totalDeposited - totalWithdrawn;

  const totalTrades = trades.length;
  const winners = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl < 0);
  const winRate =
    totalTrades > 0 ? ((winners.length / totalTrades) * 100).toFixed(1) : "0.0";

  const totalGains = winners.reduce((acc, t) => acc + t.pnl, 0);
  const totalLosses = Math.abs(losses.reduce((acc, t) => acc + t.pnl, 0));
  const profitFactor =
    totalLosses > 0
      ? (totalGains / totalLosses).toFixed(2)
      : totalGains > 0
        ? "MAX"
        : "0.00";

  // Today's PnL
  const todayStr = new Date().toISOString().split("T")[0];
  const todayTrades = trades.filter(
    (t) => new Date(t.closeTime).toISOString().split("T")[0] === todayStr,
  );
  const todayPnL = todayTrades.reduce((acc, t) => acc + t.pnl, 0);

  // Equity Curve Progression
  const equityPoints = useMemo(() => {
    let runningBalance = initialBalance;
    const points = [
      {
        label: "Start",
        balance: initialBalance,
        date: "Initial Deposit",
        tradePnl: 0,
      },
    ];

    sortedTrades.forEach((trade, i) => {
      runningBalance += trade.pnl;
      points.push({
        label: `T${i + 1}`,
        balance: runningBalance,
        date: new Date(trade.closeTime).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        tradePnl: trade.pnl,
      });
    });

    return points;
  }, [sortedTrades, initialBalance]);

  // Equity Curve SVG coordinates
  const svgWidth = 700;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const { pathD, areaD, coordinates } = useMemo(() => {
    if (equityPoints.length === 0)
      return { pathD: "", areaD: "", coordinates: [] };

    const balances = equityPoints.map((p) => p.balance);
    const minBal = Math.min(...balances) * 0.98;
    const maxBal = Math.max(...balances) * 1.02;
    const range = maxBal - minBal || 1;

    const coords = equityPoints.map((p, index) => {
      const x =
        paddingX +
        (index / Math.max(equityPoints.length - 1, 1)) *
          (svgWidth - paddingX * 2);
      const y =
        svgHeight -
        paddingY -
        ((p.balance - minBal) / range) * (svgHeight - paddingY * 2);
      return { x, y, ...p };
    });

    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      const prev = coords[i - 1];
      const curr = coords[i];
      const midX = (prev.x + curr.x) / 2;
      d += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    const first = coords[0];
    const last = coords[coords.length - 1];
    const area = `${d} L ${last.x} ${svgHeight - 10} L ${first.x} ${svgHeight - 10} Z`;

    return { pathD: d, areaD: area, coordinates: coords };
  }, [equityPoints]);

  // Behavioral Stats
  const behavioralStats = useMemo(() => {
    if (totalTrades === 0) {
      return {
        discipline: 85,
        riskMgmt: 80,
        strategy: 80,
        psychology: 90,
        compositeScore: 84,
      };
    }

    const followedCount = trades.filter((t) => t.followedRules).length;
    const discipline = Math.round((followedCount / totalTrades) * 100);
    const rawWinRate = (winners.length / totalTrades) * 100;
    const strategy = Math.min(Math.round(rawWinRate * 1.15), 100);
    const pfNumeric = parseFloat(profitFactor) || 1.0;
    const riskMgmt = Math.min(Math.round(pfNumeric * 35 + 40), 100);
    const breaches = totalTrades - followedCount;
    const psychology = Math.max(100 - breaches * 12, 45);

    const compositeScore = Math.round(
      (discipline + riskMgmt + strategy + psychology) / 4,
    );

    return { discipline, riskMgmt, strategy, psychology, compositeScore };
  }, [trades, totalTrades, winners.length, profitFactor]);

  // Radar SVG Math
  const radarSize = 180;
  const center = radarSize / 2;
  const maxRadius = 70;

  const radarPolygonPoints = useMemo(() => {
    const { discipline, riskMgmt, strategy, psychology } = behavioralStats;
    const topY = center - (discipline / 100) * maxRadius;
    const rightX = center + (riskMgmt / 100) * maxRadius;
    const bottomY = center + (strategy / 100) * maxRadius;
    const leftX = center - (psychology / 100) * maxRadius;
    return `${center},${topY} ${rightX},${center} ${center},${bottomY} ${leftX},${center}`;
  }, [behavioralStats, center, maxRadius]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner with Cash Flow Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Command Center
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Live edge, behavioral variance, and execution metrics for{" "}
            <strong className="text-zinc-200">
              {selectedAccount?.name || "Account"}
            </strong>
          </p>
        </div>

        <button
          onClick={() => setIsCashFlowOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#141624] hover:bg-[#1c1f33] border border-[#232740] text-xs font-semibold text-zinc-200 hover:text-white transition-all flex items-center gap-2 shadow-sm"
        >
          <Wallet className="h-4 w-4 text-purple-400" />
          <span>Cash Flow / Payout</span>
        </button>
      </div>

      {/* KPI Cards (Now 5 items in a flexible grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Today's PnL */}
        <div className="p-5 rounded-2xl bg-[#0e101a] border border-[#1b1d2b] space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>TODAY&apos;S P&amp;L</span>
            <DollarSign className="h-4 w-4" />
          </div>
          <p
            className={`text-2xl font-bold font-mono ${
              todayPnL >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {todayPnL >= 0
              ? `+$${todayPnL.toFixed(2)}`
              : `-$${Math.abs(todayPnL).toFixed(2)}`}
          </p>
          <p className="text-[11px] text-zinc-500">Session outcome</p>
        </div>

        {/* Current Available Equity */}
        <div className="p-5 rounded-2xl bg-[#0e101a] border border-[#1b1d2b] space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>CURRENT BALANCE</span>
            <Activity className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-white">
            $
            {currentBalance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-[11px] text-zinc-500">
            Deposit: ${initialBalance.toLocaleString()}
          </p>
        </div>

        {/* Total Withdrawn / Payouts Secured */}
        <div className="p-5 rounded-2xl bg-[#0e101a] border border-[#1b1d2b] space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>SECURED PAYOUTS</span>
            <ArrowDownRight className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400">
            $
            {totalWithdrawn.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-[11px] text-zinc-500">
            {transactions.filter((t) => t.type === "WITHDRAWAL").length}{" "}
            Withdrawals
          </p>
        </div>

        {/* Win Rate */}
        <div className="p-5 rounded-2xl bg-[#0e101a] border border-[#1b1d2b] space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>WIN RATE</span>
            <span className="text-zinc-500 text-[11px]">◎</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white">{winRate}%</p>
          <p className="text-[11px] text-zinc-500">
            Across {totalTrades} trades
          </p>
        </div>

        {/* Profit Factor */}
        <div className="p-5 rounded-2xl bg-[#0e101a] border border-[#1b1d2b] space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>PROFIT FACTOR</span>
            <Flame className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400">
            {profitFactor}
          </p>
          <p className="text-[11px] text-zinc-500">
            Net Growth: +${totalNetPnL.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Equity Curve & Behavioral DNA split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dynamic Equity Curve Panel */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-[#0e101a] border border-[#1b1d2b] space-y-4 shadow-xl flex flex-col justify-between relative">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                PORTFOLIO GROWTH
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Equity Curve
              </h2>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-zinc-500 block">
                Current Portfolio
              </span>
              <span className="font-mono text-sm font-bold text-emerald-400">
                $
                {currentBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          {/* SVG Vector Chart Area */}
          <div className="h-64 w-full rounded-2xl bg-[#121422] border border-[#1d2035] relative p-2 overflow-hidden flex items-center justify-center">
            {coordinates.length > 0 ? (
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="equityGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
                    <stop offset="70%" stopColor="#6366f1" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>

                  <linearGradient
                    id="strokeGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>

                <line
                  x1={paddingX}
                  y1={svgHeight * 0.25}
                  x2={svgWidth - paddingX}
                  y2={svgHeight * 0.25}
                  stroke="#1e2238"
                  strokeDasharray="3 3"
                />
                <line
                  x1={paddingX}
                  y1={svgHeight * 0.5}
                  x2={svgWidth - paddingX}
                  y2={svgHeight * 0.5}
                  stroke="#1e2238"
                  strokeDasharray="3 3"
                />
                <line
                  x1={paddingX}
                  y1={svgHeight * 0.75}
                  x2={svgWidth - paddingX}
                  y2={svgHeight * 0.75}
                  stroke="#1e2238"
                  strokeDasharray="3 3"
                />

                <path d={areaD} fill="url(#equityGradient)" />
                <path
                  d={pathD}
                  fill="none"
                  stroke="url(#strokeGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />

                {coordinates.map((pt, idx) => (
                  <g key={idx} className="cursor-pointer group">
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="4"
                      className="fill-purple-400 stroke-[#0e101a] stroke-2 group-hover:r-6 group-hover:fill-emerald-400 transition-all"
                      onMouseEnter={() =>
                        setHoveredPoint({
                          date: pt.date,
                          balance: pt.balance,
                          tradePnl: pt.tradePnl,
                          x: pt.x,
                          y: pt.y,
                        })
                      }
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  </g>
                ))}
              </svg>
            ) : (
              <p className="text-xs text-zinc-500 font-mono">
                No trade data to plot equity.
              </p>
            )}

            {hoveredPoint && (
              <div
                className="absolute z-20 pointer-events-none p-2.5 rounded-xl bg-[#0b0c14] border border-purple-500/40 text-xs shadow-2xl space-y-0.5"
                style={{
                  left: `${(hoveredPoint.x / svgWidth) * 90}%`,
                  top: `${hoveredPoint.y > 100 ? hoveredPoint.y - 75 : hoveredPoint.y + 15}px`,
                }}
              >
                <p className="text-[10px] text-zinc-400 font-mono">
                  {hoveredPoint.date}
                </p>
                <p className="text-sm font-bold font-mono text-white">
                  ${hoveredPoint.balance.toFixed(2)}
                </p>
                {hoveredPoint.tradePnl !== 0 && (
                  <p
                    className={`text-[11px] font-mono font-bold ${
                      hoveredPoint.tradePnl > 0
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    {hoveredPoint.tradePnl > 0 ? "+" : ""}$
                    {hoveredPoint.tradePnl.toFixed(2)}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono px-2 pt-1">
            <span>Deposit: ${initialBalance.toLocaleString()}</span>
            <span>{trades.length} Closed Executions</span>
          </div>
        </div>

        {/* Dynamic Cognitive Edge & Behavioral Radar */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-[#0e101a] border border-[#1b1d2b] space-y-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                COGNITIVE EDGE
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Behavioral Score
              </h2>
            </div>
            <span className="text-xl font-black font-mono text-purple-400">
              {behavioralStats.compositeScore}
              <span className="text-zinc-600 text-xs">/100</span>
            </span>
          </div>

          <div className="py-3 flex items-center justify-center relative">
            <svg
              width={radarSize}
              height={radarSize}
              className="overflow-visible"
            >
              <circle
                cx={center}
                cy={center}
                r={maxRadius}
                fill="none"
                stroke="#1f2238"
                strokeWidth="1"
              />
              <circle
                cx={center}
                cy={center}
                r={maxRadius * 0.66}
                fill="none"
                stroke="#1f2238"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle
                cx={center}
                cy={center}
                r={maxRadius * 0.33}
                fill="none"
                stroke="#1f2238"
                strokeWidth="1"
                strokeDasharray="3 3"
              />

              <line
                x1={center}
                y1={center - maxRadius}
                x2={center}
                y2={center + maxRadius}
                stroke="#252945"
                strokeWidth="1"
              />
              <line
                x1={center - maxRadius}
                y1={center}
                x2={center + maxRadius}
                stroke="#252945"
                strokeWidth="1"
              />

              <polygon
                points={radarPolygonPoints}
                className="fill-purple-600/30 stroke-purple-400 stroke-2 transition-all duration-500 ease-out"
              />
              <circle
                cx={center}
                cy={center}
                r="3"
                className="fill-purple-300"
              />
            </svg>

            <span className="absolute top-1 text-[10px] font-bold text-zinc-400">
              Discipline ({behavioralStats.discipline}%)
            </span>
            <span className="absolute right-0 text-[10px] font-bold text-zinc-400">
              Risk ({behavioralStats.riskMgmt}%)
            </span>
            <span className="absolute bottom-1 text-[10px] font-bold text-zinc-400">
              Strategy ({behavioralStats.strategy}%)
            </span>
            <span className="absolute left-0 text-[10px] font-bold text-zinc-400">
              Psychology ({behavioralStats.psychology}%)
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#141624] border border-[#202438] text-[11px] text-zinc-400 leading-relaxed text-center">
            {behavioralStats.compositeScore >= 85 ? (
              <span className="text-emerald-400 font-medium flex items-center justify-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                Institutional discipline. Execution tightly adheres to your
                trading edge.
              </span>
            ) : (
              <span className="text-amber-400 font-medium flex items-center justify-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                Rule variance detected. Review your stop-loss and lot sizing
                parameters.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Recent Cash Flow Ledger */}
      {transactions.length > 0 && (
        <div className="p-6 rounded-3xl bg-[#0e101a] border border-[#1b1d2b] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Wallet className="h-4 w-4 text-purple-400" />
              <span>Recent Cash Flow History</span>
            </h3>
            <span className="text-xs text-zinc-500 font-mono">
              Net Capital Flow:{" "}
              {totalDeposited - totalWithdrawn >= 0 ? "+" : ""}$
              {(totalDeposited - totalWithdrawn).toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {transactions.slice(0, 6).map((item) => {
              const isWithdrawal = item.type === "WITHDRAWAL";
              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-[#141624] border border-[#1f2238] flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      {isWithdrawal ? (
                        <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" />
                      ) : (
                        <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                      )}
                      <span className="font-bold text-white">{item.type}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-mono">
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      {item.note && ` • ${item.note}`}
                    </p>
                  </div>
                  <span
                    className={`font-black font-mono text-sm ${
                      isWithdrawal ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {isWithdrawal ? "-" : "+"}${item.amount.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cash Flow Modal */}
      {selectedAccountId && (
        <CashFlowModal
          isOpen={isCashFlowOpen}
          onClose={() => setIsCashFlowOpen(false)}
          accountId={selectedAccountId}
          onSuccess={() => {
            fetchTransactions();
          }}
        />
      )}
    </div>
  );
}
