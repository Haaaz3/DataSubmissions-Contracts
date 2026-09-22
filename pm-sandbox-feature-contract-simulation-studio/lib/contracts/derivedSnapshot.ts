import { getActionsForContract } from "@/lib/actionData";
import { getCohortsForContract } from "@/lib/cohortData";
import {
  getQualityBlockedSavingsForContract,
  getTopFinancialPrioritiesForContract,
} from "@/lib/contracts/financialPriorities";
import { mockContracts } from "@/lib/mockData";
import { getInsightsForContract, getPopulationProfile } from "@/lib/populationData";
import type { ActionItem } from "@/types/action";
import type { Cohort } from "@/types/cohort";
import type {
  FinancialPriorityItem,
  QualityBlockedSavingsInsight,
} from "@/types/contractInsights";
import type { PopulationInsight, MemberPopulationProfile } from "@/types/population";

export interface ContractDerivedSnapshot {
  populationProfile: MemberPopulationProfile | undefined;
  populationInsights: PopulationInsight[];
  actions: ActionItem[];
  relatedCohorts: Cohort[];
  topFinancialPriorities: FinancialPriorityItem[];
  qualityBlockedInsight: QualityBlockedSavingsInsight | null;
}

const priorityOrder = { High: 0, Medium: 1, Low: 2 } as const;
const contractById = new Map(mockContracts.map((contract) => [contract.id, contract] as const));
const contractDerivedSnapshotCache = new Map<string, ContractDerivedSnapshot>();

function sortByPriority<T extends { priority: "High" | "Medium" | "Low" }>(items: T[]) {
  return [...items].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

function buildContractDerivedSnapshot(contractId: string): ContractDerivedSnapshot | undefined {
  const contract = contractById.get(contractId);
  if (!contract) return undefined;

  return {
    populationProfile: getPopulationProfile(contract.id),
    populationInsights: sortByPriority(getInsightsForContract(contract.id)),
    actions: sortByPriority(getActionsForContract(contract.id)),
    relatedCohorts: getCohortsForContract(contract.id),
    topFinancialPriorities: getTopFinancialPrioritiesForContract(contract, 5),
    qualityBlockedInsight: getQualityBlockedSavingsForContract(contract),
  };
}

export function getContractDerivedSnapshot(contractId: string): ContractDerivedSnapshot | undefined {
  const cached = contractDerivedSnapshotCache.get(contractId);
  if (cached) return cached;

  const snapshot = buildContractDerivedSnapshot(contractId);
  if (!snapshot) return undefined;

  contractDerivedSnapshotCache.set(contractId, snapshot);
  return snapshot;
}

export function warmContractDerivedSnapshots(contractIds?: string[]) {
  const ids = contractIds ?? mockContracts.map((contract) => contract.id);
  ids.forEach((id) => {
    void getContractDerivedSnapshot(id);
  });
}

export function invalidateContractDerivedSnapshot(contractId: string) {
  contractDerivedSnapshotCache.delete(contractId);
}
