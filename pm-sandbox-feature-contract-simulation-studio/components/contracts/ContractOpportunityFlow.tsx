"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Contract, Opportunity } from "@/types/contract";
import { createProjectFromOpportunity } from "@/lib/projects/createFromOpportunity";
import { getAgentById, SynapseAgentId } from "@/lib/synapseai/agentRegistry";
import { trackEvent } from "@/lib/telemetry/service";

function getSuggestedExecutionAgents(opportunity: Opportunity): SynapseAgentId[] {
  const fromWorkflowType = (opportunity.workflowTypes ?? []).flatMap((type) => {
    if (type.includes("ed_")) return ["claims_friction", "kaiser_outreach", "contract_performance"] as SynapseAgentId[];
    if (type.includes("readmission") || type.includes("post_acute")) {
      return ["cleveland_readmission", "mayo_discharge", "contract_performance"] as SynapseAgentId[];
    }
    if (type.includes("screening") || type.includes("diabetes")) {
      return ["quality_care_gap", "kaiser_prevention", "contract_performance"] as SynapseAgentId[];
    }
    return ["contract_performance"] as SynapseAgentId[];
  });

  if (fromWorkflowType.length > 0) return Array.from(new Set(fromWorkflowType));

  const text = `${opportunity.title} ${opportunity.description}`.toLowerCase();
  if (text.includes("ed")) return ["contract_performance", "claims_friction", "kaiser_outreach"];
  if (text.includes("readmission") || text.includes("discharge")) {
    return ["contract_performance", "cleveland_readmission", "mayo_discharge"];
  }
  if (text.includes("screen") || text.includes("a1c") || text.includes("diabetes")) {
    return ["quality_care_gap", "contract_performance", "kaiser_prevention"];
  }
  return ["contract_performance", "claims_friction"];
}

function formatOpportunityFinancialImpact(opportunity: Opportunity) {
  const impact = opportunity.impactEstimate;
  if (!impact) return "Not quantified";

  const parts: string[] = [];
  if (typeof impact.pmpmDelta === "number") {
    parts.push(`${impact.pmpmDelta > 0 ? "+" : ""}${impact.pmpmDelta} PMPM expense impact`);
  }
  if (typeof impact.revenueLiftPmpm === "number") {
    parts.push(`+$${impact.revenueLiftPmpm} PMPM revenue lift`);
  }
  if (typeof impact.qualityLiftPoints === "number") {
    parts.push(`+${impact.qualityLiftPoints} quality pts`);
  }

  return parts.length ? parts.join(" · ") : "Not quantified";
}

