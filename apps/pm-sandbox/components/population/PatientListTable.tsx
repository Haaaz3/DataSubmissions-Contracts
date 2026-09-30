"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import type { PopulationPatientRow } from "@/types/population";

export type SortKey = "opportunity" | "name" | "dateOfBirth" | "gender" | "primaryContact" | "totalUnmetMeasures" | "providerName" | "recentVisitDate" | "nextAttributedProviderVisitDate";

export function PatientListFrame({ children, id }: { children: ReactNode; id?: string }) {
  return <div id={id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">{children}</div>;
}

export default function PatientListTable<T extends PopulationPatientRow>({ patients, onSort, renderMeasures, measureColumnLabel = "Total Unmet Measures", linkMembers = true, showSelection = true }: {
  patients: T[];
  onSort?: (key: SortKey) => void;
  renderMeasures?: (patient: T) => ReactNode;
  measureColumnLabel?: string;
  linkMembers?: boolean;
  showSelection?: boolean;
}) {
  return (
        <div className="overflow-x-auto">
          <table className="min-w-[1450px] w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {showSelection && <th className="px-3 py-2.5 text-left"><input type="checkbox" aria-label="Select all rows" /></th>}
                {[
                  { label: "Opportunity", key: "opportunity" as SortKey },
                  { label: "Name (MRN)", key: "name" as SortKey },
                  { label: "Date of Birth (Age)", key: "dateOfBirth" as SortKey },
                  { label: "Gender (Birth Sex)", key: "gender" as SortKey },
                  { label: "Primary Contact", key: "primaryContact" as SortKey },
                  { label: measureColumnLabel, key: "totalUnmetMeasures" as SortKey },
                  { label: "Provider Name", key: "providerName" as SortKey },
                  { label: "Recent Visit Date", key: "recentVisitDate" as SortKey },
                  { label: "Next Attributed Provider Visit Date", key: "nextAttributedProviderVisitDate" as SortKey },
                ].map((col) => (
                  <th
                    key={col.key}
                    className=" px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                  >
                    <button type="button" onClick={() => onSort?.(col.key)} className="inline-flex items-center gap-1 text-left">
                      {col.label}
                      <span className="text-[10px] text-slate-400">↕</span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {patients.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60">
                  {showSelection && <td className="px-3 py-3 align-top"><input type="checkbox" aria-label={`Select ${row.name}`} /></td>}
                  <td className="px-3 py-3 align-top">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      row.opportunity === "High"
                        ? "bg-amber-100 text-amber-800"
                        : row.opportunity === "Medium"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {row.opportunity}
                    </span>
                  </td>
                  <td className="px-3 py-3 align-top">
                    {linkMembers ? <Link href={`/population/member/${row.id}`} className="font-semibold text-sky-700 hover:underline">{row.name}</Link> : <span className="font-semibold text-slate-900">{row.name}</span>}
                    <p className="mt-1 text-xs text-slate-500">MRN: {row.mrn}</p>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <p className="text-slate-900">{row.dateOfBirth}</p>
                    <p className="mt-1 text-xs text-slate-500">{row.age} years</p>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <p className="text-slate-900">{row.gender}</p>
                    <p className="mt-1 text-xs text-slate-500">Birth Sex: {row.birthSex}</p>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <p className="text-slate-900">{row.primaryContact}</p>
                    <p className="mt-1 text-xs text-slate-500">Type: {row.contactType}</p>
                  </td>
                  <td className="px-3 py-3 align-top text-slate-900">{renderMeasures ? renderMeasures(row) : row.totalUnmetMeasures}</td>
                  <td className="px-3 py-3 align-top text-slate-900">{row.providerName}</td>
                  <td className="px-3 py-3 align-top text-slate-900">{row.recentVisitDate}</td>
                  <td className="px-3 py-3 align-top text-slate-900">{row.nextAttributedProviderVisitDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
  );
}
