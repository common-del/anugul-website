"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";

type Marker = { name: string; x: number; y: number };
type DistrictMap = { viewBox: string; path: string; blocks: Marker[] };

// Select Block / District (docx mock): interactive Angul map + dropdown whose
// first option is "District / All Blocks". Picking a block opens its report.
export default function GovBlockPicker({
  locale,
  slugs,
  labels,
}: {
  locale: Locale;
  slugs: Record<string, string>; // block name -> slug
  labels: { allBlocks: string; hint: string };
}) {
  const router = useRouter();
  const [map, setMap] = useState<DistrictMap | null>(null);

  useEffect(() => {
    fetch("/data/district-map.json")
      .then((r) => r.json())
      .then(setMap)
      .catch(() => {});
  }, []);

  const go = (name: string) => {
    const slug = slugs[name];
    if (slug) router.push(`/${locale}/gov/${slug}/`);
  };

  const names = Object.keys(slugs).sort();

  return (
    <div className="md:grid md:grid-cols-[minmax(0,360px),1fr] md:items-start md:gap-8">
      <div>
        {map && (
          <svg
            viewBox={map.viewBox}
            className="mx-auto block w-full max-w-[320px] md:mx-0"
            role="group"
            aria-label={labels.hint}
          >
            <path
              d={map.path}
              className="fill-gov-tint stroke-gov"
              strokeWidth="0.5"
              strokeLinejoin="round"
            />
            {map.blocks.map((b) => (
              <g
                key={b.name}
                className="group cursor-pointer focus:outline-none"
                onClick={() => go(b.name)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    go(b.name);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={b.name}
              >
                <circle cx={b.x} cy={b.y} r="6" fill="transparent" />
                <circle cx={b.x} cy={b.y} r="1.8" className="fill-gov group-hover:fill-accent" />
                <text
                  x={b.x}
                  y={b.y - 2.6}
                  textAnchor="middle"
                  fontSize="3"
                  className="pointer-events-none fill-gov-ink group-hover:fill-gov"
                  style={{ fontWeight: 700 }}
                >
                  {b.name}
                </text>
              </g>
            ))}
          </svg>
        )}
        <p className="mt-2 text-center text-sm text-muted md:text-left">{labels.hint}</p>
      </div>

      <div className="mt-4 md:mt-0">
        <select
          defaultValue=""
          onChange={(e) => e.target.value && go(e.target.value)}
          className="min-h-[48px] w-full rounded-xl border border-gov-line bg-white px-3 text-[15px] font-semibold text-gov-ink shadow-sm"
        >
          <option value="">{labels.allBlocks}</option>
          {names.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <div className="mt-3 flex flex-wrap gap-2">
          {names.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => go(n)}
              className="min-h-[44px] rounded-full bg-white px-4 text-sm font-semibold text-gov ring-1 ring-gov-line shadow-sm transition-shadow hover:bg-gov-tint hover:shadow"
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
