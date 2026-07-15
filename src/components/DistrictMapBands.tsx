import fs from "fs";
import path from "path";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";

// District map with block markers coloured by score band (server component —
// reads the prebuilt map geometry from public/data at render time). Legend
// bands per the mock: dark green 75%+, green 60–74, amber 45–59, red <45.
// Every marker keeps its name label and the score is shown in the legend
// table, so colour is reinforcement, not the sole signal.

type Marker = { name: string; x: number; y: number };
type DistrictMap = { viewBox: string; path: string; blocks: Marker[] };

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
        className="mx-auto block w-full max-w-[340px]"
        role="group"
        aria-label={hint}
      >
        <path
          d={map.path}
          className="fill-gov-tint stroke-gov"
          strokeWidth="0.5"
          strokeLinejoin="round"
        />
        {map.blocks.map((b) => {
          const slug = slugs[b.name];
          const score = scores[b.name];
          if (!slug || score == null) return null;
          return (
            <Link key={b.name} href={`/${locale}/gov/${slug}/`} aria-label={b.name}>
              <g className="cursor-pointer">
                <circle cx={b.x} cy={b.y} r="6" fill="transparent" />
                <circle cx={b.x} cy={b.y} r="2" fill={mapBandColor(score)} stroke="#fff" strokeWidth="0.4" />
                <text
                  x={b.x}
                  y={b.y - 2.8}
                  textAnchor="middle"
                  fontSize="3"
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
