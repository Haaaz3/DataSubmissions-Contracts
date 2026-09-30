"use client";
import { useEffect, useState } from "react";
import type { CostUnit } from "./vbcFinancials";
const valid = (value: unknown): value is CostUnit => value === "pmpm" || value === "pmpy" || value === "annual";
export function useExpenseBasis(id: string, fallback: CostUnit = "pmpm") {
  const [unit, setUnit] = useState<CostUnit>(fallback);
  useEffect(() => {
    const read = () => {
      try { const value = localStorage.getItem("hdi-expense-basis:" + id); setUnit(valid(value) ? value : fallback); }
      catch { setUnit(fallback); }
    };
    read(); window.addEventListener("storage", read); window.addEventListener("hdi-expense-basis", read);
    return () => { window.removeEventListener("storage", read); window.removeEventListener("hdi-expense-basis", read); };
  }, [id, fallback]);
  const change = (value: CostUnit) => {
    setUnit(value);
    try { localStorage.setItem("hdi-expense-basis:" + id, value); window.dispatchEvent(new Event("hdi-expense-basis")); } catch { /* The current view still works when storage is unavailable. */ }
  };
  return [unit, change] as const;
}
