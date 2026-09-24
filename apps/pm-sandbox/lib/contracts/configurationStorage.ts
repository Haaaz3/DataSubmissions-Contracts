import { normalizeContractConfiguration } from "./configurationNormalization";
import { seededContractConfigurations } from "@/data/synthetic/contractConfigurations";
import { createDefaultContractConfiguration } from "@/lib/contracts/configurationDefaults";
import type { ContractConfiguration } from "@/types/contractConfiguration";

const STORAGE_KEY = "contract.configurations.v1";

function readStoredConfigurations(): ContractConfiguration[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ContractConfiguration[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredConfigurations(configurations: ContractConfiguration[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(configurations));
}

export function listStoredContractConfigurations(): ContractConfiguration[] {
  return readStoredConfigurations();
}

export function saveContractConfiguration(configuration: ContractConfiguration): ContractConfiguration {
  const current = readStoredConfigurations().filter((item) => item.contractId !== configuration.contractId);
  const next: ContractConfiguration = {
    ...configuration,
    updatedAt: new Date().toISOString(),
  };
  writeStoredConfigurations([...current, next]);
  return next;
}

export function deleteContractConfiguration(contractId: string): void {
  const filtered = readStoredConfigurations().filter((item) => item.contractId !== contractId);
  writeStoredConfigurations(filtered);
}

export function loadContractConfiguration(contractId: string): ContractConfiguration {
  const stored = readStoredConfigurations().find((item) => item.contractId === contractId);
  if (stored) return normalizeContractConfiguration(stored);

  const seeded = seededContractConfigurations.find((item) => item.contractId === contractId);
  if (seeded) return normalizeContractConfiguration(seeded);

  return createDefaultContractConfiguration(contractId);
}
