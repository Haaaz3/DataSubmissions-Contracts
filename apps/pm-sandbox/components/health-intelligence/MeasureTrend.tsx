"use client";
import type { MeasureObligation, MeasureDefinition } from "@/data/synthetic/sharedMeasures";
import { measureTrendData } from "@/lib/health-intelligence/measureOverview";

export function MeasureTrendChart({ obligation, direction }: { obligation: MeasureObligation; direction: MeasureDefinition["direction"] }) {
  const { points, first, last, delta, min, max } = measureTrendData(obligation);
  const improved = delta !== null && (direction === "Higher is better" ? delta > 0 : delta < 0);
  const tone = delta === 0 || delta === null ? "#64748b" : improved ? "#047857" : "#b45309";
  const width = 288;
  const height = 70;
  const left = 36;
  const x = (index: number) => left + index / Math.max(1, points.length - 1) * (width - left - 8);
  const y = (rate: number) => 8 + (max - rate) / (max - min) * (height - 16);
  const target = obligation.impact.targetPercent;
  const targetInRange = target >= min && target <= max;
  const period = points.length ? `${points[0].month}–${points.at(-1)!.month}` : "No snapshots";
  const format = (rate: number | null) => rate === null ? "—" : `${rate.toFixed(1)}%`;
  const targetLabel = `Target ${direction === "Higher is better" ? "≥" : "≤"}${target}%${targetInRange ? " · dashed" : target > max ? " · above plot" : " · below plot"}`;
  return <figure className="w-72 max-w-full" aria-label={`${obligation.label} trend`}>
    <figcaption className="flex flex-wrap justify-between gap-1 text-[11px] text-slate-500"><span>{period}</span><span className="font-semibold text-slate-700">{format(first)} → {format(last)}</span></figcaption>
    <svg viewBox={`0 0 ${width} ${height}`} className="my-1 h-[70px] w-full" role="img" aria-label={`${obligation.label} performance; zoomed scale ${min} to ${max} percent; ${targetLabel}; ${points.map(point => `${point.month}: ${format(point.rate)}`).join(", ")}`}>
      {[min, max].map(rate => <g key={rate}><line x1={left} x2={width - 8} y1={y(rate)} y2={y(rate)} stroke="#e2e8f0" /><text x="0" y={y(rate) + 3} fontSize="9" fill="#64748b">{`${rate}%`}</text></g>)}
      {targetInRange && <line x1={left} x2={width - 8} y1={y(target)} y2={y(target)} stroke="#94a3b8" strokeDasharray="4 4" />}
      {points.slice(1).map((point, index) => point.rate !== null && points[index].rate !== null ? <line key={point.month} x1={x(index)} y1={y(points[index].rate!)} x2={x(index + 1)} y2={y(point.rate)} stroke={tone} strokeWidth="2" /> : null)}
      {points.map((point, index) => point.rate !== null && <circle key={point.month} cx={x(index)} cy={y(point.rate)} r="2.5" fill={tone}><title>{`${point.month}: ${format(point.rate)} (${point.numerator.toLocaleString("en-US")} / ${point.eligible.toLocaleString("en-US")})`}</title></circle>)}
    </svg>
    <div className="flex flex-wrap justify-between gap-1 text-[10px]"><span className="font-semibold" style={{ color: tone }}>{delta === null ? "No trend" : `${delta > 0 ? "+" : ""}${delta.toFixed(1)} pp · ${delta === 0 ? "Stable" : improved ? "Improving" : "Declining"}`}</span><span className="text-slate-500">{targetLabel}</span></div>
  </figure>;
}
