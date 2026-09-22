import { kpiCatalog } from "@/data/synthetic/kpiCatalog";
import type {
  ContractConfiguration,
  ContractIncentiveRule,
  ContractMetricSelection,
  KpiDirectionality,
} from "@/types/contractConfiguration";

export interface ValidationIssue {
  code: string;
  message: string;
  severity: "error" | "warning";
  scope: "basics" | "selection" | "targets" | "incentives" | "financialTerms" | "review";
}

function isEmpty(value?: string) {
  return !value || !value.trim();
}

function targetOrderingValid(directionality: KpiDirectionality, threshold?: number, target?: number, stretch?: number) {
  if (threshold == null || target == null) return true;

  if (directionality === "higher_is_better") {
    if (threshold > target) return false;
    if (stretch != null && target > stretch) return false;
    return true;
  }

  if (directionality === "lower_is_better") {
    if (threshold < target) return false;
    if (stretch != null && target < stretch) return false;
    return true;
  }

  return true;
}

function findDirectionality(selection: ContractMetricSelection) {
  return kpiCatalog.find((kpi) => kpi.id === selection.kpiCatalogItemId)?.directionality;
}

function validateBasics(config: ContractConfiguration): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (isEmpty(config.basics.name)) {
    issues.push({
      code: "missing_name",
      message: "Contract name is required.",
      severity: "error",
      scope: "basics",
    });
  }
  if (isEmpty(config.basics.payer)) {
    issues.push({
      code: "missing_payer",
      message: "Payer is required.",
      severity: "error",
      scope: "basics",
    });
  }
  if (isEmpty(config.basics.startDate)) {
    issues.push({
      code: "missing_start_date",
      message: "Contract start date is required.",
      severity: "error",
      scope: "basics",
    });
  }
  if (config.basics.endDate && config.basics.startDate && config.basics.endDate < config.basics.startDate) {
    issues.push({
      code: "invalid_date_order",
      message: "End date must be after start date.",
      severity: "error",
      scope: "basics",
    });
  }
  return issues;
}

function validateSelection(config: ContractConfiguration): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (config.selectedMetrics.length === 0) {
    issues.push({
      code: "no_metrics_selected",
      message: "At least one KPI must be selected.",
      severity: "error",
      scope: "selection",
    });
  }
  return issues;
}

function validateTargets(config: ContractConfiguration): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const scoredSelections = config.selectedMetrics.filter((selection) => selection.role === "scored");

  const totalWeight = scoredSelections.reduce((sum, selection) => {
    const target = config.metricTargets.find((item) => item.contractMetricSelectionId === selection.id);
    return sum + (target?.weight ?? 0);
  }, 0);

  if (scoredSelections.length > 0 && totalWeight !== 100) {
    issues.push({
      code: "weight_total_not_100",
      message: `Scored KPI weights total ${totalWeight}. Recommended total is 100.`,
      severity: "warning",
      scope: "targets",
    });
  }

  config.selectedMetrics.forEach((selection) => {
    const target = config.metricTargets.find((item) => item.contractMetricSelectionId === selection.id);
    if (!target) {
      issues.push({
        code: `missing_target_${selection.id}`,
        message: `Selected KPI (${selection.kpiCatalogItemId}) is missing target configuration.`,
        severity: "warning",
        scope: "targets",
      });
      return;
    }

    if (target.targetType === "range" && (!Number.isFinite(target.minRangeValue) || !Number.isFinite(target.maxRangeValue) || target.minRangeValue! > target.maxRangeValue!)) {
      issues.push({ code: `invalid_range_${selection.id}`, message: "Range targets need a minimum and maximum in ascending order.", severity: "error", scope: "targets" });
    }
    const directionality = target.directionalityOverride ?? findDirectionality(selection) ?? "higher_is_better";
    if (!targetOrderingValid(directionality, target.thresholdValue, target.targetValue, target.stretchValue)) {
      issues.push({
        code: `invalid_target_order_${selection.id}`,
        message: `Target order is invalid for KPI (${selection.kpiCatalogItemId}) based on directionality.`,
        severity: "error",
        scope: "targets",
      });
    }
  });

  return issues;
}

function invalidIncentiveLink(rule: ContractIncentiveRule, selectedMetricIds: Set<string>) {
  if (rule.linkedContractMetricSelectionIds.length === 0) return true;
  return rule.linkedContractMetricSelectionIds.some((id) => !selectedMetricIds.has(id));
}

function validateIncentives(config: ContractConfiguration): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const selectedMetricIds = new Set(config.selectedMetrics.map((item) => item.id));

  config.incentiveRules.forEach((rule) => {
    if (!rule.name.trim()) {
      issues.push({
        code: `missing_incentive_name_${rule.id}`,
        message: "Every incentive rule must have a name.",
        severity: "error",
        scope: "incentives",
      });
    }
    if (invalidIncentiveLink(rule, selectedMetricIds)) {
      issues.push({
        code: `invalid_incentive_link_${rule.id}`,
        message: `Incentive rule (${rule.name || rule.id}) references missing or unselected KPI links.`,
        severity: "error",
        scope: "incentives",
      });
    }
  });

  return issues;
}

function validateFinancialTerms(config: ContractConfiguration): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const terms = config.financialTerms;

  if (terms.qualityGateEnabled && (terms.qualityGateThreshold == null || Number.isNaN(terms.qualityGateThreshold))) {
    issues.push({
      code: "missing_quality_gate_threshold",
      message: "Quality gate is enabled but threshold is missing.",
      severity: "error",
      scope: "financialTerms",
    });
  }

  if (terms.qualityGateEnabled && terms.qualityGateBasis === "selected_metric_threshold" && !config.selectedMetrics.some(s => s.id === terms.qualityGateMetricSelectionId)) {
    issues.push({ code: "missing_quality_gate_metric", message: "Choose a selected KPI for the quality gate.", severity: "error", scope: "financialTerms" });
  }
  return issues;
}

export function validateContractConfiguration(config: ContractConfiguration): ValidationIssue[] {
  return [
    ...validateBasics(config),
    ...validateSelection(config),
    ...validateTargets(config),
    ...validateIncentives(config),
    ...validateFinancialTerms(config),
  ];
}
