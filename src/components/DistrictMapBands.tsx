import fs from "fs";
import path from "path";
import type { Locale } from "@/lib/i18n/config";
import { fmtPercent } from "@/lib/format";
import DistrictMapCanvas, { type MapBlock } from "./DistrictMapCanvas";

// District map as a block choropleth (server component — reads prebuilt block
// geometry from public/data at render time). Each block is a filled polygon in
// an ORANGE GRADATION by rank (darkest = highest-performing block, lightest =
// lowest), with white boundaries demarcating blocks and a white name label.
// Hovering a block pops a dark comment-bubble with its % score (the interactive
// rendering lives in DistrictMapCanvas, a small client layer). Geometry is
// traced from the official NIC "Block Map — District: Anugul" so the boundaries
// match the real administrative ones. (MAP_BANDS below is unchanged and still
// colours the grade gauges elsewhere.)

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

// Orange gradation by rank (0 = best = darkest → last = lightest). Shared by
// the district map fills AND the district "Performance by Blocks" bars, so the
// two always use identical shades.
export function rankOrange(i: number, n: number): string {
  const DARK = [154, 52, 18]; // #9A3412 — highest-performing
  const LIGHT = [246, 178, 107]; // #F6B26B — lowest
  const tt = n > 1 ? i / (n - 1) : 0;
  const c = DARK.map((d, k) => Math.round(d + (LIGHT[k] - d) * tt));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
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
  const orangeFor = (name: string) => rankOrange(rankOf.get(name) ?? 0, nRanked);

  // Prepare serialisable per-block props for the interactive client layer. The
  // % label uses the same fmtPercent(Math.round(...)) as the "Performance by
  // Blocks" bars, so the bubble and the bars always agree.
  const blocks: MapBlock[] = map.blocks
    .filter((b) => slugs[b.name] && scores[b.name] != null)
    .map((b) => ({
      name: b.name,
      d: b.d,
      lx: b.lx,
      ly: b.ly,
      slug: slugs[b.name],
      fill: orangeFor(b.name),
      label: fmtPercent(Math.round(scores[b.name]), locale),
    }));

  return (
    <DistrictMapCanvas
      locale={locale}
      viewBox={map.viewBox}
      blocks={blocks}
      hint={hint}
    />
  );
}
