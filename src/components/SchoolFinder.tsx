"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Item = { u: string; n: string; b: string; c: string };
type Marker = { name: string; x: number; y: number };
type DistrictMap = { viewBox: string; path: string; blocks: Marker[] };

type Labels = {
  searchPlaceholder: string;
  browseTitle: string;
  changeBlock: string;
  noResults: string;
};

export default function SchoolFinder({
  locale,
  labels,
}: {
  locale: string;
  labels: Labels;
}) {
  const [index, setIndex] = useState<Item[]>([]);
  const [map, setMap] = useState<DistrictMap | null>(null);
  const [q, setQ] = useState("");
  const [block, setBlockState] = useState<string | null>(null);

  // Block selection lives in the URL (?block=) so deep links work and the
  // /demo frames stay on the same view.
  const setBlock = (name: string | null) => {
    setBlockState(name);
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
    fetch("/data/district-map.json")
      .then((r) => r.json())
      .then(setMap)
      .catch(() => {});
  }, []);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (query) {
      return index
        .filter((s) => s.n.toLowerCase().includes(query) || s.u.includes(query))
        .slice(0, 40);
    }
    if (block) {
      return index
        .filter((s) => s.b === block)
        .sort((a, b) => a.n.localeCompare(b.n));
    }
    return [];
  }, [q, block, index]);

  const browsing = !q && !block;
  const blockNames = map ? map.blocks.map((b) => b.name).sort() : [];

  const resultsList = (q || block) && (
    <ul className="mt-3 divide-y divide-brand-line overflow-hidden rounded-xl border border-brand-line bg-white">
      {results.map((s) => (
        <li key={s.u}>
          <Link
            href={`/${locale}/school/${s.u}/`}
            className="flex min-h-[56px] flex-col justify-center px-4 py-3 active:bg-brand-tint"
          >
            <span className="font-semibold text-brand-ink">{s.n}</span>
            <span className="text-xs text-muted">
              {s.b} · {s.c}
            </span>
          </Link>
        </li>
      ))}
      {results.length === 0 && (
        <li className="px-4 py-4 text-sm text-muted">{labels.noResults}</li>
      )}
    </ul>
  );

  return (
    <div>
      <input
        type="search"
        inputMode="search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          if (block) setBlock(null);
        }}
        placeholder={labels.searchPlaceholder}
        aria-label={labels.searchPlaceholder}
        className="w-full rounded-xl border border-brand-line bg-white px-4 py-3 text-base text-brand-ink outline-none focus:border-brand md:max-w-xl"
      />

      {browsing && map && (
        <div className="mt-5 md:grid md:grid-cols-[minmax(0,340px),1fr] md:items-start md:gap-8">
          <div>
            <p className="text-sm font-bold text-brand-ink">
              {labels.browseTitle}
            </p>
            <svg
              viewBox={map.viewBox}
              className="mx-auto mt-2 block w-full max-w-[300px] md:mx-0"
              role="group"
              aria-label={labels.browseTitle}
            >
              <path
                d={map.path}
                className="fill-brand-tint stroke-brand"
                strokeWidth="0.5"
                strokeLinejoin="round"
              />
              {map.blocks.map((b) => (
                <g
                  key={b.name}
                  className="group cursor-pointer"
                  onClick={() => setBlock(b.name)}
                >
                  <circle cx={b.x} cy={b.y} r="6" fill="transparent" />
                  <circle
                    cx={b.x}
                    cy={b.y}
                    r="1.7"
                    className="fill-brand group-hover:fill-accent"
                  />
                  <text
                    x={b.x}
                    y={b.y - 2.6}
                    textAnchor="middle"
                    fontSize="3"
                    className="pointer-events-none fill-brand-ink group-hover:fill-brand"
                    style={{ fontWeight: 600 }}
                  >
                    {b.name}
                  </text>
                </g>
              ))}
            </svg>
          </div>
          <div className="mt-3 flex flex-wrap content-start gap-2 md:mt-7">
            {blockNames.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setBlock(name)}
                className="min-h-[44px] rounded-full bg-white px-4 text-sm font-semibold text-brand ring-1 ring-brand-line"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {block && !q && (
        <div className="mt-5 flex items-center justify-between md:max-w-2xl">
          <p className="text-lg font-bold text-brand-ink">{block}</p>
          <button
            type="button"
            onClick={() => setBlock(null)}
            className="text-sm font-semibold text-brand underline underline-offset-2"
          >
            {labels.changeBlock}
          </button>
        </div>
      )}

      <div className="md:max-w-2xl">{resultsList}</div>
    </div>
  );
}