export default function ContractOpportunityFlow({ contract }: { contract: Contract }) {
  const router = useRouter();
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [creating, setCreating] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedAgeBands, setSelectedAgeBands] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedRiskTiers, setSelectedRiskTiers] = useState<string[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);

  const ageBandOptions = useMemo(
    () => Array.from(new Set(contract.opportunities.flatMap((opp) => opp.demographics?.ageBands ?? []))),
    [contract.opportunities]
  );
  const genderOptions = useMemo(
    () => Array.from(new Set(contract.opportunities.flatMap((opp) => opp.demographics?.genders ?? []))),
    [contract.opportunities]
  );
  const riskTierOptions = useMemo(
    () => Array.from(new Set(contract.opportunities.flatMap((opp) => opp.demographics?.riskTiers ?? []))),
    [contract.opportunities]
  );
  const segmentOptions = useMemo(
    () => Array.from(new Set(contract.opportunities.flatMap((opp) => opp.demographics?.segments ?? []))),
    [contract.opportunities]
  );

  const hasDemographicData =
    ageBandOptions.length > 0 || genderOptions.length > 0 || riskTierOptions.length > 0 || segmentOptions.length > 0;

  const selectedFilterCount =
    selectedAgeBands.length + selectedGenders.length + selectedRiskTiers.length + selectedSegments.length;

  const activeFilterChips = useMemo(
    () => [
      ...selectedAgeBands.map((value) => ({ dimension: "age" as const, value })),
      ...selectedGenders.map((value) => ({ dimension: "gender" as const, value })),
      ...selectedRiskTiers.map((value) => ({ dimension: "risk" as const, value })),
      ...selectedSegments.map((value) => ({ dimension: "segment" as const, value })),
    ],
    [selectedAgeBands, selectedGenders, selectedRiskTiers, selectedSegments]
  );

  const toggleFilter = (value: string, selected: string[], setter: (next: string[]) => void) => {
    if (selected.includes(value)) {
      setter(selected.filter((item) => item !== value));
      return;
    }
    setter([...selected, value]);
  };

  const clearFilters = () => {
    setSelectedAgeBands([]);
    setSelectedGenders([]);
    setSelectedRiskTiers([]);
    setSelectedSegments([]);
  };

  const removeFilterChip = (dimension: "age" | "gender" | "risk" | "segment", value: string) => {
    if (dimension === "age") setSelectedAgeBands((prev) => prev.filter((item) => item !== value));
    if (dimension === "gender") setSelectedGenders((prev) => prev.filter((item) => item !== value));
    if (dimension === "risk") setSelectedRiskTiers((prev) => prev.filter((item) => item !== value));
    if (dimension === "segment") setSelectedSegments((prev) => prev.filter((item) => item !== value));
  };

  const filteredOpportunities = useMemo(() => {
    const matchesDimension = (selected: string[], values?: string[]) => {
      if (selected.length === 0) return true;
      if (!values || values.length === 0) return false;
      return selected.some((item) => values.includes(item));
    };

    return contract.opportunities.filter((opp) => {
      const demographics = opp.demographics;
      return (
        matchesDimension(selectedAgeBands, demographics?.ageBands) &&
        matchesDimension(selectedGenders, demographics?.genders) &&
        matchesDimension(selectedRiskTiers, demographics?.riskTiers) &&
        matchesDimension(selectedSegments, demographics?.segments)
      );
    });
  }, [contract.opportunities, selectedAgeBands, selectedGenders, selectedRiskTiers, selectedSegments]);

  const originAgent = selectedOpportunity?.originAgentId ? getAgentById(selectedOpportunity.originAgentId) : null;
  const contributingAgents = (selectedOpportunity?.contributingAgentIds ?? []).map((id) => getAgentById(id));
  const suggestedExecutionAgentIds = selectedOpportunity ? getSuggestedExecutionAgents(selectedOpportunity) : [];
  const activeAgentIds = new Set<SynapseAgentId>([
    ...(selectedOpportunity?.originAgentId ? [selectedOpportunity.originAgentId] : []),
    ...(selectedOpportunity?.contributingAgentIds ?? []),
  ]);

  return (
    <div>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Top Opportunities</h2>
          <p className="mt-0.5 text-xs text-slate-400">{filteredOpportunities.length} of {contract.opportunities.length} opportunities shown</p>
        </div>
      </div>

      {hasDemographicData && (
        <div className="mb-4">
          <div className="relative flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFilterPanelOpen((prev) => !prev)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                isFilterPanelOpen || selectedFilterCount > 0
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              Demographics
              {selectedFilterCount > 0 && (
                <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
                  {selectedFilterCount}
                </span>
              )}
              <span className="text-[10px]">{isFilterPanelOpen ? "▲" : "▼"}</span>
            </button>

            {selectedFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Clear all
              </button>
            )}

            {isFilterPanelOpen && (
              <div className="absolute left-0 top-10 z-20 w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {ageBandOptions.length > 0 && (
                    <div>
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Age</p>
                      <div className="flex flex-wrap gap-1.5">
                        {ageBandOptions.map((option) => {
                          const active = selectedAgeBands.includes(option);
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => toggleFilter(option, selectedAgeBands, setSelectedAgeBands)}
                              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                                active
                                  ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {genderOptions.length > 0 && (
                    <div>
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Gender</p>
                      <div className="flex flex-wrap gap-1.5">
                        {genderOptions.map((option) => {
                          const active = selectedGenders.includes(option);
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => toggleFilter(option, selectedGenders, setSelectedGenders)}
                              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                                active
                                  ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {riskTierOptions.length > 0 && (
                    <div>
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Risk Tier</p>
                      <div className="flex flex-wrap gap-1.5">
                        {riskTierOptions.map((option) => {
                          const active = selectedRiskTiers.includes(option);
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => toggleFilter(option, selectedRiskTiers, setSelectedRiskTiers)}
                              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                                active
                                  ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {segmentOptions.length > 0 && (
                    <div>
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Segment</p>
                      <div className="flex flex-wrap gap-1.5">
                        {segmentOptions.map((option) => {
                          const active = selectedSegments.includes(option);
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => toggleFilter(option, selectedSegments, setSelectedSegments)}
                              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                                active
                                  ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsFilterPanelOpen(false)}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

          {activeFilterChips.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {activeFilterChips.map((chip) => (
                <button
                  key={`${chip.dimension}-${chip.value}`}
                  type="button"
                  onClick={() => removeFilterChip(chip.dimension, chip.value)}
                  className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700"
                >
                  {chip.value}
                  <span className="text-[10px]">✕</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {filteredOpportunities.map((opp, i) => (
          <div key={`${opp.title}-${i}`} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                {i + 1}
              </span>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Opportunity</p>
            </div>
            <p className="mb-1.5 font-semibold text-slate-900">{opp.title}</p>
            <p className="text-sm leading-relaxed text-slate-600">{opp.description}</p>

            {!!opp.demographics && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[...(opp.demographics.ageBands ?? []), ...(opp.demographics.riskTiers ?? []), ...(opp.demographics.segments ?? [])]
                  .slice(0, 3)
                  .map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      {tag}
                    </span>
                  ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setSelectedOpportunity(opp);
                trackEvent({
                  eventName: "opportunity_review_opened",
                  page: `/contracts/${contract.id}`,
                  module: "contracts",
                  contractId: contract.id,
                  opportunityTitle: opp.title,
                  originAgentId: opp.originAgentId,
                  contributingAgentIds: opp.contributingAgentIds,
                  userId: "demo-user",
                  userRole: "operator",
                });
              }}
              className="mt-4 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700"
            >
              Review AI Opportunity
            </button>
          </div>
        ))}
      </div>

      {filteredOpportunities.length === 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <p className="text-sm font-semibold text-slate-700">No opportunities match the selected demographics.</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Reset filters
          </button>
        </div>
      )}

      {selectedOpportunity && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={() => !creating && setSelectedOpportunity(null)}
          role="button"
          tabIndex={-1}
        >
          <div
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Review Before You Act</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">{selectedOpportunity.title}</h3>
                <p className="mt-2 text-sm text-slate-600">
                  {selectedOpportunity.executiveSummary ?? selectedOpportunity.description}
                </p>
              </div>
              <button
                type="button"
                disabled={creating}
                onClick={() => {
                  trackEvent({
                    eventName: "opportunity_review_closed",
                    page: `/contracts/${contract.id}`,
                    module: "contracts",
                    contractId: contract.id,
                    opportunityTitle: selectedOpportunity.title,
                    userId: "demo-user",
                    userRole: "operator",
                  });
                  setSelectedOpportunity(null);
                }}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 lg:col-span-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Generated by AI Agent</p>
                {originAgent ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-800">
                      {originAgent.icon} {originAgent.displayName}
                    </span>
                    <span className="text-xs text-slate-600">{originAgent.shortDescription}</span>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-slate-600">Contract Performance Agent (default synthesis)</p>
                )}

                {contributingAgents.length > 0 && (
                  <div className="mt-2 text-xs text-indigo-700">
                    +{contributingAgents.length} contributing agent{contributingAgents.length > 1 ? "s" : ""}
                  </div>
                )}

                {!!selectedOpportunity.demographics && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {[
                      ...(selectedOpportunity.demographics.ageBands ?? []),
                      ...(selectedOpportunity.demographics.genders ?? []),
                      ...(selectedOpportunity.demographics.riskTiers ?? []),
                      ...(selectedOpportunity.demographics.segments ?? []),
                    ].map((tag) => (
                      <span key={tag} className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Confidence</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{selectedOpportunity.confidence ?? "Medium"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estimated Financial Impact</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {formatOpportunityFinancialImpact(selectedOpportunity)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recommended Owner</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{selectedOpportunity.ownerRole ?? "Operations Lead"}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">Project Plan Actions</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  {(selectedOpportunity.projectPlanActions ?? [selectedOpportunity.description]).map((action) => (
                    <li key={action}>• {action}</li>
                  ))}
                </ul>

                <div className="mt-4 border-t border-slate-200 pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Suggested AI Agents for Execution</p>
                  <div className="mt-2 space-y-2">
                    {suggestedExecutionAgentIds.map((agentId) => {
                      const agent = getAgentById(agentId);
                      const isActive = activeAgentIds.has(agentId);
                      return (
                        <div key={agentId} className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-2 text-xs">
                          <div className="flex items-center gap-2 text-slate-700">
                            <span>{agent.icon}</span>
                            <span className="font-semibold">{agent.shortLabel}</span>
                          </div>
                          <span
                            className={`rounded-full px-2 py-0.5 font-semibold ${
                              isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {isActive ? "Already active" : "Suggested"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">KPI Tracking Plan</p>
                <div className="mt-2 space-y-2 text-sm text-slate-700">
                  {selectedOpportunity.primaryKpi && (
                    <div className="rounded-lg bg-slate-50 p-2.5">
                      <p className="text-xs font-semibold uppercase text-slate-500">Primary KPI</p>
                      <p className="font-semibold text-slate-900">{selectedOpportunity.primaryKpi.displayName}</p>
                      <p className="text-xs text-slate-600">
                        {selectedOpportunity.primaryKpi.baseline} → {selectedOpportunity.primaryKpi.target}
                      </p>
                    </div>
                  )}
                  {(selectedOpportunity.leadingKpis ?? []).map((kpi) => (
                    <div key={kpi.key} className="rounded-lg bg-slate-50 p-2.5">
                      <p className="font-semibold text-slate-900">{kpi.displayName}</p>
                      <p className="text-xs text-slate-600">{kpi.baseline} → {kpi.target}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={creating}
                onClick={() => {
                  trackEvent({
                    eventName: "opportunity_review_closed",
                    page: `/contracts/${contract.id}`,
                    module: "contracts",
                    contractId: contract.id,
                    opportunityTitle: selectedOpportunity.title,
                    userId: "demo-user",
                    userRole: "operator",
                  });
                  setSelectedOpportunity(null);
                }}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={creating}
                onClick={async () => {
                  setCreating(true);
                  const project = await createProjectFromOpportunity(contract, selectedOpportunity);
                  void trackEvent({
                    eventName: "project_created_from_opportunity",
                    page: `/contracts/${contract.id}`,
                    module: "contracts",
                    contractId: contract.id,
                    projectId: project.id,
                    opportunityTitle: selectedOpportunity.title,
                    originAgentId: selectedOpportunity.originAgentId,
                    contributingAgentIds: selectedOpportunity.contributingAgentIds,
                    projectOrigin: "opportunity",
                    userId: "demo-user",
                    userRole: "operator",
                  });
                  setSelectedOpportunity(null);
                  router.push(`/projects/${project.id}`);
                }}
                className="rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
              >
                {creating ? "Creating Project..." : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
