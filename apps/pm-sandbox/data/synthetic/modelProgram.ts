import { publishedMeasuresFor } from "../reference/programQualityMeasures";

export type ModelProgramId = "cms-team" | "ambulatory-specialty-model";
export type Episode = {
  id: string; type: string; subtype: string; facility: string; attending: string; operating: string;
  month: number; spend: number; target: number; anchor: number; died: boolean;
  readmitted: boolean; safetyEvent: boolean; proComplete: boolean;
};
export const teamTypes = [
  { name: "Coronary artery bypass graft", short: "CABG", count: 29, better: 19, spend: 60488, subtypes: ["CABG with cardiac catheterization", "CABG without cardiac catheterization"] },
  { name: "Major bowel procedure", short: "Major bowel", count: 54, better: 35, spend: 37251, subtypes: ["Major bowel with MCC", "Major bowel without MCC"] },
  { name: "Surgical hip/femur fracture treatment", short: "Hip/femur fracture", count: 159, better: 83, spend: 42074, subtypes: ["Hip/femur treatment with MCC", "Hip/femur treatment without MCC"] },
  { name: "Lower extremity joint replacement", short: "Joint replacement", count: 388, better: 279, spend: 23741, subtypes: ["Hip replacement", "Knee replacement"] },
  { name: "Spinal fusion", short: "Spinal fusion", count: 102, better: 73, spend: 39356, subtypes: ["Cervical spinal fusion", "Lumbar spinal fusion"] },
];
export const asmTypes = [
  { name: "Heart failure", short: "Heart failure", count: 264, better: 178, spend: 18420, subtypes: ["Cardiology North", "Cardiology South"] },
  { name: "Low back pain", short: "Low back pain", count: 216, better: 142, spend: 6240, subtypes: ["Spine Clinic", "Physical Medicine"] },
];
export const modelProviders = ["Dr. Maya Patel", "Dr. James Chen", "Dr. Elena Rivera", "Dr. Owen Brooks"];
const facilities = ["Hyperion Medical Center", "Hyperion East"];

