import type {
  ContractPopulationCostTierFilter,
  ContractPopulationPatient,
} from "@/types/contractPopulation";

export function getCostTierPatients(
  patients: ContractPopulationPatient[],
  tier: ContractPopulationCostTierFilter,
  fallbackHighCostPatients: ContractPopulationPatient[] = []
) {
  if (tier === "all") return fallbackHighCostPatients.length ? fallbackHighCostPatients : patients;

  const percent = tier === "top_1" ? 1 : tier === "top_5" ? 5 : 10;
  const patientCount = Math.max(1, Math.ceil((patients.length * percent) / 100));

  return [...patients].sort((a, b) => b.totalCostOfCare - a.totalCostOfCare).slice(0, patientCount);
}