import { describe, expect, it } from "vitest";
import { emptyCostFilters, episodeStats, filterEpisodes, groupEpisodes, modelEpisodes, modelQuality, parseModelView, teamQualityContribution, teamReconciliation } from "../data/synthetic/modelProgram";

describe("program analytics scenario", () => {
  it("reconciles the TEAM summary, episode breakdowns and quality contribution", () => {
    const episodes = modelEpisodes["cms-team"];
    const summary = episodeStats(episodes);
    expect(new Set(episodes.map(e => e.id)).size).toBe(732);
    expect(summary.count).toBe(732);
    expect(summary.better).toBe(489);
    expect(summary.betterRate).toBeCloseTo(66.8033, 3);
    expect(summary.difference / summary.count).toBeCloseTo(574);
    expect(summary.averageAnchor + summary.averagePost).toBeCloseTo(summary.average);
    for (const key of ["type", "subtype", "attending", "month"] as const) {
      const groups = groupEpisodes(episodes, key);
      expect(groups.reduce((sum, g) => sum + g.count, 0)).toBe(summary.count);
      expect(groups.reduce((sum, g) => sum + g.difference, 0)).toBeCloseTo(summary.difference);
    }
    const quality = teamQualityContribution();
    expect(quality.reduce((sum, q) => sum + q.weight, 0)).toBeCloseTo(1);
    expect(quality.find(q => q.key === "team-pro-2026")?.volume).toBe(episodes.filter(e => e.type === "Lower extremity joint replacement").length);
    const result = teamReconciliation();
    expect(result.cqs).toBeCloseTo(74);
    expect(result.gross).toBeCloseTo(420168);
    expect(result.reductionRate).toBeCloseTo(0.026);
    expect(result.reduction).toBeCloseTo(10924.368);
    expect(result.net).toBeCloseTo(409243.632);
  });
  it("combines filters and preserves exact provider drill-down membership", () => {
    const episodes = modelEpisodes["cms-team"];
    const chosen = episodes[0];
    const filters = { ...emptyCostFilters, episodeType: chosen.type, episodeSubtype: chosen.subtype, facility: chosen.facility, attending: chosen.attending, operating: chosen.operating, better: chosen.spend < chosen.target ? "yes" : "no", death: chosen.died ? "yes" : "no", range: String(Math.ceil(chosen.month / 3)) };
    const filtered = filterEpisodes(episodes, filters);
    expect(filtered).toContain(chosen);
    expect(filtered.length).toBeLessThan(episodes.length);
    expect(filtered.every(e => e.type === chosen.type && e.subtype === chosen.subtype && e.attending === chosen.attending && e.operating === chosen.operating && e.died === chosen.died)).toBe(true);
    for (const row of groupEpisodes(episodes, "attending")) {
      expect(filterEpisodes(episodes, { ...emptyCostFilters, attending: row.name })).toEqual(row.records);
    }
    expect(filterEpisodes(episodes, { ...emptyCostFilters, attending: "Unknown" })).toEqual([]);
    expect(episodeStats([])).toMatchObject({ count: 0, average: 0, betterRate: 0, anchorShare: 0 });
  });
  it("restores filtered details from URLs and rejects invalid navigation values", () => {
    const selected = modelEpisodes["cms-team"][4];
    const params = new URLSearchParams({ section: "cost", costTab: "episodes", attending: selected.attending, episode: selected.id, episodePage: "999" });
    const state = parseModelView(params, "cms-team");
    expect(state.section).toBe("cost");
    expect(state.tab).toBe("episodes");
    expect(state.filters.attending).toBe(selected.attending);
    expect(state.episode).toBe(selected.id);
    expect(state.page).toBe(Math.ceil(filterEpisodes(modelEpisodes["cms-team"], state.filters).length / 15));
    const incompatible = parseModelView(new URLSearchParams({ episodeType: "Spinal fusion", episodeSubtype: "Hip replacement" }), "cms-team");
    expect(incompatible.filters.episodeSubtype).toBe("all");
    const invalid = parseModelView(new URLSearchParams("section=bad&costTab=bad&qualityMeasure=asm-236&qualityProvider=Unknown&episodePage=-1&range=99&episode=ASM-0001&attending=Unknown"), "cms-team");
    expect(invalid).toMatchObject({ section: "overview", tab: "summary", measure: "", provider: "", episode: "", page: 1, filters: emptyCostFilters });
  });
  it("keeps published measure identities and ASM cohorts separate from TEAM scoring", () => {
    const team = modelQuality("cms-team");
    expect(team.map(m => m.definition.id)).toEqual(["CMIT 356", "CMIT 135", "CMIT 1618"]);
    const asm = modelQuality("ambulatory-specialty-model");
    expect(asm).toHaveLength(9);
    expect(asm.every(m => m.definition && !m.definition.pending && m.definition.from === 2027 && m.scaled === undefined)).toBe(true);
    expect(asm.filter(m => m.definition.group === "Heart failure")).toHaveLength(5);
    expect(asm.filter(m => m.definition.group === "Low back pain")).toHaveLength(4);
    expect(modelEpisodes["ambulatory-specialty-model"].every(e => ["Heart failure", "Low back pain"].includes(e.type))).toBe(true);
  });
});
