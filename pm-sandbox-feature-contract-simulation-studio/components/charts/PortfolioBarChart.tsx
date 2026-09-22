"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Contract } from "@/types/contract";

interface PortfolioBarChartProps {
  contracts: Contract[];
}

// Shorten long contract names for the axis
function shortName(name: string): string {
  return name.length > 22 ? name.slice(0, 20) + "…" : name;
}

interface TipProps {
  active?: boolean;
  payload?: readonly { value?: number; dataKey?: string }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: TipProps) {
  if (!active || !payload?.length) return null;
  const current = payload.find((p) => p.dataKey === "currentPmpm")?.value as number;
  const target = payload.find((p) => p.dataKey === "targetPmpm")?.value as number;
  const over = current > target;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-lg">
      <p className="mb-2 text-xs font-semibold text-slate-500">{label}</p>
      <p className="text-sm text-slate-700">
        Current PMPM:{" "}
        <span className={`font-bold ${over ? "text-red-600" : "text-indigo-600"}`}>
          ${current?.toLocaleString()}
        </span>
      </p>
      <p className="text-sm text-slate-700">
        Target PMPM:{" "}
        <span className="font-bold text-amber-600">${target?.toLocaleString()}</span>
      </p>
      <p className={`mt-1 text-xs font-medium ${over ? "text-red-500" : "text-emerald-600"}`}>
        {over ? `$${current - target} over target` : `$${target - current} under target`}
      </p>
    </div>
  );
}

export default function PortfolioBarChart({ contracts }: PortfolioBarChartProps) {
  const data = contracts.map((c) => ({
    name: shortName(c.name),
    currentPmpm: c.currentPmpm,
    targetPmpm: c.targetPmpm,
    over: c.currentPmpm > c.targetPmpm,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${v}`}
          width={55}
        />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          content={(props) => <CustomTooltip active={props.active} payload={props.payload as any} label={String(props.label ?? "")} />}
          cursor={{ fill: "#f8fafc" }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, color: "#64748b", paddingTop: 12 }}
          iconType="circle"
          iconSize={8}
        />

        {/* Current PMPM — color by over/under target */}
        <Bar dataKey="currentPmpm" name="Current PMPM" radius={[4, 4, 0, 0]} maxBarSize={36}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.over ? "#f87171" : "#6366f1"} />
          ))}
        </Bar>

        {/* Target PMPM — always amber */}
        <Bar
          dataKey="targetPmpm"
          name="Target PMPM"
          fill="#fbbf24"
          radius={[4, 4, 0, 0]}
          maxBarSize={36}
          opacity={0.7}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
