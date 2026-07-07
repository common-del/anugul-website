"use client";

import { useEffect, useState } from "react";

// Awareness film: autoplays (muted — browsers block autoplay with sound) in an
// embedded player when the site opens, with a Close control. Closing collapses
// it to a compact card; reopening is a user gesture, so it restarts unmuted.
// The choice persists for the session only.
export default function AwarenessFilm({
  videoId,
  title,
  closeLabel,
  minutes,
}: {
  videoId: string;
  title: string;
  closeLabel: string;
  minutes: string;
}) {
  const [open, setOpen] = useState<boolean | null>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    setOpen(sessionStorage.getItem("filmClosed") !== "1");
  }, []);

  const close = () => {
    setOpen(false);
    sessionStorage.setItem("filmClosed", "1");
  };
  const reopen = () => {
    setMuted(false); // user gesture — sound allowed
    setOpen(true);
    sessionStorage.removeItem("filmClosed");
  };

  // Until mounted, render the closed card (no autoplay flash on SSR).
  if (open === null || !open) {
    return (
      <button
        type="button"
        onClick={reopen}
        className="relative flex min-h-[120px] w-full items-center justify-center overflow-hidden rounded-2xl bg-[#2b2c30] shadow-sm"
      >
        <span className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#0E5A40" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          <span className="text-lg font-bold tracking-wide text-white">{title}</span>
        </span>
        <span className="absolute bottom-3 right-3 rounded-full bg-black/45 px-3 py-1 text-xs font-semibold text-white">
          {minutes}
        </span>
      </button>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-black shadow-sm">
      <div className="flex items-center justify-between gap-3 bg-[#2b2c30] px-4 py-2">
        <span className="text-sm font-bold text-white">{title}</span>
        <button
          type="button"
          onClick={close}
          className="flex min-h-[36px] items-center gap-1.5 rounded-full bg-white/15 px-3 text-sm font-bold text-white hover:bg-white/25"
        >
          {closeLabel} <span aria-hidden>×</span>
        </button>
      </div>
      <div className="aspect-video w-full">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${muted ? 1 : 0}&playsinline=1&rel=0`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="h-full w-full border-0"
        />
      </div>
    </div>
  );
}
