"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";

// Block report "Schools by band" cards. Clicking a band opens the list of its
// schools, closed again with the "×" at the top right.
type S = { udise: string; name: string; cluster: string; clusterSlug?: string; score: number; band: string };
type Band = { key: string; label: string; count: number; color: string; text: string };
type Labels = { schoolsWord: string; clusterWord: string; noSchools: string; closeList: string };

export default function BandCards({
  locale, bands, schools, labels,
}: {
  locale: Locale; bands: Band[]; schools: S[]; labels: Labels;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const cur = bands.find((b) => b.key === open);
  const list = open ? schools.filter((s) => s.band === open).sort((a, z) => a.score - z.score) : [];
  return (
    <div className="mt-3">
      <div className="grid grid-cols-2 gap-2.5">
        {bands.map((b) => (
          <button
            key={b.key}
            type="button"
            onClick={() => setOpen((o) => (o === b.key ? null : b.key))}
            aria-expanded={open === b.key}
            className="rounded-xl p-3 text-left transition hover:ring-2 hover:ring-gov"
            style={{ backgroundColor: `${b.color}1F`, outline: open === b.key ? "2px solid #2D3A47" : undefined }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xl font-extrabold tabular-nums" style={{ color: b.text }}>{b.count}</span>
              <span aria-hidden className="text-xs text-gov">{open === b.key ? "▲" : "▼"}</span>
            </div>
            <div className="mt-0.5 text-xs font-semibold text-gov-ink">{b.label} · {labels.schoolsWord}</div>
          </button>
        ))}
      </div>
      {cur && (
        <div className="relative mt-3 rounded-xl border border-gov-line bg-white p-3">
          <button
            type="button"
            onClick={() => setOpen(null)}
            aria-label={labels.closeList}
            className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full border border-gov-line text-base font-bold hover:bg-gov-tint"
          >
            ×
          </button>
          <div className="pr-10 text-sm font-bold text-gov-ink">{cur.label} · {list.length} {labels.schoolsWord}</div>
          {list.length === 0 ? (
            <p className="mt-2 text-xs text-muted">{labels.noSchools}</p>
          ) : (
            <ul className="mt-2 max-h-72 divide-y divide-gov-line overflow-y-auto pr-1 text-sm">
              {list.map((s) => (
                <li key={s.udise} className="flex items-center gap-2 py-1.5">
                  <span className="min-w-0 flex-1">
                    <Link href={`/${locale}/school/${s.udise}/`} className="block truncate font-semibold text-gov underline-offset-2 hover:underline">{s.name}</Link>
                    {s.clusterSlug ? (
                      <Link href={`/${locale}/officials/cluster/${s.clusterSlug}/`} className="block truncate text-xs text-muted underline-offset-2 hover:underline">{s.cluster} {labels.clusterWord}</Link>
                    ) : (
                      <span className="block truncate text-xs text-muted">{s.cluster} {labels.clusterWord}</span>
                    )}
                  </span>
                  <span className="shrink-0 font-bold tabular-nums" style={{ color: cur.text }}>{Math.round(s.score / 10)}/10</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
