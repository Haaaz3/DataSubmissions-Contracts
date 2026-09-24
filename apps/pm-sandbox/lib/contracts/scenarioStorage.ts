import { z } from "zod";
import type { ContractScenarioOverrides } from "./scenarioSimulator";
import type { StudioInputs, StudioSnapshot } from "./scenarioStudio";

const STORAGE_KEY = "contracts.scenario.saved";
const number = z.number().finite().nonnegative();
const percent = number.max(100);
const overridesSchema = z.object({ currentPmpm: number, qualityScore: percent, edVisitsPer1000: number,
  attributedLives: number.int().min(1), benchmarkPmpm: number.positive(), sharedSavingsRate: percent, sharedRiskRate: percent, qualityGate: percent });
const termsSchema = z.object({ performancePeriodStart: z.string(), performancePeriodEnd: z.string(), benchmarkPmpm: number.positive(),
  sharedSavings: z.boolean(), sharedSavingsRate: percent, sharedSavingsThreshold: percent, sharedSavingsCap: percent, qualityGate: percent,
  sharedRisk: z.boolean(), sharedRiskRate: percent, sharedRiskThreshold: percent, downsideRiskCap: percent, populationHealthBudget: number });
const contractSchema = z.object({ id: z.string(), name: z.string(), payor: z.string(), contractType: z.enum(["MSSP", "Medicare Advantage", "Commercial"]),
  attributedLives: number.int().min(1), currentPmpm: number, targetPmpm: number.positive(), qualityScore: percent, edVisitsPer1000: number,
  status: z.enum(["On Track", "At Risk", "Off Track"]), trend: z.array(z.object({ month: z.string(), pmpm: number, qualityScore: percent })),
  opportunities: z.array(z.object({ title: z.string(), description: z.string() }).passthrough()), vbcTerms: termsSchema.optional() }).passthrough();
const configSchema = z.object({ contractId: z.string(), basics: z.object({ name: z.string(), payer: z.string(), startDate: z.string(), lineOfBusiness: z.string(), contractType: z.string() }).passthrough(),
  selectedMetrics: z.array(z.object({ id: z.string(), contractId: z.string(), kpiCatalogItemId: z.string(), role: z.enum(["scored", "gated", "monitored"]), displayOrder: number }).passthrough()),
  metricTargets: z.array(z.object({ id: z.string(), contractId: z.string(), contractMetricSelectionId: z.string(), targetType: z.enum(["absolute", "improvement_over_baseline", "range"]),
    baselineValue: number.optional(), targetValue: number.optional(), thresholdValue: number.optional(), stretchValue: number.optional(), weight: number.optional(), minRangeValue: number.optional(), maxRangeValue: number.optional(),
    directionalityOverride: z.enum(["higher_is_better", "lower_is_better", "target_range"]).optional() }).passthrough()),
  incentiveRules: z.array(z.object({ id: z.string(), contractId: z.string(), name: z.string(), incentiveType: z.enum(["fixed_payout", "weighted_pool", "tiered_payout", "per_unit_payout", "gate_based_payout"]),
    linkedContractMetricSelectionIds: z.array(z.string()), payoutBasis: z.enum(["fixed", "percent", "pmpm", "per_unit", "pool"]), payoutAmount: number.optional(), payoutRate: number.optional(), capAmount: number.optional(), floorAmount: number.optional(), allOrNothing: z.boolean().optional(),
    tiers: z.array(z.object({ id: z.string(), label: z.string().optional(), thresholdValue: number, payoutAmount: number })).optional() }).passthrough()),
  financialTerms: z.object({ contractId: z.string(), qualityGateEnabled: z.boolean(), qualityGateBasis: z.enum(["composite_score", "selected_metric_threshold"]).optional(), qualityGateThreshold: number.optional(), qualityGateMetricSelectionId: z.string().optional(), incentiveCapAmount: number.optional(), downsideCapAmount: number.optional(), withholdEnabled: z.boolean().optional(), withholdAmount: number.optional(), settlementFrequency: z.enum(["annual", "quarterly", "monthly"]) }).passthrough(),
  version: number, updatedAt: z.string(), domainEconomicRules: z.array(z.object({ id: z.string() }).passthrough()).optional() }).passthrough();
