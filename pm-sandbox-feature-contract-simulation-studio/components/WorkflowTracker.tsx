"use client";

import { useState, useEffect, useCallback } from "react";
import {
  WorkflowStatus,
  MemberWorkflowRecord,
  workflowStorageKey,
  workflowColors,
  WORKFLOW_STAGES,
} from "@/types/workflow";
import { CohortMember } from "@/types/workflow";
import { daysSinceContact } from "@/lib/memberData";

// ── Pipeline stage config ──────────────────────────────────────────────────

const PIPELINE: { status: WorkflowStatus; icon: string; activeColor: string }[] = [
  { status: "Not Started",        icon: "○", activeColor: "bg-slate-400"   },
  { status: "Outreach Attempted", icon: "◎", activeColor: "bg-sky-500"     },
  { status: "Enrolled in CM",     icon: "●", activeColor: "bg-indigo-600"  },
  { status: "Completed",          icon: "✓", activeColor: "bg-emerald-500" },
  { status: "Declined",           icon: "✕", activeColor: "bg-red-400"     },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function riskColor(score: number): string {
  if (score >= 3.5) return "text-red-600 font-bold";
  if (score >= 2.5) return "text-amber-600 font-semibold";
  return "text-slate-600";
}

function contactLabel(dateStr: string): { label: string; urgent: boolean } {
  const days = daysSinceContact(dateStr);
  if (days <= 7)  return { label: `${days}d ago`, urgent: false };
  if (days <= 30) return { label: `${days}d ago`, urgent: false };
  return { label: `${days}d ago`, urgent: true };
}

// ── Main component ─────────────────────────────────────────────────────────

interface WorkflowTrackerProps {
  cohortId: string;
  members:  CohortMember[];
}

export default function WorkflowTracker({ cohortId, members }: WorkflowTrackerProps) {
  const storageKey = workflowStorageKey(cohortId);

  // Keyed by member.id → MemberWorkflowRecord
  const [records, setRecords] = useState<Record<string, MemberWorkflowRecord>>({});
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        setRecords({});
      } else {
        setRecords(JSON.parse(raw) as Record<string, MemberWorkflowRecord>);
      }
    } catch {
      setRecords({});
    }
    setHydrated(true);
  }, [storageKey]);

  const getRecord = useCallback(
    (memberId: string): MemberWorkflowRecord =>
      records[memberId] ?? {
        status:      "Not Started",
        notes:       "",
        lastUpdated: "",
      },
    [records]
  );

  const save = useCallback(
    (updated: Record<string, MemberWorkflowRecord>) => {
      setRecords(updated);
    },
    []
  );

  const updateStatus = useCallback(
    (memberId: string, status: WorkflowStatus) => {
      const current = getRecord(memberId);
      save({
        ...records,
        [memberId]: { ...current, status, lastUpdated: new Date().toISOString().slice(0, 10) },
      });
    },
    [records, getRecord, save]
  );

  const updateNotes = useCallback(
    (memberId: string, notes: string) => {
      const current = getRecord(memberId);
      save({
        ...records,
        [memberId]: { ...current, notes, lastUpdated: new Date().toISOString().slice(0, 10) },
      });
    },
    [records, getRecord, save]
  );

  // ── Pipeline summary counts ──────────────────────────────────────────────

  const counts = WORKFLOW_STAGES.reduce(
    (acc, s) => ({ ...acc, [s]: 0 }),
    {} as Record<WorkflowStatus, number>
  );
  members.forEach((m) => {
    const s = getRecord(m.id).status;
    counts[s] = (counts[s] ?? 0) + 1;
  });

  const activeCount    = (counts["Enrolled in CM"] ?? 0) + (counts["Outreach Attempted"] ?? 0);
  const completedCount = counts["Completed"] ?? 0;
  const declinedCount  = counts["Declined"]  ?? 0;

  useEffect(() => {
    if (!hydrated) return;

    const timeoutId = window.setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(records));
      } catch {
        // ignore storage errors
      }
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [records, storageKey, hydrated]);

  if (!hydrated) return null;

  return (
    <div className="space-y-6">

      {/* ── Pipeline summary ──────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 pt-4 pb-2">
          <h3 className="text-sm font-semibold text-slate-900">Intervention Pipeline</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {members.length} members in caseload · {activeCount} active · {completedCount} completed · {declinedCount} declined
          </p>
        </div>

        {/* Pipeline flow */}
        <div className="flex items-stretch px-5 pb-5 gap-0 overflow-x-auto">
          {PIPELINE.map((stage, i) => {
            const count = counts[stage.status] ?? 0;
            const pct   = members.length ? Math.round((count / members.length) * 100) : 0;
            const isLast = i === PIPELINE.length - 1;
            return (
              <div key={stage.status} className="flex items-center">
                <div className="flex flex-col items-center min-w-[100px]">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white ${count > 0 ? stage.activeColor : "bg-slate-200"}`}>
                    {count}
                  </div>
                  <p className="mt-1.5 text-center text-[10px] font-semibold text-slate-600 leading-tight max-w-[80px]">
                    {stage.status}
                  </p>
                  <p className="text-[10px] text-slate-400">{pct}%</p>
                </div>
                {!isLast && (
                  <span className="mx-1 text-slate-300 text-base shrink-0">→</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar across pipeline (excluding declined) */}
        {(() => {
          const active    = counts["Outreach Attempted"] ?? 0;
          const enrolled  = counts["Enrolled in CM"]     ?? 0;
          const completed = counts["Completed"]          ?? 0;
          const declined  = counts["Declined"]           ?? 0;
          const notStarted = counts["Not Started"]       ?? 0;
          const total = members.length || 1;
          return (
            <div className="h-2 flex w-full">
              <div className="bg-slate-200"     style={{ width: `${(notStarted / total) * 100}%` }} />
              <div className="bg-sky-400"       style={{ width: `${(active    / total) * 100}%` }} />
              <div className="bg-indigo-500"    style={{ width: `${(enrolled  / total) * 100}%` }} />
              <div className="bg-emerald-500"   style={{ width: `${(completed / total) * 100}%` }} />
              <div className="bg-red-400"       style={{ width: `${(declined  / total) * 100}%` }} />
            </div>
          );
        })()}
      </div>

      {/* ── Member rows ───────────────────────────────────────────────── */}
      <div className="space-y-3">
        {members.map((member) => {
          const rec          = getRecord(member.id);
          const { bg, text } = workflowColors[rec.status];
          const contact      = contactLabel(member.lastContactDate);
          const notesOpen    = expandedNotes[member.id] ?? false;

          return (
            <div
              key={member.id}
              className={`rounded-xl border bg-white shadow-sm overflow-hidden transition-colors ${
                rec.status === "Completed" ? "border-emerald-200" :
                rec.status === "Declined"  ? "border-red-100"     :
                rec.status === "Enrolled in CM" ? "border-indigo-200" : "border-slate-200"
              }`}
            >
              {/* Member header row */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                {/* Left: identity */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${bg} ${text}`}>
                    {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{member.name}</span>
                      <span className="text-xs text-slate-400">{member.memberId}</span>
                      <span className="text-xs text-slate-400">· Age {member.age}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{member.primaryCondition}</p>
                  </div>
                </div>

                {/* Right: meta chips */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <span className={`text-xs font-semibold ${riskColor(member.riskScore)}`}>
                    Risk {member.riskScore.toFixed(1)}
                  </span>
                  <span className={`text-[10px] ${contact.urgent ? "text-red-500 font-semibold" : "text-slate-400"}`}>
                    Last contact: {contact.label}
                  </span>
                  <span className="text-[10px] text-slate-400 hidden sm:inline">CM: {member.assignedCM}</span>
                </div>
              </div>

              {/* Status controls */}
              <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mr-1">Status:</span>
                {WORKFLOW_STAGES.map((s) => {
                  const active = rec.status === s;
                  const { bg: sBg, text: sText, ring: sRing } = workflowColors[s];
                  return (
                    <button
                      key={s}
                      onClick={() => updateStatus(member.id, s)}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 transition-all ${
                        active
                          ? `${sBg} ${sText} ${sRing} shadow-sm scale-105`
                          : "bg-white text-slate-500 ring-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}

                {/* Notes toggle */}
                <button
                  onClick={() => setExpandedNotes((prev) => ({ ...prev, [member.id]: !notesOpen }))}
                  className="ml-auto text-[10px] font-medium text-indigo-500 hover:text-indigo-700"
                >
                  {notesOpen ? "Hide notes ↑" : `Notes ${rec.notes ? "●" : "+"}`}
                </button>

                {rec.lastUpdated && (
                  <span className="text-[10px] text-slate-300">Updated {rec.lastUpdated}</span>
                )}
              </div>

              {/* Notes panel */}
              {notesOpen && (
                <div className="border-t border-slate-100 px-5 py-3">
                  <textarea
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 placeholder-slate-300 focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200 resize-none"
                    rows={2}
                    placeholder="Add care management notes, barriers, next steps…"
                    value={rec.notes}
                    onChange={(e) => updateNotes(member.id, e.target.value)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
