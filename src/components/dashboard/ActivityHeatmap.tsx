"use client";

import React from "react";

interface ActivityDay {
  date: string;
  count: number;
  netPnl: number;
}

interface ActivityHeatmapProps {
  activityDays: Record<string, { count: number; netPnl: number }>;
}

export function ActivityHeatmap({ activityDays }: ActivityHeatmapProps) {
  // Generate the last 42 days (6 weeks) for a clean dashboard grid
  const days: ActivityDay[] = [];
  const today = new Date();

  for (let i = 41; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const data = activityDays[dateStr] || { count: 0, netPnl: 0 };
    days.push({ date: dateStr, count: data.count, netPnl: data.netPnl });
  }

  return (
    <div className="p-6 rounded-2xl bg-[#0e101a] border border-[#1b1d2b]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
            Execution Frequency
          </span>
          <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
            Trading Activity
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#161826]" /> Inactive
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-rose-500/70" /> Loss Day
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Profit
            Day
          </span>
        </div>
      </div>

      <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto py-2">
        {days.map((day) => {
          let bg = "bg-[#141624] border border-[#1e2030]";
          if (day.count > 0) {
            bg =
              day.netPnl > 0
                ? "bg-emerald-500 shadow-sm shadow-emerald-500/20"
                : day.netPnl < 0
                  ? "bg-rose-500 shadow-sm shadow-rose-500/20"
                  : "bg-zinc-500";
          }

          return (
            <div
              key={day.date}
              title={`${day.date}: ${day.count} trades (P&L: $${day.netPnl.toFixed(2)})`}
              className={`h-5 w-5 rounded-md cursor-pointer transition-transform hover:scale-110 ${bg}`}
            />
          );
        })}
      </div>
    </div>
  );
}
