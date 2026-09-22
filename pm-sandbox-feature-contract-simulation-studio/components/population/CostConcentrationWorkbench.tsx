"use client";

import { useState } from "react";
import { getCostTierPatients } from "@/lib/contracts/costTierPatients";
import type {
  ContractPopulationCostTierFilter,
  ContractPopulationPatient,
  ContractPopulationSlice,
} from "@/types/contractPopulation";

type PrimaryCostTier = Extract<ContractPopulationCostTierFilter, "top_1" | "top_5" | "top_10">;

const costTierOptions: { key: PrimaryCostTier; label: string; helper: string; percent: 1 | 5 | 10 }[] = [
  { key: "top_1", label: "Top 1% of Members", helper: "Complex / catastrophic care", percent: 1 },
  { key: "top_5", label: "Top 5% of Members", helper: "Care management focus", percent: 5 },
  { key: "top_10", label: "Top 10% of Members", helper: "Broader prevention pool", percent: 10 },
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatCompactMoney(value: number) {
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return formatMoney(value);
}

function tierLabelToKey(label: string): PrimaryCostTier | undefined {
  if (label === "Top 1%") return "top_1";
  if (label === "Top 5%") return "top_5";
  if (label === "Top 10%") return "top_10";
  return undefined;
}

function buildConditionConcentration(patients: ContractPopulationPatient[]) {
  const total = Math.max(1, patients.length);
  const counts = new Map<string, number>();

  patients.forEach((patient) => {
    patient.chronicConditions.forEach((condition) => {
      counts.set(condition, (counts.get(condition) ?? 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .map(([condition, count]) => ({ condition, count, percent: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function pct(count: number, total: number) {
  return total ? Math.round((count / total) * 100) : 0;
}

function DriverBar({ label, value, max, tone }: { label: string; value: number; max: number; tone: string }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="font-semibold tabular-nums text-slate-900">{formatCompactMoney(value)}</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-slate-100">
        <div className={`h-2 rounded-full ${tone}`} style={{ width: `${Math.max(4, (value / Math.max(max, 1)) * 100)}%` }} />
      </div>
    </div>
  );
}

function careRelationship(patient: ContractPopulationPatient) {
  if (patient.lastAttributedVisitYearsAgo <= 1) return "Recently seen";
  return `${patient.lastAttributedVisitYearsAgo} years since PCP`;
}

function PatientTable({ patients }: { patients: ContractPopulationPatient[] }) {
  const visiblePatients = patients.slice(0, 25);
  const showSourceContract = patients.some((patient) => patient.sourceContractName);
  const headers = showSourceContract
    ? ["Patient", "Source Contract", "Annual Expense", "Primary Drivers", "Care Relationship"]
    : ["Patient", "Annual Expense", "Primary Drivers", "Care Relationship"];

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-[860px] w-full divide-y divide-slate-100">
        <thead className="bg-slate-50">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {visiblePatients.map((patient) => (
            <tr key={patient.id} className="hover:bg-slate-50/70">
              <td className="px-4 py-3 align-top">
                <p className="text-sm font-semibold text-slate-900">{patient.name}</p>
                <p className="text-xs text-slate-400">MRN {patient.mrn} · {patient.age} · {patient.sex}</p>
              </td>
              {showSourceContract ? (
                <td className="px-4 py-3 align-top text-xs text-slate-600">
                  <p className="font-semibold text-slate-800">{patient.sourceContractName}</p>
                  <p className="text-slate-400">{patient.sourceContractPayor}</p>
                </td>
              ) : null}
              <td className="px-4 py-3 align-top text-xs tabular-nums text-slate-600">
                <p className="font-semibold text-slate-900">{formatMoney(patient.totalCostOfCare)}</p>
                <p className="text-slate-400">{formatMoney(patient.pmpm)} PMPM</p>
              </td>
              <td className="px-4 py-3 align-top text-xs text-slate-600">
                <p className="font-semibold">
                  {patient.chronicConditions.slice(0, 3).join(", ") || `${patient.chronicConditionCount} conditions`}
                </p>
                <p className="text-slate-400">{patient.edVisits} ED · {patient.snfAdmits} SNF admits</p>
              </td>
              <td className="px-4 py-3 align-top text-xs text-slate-600">
                <p className="font-medium text-slate-700">{patient.attributedProvider}</p>
                <p className="text-slate-400">{careRelationship(patient)}</p>
                {patient.distanceToCareMiles >= 30 ? <p className="mt-1 font-semibold text-rose-600">30+ mi from care</p> : null}
                {patient.hasOpenGap ? <p className="mt-1 font-semibold text-amber-600">Open quality gap</p> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CostConcentrationWorkbench({
  slice,
  activeTier,
  engagementFocusCount,
}: {
  slice: ContractPopulationSlice;
  activeTier: ContractPopulationCostTierFilter;
  engagementFocusCount?: number;
}) {
  const initialTier: PrimaryCostTier = activeTier === "top_1" || activeTier === "top_10" ? activeTier : "top_5";
  const [selectedTier, setSelectedTier] = useState<PrimaryCostTier>(initialTier);
  const selectedOption = costTierOptions.find((option) => option.key === selectedTier) ?? costTierOptions[1];
  const engagementFocusPatients = engagementFocusCount
    ? getCostTierPatients(slice.denominatorPatients, "all").slice(0, Math.min(engagementFocusCount, slice.denominatorPatients.length))
    : undefined;
  const selectedPatients = engagementFocusPatients ?? getCostTierPatients(slice.denominatorPatients, selectedTier, slice.highCostPatients);
  const selectedTotalCost = selectedPatients.reduce((sum, patient) => sum + patient.totalCostOfCare, 0);
  const selectedEdCost = selectedPatients.reduce((sum, patient) => sum + patient.edVisits * 1450, 0);
  const selectedSnfCost = selectedPatients.reduce((sum, patient) => sum + patient.snfDays * 650, 0);
  const selectedComplexityCost = Math.max(0, selectedTotalCost - selectedEdCost - selectedSnfCost);
  const driverMax = Math.max(selectedEdCost, selectedSnfCost, selectedComplexityCost, 1);
  const concentration = slice.costConcentration.find((tier) => tierLabelToKey(tier.tier) === selectedTier);
  const selectedSpendShare = slice.summary.totalCostOfCare > 0 ? Number(((selectedTotalCost / slice.summary.totalCostOfCare) * 100).toFixed(1)) : 0;
  const conditionConcentration = buildConditionConcentration(selectedPatients);
  const total = selectedPatients.length;
  const recentlySeen = selectedPatients.filter((patient) => patient.lastAttributedVisitYearsAgo <= 1).length;
  const staleAttribution = selectedPatients.filter((patient) => patient.lastAttributedVisitYearsAgo >= 3).length;
  const accessBarrier = selectedPatients.filter((patient) => patient.distanceToCareMiles >= 30).length;
  const openGap = selectedPatients.filter((patient) => patient.hasOpenGap).length;
  const spendShare = concentration?.percentOfTotalCost ?? selectedSpendShare;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Expense concentration workbench</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">High-expense patient strategy</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">
            {engagementFocusPatients
              ? `Viewing engagement cohort: ${formatNumber(total)} members prioritized by annual total expense of care account for ${formatCompactMoney(selectedTotalCost)} / ${spendShare}% of total spend.`
              : `Viewing ${selectedOption.label}: ${formatNumber(total)} members account for ${formatCompactMoney(selectedTotalCost)} / ${spendShare}% of total spend.`}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-3">
          {costTierOptions.map((option) => {
            const tier = slice.costConcentration.find((item) => item.tier === `Top ${option.percent}%`);
            const isActive = option.key === selectedTier;
            const cost = tier?.totalCost ?? 0;
            const count = tier?.patientCount ?? 0;
            const optionSpendShare = tier?.percentOfTotalCost ?? 0;

            return (
              <button
                key={option.key}
                type="button"
                onClick={() => setSelectedTier(option.key)}
                className={`rounded-xl border p-3 text-left transition ${
                  isActive
                    ? "border-indigo-300 bg-indigo-50 text-slate-900 ring-1 ring-indigo-100"
                    : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/60"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-[11px] font-semibold uppercase tracking-wide ${isActive ? "text-indigo-700" : "text-slate-500"}`}>{option.label}</p>
                  {isActive ? <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">Selected</span> : null}
                </div>
                <p className="mt-2 text-xl font-semibold tabular-nums text-slate-950">{formatCompactMoney(cost)}</p>
                <p className="mt-1.5 text-xs text-slate-500">
                  {formatNumber(count)} members account for {optionSpendShare}% of total spend
                </p>
                <p className="mt-1 text-[11px] text-slate-400">{option.helper}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-950">{engagementFocusPatients ? "Patients to Engage Worklist" : `${selectedOption.label} Worklist`}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Showing the first 25 of {formatNumber(total)} members sorted by annual total expense of care.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-rose-50 px-3 py-1 font-semibold text-rose-700">Expense: high to low</span>
                <span className="rounded-full bg-indigo-50 px-3 py-1 font-semibold text-indigo-700">Open gaps: {pct(openGap, total)}%</span>
                <span className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700">30+ mi: {pct(accessBarrier, total)}%</span>
              </div>
            </div>
          </div>
          <PatientTable patients={selectedPatients} />
          <p className="text-xs text-slate-400">
            Showing {formatNumber(Math.min(25, total))} of {formatNumber(total)} members in this concentration tier.
          </p>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-950">Expense drivers</h3>
            <p className="mt-1 text-xs text-slate-500">Estimated spend contribution.</p>
            <div className="mt-4 space-y-3">
              <DriverBar label="Medical complexity" value={selectedComplexityCost} max={driverMax} tone="bg-indigo-500" />
              <DriverBar label="ED avoidable use" value={selectedEdCost} max={driverMax} tone="bg-rose-500" />
              <DriverBar label="SNF / post-acute" value={selectedSnfCost} max={driverMax} tone="bg-amber-500" />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-950">Top conditions</h3>
            <p className="mt-1 text-xs text-slate-500">Common clinical drivers.</p>
            <div className="mt-4 space-y-3">
              {conditionConcentration.map((item) => (
                <div key={item.condition}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">{item.condition}</span>
                    <span className="font-semibold tabular-nums text-slate-900">{item.percent}%</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-cyan-500" style={{ width: `${Math.max(4, item.percent)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-950">Reachability</h3>
            <p className="mt-1 text-xs text-slate-500">Signals whether care can be PCP-led.</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: "Recently seen", value: pct(recentlySeen, total), tone: "text-emerald-700" },
                { label: "3+ yrs unseen", value: pct(staleAttribution, total), tone: "text-amber-700" },
                { label: "30+ mi access", value: pct(accessBarrier, total), tone: "text-rose-700" },
                { label: "Open gap", value: pct(openGap, total), tone: "text-indigo-700" },
              ].map((item) => (
                <div key={item.label} className="rounded-lg bg-slate-50 p-3">
                  <p className={`text-xl font-bold tabular-nums ${item.tone}`}>{item.value}%</p>
                  <p className="mt-1 text-[11px] font-medium text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
