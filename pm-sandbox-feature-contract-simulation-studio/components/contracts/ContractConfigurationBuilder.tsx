"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { kpiCatalog } from "@/data/synthetic/kpiCatalog";
import { getContractConfigurationPreview } from "@/lib/contracts/configurationPreview";
import { loadContractConfiguration, saveContractConfiguration } from "@/lib/contracts/configurationStorage";
import { validateContractConfiguration } from "@/lib/contracts/configurationValidation";
import type {
  ContractConfiguration,
  ContractIncentiveRule,
  ContractMetricSelection,
  ContractMetricTarget,
  IncentiveType,
} from "@/types/contractConfiguration";
import ContractBasicsStep from "@/components/contracts/ContractBasicsStep";
import KpiCatalogSelectorStep from "@/components/contracts/KpiCatalogSelectorStep";
import ContractTargetsStep from "@/components/contracts/ContractTargetsStep";
import IncentiveRuleBuilderStep from "@/components/contracts/IncentiveRuleBuilderStep";
import FinancialTermsStep from "@/components/contracts/FinancialTermsStep";
import ContractConfigurationReviewStep from "@/components/contracts/ContractConfigurationReviewStep";
import ContractConfigurationSummaryRail from "@/components/contracts/ContractConfigurationSummaryRail";

const STEPS = ["Basics", "KPI Catalog", "Targets", "Incentives", "Financial Terms", "Review"] as const;

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function createDefaultIncentiveRule(contractId: string): ContractIncentiveRule {
  return {
    id: createId("rule"),
    contractId,
    name: "",
    incentiveType: "fixed_payout",
    linkedContractMetricSelectionIds: [],
    payoutBasis: "fixed",
    payoutAmount: undefined,
    payoutRate: undefined,
    capAmount: undefined,
    floorAmount: undefined,
    allOrNothing: false,
    tiers: [],
    notes: "",
  };
}

function createDefaultTarget(contractId: string, selectionId: string): ContractMetricTarget {
  return {
    id: createId("target"),
    contractId,
    contractMetricSelectionId: selectionId,
    targetType: "absolute",
  };
}

