"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";

// One block, prepared server-side (geometry + rank-orange fill + preformatted
// % label). Kept serialisable so the server component can hand it across the
// client boundary.
export type MapBlock = {
  name: string;
  d: string;
  lx: number;
  ly: number;
  slug: string;
  fill: string;
  label: string; // e.g. "72%" (Odia digits in od)
};

// Interactive layer for the district choropleth. Same visuals as before, plus a
// dark angular comment-bubble that shows the hovered block's % score — the SVG
// twin of the "schools by band" tooltip. The bubble is rendered once, as the
// LAST child of the <svg>, so it always paints above neighbouring blocks
// (SVG has no z-index; paint order = document order).
export default function DistrictMapCanvas({
  locale,
  viewBox,
  blocks,
  hint,
}: {
  locale: Locale;
  viewBox: string;
  blocks: MapBlock[];
  hint: string;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const active = blocks.find((b) => b.name === hovered) ?? null;
  return (
    <div>
      <svg
        viewBox={viewBox}
        className="mx-auto block w-full max-w-[360px]"
        role="group"
        aria-label={hint}
      >
        {blocks.map((b) => (
          <Link
            key={b.name}
            href={`/${locale}/gov/${b.slug}/`}
            aria-label={`${b.name} — ${b.label}`}
          >
            <g
              className="cursor-pointer transition duration-150 hover:brightness-90"
              onMouseEnter={() => setHovered(b.name)}
              onMouseLeave={() => setHovered((h) => (h === b.name ? null : h))}
              onFocus={() => setHovered(b.name)}
              onBlur={() => setHovered((h) => (h === b.name ? null : h))}
            >
              <path
                d={b.d}
                fill={b.fill}
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
        ))}

        {active && <ScoreBubble block={active} />}
      </svg>
      <p className="mt-2 text-center text-sm text-muted">{hint}</p>
    </div>
  );
}

// Dark comment-bubble (rounded rect + downward tail) centred above the block's
// label point. All sizes are in the map's ~100-unit user space (viewBox
// 0 0 100 101.7), so they scale with the rendered map.
function ScoreBubble({ block }: { block: MapBlock }) {
  const { lx, ly, label } = block;
  const FS = 5; // % text — larger than the 2.9 block name so it reads as the value
  const padX = 2.6;
  const padY = 1.7;
  const w = Math.max(12, label.length * FS * 0.62 + padX * 2);
  const h = FS + padY * 2;
  const tailW = 2.6;
  const tailH = 1.9;
  const gap = 1.4; // clearance between the tail tip and the block label

  const tipY = ly - gap; // tail points just above the block name
  const bubbleBottom = tipY - tailH;
  const bubbleTop = bubbleBottom - h;
  // Keep the bubble inside the map; the tail stays anchored under the block.
  const x = Math.min(Math.max(lx - w / 2, 1), 99 - w);
  const textX = x + w / 2;
  const cx = Math.min(Math.max(lx, x + tailW), x + w - tailW);

  return (
    <g
      className="pointer-events-none"
      style={{ filter: "drop-shadow(0 0.5px 1px rgba(0,0,0,0.4))" }}
    >
      <rect x={x} y={bubbleTop} width={w} height={h} rx={1.5} fill="#2D3A47" />
      <path
        d={`M${cx - tailW / 2} ${bubbleBottom} L${cx + tailW / 2} ${bubbleBottom} L${cx} ${bubbleBottom + tailH} Z`}
        fill="#2D3A47"
      />
      <text
        x={textX}
        y={bubbleTop + h / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={FS}
        fill="#fff"
        style={{ fontWeight: 800 }}
      >
        {label}
      </text>
    </g>
  );
}
