"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";

type DriverNode = {
  key: string;
  label: string;
  percent: number;
  color: string;
  children?: DriverNode[];
};

type MeasureDriverConfig = {
  title: string;
  shortName: string;
  currentRate: number;
  targetRate: number;
  summary: string;
  drivers: DriverNode[];
  recommendations: Array<{
    title: string;
    whyItMatters: string;
    action: string;
  }>;
};

const measureDriverConfigs: Record<string, MeasureDriverConfig> = {
  "diabetes-a1c-control": {
    title: "Diabetes A1c Control — Drivers",
    shortName: "Diabetes A1c Control",
    currentRate: 68,
    targetRate: 75,
    summary:
      "Leading barriers for members not meeting A1c control include missed lab closure, medication intensification delays, and access barriers for high-risk diabetic members.",
    drivers: [
      {
        key: "lab-closure",
        label: "Missed A1c labs / no recent result",
        percent: 29,
        color: "#4f46e5",
        children: [
          { key: "lab-no-order", label: "No open lab order", percent: 9, color: "#818cf8" },
          { key: "lab-missed", label: "Missed lab appointment", percent: 8, color: "#818cf8" },
          { key: "lab-outside", label: "External result not reconciled", percent: 7, color: "#818cf8" },
          { key: "lab-transport", label: "Transportation to lab site", percent: 5, color: "#818cf8" },
        ],
      },
      {
        key: "therapy-intensification",
        label: "Medication intensification gaps",
        percent: 21,
        color: "#94a3b8",
        children: [
          { key: "therapy-delay", label: "No therapy change after elevated A1c", percent: 8, color: "#cbd5e1" },
          { key: "therapy-adherence", label: "Oral med adherence risk", percent: 6, color: "#cbd5e1" },
          { key: "therapy-injectable", label: "Injectable start friction", percent: 4, color: "#cbd5e1" },
          { key: "therapy-pharmacy", label: "Pharmacy follow-up lag", percent: 3, color: "#cbd5e1" },
        ],
      },
      {
        key: "food-insecurity",
        label: "Nutrition / food insecurity",
        percent: 14,
        color: "#94a3b8",
        children: [
          { key: "food-cost", label: "Diabetes-friendly food cost", percent: 6, color: "#cbd5e1" },
          { key: "food-education", label: "Nutrition education gap", percent: 5, color: "#cbd5e1" },
          { key: "food-referral", label: "Unclosed food referral", percent: 3, color: "#cbd5e1" },
        ],
      },
      {
        key: "specialty-access",
        label: "Endocrinology / PCP access",
        percent: 12,
        color: "#94a3b8",
        children: [
          { key: "access-endocrine", label: "Endocrinology wait time", percent: 5, color: "#cbd5e1" },
          { key: "access-pcp", label: "No PCP visit in 90 days", percent: 4, color: "#cbd5e1" },
          { key: "access-tele", label: "Virtual care not offered", percent: 3, color: "#cbd5e1" },
        ],
      },
    ],
    recommendations: [
      {
        title: "Lab Closure agent",
        whyItMatters: "A1c control cannot be credited without timely lab evidence or result reconciliation.",
        action: "Auto-generate lab orders and outreach for members missing an A1c result in the current measurement window.",
      },
      {
        title: "Clinical Pharmacy agent",
        whyItMatters: "Persistent A1c elevation often reflects delayed medication intensification or adherence friction.",
        action: "Queue pharmacist review for members with A1c >9 and no therapy change in the last 120 days.",
      },
    ],
  },
  "colorectal-screening": {
    title: "Colorectal Screening — Drivers",
    shortName: "Colorectal Screening",
    currentRate: 61,
    targetRate: 70,
    summary:
      "Screening gaps are concentrated in members overdue for FIT kit return, colonoscopy scheduling, and documentation of externally completed screenings.",
    drivers: [
      {
        key: "fit-nonreturn",
        label: "FIT kit not returned",
        percent: 31,
        color: "#4f46e5",
        children: [
          { key: "fit-no-reminder", label: "No reminder sequence", percent: 11, color: "#818cf8" },
          { key: "fit-address", label: "Address/contact mismatch", percent: 7, color: "#818cf8" },
          { key: "fit-instructions", label: "Instructions not understood", percent: 6, color: "#818cf8" },
          { key: "fit-preference", label: "Colonoscopy preference unresolved", percent: 7, color: "#818cf8" },
        ],
      },
      {
        key: "colonoscopy-access",
        label: "Colonoscopy scheduling access",
        percent: 18,
        color: "#94a3b8",
        children: [
          { key: "colo-wait", label: "GI appointment wait time", percent: 7, color: "#cbd5e1" },
          { key: "colo-prep", label: "Prep support gap", percent: 5, color: "#cbd5e1" },
          { key: "colo-transport", label: "Transportation / escort barrier", percent: 6, color: "#cbd5e1" },
        ],
      },
      {
        key: "education-hesitancy",
        label: "Screening hesitancy / education",
        percent: 13,
        color: "#94a3b8",
        children: [
          { key: "edu-fear", label: "Procedure concern", percent: 5, color: "#cbd5e1" },
          { key: "edu-risk", label: "Risk not understood", percent: 4, color: "#cbd5e1" },
          { key: "edu-language", label: "Language-concordant education needed", percent: 4, color: "#cbd5e1" },
        ],
      },
      {
        key: "documentation",
        label: "External result documentation gaps",
        percent: 10,
        color: "#94a3b8",
        children: [
          { key: "doc-outside", label: "Outside colonoscopy not abstracted", percent: 5, color: "#cbd5e1" },
          { key: "doc-claim", label: "Claims/chart mismatch", percent: 3, color: "#cbd5e1" },
          { key: "doc-exclusion", label: "Exclusion validation pending", percent: 2, color: "#cbd5e1" },
        ],
      },
    ],
    recommendations: [
      {
        title: "Preventive Outreach agent",
        whyItMatters: "FIT kit return is the fastest path to close a large share of screening gaps.",
        action: "Launch a mailed FIT kit reminder sequence with digital nudges and PCP panel escalation.",
      },
      {
        title: "GI Navigation agent",
        whyItMatters: "Members needing colonoscopy often fail to close due to scheduling, prep, and transportation barriers.",
        action: "Route high-risk members to navigation for GI scheduling, prep calls, and transportation support.",
      },
    ],
  },
  "breast-cancer-screening": {
    title: "Breast Cancer Screening — Drivers",
    shortName: "Breast Cancer Screening",
    currentRate: 67,
    targetRate: 72,
    summary:
      "Breast screening gaps are driven by imaging access, missed scheduling, incomplete follow-up after abnormal findings, and outreach barriers.",
    drivers: [
      {
        key: "imaging-access",
        label: "Imaging access and scheduling",
        percent: 27,
        color: "#4f46e5",
        children: [
          { key: "img-capacity", label: "Limited imaging capacity", percent: 9, color: "#818cf8" },
          { key: "img-hours", label: "Appointment hours mismatch", percent: 6, color: "#818cf8" },
          { key: "img-transport", label: "Transportation to imaging center", percent: 5, color: "#818cf8" },
          { key: "img-order", label: "No active mammogram order", percent: 7, color: "#818cf8" },
        ],
      },
      {
        key: "outreach-nonresponse",
        label: "Outreach nonresponse",
        percent: 17,
        color: "#94a3b8",
        children: [
          { key: "outreach-contact", label: "Invalid contact channel", percent: 6, color: "#cbd5e1" },
          { key: "outreach-language", label: "Language preference mismatch", percent: 4, color: "#cbd5e1" },
          { key: "outreach-reminder", label: "Reminder cadence incomplete", percent: 7, color: "#cbd5e1" },
        ],
      },
      {
        key: "clinical-followup",
        label: "Prior abnormal follow-up complexity",
        percent: 11,
        color: "#94a3b8",
        children: [
          { key: "follow-diag", label: "Diagnostic mammogram pending", percent: 4, color: "#cbd5e1" },
          { key: "follow-record", label: "Prior result retrieval", percent: 3, color: "#cbd5e1" },
          { key: "follow-fear", label: "Anxiety / counseling need", percent: 4, color: "#cbd5e1" },
        ],
      },
      {
        key: "documentation",
        label: "External screening documentation",
        percent: 8,
        color: "#94a3b8",
        children: [
          { key: "doc-outside", label: "Outside imaging not integrated", percent: 4, color: "#cbd5e1" },
          { key: "doc-claims", label: "Claims lag", percent: 2, color: "#cbd5e1" },
          { key: "doc-exclusion", label: "Exclusion criteria review", percent: 2, color: "#cbd5e1" },
        ],
      },
    ],
    recommendations: [
      {
        title: "Imaging Access agent",
        whyItMatters: "Screening gaps often close quickly when imaging orders and appointment access are solved together.",
        action: "Reserve mammography blocks for overdue members and auto-route order prompts to upcoming PCP visits.",
      },
      {
        title: "Result Retrieval agent",
        whyItMatters: "External mammograms can remain uncredited if results are not integrated before measurement cutoff.",
        action: "Queue outside imaging retrieval and chart abstraction for members with likely completed external screening.",
      },
    ],
  },
  "medication-adherence": {
    title: "Medication Adherence — Drivers",
    shortName: "Medication Adherence",
    currentRate: 72,
    targetRate: 80,
    summary:
      "This view summarizes leading barriers to medication adherence for the population in scope and highlights where interventions can improve performance.",
    drivers: [
      {
        key: "coverage-parent",
        label: "Cost & coverage barriers",
        percent: 34,
        color: "#4f46e5",
        children: [
          { key: "coverage-copay", label: "High copay", percent: 12, color: "#818cf8" },
          { key: "coverage-pa", label: "Prior authorization delays", percent: 8, color: "#818cf8" },
          { key: "coverage-step", label: "Step therapy requirements", percent: 7, color: "#818cf8" },
          { key: "coverage-nonform", label: "Non-formulary exclusions", percent: 5, color: "#818cf8" },
          { key: "coverage-qty", label: "Quantity limits", percent: 2, color: "#818cf8" },
        ],
      },
      {
        key: "side-effects",
        label: "Side effects concern",
        percent: 12,
        color: "#94a3b8",
        children: [
          { key: "side-nausea", label: "Nausea", percent: 4, color: "#cbd5e1" },
          { key: "side-fatigue", label: "Fatigue", percent: 3, color: "#cbd5e1" },
          { key: "side-dizzy", label: "Dizziness", percent: 3, color: "#cbd5e1" },
          { key: "side-gi", label: "GI discomfort", percent: 2, color: "#cbd5e1" },
        ],
      },
      {
        key: "forgetfulness",
        label: "Missed refills / forgetfulness",
        percent: 11,
        color: "#94a3b8",
        children: [
          { key: "forget-1", label: "Forgetfulness", percent: 5, color: "#cbd5e1" },
          { key: "forget-2", label: "Travel disruptions", percent: 3, color: "#cbd5e1" },
          { key: "forget-3", label: "Refill friction", percent: 3, color: "#cbd5e1" },
        ],
      },
      {
        key: "transport",
        label: "Pharmacy access / transportation",
        percent: 9,
        color: "#94a3b8",
        children: [
          { key: "access-1", label: "Distance to pharmacy", percent: 3, color: "#cbd5e1" },
          { key: "access-2", label: "Limited pharmacy hours", percent: 2, color: "#cbd5e1" },
          { key: "access-3", label: "Transportation insecurity", percent: 4, color: "#cbd5e1" },
        ],
      },
    ],
    recommendations: [
      {
        title: "Coverage Friction agent",
        whyItMatters: "Reducing coverage friction improves continuity of therapy and supports quality measure closure at scale.",
        action: "Run policy change scenarios to estimate the impact of payer/provider contract policy changes on adherence performance.",
      },
      {
        title: "Member Engagement agent",
        whyItMatters: "Missed refills and low persistence often reflect reminder and follow-up gaps.",
        action: "Trigger targeted refill reminders and outreach for members with rising adherence risk in the next 14 days.",
      },
    ],
  },
};

