"use client";

import { LineChart, Line } from "recharts";

interface SparklineProps {
  data: { value: number }[];
  stroke?: string;
}

export default function Sparkline({ data, stroke = "#6366f1" }: SparklineProps) {
  return (
    <LineChart width={120} height={36} data={data}>
      <Line type="monotone" dataKey="value" stroke={stroke} strokeWidth={2} dot={false} />
    </LineChart>
  );
}