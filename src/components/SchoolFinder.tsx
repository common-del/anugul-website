"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fmtNum } from "@/lib/format";
import { BAND_TEXT, type BandKey } from "@/lib/bands";
import type { Locale } from "@/lib/i18n/config";

type Item = { u: string; n: string; b: string; c: string; s10: number; band: BandKey };

type Labels = {
  searchPlaceholder: string;
  filtersLabel: string;
  blockLabel: string;
  clusterLabel: string;
  allOption: string;
  schoolsFound: string;
  openReport: string;
  overallScore: string;
  noResults: string;
};

// v2 finder (docx mock): search + Block/Cluster dropdowns (no District — all
// Angul), result cards with the /10 score. Block choice stays in ?block=.
export default function SchoolFinder({
  locale,
  labels,
}: {
  locale: Locale;
  labels: Labels;
}) {
  const [index, setIndex] = useState<Item[]>([]);
  const [q, setQ] = useState("");
  const [block, setBlockState] = useState("");
  const [cluster, setCluster] = useState("");

  const setBlock = (name: string) => {
    setBlockState(name);
    setCluster("");
    const url = new URL(window.location.href);
    if (name) url.searchParams.set("block", name);
    else url.searchParams.delete("block");
    window.history.replaceState(null, "", url);
  };

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("block");
    if (initial) setBlockState(initial);
    fetch("/data/search-index.json")
      .then((r) => r.json())
      .then(setIndex)
      .catch(() => {});
  }, []);

  const blocks = useMemo(
    () => [...new Set(index.map((s) => s.b))].sort(),
    [index],
  );
  const clusters = useMemo(
    () =>
      [...new Set(index.filter((s) => !block || s.b === block).map((s) => s.c))].sort(),
    [index, block],
  );

  const active = q.trim() !== "" || block !== "" || cluster !== "";
  const matches = useMemo(() => {
    if (!active) return [];
    const query = q.trim().toLowerCase();
    return index
      .filter(
        (s) =>
          (!query || s.n.toLowerCase().includes(query) || s.u.includes(query)) &&
          (!block || s.b === block) &&
          (!cluster || s.c === cluster),
      )
      .sort((a, z) => a.n.localeCompare(z.n));
  }, [index, q, block, cluster, active]);
  const results = matches.slice(0, 60);

  const selectCls =
    "min-h-[46px] flex-1 rounded-xl border border-gov-line bg-white px-3 text-[15px] font-semibold text-gov-ink";

  return (
    <div className="md:max-w-2xl">
      <div className="flex items-center gap-2 rounded-xl border border-gov-line bg-white px-4 focus-within:border-gov">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
          className="shrink-0 text-muted"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          type="search"
          inputMode="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={labels.searchPlaceholder}
          aria-label={labels.searchPlaceholder}
          className="min-h-[50px] w-full bg-transparent text-base text-gov-ink outline-none"
        />
      </div>

      <p className="mt-4 text-sm font-bold text-gov-ink">{labels.filtersLabel}</p>
      <div className="mt-2 flex gap-3">
        <label className="flex flex-1 flex-col gap-1 text-xs font-semibold text-muted">
          {labels.blockLabel}
          <select
            value={block}
            onChange={(e) => setBlock(e.target.value)}
            className={selectCls}
          >
            <option value="">{labels.allOption}</option>
            {blocks.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-1 flex-col gap-1 text-xs font-semibold text-muted">
          {labels.clusterLabel}
          <select
            value={cluster}
            onChange={(e) => setCluster(e.target.value)}
            className={selectCls}
          >
            <option value="">{labels.allOption}</option>
            {clusters.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>

      {active && (
        <>
          <p className="mt-5 text-sm font-bold text-gov-ink">
            {labels.schoolsFound.replace("{n}", fmtNum(matches.length, locale))}
          </p>
          <ul className="mt-2 space-y-2.5">
            {results.map((s) => (
              <li key={s.u}>
                <Link
                  href={`/${locale}/school/${s.u}/`}
                  className="block rounded-xl border border-gov-line bg-white p-4 active:bg-gov-tint"
                >
                  <span className="font-bold text-gov-ink">{s.n}</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    UDISE: {s.u} · {s.b} · {s.c}
                  </span>
                  <span className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-muted">
                      {labels.overallScore}{" "}
                      <span
                        className="text-lg font-extrabold tabular-nums"
                        style={{ color: BAND_TEXT[s.band] }}
                      >
                        {fmtNum(s.s10, locale)}
                      </span>
                      <span className="font-semibold">/{fmtNum(10, locale)}</span>
                    </span>
                    <span className="rounded-lg bg-gov px-4 py-2 text-sm font-bold text-white">
                      {labels.openReport}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
            {results.length === 0 && (
              <li className="rounded-xl border border-gov-line bg-white px-4 py-4 text-sm text-muted">
                {labels.noResults}
              </li>
            )}
          </ul>
        </>
      )}
    </div>
  );
}
