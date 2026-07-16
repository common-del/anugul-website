import fs from "fs";
import path from "path";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";

// District map as a block choropleth (server component — reads prebuilt block
// geometry from public/data at render time). Each block is a filled polygon
// coloured by its score band, with white boundaries demarcating one block from
// the next and a name label. Geometry is traced from the official NIC "Block
// Map — District: Anugul" so the boundaries match the real administrative ones.
// Legend bands per the mock: dark green 75%+, orange 60–74, amber 45–59, red <45.

type Block = { name: string; d: string; lx: number; ly: number };
type DistrictMap = { viewBox: string; blocks: Block[] };

export const MAP_BANDS = [
  { min: 75, color: "#15803D" }, // best → green
  { min: 60, color: "#DD6B20" }, // developing → orange
  { min: 45, color: "#E5A24F" }, // needs → yellow
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
                  fill={mapBandColor(score)}
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
                  stroke="#fff"
                  strokeWidth="0.85"
                  paintOrder="stroke"
                  strokeLinejoin="round"
                  className="pointer-events-none fill-gov-ink"
                  style={{ fontWeight: 700 }}
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
