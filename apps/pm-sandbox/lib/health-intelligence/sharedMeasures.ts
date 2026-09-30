import type { SharedMeasureFamily, MeasureObligation } from "../../data/synthetic/sharedMeasures";
import type { HdiObligationId } from "../../data/synthetic/healthIntelligenceObligations";

export function filterSharedMeasures(families: SharedMeasureFamily[], query: string, program: HdiObligationId | "all") {
  const term = query.trim().toLocaleLowerCase();
  return families.flatMap(family => {
    const familyMatches = `${family.name} ${family.focus}`.toLocaleLowerCase().includes(term);
    const obligations = family.obligations.filter(obligation => {
      if (program !== "all" && obligation.programId !== program) return false;
      const definition = family.definitions.find(item => item.id === obligation.definitionId);
      const text = `${obligation.label} ${definition?.name} ${definition?.id} ${definition?.standard}`.toLocaleLowerCase();
      return familyMatches || text.includes(term);
    });
    return obligations.length ? [{ family, obligations }] : [];
  });
}

export function countMeasurePrograms(obligations: MeasureObligation[]) {
  return new Set(obligations.map(item => item.programId)).size;
}
