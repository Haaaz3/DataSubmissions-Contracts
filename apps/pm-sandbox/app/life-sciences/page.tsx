"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import FeatureGuard from "@/components/FeatureGuard";
import SummaryCard from "@/components/SummaryCard";
import {
  lifeSciencesTrials,
  type LifeSciencesTrial,
  type TrialSpecialty,
} from "@/data/synthetic/lifeSciencesTrials";

const specialtyOrder: TrialSpecialty[] = ["Oncology", "Cardiology", "Neurology"];

function getEligibleDensityLabel(trial: LifeSciencesTrial) {
  if (trial.matchedPopulationCount >= 250) return "High density";
  if (trial.matchedPopulationCount >= 150) return "Moderate density";
  return "Focused density";
}

function getTrialImpactSnapshot(trial: LifeSciencesTrial) {
  const confidenceScore = Math.min(96, Math.max(78, Math.round(74 + trial.matchedPopulationCount / 8)));
  const completenessScore = Math.min(95, Math.max(76, Math.round(70 + trial.siteComparison.length * 4)));
  const qualityTieIn = trial.qualityImpacts
    .map((impact) => `${impact.measure}: ${impact.rationale}`)
    .join(" ");
  const siteFees = `$${(trial.revenueOpportunityValue / 1000000).toFixed(2)}M site fees`;
  const leakageAvoided = trial.revenueLeakageRisk;
  const vbcDownside = `Estimated VBC downside reduction: ~$${Math.round(
    trial.revenueOpportunityValue * 0.18
  ).toLocaleString()}`;

  return {
    eligibleLives: `${trial.matchedPopulationCount.toLocaleString()} matched lives (${getEligibleDensityLabel(trial)})`,
    confidence: `Confidence ${confidenceScore}% · Completeness ${completenessScore}%`,
    qualityTieIn,
    financialImpact: `${siteFees}; ${leakageAvoided}; ${vbcDownside}`,
  };
}

