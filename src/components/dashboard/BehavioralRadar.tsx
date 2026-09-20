"use client";

import React from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Tooltip,
} from "recharts";

interface BehavioralRadarProps {
  scores: {
    discipline: number;
    riskMgmt: number;
    consistency: number;
    strategy: number;
    psychology: number;
  };
  overallScore: number;
}

export function BehavioralRadar({
  scores,
  overallScore,
}: BehavioralRadarProps) {
  const radarData = [
    { subject: "Discipline", score: scores.discipline },
    { subject: "Risk Mgmt", score: scores.riskMgmt },
    { subject: "Consistency", score: scores.consistency },
    { subject: "Strategy", score: scores.strategy },
    { subject: "Psychology", score: scores.psychology },
  ];

  return (
    <div className="p-6 rounded-2xl bg-[#0e101a] border border-[#1b1d2b] flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
            Cognitive Edge
          </span>
          <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
            Behavioral Score
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-2xl font-bold font-mono text-purple-400">
              {overallScore}
            </span>
            <span className="text-xs text-zinc-500">/100</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid stroke="#1e2033" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#a1a1aa", fontSize: 11, fontWeight: 500 }}
            />
            <Radar
              name="Behavioral Score"
              dataKey="score"
              stroke="#a855f7"
              strokeWidth={2}
              fill="#9333ea"
              fillOpacity={0.3}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#141624] border border-[#26283d] p-2 rounded-md shadow-xl text-xs">
                      <p className="text-zinc-300 font-semibold">
                        {payload[0].payload.subject}
                      </p>
                      <p className="text-purple-400 font-mono font-bold mt-0.5">
                        {payload[0].value}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
