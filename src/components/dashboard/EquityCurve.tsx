"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface EquityPoint {
  date: string;
  balance: number;
}

interface EquityCurveProps {
  data: EquityPoint[];
  initialBalance: number;
}

export function EquityCurve({ data, initialBalance }: EquityCurveProps) {
  // If no trades exist yet, provide a baseline starting point
  const chartData =
    data.length > 0
      ? data
      : [
          { date: "Start", balance: initialBalance },
          { date: "Now", balance: initialBalance },
        ];

  const currentBalance = chartData[chartData.length - 1].balance;
  const isNetProfit = currentBalance >= initialBalance;

  return (
    <div className="p-6 rounded-2xl bg-[#0e101a] border border-[#1b1d2b] flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
            Portfolio Growth
          </span>
          <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
            Equity Curve
          </h3>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-zinc-400">Current Balance</span>
          <p
            className={`text-lg font-mono font-bold ${
              isNetProfit ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            $
            {currentBalance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9333ea" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#9333ea" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="#1a1c2b"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="date"
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
              domain={["auto", "auto"]}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#141624] border border-[#26283d] p-2.5 rounded-lg shadow-xl text-xs">
                      <p className="text-zinc-400">{payload[0].payload.date}</p>
                      <p className="text-emerald-400 font-bold font-mono text-sm mt-0.5">
                        ${Number(payload[0].value).toFixed(2)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#a855f7"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#equityGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
