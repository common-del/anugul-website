"use client";

import { useState } from "react";

// Click-to-play YouTube facade: shows the thumbnail with a play button, and
// only loads the (heavy) YouTube iframe when the parent taps — keeps the report
// card light on slow connections. Plays with sound (it's a user gesture).
export default function VideoEmbed({
  videoId,
  title,
}: {
  videoId: string;
  title: string;
}) {
  const [play, setPlay] = useState(false);

  if (play) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="h-full w-full border-0"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlay(true)}
      aria-label={title}
      className="group relative block aspect-video w-full overflow-hidden rounded-xl bg-black"
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
          <svg width="26" height="26" viewBox="0 0 24 24" fill="#0E5A40" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
    </button>
  );
}