// Synthetic records for interactive navigation; no patient data or CMS-calculated results.
function makeEpisodes(program: ModelProgramId): Episode[] {
  const types = program === "cms-team" ? teamTypes : asmTypes;
  let sequence = 0;
  return types.flatMap((type, group) => Array.from({ length: type.count }, (_, i) => {
    const index = sequence++;
    const spend = type.spend + (i - (type.count - 1) / 2) * 18;
    const better = (i * (type.count - 1)) % type.count < type.better;
    // TEAM total target less actual = $420,168 across the 732 example episodes.
    const difference = better ? 2000 : program === "cms-team" ? -557832 / 243 : -1900;
    return {
      id: `${program === "cms-team" ? "TEAM" : "ASM"}-${String(index + 1).padStart(4, "0")}`,
      type: type.name, subtype: type.subtypes[i % type.subtypes.length], facility: facilities[Math.floor(i / 4) % 2],
      attending: modelProviders[i % 4], operating: program === "cms-team" ? modelProviders[(i + group + 1) % 4] : "Not applicable",
      month: 1 + index % 9, spend, target: spend + difference, anchor: spend * (0.48 + (i % 5) * 0.016),
      died: index % 83 === 0, readmitted: (index * 7) % 43 < 6,
      safetyEvent: index % 47 === 0, proComplete: (index * 3) % 10 < 7,
    };
  }));
}
export const modelEpisodes: Record<ModelProgramId, Episode[]> = {
  "cms-team": makeEpisodes("cms-team"), "ambulatory-specialty-model": makeEpisodes("ambulatory-specialty-model"),
};
export type CostFilters = { facility: string; episodeType: string; episodeSubtype: string; attending: string; operating: string; better: string; death: string; range: string };
export const emptyCostFilters: CostFilters = { facility: "all", episodeType: "all", episodeSubtype: "all", attending: "all", operating: "all", better: "all", death: "all", range: "all" };
export function filterEpisodes(episodes: Episode[], filters: CostFilters) {
  return episodes.filter(e =>
    (filters.facility === "all" || e.facility === filters.facility) &&
    (filters.episodeType === "all" || e.type === filters.episodeType) &&
    (filters.episodeSubtype === "all" || e.subtype === filters.episodeSubtype) &&
    (filters.attending === "all" || e.attending === filters.attending) &&
    (filters.operating === "all" || e.operating === filters.operating) &&
    (filters.better === "all" || (e.spend < e.target) === (filters.better === "yes")) &&
    (filters.death === "all" || e.died === (filters.death === "yes")) &&
    (filters.range === "all" || Math.ceil(e.month / 3) === Number(filters.range)));
}
export function episodeStats(episodes: Episode[]) {
  const count = episodes.length;
  const spend = episodes.reduce((sum, e) => sum + e.spend, 0);
  const target = episodes.reduce((sum, e) => sum + e.target, 0);
  const anchor = episodes.reduce((sum, e) => sum + e.anchor, 0);
  const better = episodes.filter(e => e.spend < e.target).length;
  return { count, spend, target, anchor, better, difference: target - spend,
    average: count ? spend / count : 0, averageTarget: count ? target / count : 0,
    averageAnchor: count ? anchor / count : 0, averagePost: count ? (spend - anchor) / count : 0,
    anchorShare: spend ? anchor / spend * 100 : 0, betterRate: count ? better / count * 100 : 0 };
}
export function groupEpisodes(episodes: Episode[], key: "type" | "subtype" | "attending" | "month") {
  const groups = new Map<string, Episode[]>();
  for (const episode of episodes) {
    const value = String(episode[key]);
    groups.set(value, [...(groups.get(value) ?? []), episode]);
  }
  return Array.from(groups, ([name, records]) => ({ name, records, ...episodeStats(records) }));
}

export type ModeledQuality = {
  key: string; label: string; current: number; target: number; unit: "%" | "index" | "points";
  lower: boolean; scaled?: number; volume?: number; history: number[];
};
const teamQuality: ModeledQuality[] = [
  { key: "team-hwr-claims", label: "Readmissions", current: 14.6, target: 14, unit: "%", lower: true, scaled: 78, volume: 732, history: [15.5, 15.3, 15.1, 15, 14.8, 14.6] },
  { key: "team-psi90", label: "Patient safety · PSI 90", current: 0.93, target: 1, unit: "index", lower: true, scaled: 70, volume: 732, history: [1.08, 1.03, 1.02, 0.98, 0.95, 0.93] },
  { key: "team-pro-2026", label: "THA/TKA patient-reported outcomes", current: 61, target: 65, unit: "%", lower: false, scaled: 74, volume: 388, history: [56, 57, 58, 59, 60, 61] },
];
const asmQuality: ModeledQuality[] = [
  { key: "asm-492", label: "Cardiovascular admissions", current: 18.2, target: 17, unit: "%", lower: true, history: [20, 19.8, 19.6, 19, 18.7, 18.2] },
  { key: "asm-008", label: "Beta-blocker therapy", current: 89, target: 90, unit: "%", lower: false, history: [83, 84, 86, 86, 88, 89] },
  { key: "asm-005", label: "ACE / ARB / ARNI therapy", current: 87, target: 90, unit: "%", lower: false, history: [82, 82, 84, 85, 86, 87] },
  { key: "asm-236", label: "Blood pressure control", current: 76, target: 80, unit: "%", lower: false, history: [71, 72, 73, 73, 75, 76] },
  { key: "asm-377", label: "Heart failure functional assessment", current: 81, target: 85, unit: "%", lower: false, history: [75, 76, 77, 79, 80, 81] },
  { key: "asm-238", label: "High-risk medications", current: 8, target: 7, unit: "%", lower: true, history: [10, 9.8, 9.6, 9, 8.5, 8] },
  { key: "asm-134", label: "Depression screening and follow-up", current: 83, target: 85, unit: "%", lower: false, history: [76, 78, 79, 81, 82, 83] },
  { key: "asm-128", label: "BMI screening and follow-up", current: 88, target: 85, unit: "%", lower: false, history: [83, 84, 84, 86, 87, 88] },
  { key: "asm-220", label: "Low back functional status change", current: 4.2, target: 5, unit: "points", lower: false, history: [2.8, 3.1, 3.5, 3.6, 4, 4.2] },
];
export function modelQuality(program: ModelProgramId) {
  const definitions = publishedMeasuresFor(program, program === "cms-team" ? 2026 : 2027);
  return (program === "cms-team" ? teamQuality : asmQuality).map(result => ({ ...result, definition: definitions.find(item => item.key === result.key)! }));
}
export function teamQualityContribution() {
  const total = teamQuality.reduce((sum, measure) => sum + measure.volume!, 0);
  return teamQuality.map(measure => ({ ...measure, weight: measure.volume! / total, contribution: measure.scaled! * measure.volume! / total }));
}
// Positive reconciliation example, Tracks 1–3; not a full settlement engine.
export function teamReconciliation() {
  const gross = episodeStats(modelEpisodes["cms-team"]).difference;
  const cqs = teamQualityContribution().reduce((sum, measure) => sum + measure.contribution, 0);
  const reductionRate = 0.1 * (1 - cqs / 100);
  const reduction = gross * reductionRate;
  return { gross, cqs, reductionRate, reduction, net: gross - reduction };
}

