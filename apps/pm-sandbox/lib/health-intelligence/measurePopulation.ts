import { sharedMeasureFamilies, type SharedMeasureFamily } from "../../data/synthetic/sharedMeasures";
import type { PopulationPatientRow } from "../../types/population";

export type MeasurePatientStatus = "all" | "open" | "met";
export type MeasurePatientListState = { familyId: string; obligationId: string; status: MeasurePatientStatus; query: string; provider: string; page: number };
export type MeasureMembership = { obligationId: string; label: string; definitionId: string; status: "Open" | "Met"; evidence: string };
export type SharedMeasurePatient = PopulationPatientRow & { memberships: MeasureMembership[] };
export const measureProviders = ["Dr. Morgan Lee", "Dr. Avery Patel", "Dr. Jordan Rivera", "Dr. Taylor Chen"];

export function measurePatientState(familyId: string, obligationId = "all", status: MeasurePatientStatus = "all"): MeasurePatientListState {
  return { familyId, obligationId, status, query: "", provider: "", page: 0 };
}

export function parseMeasurePatientState(params: URLSearchParams): MeasurePatientListState | null {
  const family = sharedMeasureFamilies.find(item => item.id === params.get("measureFamily"));
  const obligationId = params.get("measureObligation") ?? "all";
  const status = params.get("gapStatus") ?? "all";
  const provider = params.get("provider") ?? "";
  if (!family || (obligationId !== "all" && !family.obligations.some(item => item.id === obligationId)) || !["all", "open", "met"].includes(status) || (provider && !measureProviders.includes(provider))) return null;
  const page = Number(params.get("page") ?? 0);
  return { familyId: family.id, obligationId, status: status as MeasurePatientStatus, query: params.get("q") ?? "", provider, page: Number.isSafeInteger(page) && page >= 0 ? page : 0 };
}

export function measurePatientHref(state: MeasurePatientListState) {
  const params = new URLSearchParams({ product: "hdi-command-center", view: "measure-patients", measureFamily: state.familyId, measureObligation: state.obligationId, gapStatus: state.status });
  if (state.query) params.set("q", state.query);
  if (state.provider) params.set("provider", state.provider);
  if (state.page) params.set("page", String(state.page));
  return `/home?${params}`;
}

// Deterministic demonstration roster. Payer populations are disjoint, and MIPS
// overlaps the payer cohorts. Every obligation reconciles to the impact fixture.
// Membership results remain separate even when the person is the same.
export function buildMeasurePopulation(family: SharedMeasureFamily): SharedMeasurePatient[] {
  const patients = new Map<number, SharedMeasurePatient>();
  let offset = 0;
  family.obligations.forEach(obligation => {
    const definition = family.definitions.find(item => item.id === obligation.definitionId)!;
    const isMips = obligation.id === "mips-ecqm";
    const start = isMips ? 0 : offset;
    const { eligible, numerator } = obligation.impact;
    for (let index = 0; index < eligible; index++) {
      const personIndex = start + index;
      const inNumerator = index < numerator;
      const isOpen = definition.direction === "Lower is better" ? inNumerator : !inNumerator;
      let patient = patients.get(personIndex);
      if (!patient) {
        const serial = String(personIndex + 1).padStart(5, "0");
        const age = (obligation.id === "ma-quality" ? 65 : 46) + personIndex % 10;
        const provider = measureProviders[personIndex % measureProviders.length];
        patient = {
          id: `${family.id}-${serial}`, mrn: `SM-${family.id.slice(0, 3).toUpperCase()}-${serial}`,
          name: `${["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Jamie", "Robin", "Avery"][personIndex % 8]} ${["Bennett", "Carter", "Davis", "Ellis", "Hayes", "Morgan", "Reed", "Sutton"][Math.floor(personIndex / 8) % 8]}`,
          age, dateOfBirth: `${2026 - age}-01-15`, gender: family.id === "breast-screening" || personIndex % 2 === 0 ? "Female" : "Male", birthSex: family.id === "breast-screening" || personIndex % 2 === 0 ? "F" : "M",
          primaryContact: "--", contactType: "Not provided", totalUnmetMeasures: 0, opportunity: "Low",
          providerName: provider, provider, organizationClass: "Ambulatory", organization: ["Northstar Medical Group", "Lakeside Physicians", "Summit Family Health", "Eastside Primary Care"][personIndex % 4],
          payer: obligation.id === "aetna-commercial" ? "Aetna" : obligation.id === "united-commercial" ? "UnitedHealthcare" : obligation.id === "ma-quality" ? "Medicare Advantage" : "Medicaid",
          plan: obligation.label, registry: family.name, measure: family.name, measureStatus: "Closed", scorability: "Scorable", attributionStatus: "Attributed",
          recentVisitDate: `2026-09-${String(1 + personIndex % 28).padStart(2, "0")}`, nextAttributedProviderVisitDate: `2026-10-${String(1 + personIndex % 28).padStart(2, "0")}`, memberships: [],
        };
        patients.set(personIndex, patient);
      }
      patient.memberships.push({ obligationId: obligation.id, label: obligation.label, definitionId: definition.id, status: isOpen ? "Open" : "Met", evidence: isOpen ? family.id === "glycemic-status" ? "Poor control or missing assessment/result" : "Qualifying evidence or outcome missing" : "Measure criteria met in the modeled snapshot" });
    }
    if (!isMips) offset += eligible;
  });
  return Array.from(patients.values()).map(withScopedStatus);
}

function withScopedStatus(patient: SharedMeasurePatient): SharedMeasurePatient {
  const gaps = patient.memberships.filter(item => item.status === "Open").length;
  return { ...patient, totalUnmetMeasures: gaps, opportunity: gaps ? "High" : "Low", measureStatus: gaps ? "Open" : "Closed" };
}

export function filterMeasurePopulation(patients: SharedMeasurePatient[], state: MeasurePatientListState): SharedMeasurePatient[] {
  const query = state.query.trim().toLowerCase();
  return patients.flatMap(patient => {
    const memberships = patient.memberships.filter(item => state.obligationId === "all" || item.obligationId === state.obligationId);
    if (!memberships.length || (state.provider && state.provider !== patient.providerName)) return [];
    const scoped = withScopedStatus({ ...patient, memberships });
    if (state.status === "open" && scoped.totalUnmetMeasures === 0) return [];
    if (state.status === "met" && scoped.totalUnmetMeasures > 0) return [];
    if (query && !`${patient.name} ${patient.mrn} ${patient.providerName} ${patient.organization}`.toLowerCase().includes(query)) return [];
    return [scoped];
  });
}

export function measurePopulationCsv(patients: SharedMeasurePatient[]) {
  const cell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
  const rows = [["Name", "MRN", "Provider", "Measure", "Obligations", "Results"], ...patients.map(patient => [patient.name, patient.mrn, patient.providerName, patient.measure, patient.memberships.map(item => item.label).join("; "), patient.memberships.map(item => `${item.definitionId}: ${item.status}`).join("; ")])];
  return rows.map(row => row.map(cell).join(",")).join("\r\n");
}