function wrapLabel(value: string, maxChars = 30): string[] {
  if (value.length <= maxChars) return [value];
  const words = value.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (`${current} ${word}`.trim().length <= maxChars) {
      current = `${current} ${word}`.trim();
    } else {
      if (current) lines.push(current);
      current = word;
    }
    if (lines.length === 1 && current.length > maxChars) {
      lines.push(`${current.slice(0, maxChars - 1)}…`);
      return lines;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 2);
}

export default function MeasureDriversPage({ params }: { params: Promise<{ measureSlug: string }> }) {
  const { measureSlug } = use(params);
  const config = measureDriverConfigs[measureSlug] ?? measureDriverConfigs["medication-adherence"];
  const [expandedDrivers, setExpandedDrivers] = useState<Record<string, boolean>>({});
  const xMax = 40;

  const visibleDrivers = useMemo(() => {
    const flattened: Array<DriverNode & { depth: 0 | 1; parentKey?: string }> = [];
    for (const parent of config.drivers) {
      flattened.push({ ...parent, depth: 0 });
      if (expandedDrivers[parent.key] && parent.children) {
        parent.children.forEach((child) => {
          flattened.push({ ...child, depth: 1, parentKey: parent.key });
        });
      }
    }
    return flattened;
  }, [config.drivers, expandedDrivers]);

  const toggleDriver = (key: string) => {
    setExpandedDrivers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8">
      <div>
        <Link href="/population" className="text-sm font-semibold text-indigo-700 hover:underline">
          ← Back to population
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">{config.title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">{config.summary}</p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs text-slate-500">Current performance</p>
            <p className="text-2xl font-bold text-slate-900">{config.currentRate}%</p>
          </div>
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
            <p className="text-xs text-indigo-700">Target</p>
            <p className="text-2xl font-bold text-indigo-700">{config.targetRate}%</p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs text-amber-700">Gap to target</p>
            <p className="text-2xl font-bold text-amber-700">{Math.max(0, config.targetRate - config.currentRate)} pts</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-slate-900">Drivers of performance gap</p>
            <p className="text-xs text-slate-500">Share of members with a documented barrier (%)</p>
          </div>
          <p className="text-[11px] text-slate-500">Use +/- on chart categories to expand/collapse breakdown.</p>
        </div>
        <div className="grid grid-cols-[clamp(220px,28%,320px)_1fr] gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="space-y-2 pr-2">
            {visibleDrivers.map((item) => {
              const hasChildren = config.drivers.some((driver) => driver.key === item.key && driver.children?.length);
              const expanded = !!expandedDrivers[item.key];
              const wrapped = wrapLabel(item.label, item.depth === 1 ? 28 : 32);
              return (
                <div key={`label-${item.key}`} className="flex min-h-[42px] items-center gap-2">
                  <button
                    type="button"
                    onClick={() => hasChildren && toggleDriver(item.key)}
                    aria-label={hasChildren ? (expanded ? `Collapse ${item.label}` : `Expand ${item.label}`) : `${item.label} has no subcategories`}
                    disabled={!hasChildren}
                    className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs font-semibold ${hasChildren ? "border-slate-300 bg-white text-slate-700" : "border-transparent text-transparent"}`}
                  >
                    {hasChildren ? (expanded ? "−" : "+") : "+"}
                  </button>
                  <div className={`min-w-0 ${item.depth === 1 ? "pl-3" : ""}`} title={item.label}>
                    {wrapped.map((line, idx) => (
                      <p key={`${item.key}-line-${idx}`} className="truncate text-[11px] leading-4 text-slate-700">
                        {idx === 0 && item.depth === 1 ? "↳ " : ""}
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-2 border-l border-slate-200 pl-3">
            {visibleDrivers.map((item) => (
              <div key={`bar-${item.key}`} className="flex min-h-[42px] items-center">
                <div className="relative h-7 w-full rounded bg-white">
                  <div
                    className="h-7 rounded-r"
                    style={{ width: `${Math.min((item.percent / xMax) * 100, 100)}%`, backgroundColor: item.color }}
                    title={`${item.label}: ${item.percent}%`}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-700">
                    {item.percent}%
                  </span>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <div className="relative h-6 border-t border-slate-300">
                {[0, 10, 20, 30, 40].map((tick) => (
                  <div key={tick} className="absolute top-0" style={{ left: `${(tick / xMax) * 100}%`, transform: "translateX(-50%)" }}>
                    <div className="h-1.5 w-px bg-slate-400" />
                    <span className="mt-1 block text-[10px] text-slate-500">{tick}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Opportunities to improve measure performance</h2>
            <p className="mt-1 text-xs text-slate-500">Agent recommendations for closing gaps and improving quality performance.</p>
          </div>
          <Link href={`/quality/measures/${measureSlug}/scenario`} className="rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white">
            Run scenario
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {config.recommendations.map((recommendation) => (
            <RecommendationCard key={recommendation.title} {...recommendation} />
          ))}
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({ title, whyItMatters, action }: { title: string; whyItMatters: string; action: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Why it matters</p>
        <p className="mt-1 text-xs text-amber-800">{whyItMatters}</p>
      </div>
      <div className="mt-3 rounded-lg bg-indigo-50 px-3 py-2.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Recommended action</p>
        <p className="mt-1 text-xs text-indigo-800">{action}</p>
      </div>
    </div>
  );
}
