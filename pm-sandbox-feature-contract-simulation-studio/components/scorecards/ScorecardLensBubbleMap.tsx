"use client";

import { useState } from "react";
import type { ScorecardChildSummary } from "@/types/scorecardRollup";

interface ScorecardLensBubbleMapProps {
  items: ScorecardChildSummary[];
}

const CHART = {
  width: 920,
  height: 330,
  marginLeft: 76,
  marginRight: 36,
  marginTop: 24,
  marginBottom: 46,
};

const plotWidth = CHART.width - CHART.marginLeft - CHART.marginRight;
const plotHeight = CHART.height - CHART.marginTop - CHART.marginBottom;

function formatMoneyCompact(amount: number) {
  const sign = amount < 0 ? "-" : "";
  const absolute = Math.abs(amount);
  if (absolute >= 1_000_000) return `${sign}$${(absolute / 1_000_000).toFixed(1)}M`;
  if (absolute >= 1_000) return `${sign}$${(absolute / 1_000).toFixed(1)}K`;
  return `${sign}$${absolute.toFixed(0)}`;
}

function formatNumber(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function captureRate(item: ScorecardChildSummary) {
  if (item.vbcPotentialDollars <= 0) return 0;
  return clamp((item.vbcEarnedDollars / item.vbcPotentialDollars) * 100, 0, 100);
}

function incentiveCaptureRate(item: ScorecardChildSummary) {
  if (item.potentialDollars <= 0) return 0;
  return clamp((item.achievedDollars / item.potentialDollars) * 100, 0, 100);
}

function bubbleTooltip(item: ScorecardChildSummary) {
  return [
    item.label,
    `Status: ${item.status}`,
    `Lives: ${formatNumber(item.attributedLives)}`,
    `Annualized expense: ${formatMoneyCompact(item.costAmount)}`,
    `VBC earned: ${formatMoneyCompact(item.vbcEarnedDollars)}`,
    `Budgeted VBC value: ${formatMoneyCompact(item.vbcPotentialDollars)}`,
    `Remaining opportunity: ${formatMoneyCompact(item.remainingVbcOpportunity)}`,
    `VBC capture rate: ${Math.round(captureRate(item))}%`,
    `Incentives captured: ${formatMoneyCompact(item.achievedDollars)} of ${formatMoneyCompact(item.potentialDollars)} budgeted`,
    `Incentive capture: ${Math.round(incentiveCaptureRate(item))}%`,
    `Composite quality: ${Math.round(item.qualityScore)}%`,
  ].join("\n");
}

function pointKey(item: ScorecardChildSummary) {
  return `${item.scopeType}:${item.id}`;
}

function statusBadgeClass(status: ScorecardChildSummary["status"]) {
  if (status === "On Track") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "At Risk") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-red-50 text-red-700 ring-red-200";
}

function BubbleTooltip({ item }: { item: ScorecardChildSummary }) {
  const vbcCapture = Math.round(captureRate(item));
  const incentiveCapture = Math.round(incentiveCaptureRate(item));

  const rows = [
    { label: "Budgeted VBC", value: formatMoneyCompact(item.vbcPotentialDollars), accent: "text-indigo-700" },
    { label: "VBC earned", value: formatMoneyCompact(item.vbcEarnedDollars), accent: item.vbcEarnedDollars >= 0 ? "text-emerald-700" : "text-red-700" },
    { label: "Capture rate", value: `${vbcCapture}%`, accent: vbcCapture >= 70 ? "text-emerald-700" : vbcCapture >= 40 ? "text-amber-700" : "text-red-700" },
    { label: "Remaining", value: formatMoneyCompact(item.remainingVbcOpportunity), accent: "text-amber-700" },
    { label: "Annualized expense", value: formatMoneyCompact(item.costAmount), accent: "text-slate-900" },
    { label: "Lives", value: formatNumber(item.attributedLives), accent: "text-slate-900" },
    { label: "Incentives", value: `${formatMoneyCompact(item.achievedDollars)} of ${formatMoneyCompact(item.potentialDollars)} budgeted`, accent: "text-slate-900" },
    { label: "Composite quality", value: `${Math.round(item.qualityScore)}%`, accent: "text-slate-900" },
  ];

  return (
    <div className="pointer-events-none absolute right-5 top-5 z-10 w-80 rounded-2xl border border-slate-200 bg-white/95 p-4 text-left shadow-xl shadow-slate-900/15 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-slate-900">{item.label}</p>
          <p className="mt-0.5 text-xs font-medium capitalize text-slate-500">{item.scopeType} lens</p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${statusBadgeClass(item.status)}`}>
          {item.status}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
        {rows.map((row) => (
          <div key={row.label}>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{row.label}</p>
            <p className={`mt-0.5 text-sm font-black tabular-nums ${row.accent}`}>{row.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2">
        <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-slate-500">
          <span>Incentive capture</span>
          <span>{incentiveCapture}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${incentiveCapture}%` }} />
        </div>
      </div>
    </div>
  );
}

function statusColor(status: ScorecardChildSummary["status"]) {
  if (status === "On Track") return { fill: "#0f766e", stroke: "#115e59", label: "On track" };
  if (status === "At Risk") return { fill: "#d97706", stroke: "#b45309", label: "At risk" };
  return { fill: "#dc2626", stroke: "#b91c1c", label: "Off track" };
}

