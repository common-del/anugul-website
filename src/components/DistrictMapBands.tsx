import fs from "fs";
import path from "path";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";

// District map as a block choropleth (server component — reads prebuilt block
// geometry from public/data at render time). Each block is a filled polygon in
// an ORANGE GRADATION by rank (darkest = highest-performing block, lightest =
// lowest), with white boundaries demarcating blocks and a white name label.
// Geometry is traced from the official NIC "Block Map — District: Anugul" so the
// boundaries match the real administrative ones. (MAP_BANDS below is unchanged
// and still colours the grade gauges elsewhere.)

type Block = { name: string; d: string; lx: number; ly: number };
type DistrictMap = { viewBox: string; blocks: Block[] };

export const MAP_BANDS = [
  { min: 75, color: "#15803D" }, // best → green
  { min: 60, color: "#F2B01E" }, // developing → gold
  { min: 45, color: "#DD6B20" }, // needs → orange
  { min: 0, color: "#C24E36" }, // critical → red
];

export function mapBandColor(score: number): string {
  return (MAP_BANDS.find((b) => score >= b.min) ?? MAP_BANDS[3]).color;
}

let mapCache: DistrictMap | null = null;
function getMap(): DistrictMap {
  if (!mapCache) {
    const p = path.join(process.cwd(), "public", "data", "district-map.json");
    mapCache = JSON.parse(fs.readFileSync(p, "utf-8"));
  }
  return mapCache as DistrictMap;
}

export default function DistrictMapBands({
  locale,
  scores, // block name -> average
  slugs, // block name -> slug
  hint,
}: {
  locale: Locale;
  scores: Record<string, number>;
  slugs: Record<string, string>;
  hint: string;
}) {
  const map = getMap();
  // Orange gradation by rank: darkest = highest-performing block, lightest =
  // lowest. (Owner 2026-07-16 — replaces the score-band fill on the map.)
  const ranked = map.blocks
    .filter((b) => slugs[b.name] && scores[b.name] != null)
    .map((b) => b.name)
    .sort((a, z) => scores[z] - scores[a]);
  const nRanked = ranked.length;
  const rankOf = new Map(ranked.map((name, i) => [name, i] as const));
  const DARK = [154, 52, 18]; // #9A3412 — highest
  const LIGHT = [246, 178, 107]; // #F6B26B — lowest
  const orangeFor = (name: string) => {
    const i = rankOf.get(name) ?? 0;
    const tt = nRanked > 1 ? i / (nRanked - 1) : 0;
    const c = DARK.map((d, k) => Math.round(d + (LIGHT[k] - d) * tt));
    return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
  };
  return (
    <div>
      <svg
        viewBox={map.viewBox}
        className="mx-auto block w-full max-w-[360px]"
        role="group"
        aria-label={hint}
      >
        {map.blocks.map((b) => {
          const slug = slugs[b.name];
          const score = scores[b.name];
          if (!slug || score == null) return null;
          return (
            <Link
              key={b.name}
              href={`/${locale}/gov/${slug}/`}
              aria-label={b.name}
            >
              <g className="cursor-pointer transition duration-150 hover:brightness-90">
                <path
                  d={b.d}
                  fill={orangeFor(b.name)}
                  stroke="#fff"
                  strokeWidth="0.7"
                  strokeLinejoin="round"
                />
                <text
                  x={b.lx}
                  y={b.ly}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="2.9"
                  fill="#fff"
                  className="pointer-events-none"
                  style={{ fontWeight: 700, textShadow: "0 1px 2px rgba(0,0,0,0.45)" }}
                >
                  {b.name}
                </text>
              </g>
            </Link>
          );
        })}
      </svg>
      <p className="mt-2 text-center text-sm text-muted">{hint}</p>
    </div>
  );
}
