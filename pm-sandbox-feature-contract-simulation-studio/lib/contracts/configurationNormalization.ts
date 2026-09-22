import type { ContractConfiguration } from "@/types/contractConfiguration";
const legacyIds: Record<string, string> = { "kpi-readmission-rate": "kpi-readmission-30d", "kpi-raf-capture-rate": "kpi-raf-capture" };
export function normalizeKpiCatalogId(id: string) { return legacyIds[id] ?? id; }
export function normalizeContractConfiguration(config: ContractConfiguration): ContractConfiguration {
  return { ...config, selectedMetrics: config.selectedMetrics.map(s => ({ ...s, kpiCatalogItemId: normalizeKpiCatalogId(s.kpiCatalogItemId) })) };
}

/** Compare content rather than JSON property order after storage validation. */
export function configurationSignature(config: ContractConfiguration): string {
  const canonical = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(canonical);
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined).sort(([a], [b]) => a.localeCompare(b)).map(([key, v]) => [key, canonical(v)]));
    return value;
  };
  return JSON.stringify(canonical(normalizeContractConfiguration(config)));
}