export default function ScorecardLensBubbleMap({ items }: ScorecardLensBubbleMapProps) {
  const [activePointKey, setActivePointKey] = useState<string | null>(null);
  const maxPotential = Math.max(...items.map((item) => item.vbcPotentialDollars), 1);
  const maxCost = Math.max(...items.map((item) => item.costAmount), 1);
  const xMid = CHART.marginLeft + plotWidth / 2;
  const yMid = CHART.marginTop + plotHeight / 2;

  const points = items.map((item) => {
    const x = CHART.marginLeft + (item.vbcPotentialDollars / maxPotential) * plotWidth;
    const y = CHART.marginTop + (1 - captureRate(item) / 100) * plotHeight;
    const radius = 7 + Math.sqrt(item.costAmount / maxCost) * 18;
    const color = statusColor(item.status);

    return {
      item,
      x,
      y,
      radius,
      color,
      capture: captureRate(item),
    };
  });
  const activePoint = points.find((point) => pointKey(point.item) === activePointKey);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#005A74]">Portfolio lens map</p>
          <h3 className="mt-1 text-base font-bold text-slate-900">Budgeted VBC vs value capture</h3>
          <p className="mt-1 text-sm leading-5 text-slate-600">
            Bubble size represents annualized expense. Use the lower-right quadrant to find large value pools with low capture.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-2.5">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
          {(["On Track", "At Risk", "Off Track"] as const).map((status) => {
            const color = statusColor(status);
            return (
              <span key={status} className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color.fill }} />
                {color.label}
              </span>
            );
          })}
        </div>
        <p className="text-xs font-semibold text-slate-500">Bubble size = annualized expense</p>
      </div>

      <div className="relative overflow-x-auto px-3 pb-4 pt-1">
        {activePoint && <BubbleTooltip item={activePoint.item} />}
        <svg
          viewBox={`0 0 ${CHART.width} ${CHART.height}`}
          role="img"
          aria-label="Bubble chart comparing budgeted VBC value against VBC capture rate, sized by annualized expense"
          className="h-auto w-full min-w-[640px]"
        >
          <rect x={CHART.marginLeft} y={CHART.marginTop} width={plotWidth} height={plotHeight} fill="#ffffff" />

          {[0, 50, 100].map((tick) => {
            const y = CHART.marginTop + (1 - tick / 100) * plotHeight;
            return (
              <g key={`y-${tick}`}>
                <line x1={CHART.marginLeft} x2={CHART.width - CHART.marginRight} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="4 6" />
                <text x={CHART.marginLeft - 14} y={y + 4} textAnchor="end" className="fill-slate-400 text-[11px] font-semibold">
                  {tick}%
                </text>
              </g>
            );
          })}

          {[0, 0.5, 1].map((fraction) => {
            const x = CHART.marginLeft + fraction * plotWidth;
            const value = maxPotential * fraction;
            return (
              <g key={`x-${fraction}`}>
                <line x1={x} x2={x} y1={CHART.marginTop} y2={CHART.marginTop + plotHeight} stroke="#e2e8f0" strokeDasharray="4 6" />
                <text x={x} y={CHART.marginTop + plotHeight + 25} textAnchor="middle" className="fill-slate-400 text-[11px] font-semibold">
                  {formatMoneyCompact(value)}
                </text>
              </g>
            );
          })}

          <line x1={xMid} x2={xMid} y1={CHART.marginTop} y2={CHART.marginTop + plotHeight} stroke="#cbd5e1" strokeDasharray="6 7" />
          <line x1={CHART.marginLeft} x2={CHART.width - CHART.marginRight} y1={yMid} y2={yMid} stroke="#cbd5e1" strokeDasharray="6 7" />

          <text x={CHART.marginLeft + 12} y={CHART.marginTop + 18} className="fill-slate-400 text-[10px] font-bold uppercase tracking-wide">
            Lower budget / high capture
          </text>
          <text x={xMid + 12} y={CHART.marginTop + 18} className="fill-emerald-700 text-[10px] font-bold uppercase tracking-wide">
            Protect & scale
          </text>
          <text x={xMid + 12} y={yMid + 20} className="fill-amber-700 text-[10px] font-bold uppercase tracking-wide">
            Prioritize value capture
          </text>

          {points.map(({ item, x, y, radius, color }) => {
            const key = pointKey(item);
            const isActive = key === activePointKey;
            const bubble = (
              <g className="cursor-pointer transition-opacity">
                {isActive && (
                  <circle
                    cx={x}
                    cy={y}
                    r={radius + 5}
                    fill="none"
                    stroke="#0f172a"
                    strokeOpacity="0.18"
                    strokeWidth="6"
                  />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={radius}
                  fill={color.fill}
                  fillOpacity={isActive ? "0.88" : "0.68"}
                  stroke={isActive ? "#0f172a" : color.stroke}
                  strokeWidth={isActive ? "3" : "2"}
                />
              </g>
            );

            return item.href ? (
              <a
                key={key}
                href={item.href}
                aria-label={`Open ${item.label} scorecard`}
                onMouseEnter={() => setActivePointKey(key)}
                onMouseLeave={() => setActivePointKey(null)}
                onFocus={() => setActivePointKey(key)}
                onBlur={() => setActivePointKey(null)}
              >
                {bubble}
              </a>
            ) : (
              <g
                key={key}
                tabIndex={0}
                role="img"
                aria-label={bubbleTooltip(item)}
                onMouseEnter={() => setActivePointKey(key)}
                onMouseLeave={() => setActivePointKey(null)}
                onFocus={() => setActivePointKey(key)}
                onBlur={() => setActivePointKey(null)}
              >
                {bubble}
              </g>
            );
          })}

          <text x={CHART.marginLeft + plotWidth / 2} y={CHART.height - 16} textAnchor="middle" className="fill-slate-600 text-[12px] font-bold">
            Budgeted VBC Value
          </text>
          <text
            x={18}
            y={CHART.marginTop + plotHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90 18 ${CHART.marginTop + plotHeight / 2})`}
            className="fill-slate-600 text-[12px] font-bold"
          >
            VBC Capture Rate
          </text>
        </svg>
      </div>
    </section>
  );
}
