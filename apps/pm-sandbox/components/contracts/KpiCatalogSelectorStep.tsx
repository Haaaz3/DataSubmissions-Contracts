"use client";

import { useMemo, useState } from "react";
import type {
  ContractConfiguration,
  KpiCatalogItem,
  KpiDomain,
  KpiRole,
  KpiUnit,
} from "@/types/contractConfiguration";

type SelectedMetric = ContractConfiguration["selectedMetrics"][number];

export default function KpiCatalogSelectorStep({
  catalog,
  selectedMetrics,
  onAddKpi,
  onRemoveKpi,
  onRoleChange,
}: {
  catalog: KpiCatalogItem[];
  selectedMetrics: SelectedMetric[];
  onAddKpi: (kpiId: string) => void;
  onRemoveKpi: (selectionId: string) => void;
  onRoleChange: (selectionId: string, role: KpiRole) => void;
}) {
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState<"all" | KpiDomain>("all");
  const [unit, setUnit] = useState<"all" | KpiUnit>("all");

  const selectedByKpiId = useMemo(
    () => new Map(selectedMetrics.map((item) => [item.kpiCatalogItemId, item])),
    [selectedMetrics]
  );

  const filteredCatalog = useMemo(() => {
    return catalog.filter((kpi) => {
      if (domain !== "all" && kpi.domain !== domain) return false;
      if (unit !== "all" && kpi.unit !== unit) return false;
      if (!query.trim()) return true;
      const normalized = query.trim().toLowerCase();
      return `${kpi.name} ${kpi.code ?? ""} ${kpi.description} ${kpi.domain}`
        .toLowerCase()
        .includes(normalized);
    });
  }, [catalog, domain, query, unit]);

  const selectedDetails = useMemo(
    () =>
      selectedMetrics
        .map((selection) => ({
          selection,
          kpi: catalog.find((item) => item.id === selection.kpiCatalogItemId),
        }))
        .filter((item) => !!item.kpi),
    [catalog, selectedMetrics]
  );

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-base font-semibold text-slate-900">KPI Catalog & Selection</h2>
      <p className="mt-1 text-xs text-slate-500">Pick KPIs that apply to this contract and assign a role for each.</p>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search KPI catalog"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <select
          value={domain}
          onChange={(event) => setDomain(event.target.value as typeof domain)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="all">All domains</option>
          <option value="cost">Expense</option>
          <option value="utilization">Utilization</option>
          <option value="quality">Quality</option>
          <option value="care_gap">Care gaps</option>
          <option value="access">Access</option>
          <option value="coding_raf">Coding/RAF</option>
          <option value="patient_experience">Patient experience</option>
          <option value="operations">Operations</option>
        </select>
        <select
          value={unit}
          onChange={(event) => setUnit(event.target.value as typeof unit)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="all">All units</option>
          <option value="percent">Percent</option>
          <option value="pmpm">PMPM</option>
          <option value="per_1000">Per 1,000</option>
          <option value="currency">Currency</option>
          <option value="count">Count</option>
          <option value="score">Score</option>
        </select>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="space-y-2 rounded-lg border border-slate-200 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Catalog</p>
          <div className="max-h-[26rem] space-y-2 overflow-y-auto pr-1">
            {filteredCatalog.map((kpi) => {
              const selected = selectedByKpiId.has(kpi.id);
              return (
                <article key={kpi.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{kpi.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{kpi.description}</p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {kpi.domain} · {kpi.unit} · {kpi.directionality.replaceAll("_", " ")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onAddKpi(kpi.id)}
                      disabled={selected}
                      className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {selected ? "Added" : "Add"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 rounded-lg border border-slate-200 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Selected KPIs</p>
          <div className="max-h-[26rem] space-y-2 overflow-y-auto pr-1">
            {!selectedDetails.length && (
              <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">No KPIs selected yet.</p>
            )}
            {selectedDetails.map(({ selection, kpi }) => (
              <article key={selection.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{kpi?.name}</p>
                    <p className="text-[11px] text-slate-500">{kpi?.domain} · {kpi?.unit}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveKpi(selection.id)}
                    className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-2">
                  <label className="text-[11px] font-semibold text-slate-600">Role</label>
                  <select
                    value={selection.role}
                    onChange={(event) => onRoleChange(selection.id, event.target.value as KpiRole)}
                    className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs"
                  >
                    <option value="scored">Scored</option>
                    <option value="monitored">Monitored</option>
                    <option value="gated">Gated</option>
                  </select>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
