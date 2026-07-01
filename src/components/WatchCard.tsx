"use client";

import { useState } from "react";

// The video is loaded only when the user taps play — nothing external is
// requested on page load, keeping the page light on weak connections.
export default function WatchCard({
  kicker,
  title,
  cta,
  minutes,
  videoId,
}: {
  kicker: string;
  title: string;
  cta: string;
  minutes: string;
  videoId: string;
}) {
  const [play, setPlay] = useState(false);
  return (
    <section className="px-5 py-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent-dark">
        {kicker}
      </p>
      <h2 className="mt-1 text-lg font-bold text-brand-ink">{title}</h2>
      <div className="mt-3 aspect-video overflow-hidden rounded-2xl bg-brand-dark">
        {play ? (
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title={title}
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : (
          <button
            onClick={() => setPlay(true)}
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-white"
            aria-label={cta}
          >
            <span className="grid h-14 w-14 place-items-center rounded-full bg-white/20 ring-2 ring-white/60">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <span className="text-sm font-semibold">
              {cta} · {minutes}
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
