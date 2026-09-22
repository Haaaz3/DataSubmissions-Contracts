import { getContractScorecardForContract } from "@/lib/agreementScorecardData";
import { mockContractAgreements, mockContracts } from "@/lib/mockData";
import { getPopulationPatients } from "@/lib/populationData";
import { getContractsForScope, getPortfolioContracts } from "@/lib/scorecards/selectors";
import type { AgreementDomainKey, ScorecardMetric } from "@/types/agreementScorecard";
import type {
  ContractPopulationDistributionBucket,
  ContractPopulationPatient,
  ContractPopulationSlice,
} from "@/types/contractPopulation";
import type { Contract } from "@/types/contract";
import type { PopulationPatientRow } from "@/types/population";
import type { ScorecardScopeType } from "@/types/scorecardScope";

const zipCodesByType: Record<Contract["contractType"], string[]> = {
  MSSP: ["02118", "02129", "02446", "02903", "04101", "06103", "06510", "07102"],
  "Medicare Advantage": ["44114", "45202", "46204", "48226", "53202", "55402", "60611", "63101"],
  Commercial: ["30303", "33131", "37203", "60606", "75201", "77002", "78701", "85004"],
};

const conditionPoolByType: Record<Contract["contractType"], string[]> = {
  MSSP: ["Hypertension", "Diabetes", "CKD", "CHF", "COPD", "Osteoarthritis", "Depression"],
  "Medicare Advantage": ["Hypertension", "Diabetes", "CHF", "CKD", "COPD", "Atrial fibrillation", "Medication adherence risk"],
  Commercial: ["Hypertension", "Obesity", "Depression", "Anxiety", "MSK / back pain", "Diabetes", "Asthma"],
};

const domainLabels: Record<AgreementDomainKey, string> = {
  quality_of_care: "Quality of Care",
  utilization_efficiency: "Utilization Efficiency",
  cost_management: "Cost Management",
  patient_experience: "Patient Experience",
  risk_adjustment: "Risk Adjustment",
  documentation: "Documentation",
};

