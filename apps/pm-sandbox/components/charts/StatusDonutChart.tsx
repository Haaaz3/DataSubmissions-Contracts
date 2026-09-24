"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { ContractStatus } from "@/types/contract";

interface StatusDonutChartProps {
  counts: Record<ContractStatus, number>;
  size?: "sm" | "md";
}

const STATUS_COLORS: Record<ContractStatus, string> = {
  "On Track":  "#10b981",
  "At Risk":   "#f59e0b",
  "Off Track": "#f87171",
};

interface TipProps {
  active?: boolean;
  payload?: readonly { name?: string; value?: number }[];
}

function CustomTooltip({ active, payload }: TipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg text-sm">
      <span className="font-semibold text-slate-800">{payload[0].name}</span>
      <span className="ml-2 text-slate-500">{payload[0].value} contract{payload[0].value !== 1 ? "s" : ""}</span>
    </div>
  );
}

export default function StatusDonutChart({ counts, size = "md" }: StatusDonutChartProps) {
  const data = (Object.entries(counts) as [ContractStatus, number][])
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  const total = data.reduce((s, d) => s + d.value, 0);
  const chartSize = size === "sm" ? 92 : 140;
  const innerRadius = size === "sm" ? 26 : 42;
  const outerRadius = size === "sm" ? 40 : 62;
  const centerValueClass = size === "sm" ? "text-lg" : "text-2xl";
  const centerLabelClass = size === "sm" ? "text-[9px]" : "text-[10px]";

  return (
    <div className="relative flex items-center justify-center">
      <ResponsiveContainer width={chartSize} height={chartSize}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={STATUS_COLORS[entry.name as ContractStatus]} />
            ))}
          </Pie>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Tooltip content={(props) => <CustomTooltip active={props.active} payload={props.payload as any} />} />
        </PieChart>
      </ResponsiveContainer>
      {/* Centre label */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className={`${centerValueClass} font-bold text-slate-900`}>{total}</span>
        <span className={`${centerLabelClass} font-medium uppercase tracking-wide text-slate-400`}>Contracts</span>
      </div>
    </div>
  );
}