export default function ContractConfigurationBuilder({ contractId }: { contractId: string }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [config, setConfig] = useState<ContractConfiguration>(() => loadContractConfiguration(contractId));
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  const preview = useMemo(() => getContractConfigurationPreview(config), [config]);
  const issues = useMemo(() => validateContractConfiguration(config), [config]);
  const canGoNext = stepIndex < STEPS.length - 1;

  const updateConfig = (updater: (current: ContractConfiguration) => ContractConfiguration) => {
    setConfig((current) => ({
      ...updater(current),
      updatedAt: new Date().toISOString(),
    }));
    setSaveState("idle");
  };

  const handleSave = () => {
    setSaveState("saving");
    const saved = saveContractConfiguration(config);
    setConfig(saved);
    setSaveState("saved");
    window.setTimeout(() => setSaveState("idle"), 1200);
  };

  const handleAddKpi = (kpiId: string) => {
    const alreadySelected = config.selectedMetrics.some((item) => item.kpiCatalogItemId === kpiId);
    if (alreadySelected) return;

    updateConfig((current) => {
      const selectionId = createId("selection");
      const selection: ContractMetricSelection = {
        id: selectionId,
        contractId: current.contractId,
        kpiCatalogItemId: kpiId,
        role: "scored",
        displayOrder: current.selectedMetrics.length,
      };

      return {
        ...current,
        selectedMetrics: [...current.selectedMetrics, selection],
        metricTargets: [...current.metricTargets, createDefaultTarget(current.contractId, selectionId)],
      };
    });
  };

  const handleRemoveKpi = (selectionId: string) => {
    updateConfig((current) => ({
      ...current,
      selectedMetrics: current.selectedMetrics
        .filter((item) => item.id !== selectionId)
        .map((item, index) => ({ ...item, displayOrder: index })),
      metricTargets: current.metricTargets.filter((item) => item.contractMetricSelectionId !== selectionId),
      incentiveRules: current.incentiveRules.map((rule) => ({
        ...rule,
        linkedContractMetricSelectionIds: rule.linkedContractMetricSelectionIds.filter((id) => id !== selectionId),
      })),
    }));
  };

  const handleRoleChange = (selectionId: string, role: ContractMetricSelection["role"]) => {
    updateConfig((current) => ({
      ...current,
      selectedMetrics: current.selectedMetrics.map((item) =>
        item.id === selectionId ? { ...item, role } : item
      ),
    }));
  };

  const handleTargetChange = (selectionId: string, patch: Partial<ContractMetricTarget>) => {
    updateConfig((current) => {
      const existing = current.metricTargets.find((item) => item.contractMetricSelectionId === selectionId);
      if (!existing) {
        return {
          ...current,
          metricTargets: [
            ...current.metricTargets,
            {
              ...createDefaultTarget(current.contractId, selectionId),
              ...patch,
            },
          ],
        };
      }
      return {
        ...current,
        metricTargets: current.metricTargets.map((item) =>
          item.contractMetricSelectionId === selectionId ? { ...item, ...patch } : item
        ),
      };
    });
  };

  const handleAddRule = () => {
    updateConfig((current) => ({
      ...current,
      incentiveRules: [...current.incentiveRules, createDefaultIncentiveRule(current.contractId)],
    }));
  };

  const handleRemoveRule = (ruleId: string) => {
    updateConfig((current) => ({
      ...current,
      incentiveRules: current.incentiveRules.filter((item) => item.id !== ruleId),
    }));
  };

  const handleRuleChange = (ruleId: string, patch: Partial<ContractIncentiveRule>) => {
    updateConfig((current) => ({
      ...current,
      incentiveRules: current.incentiveRules.map((item) => {
        if (item.id !== ruleId) return item;
        const nextType = (patch.incentiveType ?? item.incentiveType) as IncentiveType;
        return {
          ...item,
          ...patch,
          tiers: nextType === "tiered_payout" ? (patch.tiers ?? item.tiers ?? []) : patch.tiers ?? item.tiers,
        };
      }),
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contract Configuration Studio</h1>
          <p className="mt-1 text-sm text-slate-500">Configure KPI catalog selection, targets, incentives, and terms.</p>
        </div>
        <Link
          href={`/contracts/${contractId}`}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Back to Contract
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr),20rem]">
        <div className="space-y-4">
          <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-wrap gap-2">
              {STEPS.map((step, index) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => setStepIndex(index)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    index === stepIndex
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {index + 1}. {step}
                </button>
              ))}
            </div>
          </div>

          {stepIndex === 0 && (
            <ContractBasicsStep
              basics={config.basics}
              onChange={(key, value) =>
                updateConfig((current) => ({
                  ...current,
                  basics: {
                    ...current.basics,
                    [key]: value,
                  },
                }))
              }
            />
          )}

          {stepIndex === 1 && (
            <KpiCatalogSelectorStep
              catalog={kpiCatalog}
              selectedMetrics={config.selectedMetrics}
              onAddKpi={handleAddKpi}
              onRemoveKpi={handleRemoveKpi}
              onRoleChange={handleRoleChange}
            />
          )}

          {stepIndex === 2 && (
            <ContractTargetsStep
              selectedMetrics={config.selectedMetrics}
              metricTargets={config.metricTargets}
              catalog={kpiCatalog}
              onTargetChange={handleTargetChange}
            />
          )}

          {stepIndex === 3 && (
            <IncentiveRuleBuilderStep
              rules={config.incentiveRules}
              selectedMetrics={config.selectedMetrics}
              onAddRule={handleAddRule}
              onRemoveRule={handleRemoveRule}
              onRuleChange={handleRuleChange}
            />
          )}

          {stepIndex === 4 && (
            <FinancialTermsStep
              terms={config.financialTerms}
              selectedMetrics={config.selectedMetrics}
              onChange={(key, value) =>
                updateConfig((current) => ({
                  ...current,
                  financialTerms: {
                    ...current.financialTerms,
                    [key]: value,
                  },
                }))
              }
            />
          )}

          {stepIndex === 5 && (
            <ContractConfigurationReviewStep
              config={config}
              preview={preview}
              issues={issues}
              catalog={kpiCatalog}
            />
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
            <button
              type="button"
              onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
              disabled={stepIndex === 0}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ← Back
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSave}
                className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => setStepIndex((current) => Math.min(STEPS.length - 1, current + 1))}
                disabled={!canGoNext}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        <ContractConfigurationSummaryRail
          preview={preview}
          issues={issues}
          currentStep={stepIndex + 1}
          totalSteps={STEPS.length}
          saveState={saveState}
        />
      </div>
    </div>
  );
}
