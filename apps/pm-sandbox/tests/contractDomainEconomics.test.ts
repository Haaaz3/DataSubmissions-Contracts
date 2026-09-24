import { describe, expect, it } from "vitest";
import { seededContractConfigurations } from "@/data/synthetic/contractConfigurations";

describe("domain economics seed modeling", () => {
  it("includes seeded configurations for MSSP, Medicare Advantage, and Commercial", () => {
    const ids = seededContractConfigurations.map((config) => config.contractId);
    expect(ids).toContain("mssp-001");
    expect(ids).toContain("ma-001");
    expect(ids).toContain("comm-001");
  });

  it("adds domain economic rules for each seeded contract archetype", () => {
    seededContractConfigurations.forEach((config) => {
      expect(config.domainEconomicRules).toBeDefined();
      expect(config.domainEconomicRules?.length ?? 0).toBeGreaterThan(0);
      config.domainEconomicRules?.forEach((rule) => {
        expect(rule.contractId).toBe(config.contractId);
        expect(rule.domainKey).toBeTruthy();
        expect(rule.mechanism).toBeTruthy();
        expect(rule.direction).toBeTruthy();
        expect(rule.settlementBasis).toBeTruthy();
      });
    });
  });

  it("includes representative mechanics: gate, penalty/bonus, and modifier/uplift", () => {
    const allRules = seededContractConfigurations.flatMap((config) => config.domainEconomicRules ?? []);

    expect(allRules.some((rule) => rule.mechanism === "gate")).toBe(true);
    expect(allRules.some((rule) => rule.mechanism === "bonus" || rule.mechanism === "penalty")).toBe(true);
    expect(allRules.some((rule) => rule.mechanism === "savings_modifier" || rule.mechanism === "risk_adjustment_uplift")).toBe(true);
  });
});
