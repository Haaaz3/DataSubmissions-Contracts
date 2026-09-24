"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import FeatureGuard from "@/components/FeatureGuard";
import { useChatWorkspace } from "@/components/synapseai/useChatWorkspace";
import { getPopulationMemberDetail } from "@/lib/populationData";
import { lifeSciencesTrials } from "@/data/synthetic/lifeSciencesTrials";

type MemberDetail = NonNullable<ReturnType<typeof getPopulationMemberDetail>>;

type CopilotResponse = {
  title: string;
  summary: string;
  evidenceIds: string[];
};

type ActionStatus = "not_started" | "drafted" | "queued" | "completed";

type ActionPanel = {
  id: string;
  title: string;
  summary: string;
  nextSteps: string[];
  evidenceIds: string[];
};

type RecordTabId =
  | "documents"
  | "clinical-notes"
  | "medications"
  | "conditions"
  | "orders"
  | "labs"
  | "appointments"
  | "vitals";

type ActionFilter = "all" | ActionStatus;

const actionStatusLabel: Record<ActionStatus, string> = {
  not_started: "Not started",
  drafted: "Drafted",
  queued: "Queued",
  completed: "Completed",
};

const actionStatusClass: Record<ActionStatus, string> = {
  not_started: "bg-slate-100 text-slate-700",
  drafted: "bg-indigo-100 text-indigo-700",
  queued: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
};

