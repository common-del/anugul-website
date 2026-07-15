"use client";

import { useState } from "react";

// "Subjects vs District" table with a Grade 5 / Grade 8 toggle. Each row shows
// Subject | Block (with a small inline bar) | District | Diff. The Diff is
// coloured (green above district, red below) but all three numbers stay
// visible, so colour is reinforcement only. Strings arrive pre-localised.
export type SubjectRow = {
  subject: string; // localised label
  block: number;
  district: number;
  blockD: string; // localised display strings
  districtD: string;
  diffD: string;
  diff: number;
};

export default function SubjectsVsDistrict({
  grades, // localised grade label -> rows
  cols,
}: {
  grades: Record<string, SubjectRow[]>;
  cols: { subject: string; block: string; district: string; diff: string };
}) {
  const names = Object.keys(grades);
  const [active, setActive] = useState(names[0] ?? "");
  const rows = grades[active] ?? [];
  const max = Math.max(100, ...rows.map((r) => r.block));

  return (
    <div>
      <div className="flex gap-1.5">
        {names.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setActive(g)}
            aria-pressed={g === active}
            className={`min-h-[38px] rounded-full px-4 text-sm font-bold ring-1 transition ${
              g === active
                ? "bg-gov text-white ring-gov"
                : "bg-white text-gov-dark ring-gov-line hover:bg-gov-tint"
            }`}
          >
            {g}
          </button>
        ))}
      </div>
      <table className="mt-3 w-full text-sm">
        <thead>
          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted">
            <th className="pb-1.5 font-semibold">{cols.subject}</th>
            <th className="pb-1.5 font-semibold">{cols.block}</th>
            <th className="pb-1.5 text-right font-semibold">{cols.district}</th>
            <th className="pb-1.5 pl-3 text-right font-semibold">{cols.diff}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.subject} className="border-t border-gov-line">
              <td className="py-2 pr-2 font-semibold text-gov-ink">{r.subject}</td>
              <td className="py-2 pr-2">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-24 overflow-hidden rounded bg-gov-tint sm:w-28">
                    <span
                      className="block h-full rounded bg-gov"
                      style={{ width: `${(r.block / max) * 100}%` }}
                    />
                  </span>
                  <span className="font-bold tabular-nums text-gov-ink">{r.blockD}</span>
                </div>
              </td>
              <td className="py-2 text-right tabular-nums text-muted">{r.districtD}</td>
              <td
                className="py-2 pl-3 text-right font-bold tabular-nums"
                style={{ color: r.diff < 0 ? "#C24E36" : "#2D3A47" }}
              >
                {r.diffD}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
