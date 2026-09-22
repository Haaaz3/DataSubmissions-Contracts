import type { AgreementDomainKey, ScorecardDomain } from "@/types/agreementScorecard";

export interface ScorecardDomainGroup {
  key: "quality_group" | "expense_group";
  label: string;
  domains: ScorecardDomain[];
  domainGroupScore: number;
  achievedDollars: number;
  potentialDollars: number;
  remainingOpportunity: number;
  domainCount: number;
  metricCount: number;
  populationCount: number;
}

const DOMAIN_GROUP_CONFIG: Array<{
  key: ScorecardDomainGroup["key"];
  label: string;
  domainKeys: AgreementDomainKey[];
}> = [
  {
    key: "quality_group",
    label: "Quality Group",
    domainKeys: ["quality_of_care", "patient_experience", "risk_adjustment", "documentation"],
  },
  {
    key: "expense_group",
    label: "Expense Group",
    domainKeys: ["utilization_efficiency", "cost_management"],
  },
];

function metricWeight(domain: ScorecardDomain) {
  return domain.metrics.reduce((sum, metric) => sum + Math.max(1, Math.round(metric.weight ?? 1)), 0);
}

function metricPopulation(domain: ScorecardDomain) {
  return domain.metrics.reduce((sum, metric) => sum + (metric.populationCount ?? 0), 0);
}

export function buildScorecardDomainGroups(domains: ScorecardDomain[]): ScorecardDomainGroup[] {
  return DOMAIN_GROUP_CONFIG.map((group) => {
    const groupedDomains = group.domainKeys
      .map((domainKey) => domains.find((domain) => domain.key === domainKey))
      .filter((domain): domain is ScorecardDomain => Boolean(domain));

    if (!groupedDomains.length) return null;

    const weightedScore = groupedDomains.reduce((sum, domain) => sum + domain.score * metricWeight(domain), 0);
    const totalMetricWeight = groupedDomains.reduce((sum, domain) => sum + metricWeight(domain), 0);
    const achievedDollars = groupedDomains.reduce((sum, domain) => sum + domain.achievedDollars, 0);
    const potentialDollars = groupedDomains.reduce((sum, domain) => sum + domain.potentialDollars, 0);

    return {
      key: group.key,
      label: group.label,
      domains: groupedDomains,
      domainGroupScore: totalMetricWeight > 0 ? Math.round(weightedScore / totalMetricWeight) : 0,
      achievedDollars,
      potentialDollars,
      remainingOpportunity: Math.max(0, potentialDollars - achievedDollars),
      domainCount: groupedDomains.length,
      metricCount: groupedDomains.reduce((sum, domain) => sum + domain.metrics.length, 0),
      populationCount: groupedDomains.reduce((sum, domain) => sum + metricPopulation(domain), 0),
    };
  }).filter((group): group is ScorecardDomainGroup => Boolean(group));
}
