"use client";

import type {
  ContractMetricSelection,
  ContractMetricTarget,
  KpiCatalogItem,
  TargetType,
} from "@/types/contractConfiguration";

function toNumberOrUndefined(value: string) {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export default function ContractTargetsStep({
  selectedMetrics,
  metricTargets,
  catalog,
  onTargetChange,
}: {
  selectedMetrics: ContractMetricSelection[];
  metricTargets: ContractMetricTarget[];
  catalog: KpiCatalogItem[];
  onTargetChange: (selectionId: string, patch: Partial<ContractMetricTarget>) => void;
}) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-base font-semibold text-slate-900">Targets & Weights</h2>
      <p className="mt-1 text-xs text-slate-500">Configure baseline, threshold, target, stretch, and weight for selected KPIs.</p>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500">
              <th className="px-2 py-2">KPI</th>
              <th className="px-2 py-2">Role</th>
              <th className="px-2 py-2">Baseline</th>
              <th className="px-2 py-2">Threshold</th>
              <th className="px-2 py-2">Target</th>
              <th className="px-2 py-2">Stretch</th>
              <th className="px-2 py-2">Weight</th>
              <th className="px-2 py-2">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {selectedMetrics.map((selection) => {
              const kpi = catalog.find((item) => item.id === selection.kpiCatalogItemId);
              const target = metricTargets.find((item) => item.contractMetricSelectionId === selection.id);

              return (
                <tr key={selection.id}>
                  <td className="px-2 py-2 align-top">
                    <p className="text-sm font-semibold text-slate-900">{kpi?.name ?? selection.kpiCatalogItemId}</p>
                    <p className="text-[11px] text-slate-500">{kpi?.directionality.replaceAll("_", " ") ?? ""}</p>
                  </td>
                  <td className="px-2 py-2 text-xs text-slate-600">{selection.role}</td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      value={target?.baselineValue ?? ""}
                      onChange={(event) => onTargetChange(selection.id, { baselineValue: toNumberOrUndefined(event.target.value) })}
                      className="w-24 rounded border border-slate-200 px-2 py-1 text-xs"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      value={target?.thresholdValue ?? ""}
                      onChange={(event) => onTargetChange(selection.id, { thresholdValue: toNumberOrUndefined(event.target.value) })}
                      className="w-24 rounded border border-slate-200 px-2 py-1 text-xs"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      value={target?.targetValue ?? ""}
                      onChange={(event) => onTargetChange(selection.id, { targetValue: toNumberOrUndefined(event.target.value) })}
                      className="w-24 rounded border border-slate-200 px-2 py-1 text-xs"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      value={target?.stretchValue ?? ""}
                      onChange={(event) => onTargetChange(selection.id, { stretchValue: toNumberOrUndefined(event.target.value) })}
                      className="w-24 rounded border border-slate-200 px-2 py-1 text-xs"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      value={target?.weight ?? ""}
                      onChange={(event) => onTargetChange(selection.id, { weight: toNumberOrUndefined(event.target.value) })}
                      className="w-20 rounded border border-slate-200 px-2 py-1 text-xs"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <select
                      value={target?.targetType ?? "absolute"}
                      onChange={(event) => onTargetChange(selection.id, { targetType: event.target.value as TargetType })}
                      className="rounded border border-slate-200 px-2 py-1 text-xs"
                    >
                      <option value="absolute">Absolute</option>
                      <option value="improvement_over_baseline">Improvement</option>
                      <option value="range">Range</option>
                    </select>
                    {target?.targetType === "range" && <div className="mt-2 space-y-2">
                      <input aria-label={`${kpi?.name} minimum`} placeholder="Range minimum" type="number" value={target.minRangeValue ?? ""} onChange={e => onTargetChange(selection.id, { minRangeValue: toNumberOrUndefined(e.target.value) })} className="w-28 rounded border border-slate-200 px-2 py-1 text-xs" />
                      <input aria-label={`${kpi?.name} maximum`} placeholder="Range maximum" type="number" value={target.maxRangeValue ?? ""} onChange={e => onTargetChange(selection.id, { maxRangeValue: toNumberOrUndefined(e.target.value) })} className="w-28 rounded border border-slate-200 px-2 py-1 text-xs" />
                    </div>}
                    {target?.targetType === "improvement_over_baseline" && <p className="mt-1 max-w-32 text-[11px] text-slate-500">Target is the desired endpoint, measured against baseline.</p>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
