"use client";

import { useMemo, useState } from "react";
import { useFeatureFlags } from "@/components/FeatureFlagsProvider";
import { clearWorkspaces } from "@/lib/storage/synapseStore";

const pageMeta: Record<string, { label: string; description: string }> = {
  dashboard: { label: "Home", description: "Executive portfolio dashboard" },
  actions: { label: "Actions", description: "Recommended interventions and follow-ups" },
  cohorts: { label: "Cohorts", description: "SynapseAI cohort explorer and insights" },
  projects: { label: "Projects", description: "Project execution and outcomes" },
  scorecards: { label: "Scorecards", description: "Portfolio scorecard rollups and drill-downs" },
  workspaces: { label: "Workspaces", description: "Persistent AI workspaces" },
  careManagement: { label: "Care Mgmt", description: "Care management operations" },
  lifeSciences: { label: "Life Sciences", description: "Trial opportunity center and sponsor-fit portfolio" },
  population: { label: "Population", description: "Population health analytics" },
  quality: { label: "Quality", description: "Quality scorecards and gaps" },
  contracts: { label: "Contracts", description: "Contract financial and quality performance" },
};

export default function FeatureControls() {
  const { flags, toggleFlag, resetFlags } = useFeatureFlags();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [workspaceResetting, setWorkspaceResetting] = useState(false);

  const sortedPages = useMemo(
    () =>
      Object.keys(flags.pages).sort((a, b) =>
        (pageMeta[a]?.label ?? a).localeCompare(pageMeta[b]?.label ?? b)
      ),
    [flags.pages]
  );

  const normalizedQuery = query.trim().toLowerCase();
  const filteredPages = useMemo(() => {
    if (!normalizedQuery) return sortedPages;
    return sortedPages.filter((key) => {
      const label = pageMeta[key]?.label ?? key;
      const description = pageMeta[key]?.description ?? "";
      return `${label} ${description} ${key}`.toLowerCase().includes(normalizedQuery);
    });
  }, [normalizedQuery, sortedPages]);

  const enabledCount = useMemo(
    () =>
      Object.values(flags.pages).filter(Boolean).length +
      (flags.synapseSearch ? 1 : 0) +
      (flags.topNavSearch ? 1 : 0),
    [flags.pages, flags.synapseSearch, flags.topNavSearch]
  );

  const handleResetWorkspaces = async () => {
    try {
      setWorkspaceResetting(true);
      await clearWorkspaces();
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("synapse.activeWorkspaceId");
        window.dispatchEvent(new CustomEvent("synapse:workspaces-reset"));
      }
    } finally {
      setWorkspaceResetting(false);
    }
  };

  return (
    <div className="feature-controls fixed bottom-6 right-6 z-50">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="feature-controls-trigger rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-lg hover:bg-slate-800"
      >
        {open ? "Close Feature Controls" : "Feature Controls"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            className="absolute inset-0 bg-slate-900/30"
            aria-label="Close feature controls"
            onClick={() => setOpen(false)}
          />

          <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Feature Controls</h2>
                  <p className="text-xs text-slate-500">Local demo configuration · {enabledCount} enabled</p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
              <div className="mt-3">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search features..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-indigo-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              <Section title="AI / Synapse" subtitle="Core assistant capabilities" defaultOpen>
                <ToggleRow
                  label="Agents Suite Directory"
                  description="Global Synapse search and agent directory entry point"
                  enabled={flags.synapseSearch}
                  onToggle={() => toggleFlag("synapseSearch")}
                />
                <ToggleRow
                  label="Top nav search bar"
                  description="Show the Synapse search component in the top navigation"
                  enabled={flags.topNavSearch}
                  onToggle={() => toggleFlag("topNavSearch")}
                />
              </Section>

              <Section
                title="Navigation & Pages"
                subtitle={`Toggle routed modules (${filteredPages.length}/${sortedPages.length} shown)`}
                defaultOpen
              >
                <div className="space-y-2">
                  {filteredPages.map((key) => (
                    <ToggleRow
                      key={key}
                      label={pageMeta[key]?.label ?? key}
                      description={pageMeta[key]?.description ?? ""}
                      enabled={flags.pages[key as keyof typeof flags.pages]}
                      onToggle={() => toggleFlag(`pages.${key}`)}
                    />
                  ))}
                  {!filteredPages.length && (
                    <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                      No matching features found.
                    </p>
                  )}
                </div>
              </Section>

              <Section title="Contract Insights Sections" subtitle="Toggle sections within contract pages" defaultOpen>
                <ToggleRow
                  label="Top 5 Value Levers"
                  description="Opportunity list on Contracts and Contract Details pages"
                  enabled={flags.sections.topValueLevers}
                  onToggle={() => toggleFlag("sections.topValueLevers")}
                />
                <ToggleRow
                  label="Savings at Risk from Quality Gaps"
                  description="Quality-blocked savings panel across contract portfolio and contract detail views"
                  enabled={flags.sections.qualityBlockedSavings}
                  onToggle={() => toggleFlag("sections.qualityBlockedSavings")}
                />
                <ToggleRow
                  label="Scorecard Portfolio Lens Map"
                  description="Portfolio Lens Map and Earnings to Watch card on the Scorecards page"
                  enabled={flags.sections.scorecardPortfolioLensMap}
                  onToggle={() => toggleFlag("sections.scorecardPortfolioLensMap")}
                />
                <ToggleRow
                  label="Contract Scorecard Financial Levers"
                  description="Top Value Levers panel on the Scorecards page"
                  enabled={flags.sections.contractScorecardFinancialLevers}
                  onToggle={() => toggleFlag("sections.contractScorecardFinancialLevers")}
                />
                <ToggleRow
                  label="Contracts Earnings Gates to Watch"
                  description="Earnings gates card on the Contracts portfolio page"
                  enabled={flags.sections.contractPortfolioEarningsGateToWatch}
                  onToggle={() => toggleFlag("sections.contractPortfolioEarningsGateToWatch")}
                />
                <ToggleRow
                  label="Population Secondary Patient List"
                  description="Overview/denominator/gaps patient list below the population cost workbench"
                  enabled={flags.sections.contractPopulationSecondaryPatientList}
                  onToggle={() => toggleFlag("sections.contractPopulationSecondaryPatientList")}
                />
              </Section>

              <Section title="Demo Data & Utilities" subtitle="Operational reset controls" defaultOpen>
                <button
                  onClick={handleResetWorkspaces}
                  disabled={workspaceResetting}
                  className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {workspaceResetting ? "Resetting Workspaces…" : "Reset Synapse Workspaces"}
                </button>
              </Section>
            </div>

            <div className="border-t border-slate-100 bg-white px-5 py-3">
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={resetFlags}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Reset to Defaults
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Done
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
  defaultOpen = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="rounded-xl border border-slate-200 bg-white p-3">
      <summary className="cursor-pointer list-none">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
            {subtitle && <p className="mt-0.5 text-[11px] text-slate-400">{subtitle}</p>}
          </div>
          <span className="text-xs text-slate-400">▾</span>
        </div>
      </summary>
      <div className="mt-3 space-y-2">{children}</div>
    </details>
  );
}

function ToggleRow({
  label,
  description,
  enabled,
  onToggle,
}: {
  label: string;
  description?: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
      <div>
        <p className="text-xs font-medium text-slate-700">{label}</p>
        {description && <p className="mt-0.5 text-[11px] text-slate-500">{description}</p>}
      </div>
      <button
        onClick={onToggle}
        aria-pressed={enabled}
        className={`h-6 w-11 rounded-full p-0.5 transition ${
          enabled ? "bg-emerald-500" : "bg-slate-200"
        }`}
      >
        <span
          className={`block h-5 w-5 rounded-full bg-white shadow-sm transition ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
