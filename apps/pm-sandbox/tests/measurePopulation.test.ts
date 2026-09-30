import { describe, expect, it } from "vitest";
import { sharedMeasureFamilies } from "../data/synthetic/sharedMeasures";
import { calculateMeasureImpact } from "../lib/health-intelligence/sharedMeasures";
import { buildMeasurePopulation, filterMeasurePopulation, measurePatientState, measurePatientHref, parseMeasurePatientState, measurePopulationCsv } from "../lib/health-intelligence/measurePopulation";

describe("shared measure patient populations", () => {
  for (const family of sharedMeasureFamilies) it(`reconciles every ${family.name} obligation to its eligible and gap counts`, () => {
    const population = buildMeasurePopulation(family);
    for (const obligation of family.obligations) {
      const state = measurePatientState(family.id, obligation.id);
      const impact = calculateMeasureImpact(obligation.impact, family.definitions.find(item => item.id === obligation.definitionId)!.direction);
      expect(filterMeasurePopulation(population, state)).toHaveLength(obligation.impact.eligible);
      expect(filterMeasurePopulation(population, { ...state, status: "open" })).toHaveLength(impact.openGaps);
      expect(filterMeasurePopulation(population, { ...state, status: "met" })).toHaveLength(obligation.impact.eligible - impact.openGaps);
      expect(obligation.history.at(-1)).toMatchObject({ eligible: obligation.impact.eligible, numerator: obligation.impact.numerator });
    }
  });

  it("deduplicates overlapping obligations while preserving each result", () => {
    const family = sharedMeasureFamilies[0];
    const patients = buildMeasurePopulation(family);
    expect(patients).toHaveLength(21900);
    expect(new Set(patients.map(patient => patient.id)).size).toBe(patients.length);
    expect(patients.reduce((sum, patient) => sum + patient.memberships.length, 0)).toBe(25100);
    const mixed = patients.find(patient => patient.memberships.some(item => item.obligationId === "aetna-commercial" && item.status === "Open") && patient.memberships.some(item => item.obligationId === "mips-ecqm" && item.status === "Met"))!;
    expect(mixed).toBeDefined();
    expect(filterMeasurePopulation([mixed], measurePatientState(family.id, "aetna-commercial", "open"))).toHaveLength(1);
    expect(filterMeasurePopulation([mixed], measurePatientState(family.id, "mips-ecqm", "open"))).toHaveLength(0);
    expect(filterMeasurePopulation([mixed], measurePatientState(family.id, "all", "open"))).toHaveLength(1);
    expect(filterMeasurePopulation([mixed], measurePatientState(family.id, "all", "met"))).toHaveLength(0);
  });

  it("combines scope, status, provider and MRN filters without changing identities", () => {
    const patients = buildMeasurePopulation(sharedMeasureFamilies[0]);
    const member = patients[599];
    const state = { ...measurePatientState("blood-pressure", "aetna-commercial", "open"), query: member.mrn, provider: member.providerName };
    expect(filterMeasurePopulation(patients, state).map(patient => patient.id)).toEqual([member.id]);
    expect(filterMeasurePopulation(patients, { ...state, obligationId: "united-commercial" })).toHaveLength(0);
    expect(filterMeasurePopulation(patients, { ...state, query: "no match" })).toHaveLength(0);
  });

  it("round-trips list filters and never widens invalid obligations to all patients", () => {
    const state = { ...measurePatientState("glycemic-status", "mips-ecqm", "open"), query: "Morgan & Reed", provider: "Dr. Morgan Lee", page: 2 };
    const url = new URL(measurePatientHref(state), "http://localhost");
    expect(parseMeasurePatientState(url.searchParams)).toEqual(state);
    url.searchParams.set("measureObligation", "missing-contract");
    expect(parseMeasurePatientState(url.searchParams)).toBeNull();
    expect(parseMeasurePatientState(new URLSearchParams("measureFamily=unknown"))).toBeNull();
    expect(parseMeasurePatientState(new URLSearchParams("measureFamily=blood-pressure&gapStatus=unknown"))).toBeNull();
  });

  it("exports the full filtered population with obligation-specific results", () => {
    const patients = buildMeasurePopulation(sharedMeasureFamilies[0]);
    const filtered = filterMeasurePopulation(patients, measurePatientState("blood-pressure", "aetna-commercial", "open"));
    const csv = measurePopulationCsv(filtered);
    expect(csv.split("\r\n")).toHaveLength(169);
    expect(csv).toContain("CBP: Open");
    expect(csv).not.toContain("CMS165v14");
    expect(csv).not.toContain("United Commercial");
  });
});
