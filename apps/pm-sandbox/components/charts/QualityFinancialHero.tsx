"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { QualityFinancialHeroData } from "@/lib/qualityData";

type HeroMode = "trends" | "organizations" | "providers" | "validation";

export default function QualityFinancialHero({
  data,
  formatFinancial,
  scopeLabel,
  organizationRows,
  providerRows,
}: {
  data: QualityFinancialHeroData;
  formatFinancial: (value: number) => string;
  scopeLabel?: string | null;
  organizationRows?: Array<{
    name: string;
    qualityScore: number;
    careGaps: number;
    belowTargetMeasures: number;
  }>;
  providerRows?: Array<{
    name: string;
    qualityScore: number;
    careGaps: number;
    belowTargetMeasures: number;
  }>;
}) {
  const [mode, setMode] = useState<HeroMode>("trends");
  const [selectedMeasureId, setSelectedMeasureId] = useState<string | null>(data.measures[0]?.id ?? null);

  const selectedMeasure = useMemo(
    () => data.measures.find((measure) => measure.id === selectedMeasureId) ?? data.measures[0],
    [data.measures, selectedMeasureId]
  );

  const trendSeries = useMemo(() => {
    const months = data.measures[0]?.monthlyRates.map((item) => item.month) ?? [];
    return months.map((month, idx) => {
      const point: Record<string, string | number> = { month };
      data.measures.slice(0, 5).forEach((measure) => {
        point[measure.id] = measure.monthlyRates[idx]?.rate ?? measure.current;
      });
      return point;
    });
  }, [data.measures]);

  const measureTargetAverage = useMemo(() => {
    if (!data.measures.length) return 0;
    return Number(
      (
        data.measures.slice(0, 5).reduce((sum, measure) => sum + measure.target, 0) /
        Math.max(1, Math.min(5, data.measures.length))
      ).toFixed(1)
    );
  }, [data.measures]);

  const bottomOrganizationOutliers = useMemo(() => {
    return [...(organizationRows ?? [])]
      .sort((a, b) => a.qualityScore - b.qualityScore || b.careGaps - a.careGaps)
      .slice(0, 8);
  }, [organizationRows]);

  const bottomProviderOutliers = useMemo(() => {
    return [...(providerRows ?? [])]
      .sort((a, b) => a.qualityScore - b.qualityScore || b.careGaps - a.careGaps)
      .slice(0, 10);
  }, [providerRows]);

  const organizationAverage = useMemo(() => {
    if (!organizationRows?.length) return 0;
    return Number((organizationRows.reduce((sum, row) => sum + row.qualityScore, 0) / organizationRows.length).toFixed(1));
  }, [organizationRows]);

  const providerAverage = useMemo(() => {
    if (!providerRows?.length) return 0;
    return Number((providerRows.reduce((sum, row) => sum + row.qualityScore, 0) / providerRows.length).toFixed(1));
  }, [providerRows]);

  const topOpportunityValidation = useMemo(() => {
    const top = data.measures.slice(0, 5);
    const maxPatients = Math.max(1, ...top.map((measure) => measure.patientsLeftToTarget));
    const maxGap = Math.max(1, ...top.map((measure) => measure.gapMagnitude));
    const maxPotential = Math.max(1, ...top.map((measure) => measure.potential));

    return top.map((measure) => {
      const impactScore =
        (measure.patientsLeftToTarget / maxPatients) * 0.45 +
        (measure.gapMagnitude / maxGap) * 0.35 +
        (measure.potential / maxPotential) * 0.2;
      return {
        ...measure,
        impactScore: Number((impactScore * 100).toFixed(1)),
      };
    });
  }, [data.measures]);

  const modes: Array<{ id: HeroMode; label: string }> = [
    { id: "trends", label: "12-Month Trends" },
    { id: "organizations", label: "Organization Outliers" },
    { id: "providers", label: "Provider Outliers" },
    { id: "validation", label: "Top 5 Validation" },
  ];

  return (
    <div className="sketch-hero rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900 p-5 text-white shadow-2xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-200">Quality performance command center</p>
          <h3 className="mt-1 text-xl font-semibold">Measure Trend + Outlier Validation</h3>
          <p className="mt-1 text-xs text-indigo-200">
            {scopeLabel ? `${scopeLabel} · ` : ""}
            Understand 12-month quality movement, detect low-performing outliers, and validate top opportunities by impact.
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricPill label="Tracked measures" value={String(data.measures.length)} accent="text-emerald-200" />
        <MetricPill label="Avg current rate" value={`${Math.round(data.measures.reduce((sum, measure) => sum + measure.current, 0) / Math.max(1, data.measures.length))}%`} accent="text-cyan-200" />
        <MetricPill label="Avg target rate" value={`${Math.round(data.measures.reduce((sum, measure) => sum + measure.target, 0) / Math.max(1, data.measures.length))}%`} accent="text-amber-200" />
        <MetricPill
          label="Top-5 total impact"
          value={formatFinancial(data.measures.slice(0, 5).reduce((sum, measure) => sum + measure.potential, 0))}
          accent="text-rose-200"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {modes.map((item) => (
          <button
            key={item.id}
            onClick={() => setMode(item.id)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              mode === item.id
                ? "bg-white text-indigo-900"
                : "bg-white/10 text-indigo-100 hover:bg-white/20"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 h-[320px] rounded-xl border border-white/15 bg-slate-950/30 p-3">
        {mode === "trends" ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
              <YAxis domain={[30, 95]} tick={{ fill: "#cbd5e1", fontSize: 11 }} tickFormatter={(value) => `${value}%`} />
              <Tooltip
                formatter={(value) => {
                  const numericValue = typeof value === "number" ? value : Number(value);
                  return Number.isFinite(numericValue) ? `${numericValue}%` : "N/A";
                }}
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 10 }}
              />
              <ReferenceLine y={measureTargetAverage} stroke="#fbbf24" strokeDasharray="6 4" />
              {data.measures.slice(0, 5).map((measure, idx) => (
                <Line
                  key={measure.id}
                  type="monotone"
                  dataKey={measure.id}
                  name={measure.label}
                  stroke={selectedMeasure?.id === measure.id ? "#22d3ee" : ["#38bdf8", "#34d399", "#f472b6", "#f59e0b", "#a78bfa"][idx % 5]}
                  strokeWidth={selectedMeasure?.id === measure.id ? 3 : 2}
                  dot={{ r: 1.8 }}
                  onClick={() => setSelectedMeasureId(measure.id)}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : null}

        {mode === "organizations" ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bottomOrganizationOutliers} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" domain={[30, 100]} tick={{ fill: "#cbd5e1", fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#cbd5e1", fontSize: 11 }} width={140} />
              <Tooltip
                formatter={(value, key) => {
                  const numericValue = typeof value === "number" ? value : Number(value);
                  if (!Number.isFinite(numericValue)) return "N/A";
                  return String(key) === "qualityScore" ? `${numericValue}%` : `${numericValue}`;
                }}
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 10 }}
              />
              <ReferenceLine x={organizationAverage} stroke="#fbbf24" strokeDasharray="6 4" />
              <Bar dataKey="qualityScore" fill="#38bdf8" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : null}

        {mode === "providers" ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bottomProviderOutliers} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" domain={[30, 100]} tick={{ fill: "#cbd5e1", fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#cbd5e1", fontSize: 11 }} width={140} />
              <Tooltip
                formatter={(value, key) => {
                  const numericValue = typeof value === "number" ? value : Number(value);
                  if (!Number.isFinite(numericValue)) return "N/A";
                  return String(key) === "qualityScore" ? `${numericValue}%` : `${numericValue}`;
                }}
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 10 }}
              />
              <ReferenceLine x={providerAverage} stroke="#fbbf24" strokeDasharray="6 4" />
              <Bar dataKey="qualityScore" fill="#6366f1" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : null}

        {mode === "validation" ? (
          <div className="h-full overflow-y-auto space-y-2 text-xs text-indigo-100">
            {topOpportunityValidation.map((opportunity, idx) => (
              <div key={opportunity.id} className="rounded-lg border border-white/15 bg-white/5 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white">#{idx + 1} {opportunity.label}</p>
                  <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-[11px] font-semibold text-cyan-100">
                    Impact score {opportunity.impactScore}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <div className="rounded bg-slate-900/40 px-2 py-1.5">
                    <p className="text-[10px] text-indigo-200">Current / Target</p>
                    <p className="font-semibold text-white">{opportunity.current}% / {opportunity.target}%</p>
                  </div>
                  <div className="rounded bg-slate-900/40 px-2 py-1.5">
                    <p className="text-[10px] text-indigo-200">Gap</p>
                    <p className="font-semibold text-amber-200">+{opportunity.gapMagnitude}%</p>
                  </div>
                  <div className="rounded bg-slate-900/40 px-2 py-1.5">
                    <p className="text-[10px] text-indigo-200">Patients</p>
                    <p className="font-semibold text-white">{opportunity.patientsLeftToTarget.toLocaleString()}</p>
                  </div>
                  <div className="rounded bg-slate-900/40 px-2 py-1.5">
                    <p className="text-[10px] text-indigo-200">Impact</p>
                    <p className="font-semibold text-emerald-200">{formatFinancial(opportunity.potential)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-indigo-100">
        <span className="rounded-full bg-white/10 px-2 py-1 font-semibold">
          Focus: {selectedMeasure?.label ?? "All measures"}
        </span>
        {selectedMeasure ? (
          <span className="rounded-full bg-white/10 px-2 py-1">
            Current {selectedMeasure.current}% · Target {selectedMeasure.target}% · Patients {selectedMeasure.patientsLeftToTarget.toLocaleString()}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function MetricPill({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-indigo-200">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${accent}`}>{value}</p>
    </div>
  );
}