const inputsSchema = z.object({ overrides: overridesSchema, kpiValues: z.record(z.string(), number), baselineKpiValues: z.record(z.string(), number),
  ruleAssumptions: z.record(z.string(), z.object({ eligibleUnits: number.optional(), dollarRate: number.optional(), monetaryBase: number.optional() })) });
const baseSchema = z.object({ id: z.string(), name: z.string(), contractId: z.string(), createdAt: z.string(), overrides: overridesSchema });
const scenarioSchema = z.union([
  baseSchema.extend({ version: z.literal(2), snapshot: z.object({ contract: contractSchema, configuration: configSchema }), inputs: inputsSchema }),
  baseSchema.extend({ version: z.literal(1).optional() }),
]);
export interface SavedContractScenario {
  id: string; name: string; contractId: string; createdAt: string; overrides: ContractScenarioOverrides;
  version?: 1 | 2; snapshot?: StudioSnapshot; inputs?: StudioInputs;
}
export function readSavedScenarios(): { data: Record<string, SavedContractScenario[]>; issue?: string } {
  if (typeof window === "undefined") return { data: {} };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { data: {} };
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return { data: {}, issue: "Saved scenarios could not be read." };
    const data: Record<string, SavedContractScenario[]> = {};
    let skipped = false;
    Object.entries(parsed).forEach(([id, records]) => {
      if (!Array.isArray(records)) { skipped = true; return; }
      data[id] = records.flatMap(record => {
        // Never reinterpret a malformed v2 snapshot as a legacy record.
        if (record?.version !== undefined && record.version !== 1 && record.version !== 2) { skipped = true; return []; }
        const result = scenarioSchema.safeParse(record);
        if (!result.success || result.data.contractId !== id || (record.version === 2 && (!("snapshot" in result.data) || result.data.snapshot.contract.id !== id || result.data.snapshot.configuration.contractId !== id))) { skipped = true; return []; }
        return [result.data as SavedContractScenario];
      }).slice(0, 20);
    });
    return { data, issue: skipped ? "Some invalid saved scenarios were skipped." : undefined };
  } catch { return { data: {}, issue: "Browser storage is unavailable or contains unreadable scenarios. You can still simulate." }; }
}
export function listSavedScenarios(contractId: string): SavedContractScenario[] { return readSavedScenarios().data[contractId] ?? []; }
function writeAll(data: Record<string, SavedContractScenario[]>) {
  if (typeof window === "undefined") throw new Error("Scenario saving requires browser storage.");
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
  catch { throw new Error("Could not save changes to browser storage. Your active simulation is still available."); }
}
export function saveScenario(params: { contractId: string; name: string; overrides: ContractScenarioOverrides; snapshot?: StudioSnapshot; inputs?: StudioInputs }): SavedContractScenario {
  const scenario: SavedContractScenario = { id: `scenario-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, contractId: params.contractId,
    name: params.name.trim() || "Untitled scenario", createdAt: new Date().toISOString(), overrides: params.overrides,
    ...(params.snapshot && params.inputs ? { version: 2 as const, snapshot: params.snapshot, inputs: params.inputs } : {}) };
  const validation = scenarioSchema.safeParse(scenario);
  if (!validation.success) throw new Error("Complete valid scenario inputs before saving.");
  const { data, issue } = readSavedScenarios();
  if (issue) throw new Error(`${issue} Existing saved data has been preserved.`);
  data[params.contractId] = [scenario, ...(data[params.contractId] ?? [])].slice(0, 20);
  writeAll(data);
  return structuredClone(scenario);
}
export function deleteScenario(contractId: string, scenarioId: string) {
  const { data, issue } = readSavedScenarios();
  if (issue) throw new Error(`${issue} Existing saved data has been preserved.`);
  data[contractId] = (data[contractId] ?? []).filter(s => s.id !== scenarioId);
  writeAll(data);
}