export default function LifeSciencesPage() {
  const [interestedTrialIds, setInterestedTrialIds] = useState<string[]>(["onc-ls-001"]);
  const [trialView, setTrialView] = useState<"card" | "list">("card");
  const [selectedSpecialties, setSelectedSpecialties] = useState<TrialSpecialty[]>([...specialtyOrder]);

  const totals = useMemo(() => {
    const matchedPopulation = lifeSciencesTrials.reduce(
      (sum, trial) => sum + trial.matchedPopulationCount,
      0
    );
    const qualitySignals = lifeSciencesTrials.reduce(
      (sum, trial) => sum + trial.qualityImpacts.length,
      0
    );
    const outreachReady = lifeSciencesTrials.filter(
      (trial) => trial.pipelineStage === "Outreach Ready" || trial.pipelineStage === "Interested"
    ).length;
    const revenueOpportunityValue = lifeSciencesTrials.reduce(
      (sum, trial) => sum + trial.revenueOpportunityValue,
      0
    );
    const revenueLeakageAtRisk = lifeSciencesTrials.length;
    const tier1Priorities = lifeSciencesTrials.filter((trial) => trial.therapeuticPriority === "Tier 1").length;

    return {
      matchedPopulation,
      qualitySignals,
      outreachReady,
      revenueOpportunityValue,
      revenueLeakageAtRisk,
      tier1Priorities,
    };
  }, []);

  const bySpecialty = useMemo(
    () =>
      specialtyOrder.map((specialty) => ({
        specialty,
        trials: lifeSciencesTrials.filter((trial) => trial.specialty === specialty),
      })),
    []
  );

  const filteredBySpecialty = useMemo(
    () => bySpecialty.filter((entry) => selectedSpecialties.includes(entry.specialty)),
    [bySpecialty, selectedSpecialties]
  );

  const prioritizedTherapeuticAreas = useMemo(
    () =>
      specialtyOrder
        .map((specialty) => {
          const specialtyTrials = lifeSciencesTrials.filter((trial) => trial.specialty === specialty);
          const tier1Count = specialtyTrials.filter((trial) => trial.therapeuticPriority === "Tier 1").length;
          return {
            specialty,
            tier1Count,
            total: specialtyTrials.length,
          };
        })
        .sort((a, b) => b.tier1Count - a.tier1Count),
    []
  );

  const recommendedPortfolio = useMemo(
    () =>
      [...lifeSciencesTrials]
        .sort((a, b) => {
          const priorityRank = { "Tier 1": 0, "Tier 2": 1, "Tier 3": 2 };
          if (priorityRank[a.therapeuticPriority] !== priorityRank[b.therapeuticPriority]) {
            return priorityRank[a.therapeuticPriority] - priorityRank[b.therapeuticPriority];
          }
          return b.revenueOpportunityValue - a.revenueOpportunityValue;
        })
        .slice(0, 3),
    []
  );

  const featuredTrialId = recommendedPortfolio[0]?.id ?? lifeSciencesTrials[0].id;

  const pointOfCareMatchAlert = useMemo(() => {
    const oncologyTrial = lifeSciencesTrials.find((trial) => trial.id === "onc-ls-001");
    const matchedPatient = oncologyTrial?.eligiblePatients[0];

    return {
      trial: oncologyTrial,
      patient: matchedPatient,
      therapyRecommendation:
        "Recommend checkpoint inhibitor + platinum-doublet pathway review and same-week research coordinator outreach.",
      explainability: [
        "Biomarker profile aligns with trial inclusion criteria (PD-L1 high expression).",
        "Recent progression on standard regimen indicates candidate for protocol escalation.",
        "Performance status and organ-function documentation satisfy pre-screen thresholds.",
      ],
      workflowActions: [
        "One-click referral to research coordinator",
        "One-click patient consent packet delivery",
        "One-click open trial care pathway in oncology workflow",
      ],
    };
  }, []);

  const toggleInterest = (trialId: string) => {
    setInterestedTrialIds((current) =>
      current.includes(trialId)
        ? current.filter((id) => id !== trialId)
        : [...current, trialId]
    );
  };

  const toggleSpecialty = (specialty: TrialSpecialty) => {
    setSelectedSpecialties((current) => {
      const next = current.includes(specialty)
        ? current.filter((item) => item !== specialty)
        : [...current, specialty];
      return next.length ? next : [...specialtyOrder];
    });
  };

  return (
    <FeatureGuard page="lifeSciences">
      <div className="space-y-8">
        <section
          id="opportunity-center"
          className="sketch-hero scroll-mt-24 rounded-2xl bg-gradient-to-r from-indigo-950 via-blue-900 to-cyan-900 p-6 text-white shadow-sm ring-1 ring-blue-700/40"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-cyan-200">Life Sciences Opportunity Center</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-bold">Launch your highest-value trial outreach plan</h1>
          <p className="mt-2 max-w-3xl text-sm text-white/85">
            Prioritize sponsor-fit trials that improve quality, reduce leakage, and unlock new revenue. Start with
            your highest-impact opportunities and move directly into outreach workflows.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="#trials-catalog"
              className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-indigo-900 hover:bg-indigo-50"
            >
              Review recommended trials
            </Link>
            <Link
              href={`/population?trialId=${featuredTrialId}`}
              className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20"
            >
              View eligible patients
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs">
              <p className="text-cyan-100">Matched population</p>
              <p className="mt-1 font-semibold text-white">{totals.matchedPopulation.toLocaleString()} eligible lives</p>
            </div>
            <div className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs">
              <p className="text-cyan-100">Outreach-ready portfolio</p>
              <p className="mt-1 font-semibold text-white">{totals.outreachReady} trials ready for sponsor outreach</p>
            </div>
            <div className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs">
              <p className="text-cyan-100">Projected opportunity</p>
              <p className="mt-1 font-semibold text-white">${(totals.revenueOpportunityValue / 1000000).toFixed(2)}M in potential value</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Revenue opportunities</h2>
            <p className="mt-1 text-xs text-slate-500">Where trial strategy can protect referral value and net-new revenue.</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Portfolio upside</p>
                <p className="mt-1 text-lg font-bold text-emerald-800">${(totals.revenueOpportunityValue / 1000000).toFixed(2)}M</p>
              </div>
              <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">Leakage risks identified</p>
                <p className="mt-1 text-sm font-semibold text-amber-900">{totals.revenueLeakageAtRisk} trials with downstream referral risk</p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Therapeutic area prioritization</h2>
            <p className="mt-1 text-xs text-slate-500">Focus service lines with the highest near-term sponsor-fit return.</p>
            <div className="mt-4 space-y-2">
              {prioritizedTherapeuticAreas.map((area) => (
                <div key={area.specialty} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs">
                  <p className="font-semibold text-slate-800">{area.specialty}</p>
                  <p className="text-slate-500">{area.tier1Count} Tier 1 priorities out of {area.total} active recommendations</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Trial portfolio recommendations</h2>
            <p className="mt-1 text-xs text-slate-500">Best next actions for strategy and sponsor outreach teams.</p>
            <ul className="mt-4 space-y-2">
              {recommendedPortfolio.map((trial) => (
                <li key={trial.id} className="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs">
                  <p className="font-semibold text-indigo-900">{trial.name} · {trial.therapeuticPriority}</p>
                  <p className="text-indigo-700">{trial.portfolioRecommendation}</p>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="space-y-6">
          <div id="trials-catalog" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm scroll-mt-24">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Trials catalog</h2>
              <p className="text-xs text-slate-500">Switch between card and list views for planning workflows.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap gap-2">
                {specialtyOrder.map((specialty) => {
                  const selected = selectedSpecialties.includes(specialty);
                  return (
                    <button
                      key={specialty}
                      onClick={() => toggleSpecialty(specialty)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                        selected
                          ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {specialty}
                    </button>
                  );
                })}
              </div>
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-semibold">
                <button
                  onClick={() => setTrialView("card")}
                  className={`rounded-md px-3 py-1.5 ${
                    trialView === "card" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Card view
                </button>
                <button
                  onClick={() => setTrialView("list")}
                  className={`rounded-md px-3 py-1.5 ${
                    trialView === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  List view
                </button>
              </div>
            </div>
          </div>

          {filteredBySpecialty.map(({ specialty, trials }) => (
            <div key={specialty} className="space-y-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{specialty} Trials</h2>
                <p className="text-xs text-slate-400">Realistic options based on likely health-system fit and sponsor demand</p>
              </div>
              {trialView === "card" ? (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {trials.map((trial) => {
                    const interested = interestedTrialIds.includes(trial.id);
                    const impact = getTrialImpactSnapshot(trial);
                    return (
                      <article key={trial.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{trial.name}</p>
                            <p className="mt-1 text-xs text-slate-500">{trial.description}</p>
                          </div>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                            {trial.phase}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                            <p className="text-slate-400">Matched population</p>
                            <p className="mt-1 text-sm font-semibold text-slate-800">
                              {trial.matchedPopulationCount.toLocaleString()} patients
                            </p>
                          </div>
                          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                            <p className="text-slate-400">Revenue opportunity</p>
                            <p className="mt-1 text-sm font-semibold text-emerald-700">{trial.revenueOpportunity}</p>
                          </div>
                        </div>

                        <div className="mt-4 rounded-lg border border-rose-100 bg-rose-50 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-500">Revenue opportunities</p>
                          <p className="mt-1 text-xs text-rose-800">{trial.revenueLeakageRisk}</p>
                        </div>

                        <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-500">
                            Potential Quality Measure Impact
                          </p>
                          <div className="mt-2 space-y-2">
                            {trial.qualityImpacts.map((impact) => (
                              <div key={impact.measure} className="rounded-md bg-white px-3 py-2 text-xs">
                                <p className="font-semibold text-slate-700">
                                  {impact.measure} · <span className="text-indigo-600">{impact.impact}</span>
                                </p>
                                <p className="text-slate-500">{impact.rationale}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 rounded-lg border border-cyan-100 bg-cyan-50 p-3 text-xs">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-cyan-700">Measurable impact</p>
                          <ul className="mt-2 space-y-1 text-cyan-900">
                            <li><span className="font-semibold">Eligible lives / density:</span> {impact.eligibleLives} · {impact.confidence}</li>
                            <li><span className="font-semibold">Quality tie-in:</span> {impact.qualityTieIn}</li>
                            <li><span className="font-semibold">Financial impact:</span> {impact.financialImpact}</li>
                          </ul>
                        </div>

                        <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-xs">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Adoption case</p>
                          <ul className="mt-2 list-disc space-y-1 pl-4 text-emerald-900">
                            <li><span className="font-semibold">Quality:</span> {trial.adoptionCase.qualityImprovement}</li>
                            <li><span className="font-semibold">Reduced leakage:</span> {trial.adoptionCase.reducedLeakage}</li>
                            <li><span className="font-semibold">Financial performance:</span> {trial.adoptionCase.financialPerformance}</li>
                          </ul>
                        </div>

                        <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Deidentified eligible patients</p>
                          <ul className="mt-2 space-y-1">
                            {trial.eligiblePatients.map((patient) => (
                              <li key={patient.id} className="rounded-md bg-white px-2 py-1">
                                <p className="font-semibold text-slate-700">{patient.id} · {patient.profile}</p>
                                <p className="text-slate-500">{patient.rationale}</p>
                              </li>
                            ))}
                          </ul>
                          <Link
                            href={`/population?trialId=${trial.id}`}
                            className="mt-3 inline-flex text-xs font-semibold text-indigo-600 hover:underline"
                          >
                            View eligible patient population →
                          </Link>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Sponsor fit</p>
                            <p className="text-xs text-slate-600">{trial.sponsor} · {trial.pipelineStage} · {trial.therapeuticPriority}</p>
                            <p className="mt-1 text-xs text-slate-500">{trial.fitReason}</p>
                          </div>
                          <button
                            onClick={() => toggleInterest(trial.id)}
                            className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                              interested
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-indigo-600 text-white hover:bg-indigo-500"
                            }`}
                          >
                            {interested ? "Interested ✓" : "Express Interest"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                  <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Trial</th>
                        <th className="px-4 py-3 text-left font-semibold">Priority</th>
                        <th className="px-4 py-3 text-left font-semibold">Population</th>
                        <th className="px-4 py-3 text-left font-semibold">Revenue opportunities</th>
                        <th className="px-4 py-3 text-left font-semibold">Measurable impact</th>
                        <th className="px-4 py-3 text-left font-semibold">Eligible patients</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {trials.map((trial) => {
                        const interested = interestedTrialIds.includes(trial.id);
                        const impact = getTrialImpactSnapshot(trial);
                        return (
                          <tr key={trial.id} className="align-top">
                            <td className="px-4 py-3">
                              <p className="font-semibold text-slate-900">{trial.name}</p>
                              <p className="text-slate-500">{trial.phase} · {trial.sponsor}</p>
                            </td>
                            <td className="px-4 py-3 text-slate-700">{trial.therapeuticPriority}</td>
                            <td className="px-4 py-3 text-slate-700">{trial.matchedPopulationCount.toLocaleString()}</td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-emerald-700">{trial.revenueOpportunity}</p>
                              <p className="text-slate-500">{trial.revenueLeakageRisk}</p>
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              <p><span className="font-semibold">Eligible lives / density:</span> {impact.eligibleLives}</p>
                              <p><span className="font-semibold">Confidence / completeness:</span> {impact.confidence}</p>
                              <p><span className="font-semibold">Quality tie-in:</span> {trial.qualityImpacts.map((item) => item.measure).join(", ")}</p>
                              <p><span className="font-semibold">Financial impact:</span> {impact.financialImpact}</p>
                            </td>
                            <td className="px-4 py-3">
                              <ul className="space-y-1 text-slate-700">
                                {trial.eligiblePatients.slice(0, 2).map((patient) => (
                                  <li key={patient.id}>{patient.id} · {patient.profile}</li>
                                ))}
                              </ul>
                              <Link
                                href={`/population?trialId=${trial.id}`}
                                className="mt-2 inline-flex text-xs font-semibold text-indigo-600 hover:underline"
                              >
                                View eligible population →
                              </Link>
                              <button
                                onClick={() => toggleInterest(trial.id)}
                                className={`mt-2 block rounded-md px-3 py-1.5 text-xs font-semibold ${
                                  interested
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-indigo-600 text-white hover:bg-indigo-500"
                                }`}
                              >
                                {interested ? "Interested ✓" : "Express Interest"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <SummaryCard label="Recommended Trials" value={lifeSciencesTrials.length} description="Cross-specialty portfolio" />
          <SummaryCard
            label="Matched Population"
            value={totals.matchedPopulation.toLocaleString()}
            description="Potentially eligible patients"
            accent="text-indigo-600"
          />
          <SummaryCard label="Outreach-Ready Trials" value={totals.outreachReady} description="Ready for sponsor outreach" accent="text-emerald-600" />
          <SummaryCard label="Quality Impact Signals" value={totals.qualitySignals} description="Measure opportunities identified" accent="text-amber-600" />
          <SummaryCard
            label="Interested"
            value={interestedTrialIds.length}
            description="Trials marked by strategy team"
            accent="text-cyan-600"
          />
        </section>

        {pointOfCareMatchAlert.trial && pointOfCareMatchAlert.patient && (
          <section className="rounded-2xl border border-violet-200 bg-violet-50 p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-violet-900">Point-of-Care Match Alert Example (Oncology)</h2>
                <p className="mt-1 text-xs text-violet-700">
                  Example of a pre-prompted trial + therapy recommendation with explainability and one-click workflows.
                </p>
              </div>
              <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-semibold text-violet-700">
                Live workflow simulation
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <article className="rounded-xl border border-white bg-white p-4 text-xs shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Matched patient</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{pointOfCareMatchAlert.patient.id}</p>
                <p className="text-slate-600">{pointOfCareMatchAlert.patient.profile}</p>
                <p className="mt-2 text-slate-500">{pointOfCareMatchAlert.patient.rationale}</p>
              </article>

              <article className="rounded-xl border border-white bg-white p-4 text-xs shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Pre-prompted recommendation</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{pointOfCareMatchAlert.trial.name}</p>
                <p className="mt-1 text-slate-700">{pointOfCareMatchAlert.therapyRecommendation}</p>
                <p className="mt-2 text-slate-500">
                  Sponsor: {pointOfCareMatchAlert.trial.sponsor} · {pointOfCareMatchAlert.trial.phase}
                </p>
              </article>

              <article className="rounded-xl border border-white bg-white p-4 text-xs shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Explainability</p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-slate-700">
                  {pointOfCareMatchAlert.explainability.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>

            <div className="mt-4 rounded-xl border border-violet-100 bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-700">One-click referral & consent workflows</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {pointOfCareMatchAlert.workflowActions.map((actionLabel) => (
                  <button
                    key={actionLabel}
                    className="rounded-lg border border-violet-200 bg-violet-100 px-3 py-2 text-xs font-semibold text-violet-800 hover:bg-violet-200"
                  >
                    {actionLabel}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </FeatureGuard>
  );
}
