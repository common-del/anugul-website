"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BLOCK_SHAPES } from "@/lib/blockShapes";

type Item = { u: string; n: string; b: string; c: string };
type Block = { name: string; x: number; y: number; schools: number };

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
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [q, setQ] = useState("");
  const [block, setBlock] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/search-index.json")
      .then((r) => r.json())
      .then(setIndex)
      .catch(() => {});
    fetch("/data/blocks.json")
      .then((r) => r.json())
      .then(setBlocks)
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

  return (
    <div>
      <input
        type="search"
        inputMode="search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setBlock(null);
        }}
        placeholder={labels.searchPlaceholder}
        aria-label={labels.searchPlaceholder}
        className="w-full rounded-xl border border-brand-line bg-white px-4 py-3 text-base text-brand-ink outline-none focus:border-brand"
      />

      {browsing && blocks.length > 0 && (
        <div className="mt-5">
          <p className="text-sm font-bold text-brand-ink">{labels.browseTitle}</p>
          <svg
            viewBox="0 0 95 92"
            className="mt-2 w-full"
            role="group"
            aria-label={labels.browseTitle}
          >
            {BLOCK_SHAPES.map((b) => (
              <g
                key={b.name}
                className="group cursor-pointer"
                onClick={() => setBlock(b.name)}
              >
                <polygon
                  points={b.points}
                  strokeWidth="0.7"
                  className="fill-brand-tint stroke-white transition-colors group-hover:fill-brand"
                />
                <text
                  x={b.lx}
                  y={b.ly}
                  textAnchor="middle"
                  fontSize="3"
                  className="pointer-events-none fill-brand-ink group-hover:fill-white"
                >
                  {b.name}
                </text>
              </g>
            ))}
          </svg>
          <div className="mt-3 flex flex-wrap gap-2">
            {blocks.map((bl) => (
              <button
                key={bl.name}
                type="button"
                onClick={() => setBlock(bl.name)}
                className="min-h-[44px] rounded-full bg-white px-4 text-sm font-semibold text-brand ring-1 ring-brand-line"
              >
                {bl.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {block && !q && (
        <div className="mt-5 flex items-center justify-between">
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

      {(q || block) && (
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
      )}
    </div>
  );
}
