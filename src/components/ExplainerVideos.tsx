"use client";

import { useState } from "react";
import VideoEmbed from "./VideoEmbed";
import type { Locale } from "@/lib/i18n/config";
import { blockName } from "@/lib/placeNames";

// The "How to read your report card" explainer differs by block — 4 films
// across the 8 blocks (owner). Anugola, Athamalik and Talachera have their
// own; every other block shares the default film.
const BLOCK_VIDEO: Record<string, string> = {
  Anugola: "gn9tbf-tLkA",
  Athamalik: "r04dfh8Gq94",
  Talachera: "lq_Z0Ikqlag",
};
const DEFAULT_VIDEO = "OcBdapIlGHM";

export default function ExplainerVideos({
  blocks,
  chooseLabel,
  title,
  locale,
}: {
  blocks: string[];
  chooseLabel: string;
  title: string;
  locale: Locale;
}) {
  const [block, setBlock] = useState(blocks[0] ?? "");
  const videoId = BLOCK_VIDEO[block] ?? DEFAULT_VIDEO;
  return (
    <figure>
      <label className="mb-2 block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
          {chooseLabel}
        </span>
        <select
          value={block}
          onChange={(e) => setBlock(e.target.value)}
          className="min-h-[40px] w-full rounded-lg border border-gov-line bg-white px-3 text-sm font-semibold text-gov-ink"
        >
          {blocks.map((b) => (
            <option key={b} value={b}>
              {blockName(b, locale)}
            </option>
          ))}
        </select>
      </label>
      {/* key re-mounts the facade so a playing video resets when the block changes */}
      <VideoEmbed key={videoId} videoId={videoId} title={title} />
      <figcaption className="mt-1.5 text-sm font-semibold text-gov-ink">
        {title}
      </figcaption>
    </figure>
  );
}