export default function PopulationMemberDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const memberId = params?.id;
  const member = useMemo(() => (memberId ? getPopulationMemberDetail(memberId) : null), [memberId]);
  const source = searchParams.get("source");
  const sourceAgentLabel = searchParams.get("sourceAgentLabel");
  const supportingAgentLabel = searchParams.get("supportingAgentLabel");
  const initiative = searchParams.get("initiative");
  const sourceMeasure = searchParams.get("measure");
  const sourceProjectName = searchParams.get("projectName");
  const sourceWorkflowTitle = searchParams.get("workflowTitle");
  const sourceAppointmentDate = searchParams.get("appointmentDate");
  const sourceTrialId = searchParams.get("trialId");
  const sourceTrial = useMemo(
    () => (sourceTrialId ? lifeSciencesTrials.find((trial) => trial.id === sourceTrialId) ?? null : null),
    [sourceTrialId]
  );
  const recommendedTrial = useMemo(() => {
    if (!member) return null;
    if (sourceTrial) return sourceTrial;

    const normalizedMemberName = member.name.toLowerCase().trim();
    const trialByName = lifeSciencesTrials.find((trial) =>
      trial.patientList.some((patient) => patient.fullName.toLowerCase() === normalizedMemberName)
    );
    if (trialByName) return trialByName;

    const trialByMrn = lifeSciencesTrials.find((trial) =>
      trial.patientList.some((patient) => patient.mrn === member.mrn)
    );
    if (trialByMrn) return trialByMrn;

    return lifeSciencesTrials[0] ?? null;
  }, [member, sourceTrial]);
  const recommendedTrialPatient = useMemo(() => {
    if (!member || !recommendedTrial) return null;
    const normalizedMemberName = member.name.toLowerCase().trim();
    return (
      recommendedTrial.patientList.find((patient) => patient.fullName.toLowerCase() === normalizedMemberName) ??
      recommendedTrial.patientList.find((patient) => patient.mrn === member.mrn) ??
      null
    );
  }, [member, recommendedTrial]);
  const trialExplainability = useMemo(() => {
    if (!recommendedTrial) return [];
    return [
      `${recommendedTrial.specialty} referral readiness aligns with ${recommendedTrial.name} inclusion profile.`,
      recommendedTrial.eligiblePatients[0]?.rationale ?? "Candidate profile and recent clinical trajectory suggest pre-screen feasibility.",
      recommendedTrial.qualityImpacts[0]?.rationale ?? "Workflow evidence supports coordinator review for pre-screen handoff.",
    ];
  }, [recommendedTrial]);
  const trialEvidenceSources = useMemo(() => {
    if (!recommendedTrial) return [];
    return [
      "Structured EHR diagnosis/problem list and utilization history",
      `${recommendedTrial.specialty} specialty workflows and care-pathway documentation`,
      `Life Sciences trial portfolio signal: ${recommendedTrial.pipelineStage}`,
      "Agent-generated evidence facts and referral readiness scoring",
    ];
  }, [recommendedTrial]);
  const trialMatchConfidence = useMemo(() => {
    const opportunity = recommendedTrialPatient?.opportunity ?? member?.opportunity;
    if (opportunity === "High") return 92;
    if (opportunity === "Medium") return 84;
    return 76;
  }, [recommendedTrialPatient, member?.opportunity]);
  const trialMatchReasons = useMemo(() => {
    if (!recommendedTrial) return [];
    return [
      recommendedTrial.eligiblePatients[0]?.profile ?? `${recommendedTrial.specialty} candidate profile fit`,
      recommendedTrial.qualityImpacts[0]?.measure ?? "Referral readiness signal",
      `Pipeline status: ${recommendedTrial.pipelineStage}`,
    ];
  }, [recommendedTrial]);
  const patientChatStorageKey = memberId
    ? `synapse.chat.patient.${memberId}`
    : "synapse.chat.patient.unknown";
  const copilotWorkspace = useChatWorkspace({
    storageKey: patientChatStorageKey,
    recentThreadsLimit: 8,
  });

  const [actionPanel, setActionPanel] = useState<ActionPanel | null>(null);
  const [actionStatusMap, setActionStatusMap] = useState<Record<string, ActionStatus>>({});
  const [activeRecordsTab, setActiveRecordsTab] = useState<RecordTabId>("documents");
  const [actionFilter, setActionFilter] = useState<ActionFilter>("all");
  const [expandedActionId, setExpandedActionId] = useState<string | null>(null);

  const evidenceById = useMemo(() => {
    const map = new Map<string, MemberDetail["evidenceFacts"][number]>();
    if (!member) return map;
    member.evidenceFacts.forEach((fact) => map.set(fact.id, fact));
    return map;
  }, [member]);

  useEffect(() => {
    if (!member) return;
    if (copilotWorkspace.threads.length > 0) return;
    copilotWorkspace.appendAssistantMessage({
      title: "Patient Copilot ready",
      content: "I have loaded this patient context. Ask me anything about care gaps, evidence, risk signals, outreach, or next best actions.",
      evidenceIds: member.evidenceFacts.slice(0, 2).map((fact) => fact.id),
    });
  }, [copilotWorkspace, member]);

  const buildCopilotResponse = (input: string): CopilotResponse => {
    if (!member) return { title: "No member context", summary: "Patient context is unavailable.", evidenceIds: [] };
    const normalized = input.toLowerCase();

    if (
      (normalized.includes("why") && normalized.includes("auto") && normalized.includes("enroll")) ||
      (normalized.includes("why") && normalized.includes("care management") && normalized.includes("enroll")) ||
      (normalized.includes("why") && normalized.includes("this patient") && normalized.includes("project"))
    ) {
      return {
        title: "Why this patient was auto-enrolled",
        summary:
          "This patient was auto-enrolled because the Quality Performance Agent identified a high-priority risk pattern (open care gaps + recent utilization signals), and the Resources Agent confirmed care-management capacity to safely launch enrollment. The project rules then triggered automatic assignment to the RN/pharmacist pathway.",
        evidenceIds: member.evidenceFacts.slice(0, 4).map((fact) => fact.id),
      };
    }

    if (normalized.includes("chart") || normalized.includes("mammogram") || normalized.includes("closure")) {
      return {
        title: "Chart evidence and care-gap closure summary",
        summary:
          "Chart Scrubbing Agent identified an out-of-network mammogram mention and generated structured closure evidence. The breast screening gap is now flagged as Inferred Closed pending final abstraction confirmation.",
        evidenceIds: member.evidenceFacts
          .filter((fact) => fact.title.toLowerCase().includes("mammogram") || fact.agent.toLowerCase().includes("chart"))
          .map((fact) => fact.id),
      };
    }

    if (normalized.includes("trial") || normalized.includes("referral") || normalized.includes("evidence")) {
      return {
        title: "Referral / trial opportunity summary",
        summary:
          "Evidence & Trial Agent flagged this member for specialist referral review and possible trial pre-screening due to combined clinical and utilization patterns.",
        evidenceIds: member.evidenceFacts
          .filter((fact) => fact.agent.toLowerCase().includes("trial") || fact.title.toLowerCase().includes("referral"))
          .map((fact) => fact.id),
      };
    }

    if (normalized.includes("portal") || normalized.includes("message") || normalized.includes("outreach")) {
      return {
        title: "Patient outreach recommendation",
        summary:
          "Best next step is a personalized portal outreach asking the member to confirm follow-up availability and transportation needs, with escalation to phone outreach if no response in 48 hours.",
        evidenceIds: member.evidenceFacts.slice(0, 3).map((fact) => fact.id),
      };
    }

    return {
      title: "Member priority summary",
      summary:
        "This member remains a high-value intervention target based on open or in-progress care gaps, recent utilization signals, and evidence-backed next actions from multiple agents.",
      evidenceIds: member.evidenceFacts.slice(0, 3).map((fact) => fact.id),
    };
  };

  const openActionPanel = (panel: ActionPanel) => {
    setActionPanel(panel);
    setActionStatusMap((prev) => ({
      ...prev,
      [panel.id]: prev[panel.id] ?? "not_started",
    }));
  };

  const setActionStatus = (id: string, status: ActionStatus) => {
    setActionStatusMap((prev) => ({ ...prev, [id]: status }));
  };

  const submitCopilotQuestion = (prompt: string) => {
    if (!member) return;
    const input = prompt.trim();
    if (!input) return;

    const response = buildCopilotResponse(input);

    copilotWorkspace.appendTurn(input, {
      title: response.title,
      content: response.summary,
      evidenceIds: response.evidenceIds,
    });
  };

  const recommendedActions = useMemo(() => {
    if (!member) return [];
    const firstSuggestion = member.agentSuggestions[0];
    const firstOpenGap = member.measureGaps.find((gap) => gap.status !== "Closed");
    const firstEvidence = member.evidenceFacts[0];

    const systemActions = [
      firstSuggestion
        ? {
            id: `nba-${firstSuggestion.id}`,
            title: "Launch agent recommendation",
            summary: firstSuggestion.nextAction,
            nextSteps: ["Validate recommendation context", "Assign owner", "Queue execution workflow"],
            evidenceIds: firstSuggestion.evidenceFactIds,
            source: firstSuggestion.agentLabel,
          }
        : null,
      firstOpenGap
        ? {
            id: `nba-${firstOpenGap.id}`,
            title: `Resolve ${firstOpenGap.measureName}`,
            summary: firstOpenGap.recommendedAction,
            nextSteps: ["Review supporting facts", "Choose closure path", "Execute outreach or abstraction"],
            evidenceIds: firstOpenGap.supportingFactIds,
            source: "Measure Gap Engine",
          }
        : null,
      {
        id: "nba-portal",
        title: "Send portal outreach",
        summary: "Draft and send a personalized portal message with recommended follow-up next steps.",
        nextSteps: ["Generate draft via Copilot", "Review language and channel", "Send to patient portal"],
        evidenceIds: firstEvidence ? [firstEvidence.id] : [],
        source: "Care Coordination",
      },
    ].filter(Boolean) as (ActionPanel & { source?: string })[];

    const suggestionActions = member.agentSuggestions.map((suggestion) => ({
      id: `suggestion-${suggestion.id}`,
      title: suggestion.title,
      summary: suggestion.nextAction,
      nextSteps: ["Review supporting evidence", "Confirm workflow owner", "Queue execution"],
      evidenceIds: suggestion.evidenceFactIds,
      source: `${suggestion.agentLabel} · ${(suggestion.confidence * 100).toFixed(0)}% confidence`,
    }));

    const deduped = [...systemActions, ...suggestionActions].filter(
      (action, index, arr) => arr.findIndex((candidate) => candidate.id === action.id) === index
    );

    return deduped;
  }, [member]);

  const filteredRecommendedActions = useMemo(() => {
    if (actionFilter === "all") return recommendedActions;
    return recommendedActions.filter((action) => (actionStatusMap[action.id] ?? "not_started") === actionFilter);
  }, [recommendedActions, actionFilter, actionStatusMap]);

  if (!member) {
    return (
      <FeatureGuard page="population">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-slate-900">Member not found</h1>
          <p className="text-sm text-slate-600">We could not locate the requested member profile.</p>
          <Link href="/population" className="text-sm font-semibold text-indigo-700 hover:underline">
            ← Back to population
          </Link>
        </div>
      </FeatureGuard>
    );
  }

  return (
    <FeatureGuard page="population">
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Agentic Member Workspace</p>
            <h1 className="text-2xl font-bold text-slate-900">{member.name}</h1>
            <p className="mt-1 text-sm text-slate-600">
              MRN {member.mrn} · DOB {member.dateOfBirth} · {member.payer} · {member.plan}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/population" className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              Back to Population
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          {[
            { label: "Opportunity", value: member.opportunity },
            { label: "Attribution", value: member.attributionStatus },
            { label: "Open / active gaps", value: String(member.measureGaps.filter((m) => m.status !== "Closed").length) },
            { label: "Portal", value: member.portalEnrolled ? "Enrolled" : "Not enrolled" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">{item.label}</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>

        {source === "quality-auto-workflow" ? (
          <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Sourced from Quality automation</p>
            <h2 className="mt-1 text-sm font-semibold text-slate-900">
              This patient was surfaced from the Quality workflow for agent-assisted care management action.
            </h2>
            <p className="mt-1 text-xs text-slate-700">
              {sourceAgentLabel ?? "Quality agent"} identified this member in a high-priority cohort for {sourceMeasure ?? "quality gap closure"}. {supportingAgentLabel ?? "Resources agent"} validated staffing and operational capacity via Oracle Fusion signals before auto-assignment.
            </p>
            {initiative ? (
              <p className="mt-1 text-xs text-emerald-800">
                Active initiative: <span className="font-semibold">{initiative.replace(/-/g, " ")}</span>
              </p>
            ) : null}
          </section>
        ) : null}

        {source === "project-workflow" ? (
          <section className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-700">Opened from project workflow</p>
            <h2 className="mt-1 text-sm font-semibold text-slate-900">
              This patient was opened from an active workflow queue for execution review.
            </h2>
            <p className="mt-1 text-xs text-slate-700">
              Project: <span className="font-semibold">{sourceProjectName ?? "Active project"}</span>
              {sourceWorkflowTitle ? (
                <>
                  {" "}· Workflow: <span className="font-semibold">{sourceWorkflowTitle}</span>
                </>
              ) : null}
              {sourceAgentLabel ? (
                <>
                  {" "}· Agent: <span className="font-semibold">{sourceAgentLabel}</span>
                </>
              ) : null}
            </p>
            {initiative ? (
              <p className="mt-1 text-xs text-indigo-800">
                Initiative: <span className="font-semibold">{initiative.replace(/-/g, " ")}</span>
              </p>
            ) : null}
          </section>
        ) : null}

        {source === "pre-visit-planning" ? (
          <section className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-700">Sourced from Pre-visit Prep Agent</p>
            <h2 className="mt-1 text-sm font-semibold text-slate-900">
              This patient was prioritized for upcoming appointment pre-visit planning.
            </h2>
            <p className="mt-1 text-xs text-slate-700">
              The Pre-visit Prep Agent identified closure-ready care gaps for this attributed member so the care team can maximize visit-day gap closure.
            </p>
            {sourceAppointmentDate ? (
              <p className="mt-1 text-xs text-indigo-800">
                Upcoming appointment: <span className="font-semibold">{sourceAppointmentDate}</span>
              </p>
            ) : null}
          </section>
        ) : null}

        {source === "trial-match" ? (
          <section className="rounded-xl border border-violet-200 bg-violet-50 p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-700">Sourced from trial matching workflow</p>
            <h2 className="mt-1 text-sm font-semibold text-slate-900">
              This patient was opened from the Life Sciences trial-matched population list.
            </h2>
            <p className="mt-1 text-xs text-slate-700">
              {sourceTrial
                ? `${sourceTrial.name} · ${sourceTrial.sponsor} · ${sourceTrial.phase}`
                : "Review referral readiness, consent progression, and next best trial workflow actions."}
            </p>
            {sourceTrialId ? (
              <p className="mt-1 text-xs text-violet-800">
                Trial ID: <span className="font-semibold">{sourceTrialId}</span>
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-semibold">
              {sourceTrialId ? (
                <Link href={`/population/patients?trialId=${sourceTrialId}`} className="text-violet-700 hover:underline">
                  ← Back to trial patient list
                </Link>
              ) : null}
              <Link href="/life-sciences" className="text-violet-700 hover:underline">
                Back to Life Sciences opportunity center
              </Link>
            </div>
          </section>
        ) : null}

        {recommendedTrial ? (
          <section className="rounded-xl border-2 border-violet-300 bg-violet-50/70 p-4 shadow-sm ring-2 ring-violet-200/60">
            <div className="rounded-xl bg-gradient-to-r from-violet-700 via-violet-700 to-fuchsia-700 p-4 text-white shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-100">Matched Trial Opportunity</p>
                  <h2 className="mt-1 text-xl font-bold leading-tight">{recommendedTrial.name}</h2>
                  <p className="mt-1 text-xs text-violet-100">
                    {recommendedTrial.sponsor} · {recommendedTrial.phase} · {recommendedTrial.specialty}
                  </p>
                  <p className="mt-2 text-xs text-violet-50">
                    This member meets pre-screen indicators for research coordinator outreach and same-week referral review.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-semibold text-white">High match opportunity</span>
                  <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-semibold text-white">{trialMatchConfidence}% confidence</span>
                  <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-semibold text-white">{recommendedTrial.pipelineStage}</span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  className="rounded-md border border-white/40 bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-white/30"
                >
                  Start referral now
                </button>
                <button
                  type="button"
                  className="rounded-md border border-white/40 bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-white/30"
                >
                  Send consent packet
                </button>
                <button
                  type="button"
                  className="rounded-md border border-white/40 bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-white/30"
                >
                  Open trial workflow
                </button>
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-violet-200 bg-white p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-700">Why this member matched</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {trialMatchReasons.map((reason) => (
                  <span key={reason} className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
                    {reason}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2.5 lg:grid-cols-3">
              <article className="rounded-lg border border-violet-100 bg-white p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Matched member profile</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{member.name}</p>
                <p className="mt-1 text-xs text-slate-600">
                  {recommendedTrialPatient
                    ? `${recommendedTrialPatient.organization} · ${recommendedTrialPatient.provider}`
                    : `${member.payer} · ${member.plan}`}
                </p>
                <p className="mt-1 text-xs text-slate-700">
                  Opportunity: <span className="font-semibold">{recommendedTrialPatient?.opportunity ?? member.opportunity}</span>
                </p>
              </article>

              <article className="rounded-lg border border-violet-100 bg-white p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Recommendation</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">Pre-screen for {recommendedTrial.specialty.toLowerCase()} trial eligibility</p>
                <p className="mt-1 text-xs text-slate-700">{recommendedTrial.description}</p>
              </article>

              <article className="rounded-lg border border-violet-100 bg-white p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Explainability</p>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-slate-700">
                  {trialExplainability.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            </div>

            <div className="mt-2.5 grid grid-cols-1 gap-2.5 lg:grid-cols-2">
              <article className="rounded-lg border border-violet-100 bg-white p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Evidence sources</p>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-slate-700">
                  {trialEvidenceSources.map((sourceItem) => (
                    <li key={sourceItem}>{sourceItem}</li>
                  ))}
                </ul>
              </article>

              <article className="rounded-lg border border-violet-100 bg-white p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Referral next steps</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    className="rounded-md border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700 hover:bg-violet-100"
                  >
                    Send to research coordinator
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700 hover:bg-violet-100"
                  >
                    Deliver consent packet
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700 hover:bg-violet-100"
                  >
                    Open trial workflow
                  </button>
                </div>
              </article>
            </div>
          </section>
        ) : null}

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Recommended Actions</h3>
              <p className="mt-1 text-xs text-slate-500">Unified action center combining best actions, agent suggestions, and evidence context.</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {([
                { id: "all", label: "All" },
                { id: "not_started", label: "Not started" },
                { id: "drafted", label: "Drafted" },
                { id: "queued", label: "Queued" },
                { id: "completed", label: "Completed" },
              ] as { id: ActionFilter; label: string }[]).map((filterItem) => {
                const isActive = actionFilter === filterItem.id;
                return (
                  <button
                    key={filterItem.id}
                    type="button"
                    onClick={() => setActionFilter(filterItem.id)}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                      isActive
                        ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {filterItem.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 space-y-2.5">
            {filteredRecommendedActions.map((action) => {
              const status = actionStatusMap[action.id] ?? "not_started";
              const relatedEvidence = action.evidenceIds
                .map((id) => evidenceById.get(id))
                .filter((fact): fact is NonNullable<typeof fact> => Boolean(fact));
              const isExpanded = expandedActionId === action.id;

              return (
                <div key={action.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{action.title}</p>
                      {(action as { source?: string }).source ? (
                        <p className="mt-0.5 text-[11px] text-slate-500">Source: {(action as { source?: string }).source}</p>
                      ) : null}
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${actionStatusClass[status]}`}>
                      {actionStatusLabel[status]}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-600">{action.summary}</p>
                  <p className="mt-1 text-[11px] text-slate-500">Evidence linked: {relatedEvidence.length}</p>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => openActionPanel(action)}
                      className="rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100"
                    >
                      Open next steps
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedActionId((prev) => (prev === action.id ? null : action.id))}
                      className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      {isExpanded ? "Hide evidence" : "View evidence"}
                    </button>
                    {relatedEvidence[0] ? (
                      <button
                        type="button"
                        onClick={() => submitCopilotQuestion(`What should we do next based on this evidence: ${relatedEvidence[0].title}?`)}
                        className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Ask Copilot
                      </button>
                    ) : null}
                  </div>

                  {isExpanded ? (
                    <div className="mt-3 rounded-md border border-slate-200 bg-white p-2.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Supporting evidence timeline</p>
                      <div className="mt-2 space-y-1.5">
                        {relatedEvidence.length ? (
                          relatedEvidence.map((fact) => (
                            <div key={fact.id} className="rounded border border-slate-100 bg-slate-50 p-2">
                              <p className="text-[11px] font-semibold text-slate-900">{fact.date} · {fact.title}</p>
                              <p className="mt-0.5 text-[11px] text-slate-600">{fact.detail}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-[11px] text-slate-500">No supporting evidence linked.</p>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}

            {!filteredRecommendedActions.length ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-xs text-slate-500">
                No actions in this status yet.
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="border-b border-slate-200">
            <div className="flex flex-wrap gap-5">
              {[
                { id: "documents", label: "Documents" },
                { id: "clinical-notes", label: "Clinical Notes" },
                { id: "medications", label: "Medications" },
                { id: "conditions", label: "Conditions" },
                { id: "orders", label: "Orders" },
                { id: "labs", label: "Labs" },
                { id: "appointments", label: "Appointments" },
                { id: "vitals", label: "Vitals" },
              ].map((tab) => {
                const isActive = activeRecordsTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveRecordsTab(tab.id as RecordTabId)}
                    className={`border-b-2 pb-2 text-sm font-semibold transition ${
                      isActive
                        ? "border-slate-900 text-slate-900"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4">
            {activeRecordsTab === "documents" ? (
              <RecordsTable
                columns={["Date", "Type", "Title", "Source"]}
                rows={member.documents.map((item) => [item.date, item.type, item.title, item.source])}
              />
            ) : null}

            {activeRecordsTab === "clinical-notes" ? (
              <RecordsTable
                columns={["Date", "Author", "Note Type", "Excerpt"]}
                rows={member.clinicalNotes.map((item) => [item.date, item.author, item.noteType, item.excerpt])}
              />
            ) : null}

            {activeRecordsTab === "medications" ? (
              <RecordsTable
                columns={["Medication", "Dose", "Frequency", "Last Fill", "Adherence"]}
                rows={member.medications.map((item) => [item.name, item.dose, item.frequency, item.lastFillDate, item.adherenceStatus])}
              />
            ) : null}

            {activeRecordsTab === "conditions" ? (
              <RecordsTable
                columns={["Condition", "Status", "Onset Date"]}
                rows={member.conditions.map((item) => [item.name, item.status, item.onsetDate])}
              />
            ) : null}

            {activeRecordsTab === "orders" ? (
              <RecordsTable
                columns={["Placed Date", "Order Type", "Description", "Status"]}
                rows={member.orders.map((item) => [item.placedDate, item.orderType, item.description, item.status])}
              />
            ) : null}

            {activeRecordsTab === "labs" ? (
              <RecordsTable
                columns={["Collected Date", "Lab", "Value", "Reference Range"]}
                rows={member.labs.map((item) => [item.collectedDate, item.name, item.value, item.referenceRange])}
              />
            ) : null}

            {activeRecordsTab === "appointments" ? (
              <RecordsTable
                columns={["Date", "Visit Type", "Provider", "Status"]}
                rows={member.appointments.map((item) => [item.date, item.visitType, item.provider, item.status])}
              />
            ) : null}

            {activeRecordsTab === "vitals" ? (
              <RecordsTable
                columns={["Date", "Vital", "Value"]}
                rows={member.vitals.map((item) => [item.date, item.label, item.value])}
              />
            ) : null}
          </div>
        </section>

        {actionPanel ? (
          <div className="fixed inset-0 z-50 flex items-end justify-end bg-slate-950/30 p-4">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-2xl">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600">Action workflow</p>
                  <h4 className="text-sm font-semibold text-slate-900">{actionPanel.title}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setActionPanel(null)}
                  className="rounded-md border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-600">{actionPanel.summary}</p>
              <div className="mt-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Next steps</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-slate-700">
                  {actionPanel.nextSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>

              {actionPanel.evidenceIds.length ? (
                <div className="mt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Linked evidence</p>
                  <div className="mt-1 space-y-1">
                    {actionPanel.evidenceIds.map((id) => {
                      const fact = evidenceById.get(id);
                      if (!fact) return null;
                      return <p key={id} className="text-xs text-slate-600">• {fact.title}</p>;
                    })}
                  </div>
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActionStatus(actionPanel.id, "drafted")}
                  className="rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100"
                >
                  Mark drafted
                </button>
                <button
                  type="button"
                  onClick={() => setActionStatus(actionPanel.id, "queued")}
                  className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-100"
                >
                  Queue action
                </button>
                <button
                  type="button"
                  onClick={() => setActionStatus(actionPanel.id, "completed")}
                  className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                >
                  Complete
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </FeatureGuard>
  );
}

function RecordsTable({ columns, rows }: { columns: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0 text-left">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className="border-b border-slate-200 px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr key={`row-${rowIdx}`}>
              {row.map((value, colIdx) => (
                <td key={`row-${rowIdx}-col-${colIdx}`} className="border-b border-slate-100 px-3 py-2 text-sm text-slate-700">
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3">
        <button type="button" className="text-sm font-semibold text-cyan-700 hover:text-cyan-600">
          View All ({rows.length} Records)
        </button>
      </div>
    </div>
  );
}
