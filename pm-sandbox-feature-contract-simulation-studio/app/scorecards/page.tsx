"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import FeatureGuard from "@/components/FeatureGuard";
import { useFeatureFlags } from "@/components/FeatureFlagsProvider";
import TopFinancialPrioritiesPanel from "@/components/contracts/TopFinancialPrioritiesPanel";
import ScorecardViewSelector, { type ScorecardView } from "@/components/scorecards/ScorecardViewSelector";
import ScorecardLensBubbleMap from "@/components/scorecards/ScorecardLensBubbleMap";
import ScorecardQualityBlockedLensCard from "@/components/scorecards/ScorecardQualityBlockedLensCard";
import ScorecardChildTable from "@/components/scorecards/ScorecardChildTable";
import { loadStoredContracts } from "@/lib/contractStore";
import { getTopFinancialPriorityItems } from "@/lib/contracts/financialPriorities";
import { mockContractAgreements } from "@/lib/mockData";
import { buildScorecardRollup } from "@/lib/scorecards/rollups";
import {
  getPortfolioContracts,
  groupContractsByAgreement,
  groupContractsByContract,
  groupContractsByContractType,
  groupContractsByInsuranceSegment,
  groupContractsByMarket,
  groupContractsByPayor,
  groupContractsByRegion,
} from "@/lib/scorecards/selectors";

const scorecardViews: ScorecardView[] = [
  "region",
  "market",
  "payor",
  "insuranceSegment",
  "contractType",
  "agreement",
  "contract",
];

function getValidScorecardView(value: string | null): ScorecardView {
  return scorecardViews.includes(value as ScorecardView) ? (value as ScorecardView) : "payor";
}

function ScorecardsPageContent() {
  const { flags } = useFeatureFlags();
  const searchParams = useSearchParams();
  const initialView = useMemo(() => getValidScorecardView(searchParams.get("view")), [searchParams]);
  const [view, setView] = useState<ScorecardView>(initialView);
  const [draftContracts, setDraftContracts] = useState<ReturnType<typeof loadStoredContracts>>([]);

  useEffect(() => {
    setDraftContracts(loadStoredContracts());
  }, []);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const allContracts = useMemo(
    () => getPortfolioContracts({ agreements: mockContractAgreements, draftContracts }),
    [draftContracts]
  );

  const childGroups = useMemo(() => {
    if (view === "region") {
      return groupContractsByRegion(allContracts).map((group) => ({ ...group, scopeType: "region" as const }));
    }

    if (view === "market") {
      return groupContractsByMarket(allContracts).map((group) => ({ ...group, scopeType: "market" as const }));
    }

    if (view === "payor") {
      return groupContractsByPayor(allContracts).map((group) => ({ ...group, scopeType: "payor" as const }));
    }

    if (view === "insuranceSegment") {
      return groupContractsByInsuranceSegment(allContracts).map((group) => ({
        ...group,
        scopeType: "insuranceSegment" as const,
      }));
    }

    if (view === "contractType") {
      return groupContractsByContractType(allContracts).map((group) => ({
        ...group,
        scopeType: "contractType" as const,
      }));
    }

    if (view === "agreement") {
      return groupContractsByAgreement(mockContractAgreements, draftContracts).map((group) => ({
        ...group,
        scopeType: "agreement" as const,
      }));
    }

    return groupContractsByContract(allContracts).map((group) => ({ ...group, scopeType: "contract" as const }));
  }, [allContracts, draftContracts, view]);

  const rollup = useMemo(
    () =>
      buildScorecardRollup({
        scopeType: "portfolio",
        scopeId: "enterprise",
        scopeLabel: "Portfolio",
        contracts: allContracts,
        childGroups,
      }),
    [allContracts, childGroups]
  );

  const sortedChildren = useMemo(
    () => [...rollup.children].sort((a, b) => b.vbcPotentialDollars - a.vbcPotentialDollars),
    [rollup.children]
  );

  const topFinancialPriorities = useMemo(
    () => getTopFinancialPriorityItems(allContracts, { limit: 5 }),
    [allContracts]
  );
  const tableTitle =
    view === "region"
      ? "Region performance"
      : view === "market"
          ? "Market performance"
          : view === "payor"
            ? "Payor performance"
            : view === "insuranceSegment"
              ? "Insurance segment performance"
              : view === "contractType"
                ? "Contract type performance"
                : view === "agreement"
                  ? "Agreement performance"
                  : "Contract performance";

  return (
    <FeatureGuard page="scorecards">
      <div className="space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Portfolio Scorecards</h1>
          </div>
          <Link
            href="/contracts"
            className="inline-flex items-center rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
          >
            Open Contracts Inventory →
          </Link>
        </div>

        <section className="space-y-3">
          <section className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5 shadow-sm ring-1 ring-indigo-100">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Analyze performance</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">{tableTitle}</h2>
              <p className="mt-1 text-sm text-slate-600">
                Choose a lens to compare where expense, quality, earned VBC value, and budgeted VBC value are concentrated.
              </p>
            </div>
          </section>

          <div className="-mx-1 overflow-x-auto px-1 pb-1 md:mx-0 md:flex md:justify-end md:overflow-visible md:px-0 md:pb-0">
            <ScorecardViewSelector value={view} onChange={setView} />
          </div>

          {flags.sections.scorecardPortfolioLensMap ? (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr),24rem] xl:items-start">
              <ScorecardLensBubbleMap items={sortedChildren} />
              <ScorecardQualityBlockedLensCard items={sortedChildren} view={view} />
            </div>
          ) : null}

          <ScorecardChildTable
            items={sortedChildren}
            title={tableTitle}
          />
        </section>

        {flags.sections.contractScorecardFinancialLevers ? (
          <section className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Supporting insights</p>
              <p className="mt-1 text-sm text-slate-500">Use these panels to interpret the ranking and identify where action may create the most value.</p>
            </div>
            <div>
              <TopFinancialPrioritiesPanel
                items={topFinancialPriorities}
                title="Top Value Levers"
                subtitle="Portfolio-ranked priorities across contracts, opportunities, and scorecard domains."
                maxItems={5}
              />
            </div>
          </section>
        ) : null}
      </div>
    </FeatureGuard>
  );
}

export default function ScorecardsPage() {
  return (
    <Suspense fallback={null}>
      <ScorecardsPageContent />
    </Suspense>
  );
}