function hashValue(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededNumber(seed: string, min: number, max: number) {
  const normalized = (hashValue(seed) % 10_000) / 10_000;
  return min + normalized * (max - min);
}

function seededInt(seed: string, min: number, max: number) {
  return Math.round(seededNumber(seed, min, max));
}

function pick<T>(items: T[], seed: string) {
  return items[hashValue(seed) % items.length];
}

function getMetric(contractId: string, domainKey?: AgreementDomainKey, metricId?: string) {
  if (!domainKey || !metricId) return undefined;
  return getContractScorecardForContract(contractId)
    ?.domains.find((domain) => domain.key === domainKey)
    ?.metrics.find((metric) => metric.id === metricId);
}

function targetPopulationCount(contract: Contract, domainKey?: AgreementDomainKey, metric?: ScorecardMetric) {
  if (metric?.populationCount) return metric.populationCount;
  if (!domainKey) return contract.attributedLives;

  const domainRatios: Record<AgreementDomainKey, number> = {
    quality_of_care: 0.58,
    utilization_efficiency: 0.22,
    cost_management: 0.72,
    patient_experience: 0.55,
    risk_adjustment: 0.48,
    documentation: 0.38,
  };

  return Math.max(1, Math.round(contract.attributedLives * domainRatios[domainKey]));
}

function selectBaseRows(contract: Contract, count: number, domainKey?: AgreementDomainKey, metricId?: string) {
  const rows = getPopulationPatients();
  const sorted = [...rows].sort(
    (a, b) =>
      hashValue(`${contract.id}:${domainKey ?? "contract"}:${metricId ?? "all"}:${a.id}`) -
      hashValue(`${contract.id}:${domainKey ?? "contract"}:${metricId ?? "all"}:${b.id}`)
  );
  return sorted.slice(0, Math.min(count, sorted.length));
}

function inferConditionCount(contract: Contract, row: PopulationPatientRow, metricId?: string) {
  const base = contract.contractType === "Commercial" ? 1 : 2;
  const riskAdd = row.opportunity === "High" ? 2 : row.opportunity === "Medium" ? 1 : 0;
  const metricAdd = metricId === "high-cost-concentration" || metricId === "chronic-control" ? 1 : 0;
  return Math.max(0, Math.min(5, base + riskAdd + metricAdd + seededInt(`${contract.id}:${row.id}:conditions`, -1, 1)));
}

function enrichPatient(contract: Contract, row: PopulationPatientRow, domainKey?: AgreementDomainKey, metric?: ScorecardMetric): ContractPopulationPatient {
  const metricId = metric?.id;
  const conditionPool = conditionPoolByType[contract.contractType];
  const chronicConditionCount = inferConditionCount(contract, row, metricId);
  const chronicConditions = Array.from({ length: chronicConditionCount }, (_, index) =>
    pick(conditionPool, `${contract.id}:${row.id}:condition:${index}`)
  ).filter((condition, index, all) => all.indexOf(condition) === index);

  const highCostSignal = row.opportunity === "High" || metricId === "high-cost-concentration";
  const pmpmMultiplier = highCostSignal
    ? seededNumber(`${contract.id}:${row.id}:high-cost`, 1.8, 7.5)
    : seededNumber(`${contract.id}:${row.id}:base-cost`, 0.35, 1.7);
  const pmpm = Math.round(contract.currentPmpm * pmpmMultiplier);
  const totalCostOfCare = pmpm * 12;
  const edVisits = Math.max(0, seededInt(`${contract.id}:${row.id}:ed`, 0, highCostSignal ? 8 : 3));
  const snfAdmits = contract.contractType === "Commercial" ? seededInt(`${contract.id}:${row.id}:snf`, 0, 1) : seededInt(`${contract.id}:${row.id}:snf`, 0, highCostSignal ? 3 : 1);
  const snfDays = snfAdmits * seededInt(`${contract.id}:${row.id}:snf-days`, 4, 18);
  const lastAttributedVisitYearsAgo = Math.max(0, seededInt(`${contract.id}:${row.id}:seen`, 0, 6));
  const scoreGapSignal = metric ? metric.currentStars < metric.targetStars : false;
  const hasOpenGap = scoreGapSignal
    ? hashValue(`${contract.id}:${row.id}:${metricId}:gap`) % 100 < 46
    : row.measureStatus !== "Closed" && hashValue(`${contract.id}:${row.id}:gap`) % 100 < 34;

  return {
    id: row.id,
    mrn: row.mrn,
    name: row.name,
    age: row.age,
    sex: row.gender,
    zipCode: pick(zipCodesByType[contract.contractType], `${contract.id}:${row.id}:zip`),
    attributedProvider: row.providerName === "--" ? row.provider : row.providerName,
    distanceToCareMiles: Number(seededNumber(`${contract.id}:${row.id}:distance`, 0.4, contract.contractType === "Commercial" ? 32 : 48).toFixed(1)),
    chronicConditions,
    chronicConditionCount: chronicConditions.length,
    lastAttributedVisitYearsAgo,
    totalCostOfCare,
    pmpm,
    edVisits,
    snfAdmits,
    snfDays,
    hasOpenGap,
    relatedMetricIds: metricId ? [metricId] : domainKey ? [domainKey] : [],
  };
}

function bucket(label: string, count: number, total: number): ContractPopulationDistributionBucket {
  return { label, count, percent: total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0 };
}

function countBy<T extends string>(items: ContractPopulationPatient[], labels: T[], resolver: (item: ContractPopulationPatient) => T) {
  return labels.map((label) => bucket(label, items.filter((item) => resolver(item) === label).length, items.length));
}

export function buildContractPopulationDistributions(patients: ContractPopulationPatient[]) {
  const conditionCounts = new Map<string, number>();
  patients.forEach((patient) => {
    patient.chronicConditions.forEach((condition) => conditionCounts.set(condition, (conditionCounts.get(condition) ?? 0) + 1));
  });

  const zipCounts = new Map<string, number>();
  patients.forEach((patient) => zipCounts.set(patient.zipCode, (zipCounts.get(patient.zipCode) ?? 0) + 1));

  return {
    age: countBy(patients, ["0-17", "18-44", "45-64", "65+"], (patient) => {
      if (patient.age < 18) return "0-17";
      if (patient.age < 45) return "18-44";
      if (patient.age < 65) return "45-64";
      return "65+";
    }),
    sex: countBy(patients, ["F", "M", "Other"], (patient) => (patient.sex === "F" ? "F" : patient.sex === "M" ? "M" : "Other")),
    zip: Array.from(zipCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([label, count]) => bucket(label, count, patients.length)),
    distanceToCare: countBy(patients, ["<5 mi", "5-15 mi", "15-30 mi", "30+ mi"], (patient) => {
      if (patient.distanceToCareMiles < 5) return "<5 mi";
      if (patient.distanceToCareMiles < 15) return "5-15 mi";
      if (patient.distanceToCareMiles < 30) return "15-30 mi";
      return "30+ mi";
    }),
    chronicConditions: Array.from(conditionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([label, count]) => bucket(label, count, patients.length)),
    chronicConditionBurden: countBy(patients, ["0", "1", "2", "3", "4+"], (patient) => {
      if (patient.chronicConditionCount >= 4) return "4+";
      return String(patient.chronicConditionCount) as "0" | "1" | "2" | "3";
    }),
    seenHistory: countBy(patients, ["≤1 year", "≤2 years", "≤3 years", "≤4 years", "≤5 years", "5+ years"], (patient) => {
      if (patient.lastAttributedVisitYearsAgo <= 1) return "≤1 year";
      if (patient.lastAttributedVisitYearsAgo <= 2) return "≤2 years";
      if (patient.lastAttributedVisitYearsAgo <= 3) return "≤3 years";
      if (patient.lastAttributedVisitYearsAgo <= 4) return "≤4 years";
      if (patient.lastAttributedVisitYearsAgo <= 5) return "≤5 years";
      return "5+ years";
    }),
  };
}

export function buildContractPopulationCostConcentration(patients: ContractPopulationPatient[]) {
  const sorted = [...patients].sort((a, b) => b.totalCostOfCare - a.totalCostOfCare);
  const totalCost = patients.reduce((sum, patient) => sum + patient.totalCostOfCare, 0);
  return ([1, 5, 10] as const).map((percent) => {
    const patientCount = Math.max(1, Math.ceil((patients.length * percent) / 100));
    const tierCost = sorted.slice(0, patientCount).reduce((sum, patient) => sum + patient.totalCostOfCare, 0);
    return {
      tier: `Top ${percent}%` as "Top 1%" | "Top 5%" | "Top 10%",
      patientCount,
      totalCost: tierCost,
      percentOfTotalCost: totalCost > 0 ? Number(((tierCost / totalCost) * 100).toFixed(1)) : 0,
    };
  });
}

function summarizePatients(denominatorPatients: ContractPopulationPatient[]) {
  const totalCostOfCare = denominatorPatients.reduce((sum, patient) => sum + patient.totalCostOfCare, 0);
  const snfAdmits = denominatorPatients.reduce((sum, patient) => sum + patient.snfAdmits, 0);
  const snfDays = denominatorPatients.reduce((sum, patient) => sum + patient.snfDays, 0);
  const edVisits = denominatorPatients.reduce((sum, patient) => sum + patient.edVisits, 0);
  const edCostImpact = edVisits * 1450;
  const snfCostImpact = snfDays * 650;
  const costConcentration = buildContractPopulationCostConcentration(denominatorPatients);

  return {
    summary: {
      totalCostOfCare,
      pmpm: denominatorPatients.length ? Math.round(totalCostOfCare / denominatorPatients.length / 12) : 0,
      edVisitsPer1000: denominatorPatients.length ? Math.round((edVisits / denominatorPatients.length) * 1000) : 0,
      snfUtilizationPer1000: denominatorPatients.length ? Math.round((snfAdmits / denominatorPatients.length) * 1000) : 0,
      avgSnfLengthOfStay: snfAdmits ? Number((snfDays / snfAdmits).toFixed(1)) : 0,
      edCostImpact,
      snfCostImpact,
      avoidableUtilizationCost: edCostImpact + snfCostImpact,
      highCostConcentrationCost: costConcentration.find((tier) => tier.tier === "Top 5%")?.totalCost ?? 0,
    },
    costConcentration,
  };
}

export function getContractPopulationSlice(params: {
  contractId: string;
  domainKey?: AgreementDomainKey;
  metricId?: string;
}): ContractPopulationSlice | undefined {
  const contract = mockContracts.find((item) => item.id === params.contractId);
  if (!contract) return undefined;

  const metric = getMetric(contract.id, params.domainKey, params.metricId);
  const targetCount = targetPopulationCount(contract, params.domainKey, metric);
  const rows = selectBaseRows(contract, targetCount, params.domainKey, params.metricId);
  const denominatorPatients = rows.map((row) => enrichPatient(contract, row, params.domainKey, metric));
  const gapPatients = denominatorPatients.filter((patient) => patient.hasOpenGap);
  const highCostPatients = [...denominatorPatients].sort((a, b) => b.totalCostOfCare - a.totalCostOfCare).slice(0, 50);
  const { costConcentration, summary } = summarizePatients(denominatorPatients);
  const representedLives = targetPopulationCount(contract, params.domainKey, metric);
  const label = metric?.label ?? (params.domainKey ? `${domainLabels[params.domainKey]} population` : "All attributed lives");

  return {
    contractId: contract.id,
    scope: metric ? "metric" : params.domainKey ? "domain" : "contract",
    domainKey: params.domainKey,
    metricId: params.metricId,
    label,
    description: metric
      ? `${metric.populationLabel ?? "Qualifying patients"} contributing to ${metric.label}.`
      : params.domainKey
        ? `Patients most relevant to the ${domainLabels[params.domainKey]} domain.`
        : `All attributed lives for ${contract.name}.`,
    representedLives,
    contractCount: 1,
    contractMix: [
      {
        contractId: contract.id,
        contractName: contract.name,
        payor: contract.payor,
        contractType: contract.contractType,
        attributedLives: contract.attributedLives,
        patientRecords: denominatorPatients.length,
        percentOfRepresentedLives: 100,
      },
    ],
    totalPatients: denominatorPatients.length,
    denominatorPatients,
    gapPatients,
    highCostPatients,
    summary,
    distributions: buildContractPopulationDistributions(denominatorPatients),
    costConcentration,
  };
}

export function getAggregateContractPopulationSlice(params: {
  scopeType: ScorecardScopeType;
  scopeId?: string;
  scopeLabel?: string;
  domainKey?: AgreementDomainKey;
  metricId?: string;
}): ContractPopulationSlice | undefined {
  if (params.scopeType === "contract") {
    return params.scopeId
      ? getContractPopulationSlice({
          contractId: params.scopeId,
          domainKey: params.domainKey,
          metricId: params.metricId,
        })
      : undefined;
  }

  const allContracts = getPortfolioContracts({ agreements: mockContractAgreements });
  const contracts = getContractsForScope({
    scopeType: params.scopeType,
    scopeId: params.scopeId,
    contracts: allContracts,
    agreements: mockContractAgreements,
  });

  if (!contracts.length) return undefined;

  const sourceSlices = contracts
    .map((contract) => {
      const slice = getContractPopulationSlice({
        contractId: contract.id,
        domainKey: params.domainKey,
        metricId: params.metricId,
      });
      return slice ? { contract, slice } : undefined;
    })
    .filter((item): item is { contract: Contract; slice: ContractPopulationSlice } => Boolean(item));

  if (!sourceSlices.length) return undefined;

  const denominatorPatients = sourceSlices.flatMap(({ contract, slice }) =>
    slice.denominatorPatients.map((patient) => ({
      ...patient,
      id: `${contract.id}:${patient.id}`,
      mrn: `${contract.id.toUpperCase()}-${patient.mrn}`,
      sourceContractId: contract.id,
      sourceContractName: contract.name,
      sourceContractPayor: contract.payor,
      sourceContractType: contract.contractType,
    }))
  );
  const gapPatients = denominatorPatients.filter((patient) => patient.hasOpenGap);
  const highCostPatients = [...denominatorPatients].sort((a, b) => b.totalCostOfCare - a.totalCostOfCare).slice(0, 50);
  const { costConcentration, summary } = summarizePatients(denominatorPatients);
  const representedLives = sourceSlices.reduce((sum, item) => sum + item.slice.representedLives, 0);
  const scopeLabel = params.scopeLabel ?? (params.scopeType === "portfolio" ? "Portfolio" : params.scopeId ?? "Selected scorecard");

  const contractMix = sourceSlices
    .map(({ contract, slice }) => ({
      contractId: contract.id,
      contractName: contract.name,
      payor: contract.payor,
      contractType: contract.contractType,
      attributedLives: contract.attributedLives,
      patientRecords: slice.denominatorPatients.length,
      percentOfRepresentedLives: representedLives
        ? Number(((slice.representedLives / representedLives) * 100).toFixed(1))
        : 0,
    }))
    .sort((a, b) => b.attributedLives - a.attributedLives);

  const firstSlice = sourceSlices[0].slice;

  return {
    contractId: `${params.scopeType}:${params.scopeId ?? "portfolio"}`,
    scope: firstSlice.scope,
    scorecardScope: {
      type: params.scopeType,
      id: params.scopeId ?? "enterprise",
      label: scopeLabel,
    },
    domainKey: params.domainKey,
    metricId: params.metricId,
    label:
      params.metricId && firstSlice.label
        ? firstSlice.label
        : params.domainKey
          ? `${domainLabels[params.domainKey]} population`
          : `${scopeLabel} attributed lives`,
    description:
      params.metricId && firstSlice.label
        ? `Qualifying lives contributing to ${firstSlice.label} across ${sourceSlices.length} contracts in ${scopeLabel}.`
        : params.domainKey
          ? `Patients most relevant to the ${domainLabels[params.domainKey]} domain across ${sourceSlices.length} contracts in ${scopeLabel}.`
          : `All attributed lives represented by the ${scopeLabel} scorecard cohort across ${sourceSlices.length} contracts.`,
    representedLives,
    contractCount: sourceSlices.length,
    contractMix,
    totalPatients: denominatorPatients.length,
    denominatorPatients,
    gapPatients,
    highCostPatients,
    summary,
    distributions: buildContractPopulationDistributions(denominatorPatients),
    costConcentration,
  };
}
