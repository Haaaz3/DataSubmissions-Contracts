import { Contract } from "@/types/contract";

const STORAGE_KEY = "ci-created-contracts";

/** Load all user-created contracts from localStorage */
export function loadStoredContracts(): Contract[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Contract[]) : [];
  } catch {
    return [];
  }
}

/** Load a single user-created contract by id */
export function loadStoredContractById(id: string): Contract | undefined {
  return loadStoredContracts().find((c) => c.id === id);
}

/** Persist a new or updated contract */
export function saveContract(contract: Contract): void {
  if (typeof window === "undefined") return;
  const existing = loadStoredContracts().filter((c) => c.id !== contract.id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, contract]));
}

/** Delete a user-created contract */
export function deleteStoredContract(id: string): void {
  if (typeof window === "undefined") return;
  const filtered = loadStoredContracts().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/** Generate a unique draft contract ID */
export function generateContractId(): string {
  return `draft-${Date.now()}`;
}
