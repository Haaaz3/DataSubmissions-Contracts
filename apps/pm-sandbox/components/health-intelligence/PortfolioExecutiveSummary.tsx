"use client";

import {
  hdiExecutiveMetrics,
  hdiObligations,
  type HdiObligationId,
} from "@/data/synthetic/healthIntelligenceObligations";
import { healthSystemSnapshot } from "@/data/synthetic/healthSystemObligations";

const money = (value: number) => value >= 1_000_000 ? `$${(value / 1_000_000).toFixed(1)}M` : `$${Math.round(value / 1_000)}K`;
const whole = (value: number) => value.toLocaleString("en-US");

function MetricTile({ label, value, detail, tone, trend }: { label: string; value: string; detail: string; tone: string; trend: string }) {
  return <div className="rounded-xl border border-[#e2e7ee] bg-white px-4 py-3 shadow-sm">
    <div className="flex items-center justify-between gap-2"><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-500">{label}</p><span className={`text-[10px] font-bold ${tone}`}>{trend}</span></div>
    <p className={`mt-2 text-2xl font-bold tracking-tight ${tone}`}>{value}</p>
    <p className="mt-1 text-[11px] leading-4 text-slate-500">{detail}</p>
  </div>;
}

function PortfolioSignalChart() {
  const width = 520;
  const height = 116;
  const risk = [112, 109, 106, 103, 101, 100];
  const lives = [91, 93, 95, 97, 99, 100];
  const points = (values: number[]) => values.map((value, index) => `${24 + (index / (values.length - 1)) * (width - 48)},${height - 18 - ((value - 88) / 24) * (height - 36)}`).join(" ");
  return <div className="rounded-xl border border-[#e2e7ee] bg-white p-4 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#28737a]">Portfolio signal</p><h3 className="mt-1 text-base font-bold tracking-tight text-slate-900">Risk and membership trend</h3><p className="mt-1 text-[11px] text-slate-500">Six refreshes, indexed to the latest portfolio snapshot.</p></div><div className="flex gap-3 text-[10px] font-semibold text-slate-500"><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-[#ed9b3b]" />Risk</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-[#5270e8]" />Lives</span></div></div>
    <svg className="mt-3 h-28 w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Portfolio risk and attributed lives trend over the last six refreshes">
      {[18, 50, 82].map((y) => <line key={y} x1="24" x2={width - 24} y1={y} y2={y} stroke="#e8edf2" strokeDasharray="3 4" />)}
      <polyline points={points(risk)} fill="none" stroke="#ed9b3b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={points(lives)} fill="none" stroke="#5270e8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {[risk, lives].map((series, seriesIndex) => <g key={seriesIndex}>{series.map((value, index) => <circle key={`${seriesIndex}-${index}`} cx={24 + (index / (series.length - 1)) * (width - 48)} cy={height - 18 - ((value - 88) / 24) * (height - 36)} r="3.5" fill={seriesIndex === 0 ? "#ed9b3b" : "#5270e8"} stroke="white" strokeWidth="1.5" />)}</g>)}
      {['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map((label, index) => <text key={label} x={24 + (index / 5) * (width - 48)} y={height - 1} textAnchor="middle" fill="#94a3b8" fontSize="9">{label}</text>)}
    </svg>
    <div className="mt-1 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] font-semibold text-slate-500"><span>Risk now <strong className="text-amber-700">{money(hdiExecutiveMetrics.atRiskDollars)}</strong></span><span>Lives now <strong className="text-slate-800">{whole(healthSystemSnapshot.attributedLives)}</strong></span></div>
  </div>;
}

function ProgramExposure({ onOpenProgram }: { onOpenProgram: (id: HdiObligationId) => void }) {
  const programs = [...hdiObligations].sort((a, b) => b.atRiskDollars - a.atRiskDollars);
  const maxRisk = programs[0]?.atRiskDollars ?? 1;
  return <section className="rounded-xl border border-[#e2e7ee] bg-white p-4 shadow-sm">
    <div className="flex items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#28737a]">Obligation exposure</p><h3 className="mt-1 text-base font-bold tracking-tight text-slate-900">Where the portfolio is concentrated</h3></div><span className="text-[10px] font-semibold text-slate-500">Risk · lives · opportunity</span></div>
    <div className="mt-3 grid gap-x-5 gap-y-2.5 sm:grid-cols-2">{programs.map((program) => <button key={program.id} type="button" onClick={() => onOpenProgram(program.id)} className="group text-left">
      <div className="flex items-center justify-between gap-2"><span className="truncate text-[11px] font-bold text-slate-800 group-hover:text-[#176b75]">{program.shortTitle}</span><span className="shrink-0 text-[11px] font-bold text-amber-700">{money(program.atRiskDollars)}</span></div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-[#f8c24d] to-[#ed9b3b]" style={{ width: `${Math.max(7, (program.atRiskDollars / maxRisk) * 100)}%` }} /></div>
      <div className="mt-1 flex justify-between text-[10px] text-slate-500"><span>{whole(program.lives)} lives</span><span>{money(program.recoverableDollars)} recoverable · {program.forecast.projected}% projected</span></div>
    </button>)}</div>
  </section>;
}

export default function PortfolioExecutiveSummary({ attentionCount, onOpenProgram }: { attentionCount: number; onOpenProgram: (id: HdiObligationId) => void }) {
  const sharedCohortLives = 1840 + 3120 + 2680 + 12100;
  const recoveryRate = Math.round((hdiExecutiveMetrics.recoverableDollars / hdiExecutiveMetrics.atRiskDollars) * 100);
  return <section className="space-y-3" aria-label="Portfolio executive summary">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetricTile label="Total risk" value={money(hdiExecutiveMetrics.atRiskDollars)} detail={`${hdiExecutiveMetrics.programs} programs · ${hdiExecutiveMetrics.obligations} active obligations`} tone="text-amber-700" trend="Portfolio" />
      <MetricTile label="Attributed lives" value={whole(healthSystemSnapshot.attributedLives)} detail={`${healthSystemSnapshot.hospitals} hospitals · ${healthSystemSnapshot.ambulatorySites} ambulatory sites`} tone="text-slate-900" trend="+3.1%" />
      <MetricTile label="Recoverable opportunity" value={money(hdiExecutiveMetrics.recoverableDollars)} detail={`${recoveryRate}% of modeled risk still actionable`} tone="text-emerald-700" trend="Prioritize" />
      <MetricTile label="Attention window" value={`${attentionCount} programs`} detail={`${hdiExecutiveMetrics.deadlinesIn30Days} deadlines inside 30 days`} tone="text-[#b85d12]" trend="Act now" />
    </div>
    <div className="grid gap-3 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
      <PortfolioSignalChart />
      <ProgramExposure onOpenProgram={onOpenProgram} />
    </div>
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-[#e2e7ee] bg-[#f8fbfa] px-4 py-3 text-[11px] font-semibold text-slate-600">
      <span><strong className="text-slate-900">{whole(sharedCohortLives)}</strong> shared-cohort lives across cross-program measures</span>
      <span><strong className="text-slate-900">{hdiExecutiveMetrics.obligations}</strong> obligations mapped to work</span>
      <span><strong className="text-emerald-700">{money(hdiExecutiveMetrics.recoverableDollars)}</strong> value available to recover</span>
      <span className="text-slate-500">Updated {healthSystemSnapshot.asOf}</span>
    </div>
  </section>;
}
