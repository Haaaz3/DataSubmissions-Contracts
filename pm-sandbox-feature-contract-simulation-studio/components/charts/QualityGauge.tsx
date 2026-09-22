"use client";

import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

interface QualityGaugeProps {
  score: number; // 0–100
}

// Pick fill color based on score tier
function gaugeColor(score: number): string {
  if (score >= 85) return "#10b981"; // emerald
  if (score >= 75) return "#6366f1"; // indigo
  if (score >= 65) return "#f59e0b"; // amber
  return "#f87171";                  // red
}

export default function QualityGauge({ score }: QualityGaugeProps) {
  const color = gaugeColor(score);
  // RadialBar fills from 0 to `score`; background track at 100
  const data = [
    { value: 100, fill: "#f1f5f9" },  // track
    { value: score, fill: color },
  ];

  return (
    <div className="relative flex items-center justify-center">
      <ResponsiveContainer width={120} height={120}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="65%"
          outerRadius="100%"
          startAngle={220}
          endAngle={-40}
          data={data}
          barSize={10}
        >
          <RadialBar dataKey="value" background={false} cornerRadius={6} />
        </RadialBarChart>
      </ResponsiveContainer>
      {/* Centre label */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>{score}</span>
        <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Quality</span>
      </div>
    </div>
  );
}
