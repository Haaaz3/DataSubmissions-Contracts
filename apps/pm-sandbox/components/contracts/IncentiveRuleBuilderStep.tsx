"use client";

import type {
  ContractIncentiveRule,
  ContractMetricSelection,
  IncentiveTier,
  IncentiveType,
} from "@/types/contractConfiguration";

function toNumberOrUndefined(value: string) {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function createTier(): IncentiveTier {
  return {
    id: `tier-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    label: "",
    thresholdValue: 0,
    payoutAmount: 0,
  };
}

export default function IncentiveRuleBuilderStep({
  rules,
  selectedMetrics,
  onAddRule,
  onRemoveRule,
  onRuleChange,
}: {
  rules: ContractIncentiveRule[];
  selectedMetrics: ContractMetricSelection[];
  onAddRule: () => void;
  onRemoveRule: (ruleId: string) => void;
  onRuleChange: (ruleId: string, patch: Partial<ContractIncentiveRule>) => void;
}) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Incentive Rule Builder</h2>
          <p className="mt-1 text-xs text-slate-500">Configure fixed, tiered, per-unit, weighted, or gate-based incentives.</p>
        </div>
        <button
          type="button"
          onClick={onAddRule}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
        >
          + Add Rule
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {!rules.length && (
          <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">No incentive rules yet.</p>
        )}

        {rules.map((rule) => (
          <article key={rule.id} className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900">{rule.name || "Untitled incentive"}</p>
              <button
                type="button"
                onClick={() => onRemoveRule(rule.id)}
                className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Remove
              </button>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label>
                <span className="mb-1 block text-[11px] font-semibold text-slate-600">Name</span>
                <input
                  value={rule.name}
                  onChange={(event) => onRuleChange(rule.id, { name: event.target.value })}
                  className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs"
                />
              </label>

              <label>
                <span className="mb-1 block text-[11px] font-semibold text-slate-600">Incentive Type</span>
                <select
                  value={rule.incentiveType}
                  onChange={(event) => onRuleChange(rule.id, { incentiveType: event.target.value as IncentiveType })}
                  className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs"
                >
                  <option value="fixed_payout">Fixed payout</option>
                  <option value="tiered_payout">Tiered payout</option>
                  <option value="per_unit_payout">Per-unit payout</option>
                  <option value="weighted_pool">Weighted pool</option>
                  <option value="gate_based_payout">Gate-based payout</option>
                </select>
              </label>

              <label>
                <span className="mb-1 block text-[11px] font-semibold text-slate-600">Payout basis</span>
                <select
                  value={rule.payoutBasis}
                  onChange={(event) => onRuleChange(rule.id, { payoutBasis: event.target.value as ContractIncentiveRule["payoutBasis"] })}
                  className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs"
                >
                  <option value="fixed">Fixed</option>
                  <option value="percent">Percent</option>
                  <option value="pmpm">PMPM</option>
                  <option value="per_unit">Per unit</option>
                  <option value="pool">Pool</option>
                </select>
              </label>

              <label>
                <span className="mb-1 block text-[11px] font-semibold text-slate-600">Payout amount</span>
                <input
                  type="number"
                  value={rule.payoutAmount ?? ""}
                  onChange={(event) => onRuleChange(rule.id, { payoutAmount: toNumberOrUndefined(event.target.value) })}
                  className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs"
                />
              </label>

              <label>
                <span className="mb-1 block text-[11px] font-semibold text-slate-600">Rate / multiplier</span>
                <input
                  type="number"
                  value={rule.payoutRate ?? ""}
                  onChange={(event) => onRuleChange(rule.id, { payoutRate: toNumberOrUndefined(event.target.value) })}
                  className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs"
                />
              </label>

              <label>
                <span className="mb-1 block text-[11px] font-semibold text-slate-600">Cap amount</span>
                <input
                  type="number"
                  value={rule.capAmount ?? ""}
                  onChange={(event) => onRuleChange(rule.id, { capAmount: toNumberOrUndefined(event.target.value) })}
                  className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs"
                />
              </label>
            </div>

            <div className="mt-3">
              <p className="mb-1 text-[11px] font-semibold text-slate-600">Linked KPI selections</p>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
                {selectedMetrics.map((selection) => {
                  const checked = rule.linkedContractMetricSelectionIds.includes(selection.id);
                  return (
                    <label key={selection.id} className="flex items-center gap-2 rounded border border-slate-200 px-2 py-1.5 text-xs">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => {
                          const next = event.target.checked
                            ? [...rule.linkedContractMetricSelectionIds, selection.id]
                            : rule.linkedContractMetricSelectionIds.filter((id) => id !== selection.id);
                          onRuleChange(rule.id, { linkedContractMetricSelectionIds: next });
                        }}
                      />
                      <span>{selection.kpiCatalogItemId}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {rule.incentiveType === "tiered_payout" && (
              <div className="mt-3 rounded-lg bg-slate-50 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-700">Tiers</p>
                  <button
                    type="button"
                    onClick={() => onRuleChange(rule.id, { tiers: [...(rule.tiers ?? []), createTier()] })}
                    className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600"
                  >
                    + Add tier
                  </button>
                </div>
                <div className="space-y-2">
                  {(rule.tiers ?? []).map((tier) => (
                    <div key={tier.id} className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                      <input
                        value={tier.label ?? ""}
                        onChange={(event) => {
                          const next = (rule.tiers ?? []).map((item) =>
                            item.id === tier.id ? { ...item, label: event.target.value } : item
                          );
                          onRuleChange(rule.id, { tiers: next });
                        }}
                        className="rounded border border-slate-200 px-2 py-1 text-xs"
                        placeholder="Tier label"
                      />
                      <input
                        type="number"
                        value={tier.thresholdValue}
                        onChange={(event) => {
                          const next = (rule.tiers ?? []).map((item) =>
                            item.id === tier.id
                              ? { ...item, thresholdValue: Number(event.target.value) }
                              : item
                          );
                          onRuleChange(rule.id, { tiers: next });
                        }}
                        className="rounded border border-slate-200 px-2 py-1 text-xs"
                        placeholder="Threshold"
                      />
                      <input
                        type="number"
                        value={tier.payoutAmount}
                        onChange={(event) => {
                          const next = (rule.tiers ?? []).map((item) =>
                            item.id === tier.id ? { ...item, payoutAmount: Number(event.target.value) } : item
                          );
                          onRuleChange(rule.id, { tiers: next });
                        }}
                        className="rounded border border-slate-200 px-2 py-1 text-xs"
                        placeholder="Payout"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          onRuleChange(rule.id, {
                            tiers: (rule.tiers ?? []).filter((item) => item.id !== tier.id),
                          })
                        }
                        className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
