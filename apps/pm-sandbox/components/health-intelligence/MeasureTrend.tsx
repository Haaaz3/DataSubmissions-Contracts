"use client";
import { useState } from "react";
import type { MeasureObligation, SharedMeasureFamily, MeasureDefinition } from "@/data/synthetic/sharedMeasures";

export function MeasureTrendChart({ obligation, direction, compact = false }: { obligation: MeasureObligation; direction: MeasureDefinition["direction"]; compact?: boolean }) {
  const points = obligation.history.map(point => ({ ...point, rate: point.eligible ? point.numerator / point.eligible * 100 : null }));
  const first = points[0]?.rate;
  const last = points.at(-1)?.rate;
  const delta = first == null || last == null ? null : last - first;
  const improved = delta !== null && (direction === "Higher is better" ? delta > 0 : delta < 0);
  const tone = delta === 0 || delta === null ? "#64748b" : improved ? "#047857" : "#b45309";
  const width = compact ? 200 : 620;
  const height = compact ? 64 : 180;
  const left = compact ? 6 : 38;
  const bottom = compact ? 12 : 30;
  const x = (index: number) => left + index / Math.max(1, points.length - 1) * (width - left - 14);
  const y = (rate: number) => 10 + (100 - rate) / 100 * (height - bottom - 10);
  const targetY = y(obligation.impact.targetPercent);
  return <figure className={compact ? "w-52 max-w-full" : "min-w-0"}>
    <figcaption className="flex flex-wrap justify-between gap-2 text-xs text-slate-500"><span>{compact ? "Apr–Sep 2026" : `${obligation.definitionId} · ${direction}`}</span><span className="font-semibold" style={{ color: tone }}>{delta === null ? "No trend" : `${delta > 0 ? "+" : ""}${delta.toFixed(1)} pp · ${delta === 0 ? "Stable" : improved ? "Improving" : "Declining"}`}</span></figcaption>
    <svg viewBox={`0 0 ${width} ${height}`} className={compact ? "h-16 w-full" : "mt-2 h-44 w-full"} role="img" aria-label={`${obligation.label} performance, April to September 2026; target ${obligation.impact.targetPercent} percent; ${points.map(point => `${point.month}: ${point.rate?.toFixed(1) ?? "no rate"} percent`).join(", ")}`}>
      {!compact && [0, 50, 100].map(rate => <g key={rate}><line x1={left} x2={width - 14} y1={y(rate)} y2={y(rate)} stroke="#e2e8f0" /><text x="1" y={y(rate) + 4} fontSize="10" fill="#64748b">{rate}%</text></g>)}
      <line x1={left} x2={width - 14} y1={targetY} y2={targetY} stroke="#94a3b8" strokeDasharray="4 4" />
      <polyline points={points.filter(point => point.rate !== null).map(point => `${x(points.indexOf(point))},${y(point.rate!)}`).join(" ")} fill="none" stroke={tone} strokeWidth="2.5" />
      {points.map((point, index) => <g key={point.month}>{point.rate !== null && <circle cx={x(index)} cy={y(point.rate)} r={compact ? 2 : 3.5} fill={tone}><title>{`${point.month}: ${point.rate.toFixed(1)}% (${point.numerator.toLocaleString("en-US")} / ${point.eligible.toLocaleString("en-US")})`}</title></circle>}{!compact && <text x={x(index)} y={height - 7} textAnchor="middle" fontSize="10" fill="#64748b">{point.month.slice(0, 3)}</text>}</g>)}
    </svg>
    {!compact && <p className="text-xs text-slate-500">Dashed line: {obligation.impact.targetPercent}% target · Modeled monthly snapshots</p>}
  </figure>;
}

export default function MeasureTrend({ family, obligations }: { family: SharedMeasureFamily; obligations: MeasureObligation[] }) {
  const [selectedId, setSelectedId] = useState(obligations[0]?.id);
  const selected = obligations.find(item => item.id === selectedId) ?? obligations[0];
  if (!selected) return null;
  const definition = family.definitions.find(item => item.id === selected.definitionId)!;
  return <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h5 className="text-sm font-semibold text-slate-900">Performance trend</h5><select aria-label={`Trend obligation for ${family.name}`} value={selected.id} onChange={event => setSelectedId(event.target.value)} className="max-w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700">{obligations.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
    <MeasureTrendChart obligation={selected} direction={definition.direction} />
  </div>;
}
