"use client";

import { useState } from "react";

// Awareness film (mock-up correction): click-to-play, NOT autoplay. Shows a
// static poster (a still from the film) with a centred play button and a heavy
// outline; a title bar reads "Awareness Film" with a one-line descriptor. The
// panel is core content — it cannot be closed, hidden, or collapsed.
export default function AwarenessFilm({
  videoId,
  title,
  desc,
  minutes,
}: {
  videoId: string;
  title: string;
  desc: string;
  minutes: string;
}) {
  const [play, setPlay] = useState(false);

  return (
    <section className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-card">
      <div className="border-b border-gov-line bg-gov-tint px-4 py-2.5">
        <h2 className="text-base font-bold text-gov-ink">{title}</h2>
        <p className="mt-0.5 text-xs text-muted">{desc}</p>
      </div>
      {play ? (
        <div className="aspect-video w-full bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPlay(true)}
          aria-label={title}
          className="group relative block aspect-video w-full bg-black"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover opacity-95 transition group-hover:opacity-100"
          />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-white/95 shadow-lg transition group-hover:scale-105">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#E56A4F" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
          <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white">
            {minutes}
          </span>
        </button>
      )}
    </section>
  );
}