export type ModelView = { section: "overview" | "quality" | "cost"; tab: "summary" | "trends" | "episodes"; measure: string; provider: string; cohort: string; filters: CostFilters; page: number; episode: string };
export function parseModelView(params: URLSearchParams, program: ModelProgramId): ModelView {
  const rows = modelEpisodes[program];
  const filters = { ...emptyCostFilters };
  const fieldMap = { facility: "facility", episodeType: "type", episodeSubtype: "subtype", attending: "attending", operating: "operating" } as const;
  for (const key of Object.keys(fieldMap) as (keyof typeof fieldMap)[]) {
    const value = params.get(key);
    if (value && rows.some(e => e[fieldMap[key]] === value)) filters[key] = value;
  }
  if (filters.episodeType !== "all" && filters.episodeSubtype !== "all" && !rows.some(e => e.type === filters.episodeType && e.subtype === filters.episodeSubtype)) filters.episodeSubtype = "all";
  for (const key of ["better", "death"] as const) { const value = params.get(key); if (value === "yes" || value === "no") filters[key] = value; }
  const range = params.get("range"); if (range && ["1", "2", "3"].includes(range)) filters.range = range;
  const section = params.get("section"), tab = params.get("costTab"), measure = params.get("qualityMeasure") ?? "";
  const provider = params.get("qualityProvider") ?? "";
  const pageCount = Math.max(1, Math.ceil(filterEpisodes(rows, filters).length / 15));
  const page = Math.min(pageCount, Math.max(1, Math.floor(Number(params.get("episodePage"))) || 1));
  const episode = params.get("episode") ?? "";
  return { section: section === "quality" || section === "cost" ? section : "overview", tab: tab === "trends" || tab === "episodes" ? tab : "summary",
    measure: modelQuality(program).some(m => m.key === measure) ? measure : "", provider: modelProviders.includes(provider) ? provider : "",
    cohort: program === "ambulatory-specialty-model" && ["Heart failure", "Low back pain"].includes(params.get("qualityCohort") ?? "") ? params.get("qualityCohort")! : "all",
    filters, page, episode: filterEpisodes(rows, filters).some(e => e.id === episode) ? episode : "" };
}
export const modelViewKeys = ["section", "costTab", "qualityMeasure", "qualityProvider", "qualityCohort", "episodePage", "episode", ...Object.keys(emptyCostFilters)];
