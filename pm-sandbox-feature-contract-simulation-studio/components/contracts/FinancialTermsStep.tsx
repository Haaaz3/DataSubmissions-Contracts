"use client";

import { kpiCatalog } from "@/data/synthetic/kpiCatalog";
import type { ContractFinancialTerms, ContractMetricSelection, SettlementFrequency } from "@/types/contractConfiguration";

function toNumberOrUndefined(value: string) {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export default function FinancialTermsStep({
  terms,
  selectedMetrics,
  onChange,
}: {
  terms: ContractFinancialTerms;
  selectedMetrics: ContractMetricSelection[];
  onChange: <K extends keyof ContractFinancialTerms>(key: K, value: ContractFinancialTerms[K]) => void;
}) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-base font-semibold text-slate-900">Financial Terms & Quality Gates</h2>
      <p className="mt-1 text-xs text-slate-500">Define contract-level gating and payout constraints.</p>

      <div className="mt-4 space-y-4">
        <div className="rounded-lg border border-slate-200 p-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={terms.qualityGateEnabled}
              onChange={(event) => onChange("qualityGateEnabled", event.target.checked)}
            />
            Enable quality gate
          </label>
          {terms.qualityGateEnabled && (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label>
                <span className="mb-1 block text-[11px] font-semibold text-slate-600">Gate basis</span>
                <select
                  value={terms.qualityGateBasis ?? "composite_score"}
                  onChange={(event) => onChange("qualityGateBasis", event.target.value as ContractFinancialTerms["qualityGateBasis"])}
                  className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs"
                >
                  <option value="composite_score">Composite quality score</option>
                  <option value="selected_metric_threshold">Selected metric threshold</option>
                </select>
              </label>
              {terms.qualityGateBasis === "selected_metric_threshold" && <label>
                <span className="mb-1 block text-[11px] font-semibold text-slate-600">Gate metric</span>
                <select aria-label="Gate metric" value={terms.qualityGateMetricSelectionId ?? ""} onChange={event => onChange("qualityGateMetricSelectionId", event.target.value)} className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs">
                  <option value="">Choose a selected KPI</option>
                  {selectedMetrics.map(s => <option key={s.id} value={s.id}>{kpiCatalog.find(k => k.id === s.kpiCatalogItemId)?.name ?? s.kpiCatalogItemId}</option>)}
                </select>
              </label>}
              <label>
                <span className="mb-1 block text-[11px] font-semibold text-slate-600">Gate threshold</span>
                <input
                  type="number"
                  value={terms.qualityGateThreshold ?? ""}
                  onChange={(event) => onChange("qualityGateThreshold", toNumberOrUndefined(event.target.value))}
                  className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs"
                />
              </label>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label>
            <span className="mb-1 block text-[11px] font-semibold text-slate-600">Incentive cap amount</span>
            <input
              type="number"
              value={terms.incentiveCapAmount ?? ""}
              onChange={(event) => onChange("incentiveCapAmount", toNumberOrUndefined(event.target.value))}
              className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs"
            />
          </label>
          <label>
            <span className="mb-1 block text-[11px] font-semibold text-slate-600">Downside cap amount</span>
            <input
              type="number"
              value={terms.downsideCapAmount ?? ""}
              onChange={(event) => onChange("downsideCapAmount", toNumberOrUndefined(event.target.value))}
              className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs"
            />
          </label>
          <label>
            <span className="mb-1 block text-[11px] font-semibold text-slate-600">Settlement frequency</span>
            <select
              value={terms.settlementFrequency}
              onChange={(event) => onChange("settlementFrequency", event.target.value as SettlementFrequency)}
              className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
            </select>
          </label>
        </div>

        <label>
          <span className="mb-1 block text-[11px] font-semibold text-slate-600">Assumptions note</span>
          <textarea
            value={terms.assumptionsNote ?? ""}
            onChange={(event) => onChange("assumptionsNote", event.target.value)}
            className="min-h-20 w-full rounded border border-slate-200 px-2 py-1.5 text-xs"
          />
        </label>

        <label>
          <span className="mb-1 block text-[11px] font-semibold text-slate-600">Clause reference</span>
          <input
            value={terms.clauseReference ?? ""}
            onChange={(event) => onChange("clauseReference", event.target.value)}
            className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs"
          />
        </label>
      </div>
    </section>
  );
}
