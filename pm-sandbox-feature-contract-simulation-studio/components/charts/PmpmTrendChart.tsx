"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { MonthlyTrend } from "@/types/contract";

interface PmpmTrendChartProps {
  data: MonthlyTrend[];
  targetPmpm: number;
}

// Minimal tooltip props — avoids Recharts 3 generic variance issues
interface TipProps {
  active?: boolean;
  payload?: readonly { value?: number | string; name?: string }[];
  label?: string;
}

// Custom tooltip for richer hover display
function CustomTooltip({ active, payload, label }: TipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-lg">
      <p className="mb-1 text-xs font-semibold text-slate-500">{label}</p>
      <p className="text-sm font-bold text-slate-900">
        PMPM: <span className="text-indigo-600">${payload[0]?.value?.toLocaleString()}</span>
      </p>
      <p className="text-sm text-slate-600">
        Quality: <span className="font-medium">{payload[1]?.value}</span>
      </p>
    </div>
  );
}

export default function PmpmTrendChart({ data, targetPmpm }: PmpmTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="pmpmGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="qualityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
        />
        {/* Left Y axis — PMPM */}
        <YAxis
          yAxisId="pmpm"
          orientation="left"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${v}`}
          domain={["auto", "auto"]}
          width={55}
        />
        {/* Right Y axis — Quality score */}
        <YAxis
          yAxisId="quality"
          orientation="right"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          domain={[50, 100]}
          width={36}
        />

        <Tooltip
          content={(props) => (
            <CustomTooltip
              active={props.active}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              payload={props.payload as any}
              label={String(props.label ?? "")}
            />
          )}
        />

        {/* Target PMPM reference line */}
        <ReferenceLine
          yAxisId="pmpm"
          y={targetPmpm}
          stroke="#f59e0b"
          strokeDasharray="5 4"
          strokeWidth={1.5}
          label={{
            value: `Target $${targetPmpm}`,
            position: "insideTopRight",
            fontSize: 10,
            fill: "#f59e0b",
          }}
        />

        <Area
          yAxisId="pmpm"
          type="monotone"
          dataKey="pmpm"
          stroke="#6366f1"
          strokeWidth={2.5}
          fill="url(#pmpmGradient)"
          dot={{ r: 3, fill: "#6366f1", strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "#6366f1" }}
          name="PMPM"
        />
        <Area
          yAxisId="quality"
          type="monotone"
          dataKey="qualityScore"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#qualityGradient)"
          dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "#10b981" }}
          name="Quality"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
