import Link from "next/link";
import FeatureGuard from "@/components/FeatureGuard";
import { lifeSciencesTrials } from "@/data/synthetic/lifeSciencesTrials";

const FILTER_LABELS = [
  "Organization",
  "Provider",
  "Payer",
  "Plan",
  "Gender",
  "Opportunity",
  "Match Confidence",
  "Referral / Consent Status",
];

const getMatchConfidence = (patientId: string) => {
  const confidenceMap: Record<string, string> = {
    "PTL-ONC-10001": "94%",
    "PTL-ONC-10002": "92%",
    "PTL-ONC-10003": "90%",
    "PTL-ONC-10004": "89%",
    "PTL-ONC-10005": "86%",
    "PTL-ONC-10006": "88%",
    "PTL-ONC-10007": "85%",
    "PTL-ONC-10008": "87%",
  };

  return confidenceMap[patientId] ?? "88%";
};

const getReferralConsentStatus = (patientId: string) => {
  const statusMap: Record<string, string> = {
    "PTL-ONC-10001": "Referral Ready · Consent Pending",
    "PTL-ONC-10002": "Coordinator Review",
    "PTL-ONC-10003": "Referral Sent · Consent Delivered",
    "PTL-ONC-10004": "Needs Provider Review",
    "PTL-ONC-10005": "Referral Ready · Consent Pending",
    "PTL-ONC-10006": "Coordinator Outreach",
    "PTL-ONC-10007": "Needs Provider Review",
    "PTL-ONC-10008": "Consent Complete",
  };

  return statusMap[patientId] ?? "Coordinator Review";
};

export default async function TrialPatientListPage({
  searchParams,
}: {
  searchParams?: Promise<{ trialId?: string }>;
}) {
  const params = await searchParams;
  const trialId = params?.trialId;
  const trial = lifeSciencesTrials.find((entry) => entry.id === trialId);

  return (
    <FeatureGuard page="population">
      <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Patient List</h1>
            <p className="mt-2 text-slate-500">
              Identifiable patient list for trial matching and outreach workflow review.
            </p>
          </div>

          {!trial ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">No trial selected or trial not found.</p>
              <Link
                href="/life-sciences"
                className="mt-2 inline-flex text-sm font-semibold text-amber-800 hover:underline"
              >
                ← Return to Life Sciences opportunity center
              </Link>
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  Trial patient list
                </p>
                <h2 className="mt-1 text-base font-semibold text-indigo-900">{trial.name}</h2>
                <p className="mt-1 text-sm text-indigo-800">
                  {trial.sponsor} · {trial.phase} · {trial.specialty}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Link
                    href={`/population?trialId=${trial.id}`}
                    className="inline-flex rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
                  >
                    ← Back to demographics
                  </Link>
                  <Link
                    href="/life-sciences"
                    className="inline-flex text-sm font-semibold text-indigo-700 hover:underline"
                  >
                    Back to Life Sciences opportunity center
                  </Link>
                </div>
              </div>

              <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
                  <input
                    placeholder="Please select a filter or search for patient, MRN"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 lg:col-span-2"
                  />
                  {FILTER_LABELS.map((label) => (
                    <select
                      key={label}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
                    >
                      <option>{label}</option>
                    </select>
                  ))}
                </div>
              </section>

              <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-4xl font-semibold text-slate-900">
                    {trial.matchedPopulationCount.toLocaleString()} Persons
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                      Export
                    </button>
                    <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                      Save View
                    </button>
                    <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                      Select View
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">Opportunity</th>
                        <th className="px-3 py-2 text-left font-semibold">Name (MRN)</th>
                        <th className="px-3 py-2 text-left font-semibold">Date of Birth (Age)</th>
                        <th className="px-3 py-2 text-left font-semibold">Organization / Provider</th>
                        <th className="px-3 py-2 text-left font-semibold">Payer / Plan</th>
                        <th className="px-3 py-2 text-left font-semibold">Trial Match Confidence</th>
                        <th className="px-3 py-2 text-left font-semibold">Referral / Consent Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {trial.patientList.map((patient) => (
                        <tr key={patient.id}>
                          <td className="px-3 py-3">
                            <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                              {patient.opportunity}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <Link
                              href={`/population/member/${patient.id}?source=trial-match&trialId=${trial.id}`}
                              className="font-semibold text-sky-800 hover:underline"
                            >
                              {patient.fullName}
                            </Link>
                            <p className="text-slate-500">MRN: {patient.mrn}</p>
                          </td>
                          <td className="px-3 py-3">
                            <p className="text-slate-900">{patient.dateOfBirth}</p>
                            <p className="text-slate-500">{patient.age} years</p>
                          </td>
                          <td className="px-3 py-3">
                            <p className="text-slate-900">{patient.organization}</p>
                            <p className="text-slate-500">{patient.provider}</p>
                          </td>
                          <td className="px-3 py-3">
                            <p className="text-slate-900">{patient.payer}</p>
                            <p className="text-slate-500">{patient.plan}</p>
                          </td>
                          <td className="px-3 py-3">
                            <p className="font-semibold text-slate-900">{getMatchConfidence(patient.id)}</p>
                            <p className="text-slate-500">{patient.measure}</p>
                          </td>
                          <td className="px-3 py-3 text-slate-900">
                            {getReferralConsentStatus(patient.id)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
      </div>
    </FeatureGuard>
  );
}