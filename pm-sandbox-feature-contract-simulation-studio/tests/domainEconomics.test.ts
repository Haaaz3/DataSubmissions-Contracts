import { describe, expect, it } from "vitest";
import { evaluateContractDomainEconomics } from "@/lib/contracts/domainEconomics";
import type { ContractScorecard } from "@/types/agreementScorecard";
import type { ContractDomainEconomicRule } from "@/types/contractDomainEconomics";

function buildScorecard(domainScoreByKey: Partial<Record<ContractDomainEconomicRule["domainKey"], number>>): ContractScorecard {
  const defaults: Record<ContractDomainEconomicRule["domainKey"], number> = {
    quality_of_care: 82,
    utilization_efficiency: 75,
    cost_management: 78,
    patient_experience: 80,
    risk_adjustment: 79,
    documentation: 81,
  };

  const byKey = { ...defaults, ...domainScoreByKey };

  return {
    contractId: "contract-1",
    contractName: "Test Contract",
    payor: "Test Payor",
    asOfDate: "Mar 2026",
    overallScore: 80,
    overallStars: 4,
    status: "On Track",
    headline: "",
    domains: [
      {
        key: "quality_of_care",
        label: "Quality of Care",
        description: "",
        score: byKey.quality_of_care,
        status: "on_track",
        trendDirection: "up",
        trendPercent: 2,
        executiveInsight: "",
        metrics: [],
        currentStars: 4.2,
        targetStars: 4.5,
        benchmarkStars: 4,
        achievedDollars: 100000,
        potentialDollars: 160000,
      },
      {
        key: "utilization_efficiency",
        label: "Utilization Efficiency",
        description: "",
        score: byKey.utilization_efficiency,
        status: "watch",
        trendDirection: "up",
        trendPercent: 2,
        executiveInsight: "",
        metrics: [],
        currentStars: 3.6,
        targetStars: 4.4,
        benchmarkStars: 3.9,
        achievedDollars: 90000,
        potentialDollars: 150000,
      },
      {
        key: "cost_management",
        label: "Cost Management",
        description: "",
        score: byKey.cost_management,
        status: "watch",
        trendDirection: "up",
        trendPercent: 2,
        executiveInsight: "",
        metrics: [],
        currentStars: 3.7,
        targetStars: 4.4,
        benchmarkStars: 4,
        achievedDollars: 110000,
        potentialDollars: 170000,
      },
      {
        key: "patient_experience",
        label: "Patient Experience",
        description: "",
        score: byKey.patient_experience,
        status: "watch",
        trendDirection: "up",
        trendPercent: 2,
        executiveInsight: "",
        metrics: [],
        currentStars: 3.9,
        targetStars: 4.3,
        benchmarkStars: 4,
        achievedDollars: 70000,
        potentialDollars: 120000,
      },
      {
        key: "risk_adjustment",
        label: "Risk Adjustment",
        description: "",
        score: byKey.risk_adjustment,
        status: "watch",
        trendDirection: "up",
        trendPercent: 2,
        executiveInsight: "",
        metrics: [],
        currentStars: 3.8,
        targetStars: 4.3,
        benchmarkStars: 3.9,
        achievedDollars: 65000,
        potentialDollars: 115000,
      },
      {
        key: "documentation",
        label: "Documentation",
        description: "",
        score: byKey.documentation,
        status: "watch",
        trendDirection: "up",
        trendPercent: 2,
        executiveInsight: "",
        metrics: [],
        currentStars: 4,
        targetStars: 4.4,
        benchmarkStars: 4.1,
        achievedDollars: 60000,
        potentialDollars: 100000,
      },
    ],
  };
}

describe("evaluateContractDomainEconomics", () => {
  it("evaluates gate rules and marks blocked domains", () => {
    const scorecard = buildScorecard({ quality_of_care: 74 });
    const rules: ContractDomainEconomicRule[] = [
      {
        id: "rule-gate",
        contractId: "contract-1",
        domainKey: "quality_of_care",
        mechanism: "gate",
        direction: "gate_only",
        settlementBasis: "percent_of_savings",
        thresholdScore: 80,
        gateBlocksSettlement: true,
      },
    ];

    const summary = evaluateContractDomainEconomics({ contractId: "contract-1", scorecard, rules });
    expect(summary.blockedByDomains).toEqual(["quality_of_care"]);
    expect(summary.domainImpacts[0]?.settlementBlocked).toBe(true);
  });

  it("applies fixed bonus and fixed penalty mechanics", () => {
    const scorecard = buildScorecard({ quality_of_care: 86, utilization_efficiency: 65 });
    const rules: ContractDomainEconomicRule[] = [
      {
        id: "rule-bonus",
        contractId: "contract-1",
        domainKey: "quality_of_care",
        mechanism: "bonus",
        direction: "upside",
        settlementBasis: "fixed_amount",
        thresholdScore: 80,
        payoutAmount: 200000,
      },
      {
        id: "rule-penalty",
        contractId: "contract-1",
        domainKey: "utilization_efficiency",
        mechanism: "penalty",
        direction: "downside",
        settlementBasis: "fixed_amount",
        thresholdScore: 70,
        penaltyAmount: 125000,
      },
    ];

    const summary = evaluateContractDomainEconomics({ contractId: "contract-1", scorecard, rules });
    expect(summary.totalDomainBonusAmount).toBe(200000);
    expect(summary.totalDomainPenaltyAmount).toBe(125000);
    expect(summary.totalDomainNetImpactAmount).toBe(75000);
  });

  it("applies tiered/savings modifiers using baseline savings", () => {
    const scorecard = buildScorecard({ cost_management: 88 });
    const rules: ContractDomainEconomicRule[] = [
      {
        id: "rule-modifier",
        contractId: "contract-1",
        domainKey: "cost_management",
        mechanism: "savings_modifier",
        direction: "both",
        settlementBasis: "percent_of_savings",
        tiers: [
          { id: "tier-high", label: "High", minScore: 85, multiplier: 1.1 },
          { id: "tier-mid", label: "Mid", minScore: 70, maxScore: 84.9, multiplier: 1 },
        ],
      },
    ];

    const summary = evaluateContractDomainEconomics({
      contractId: "contract-1",
      scorecard,
      rules,
      baselineSavingsAmount: 500000,
    });

    expect(summary.totalDomainBonusAmount).toBe(50000);
    expect(summary.totalDomainPenaltyAmount).toBe(0);
    expect(summary.totalDomainNetImpactAmount).toBe(50000);
    expect(summary.domainImpacts[0]?.triggeredTierLabel).toBe("High");
  });

  it("applies risk adjustment uplift from benchmark revenue", () => {
    const scorecard = buildScorecard({ risk_adjustment: 90 });
    const rules: ContractDomainEconomicRule[] = [
      {
        id: "rule-raf",
        contractId: "contract-1",
        domainKey: "risk_adjustment",
        mechanism: "risk_adjustment_uplift",
        direction: "upside",
        settlementBasis: "percent_of_premium",
        payoutRate: 1.5,
      },
    ];

    const summary = evaluateContractDomainEconomics({
      contractId: "contract-1",
      scorecard,
      rules,
      benchmarkRevenueAmount: 10000000,
    });

    expect(summary.totalDomainBonusAmount).toBe(150000);
    expect(summary.totalDomainNetImpactAmount).toBe(150000);
  });
});
