"use client";

import { useState } from "react";

// Report-card image with an enlarge control (expand icon, bottom-left) that
// opens the full card in a full-screen, scrollable overlay so parents can read
// the whole thing. Escape / backdrop / Close button dismiss it.
export default function CardLightbox({
  src,
  alt,
  enlargeLabel,
  closeLabel,
}: {
  src: string;
  alt: string;
  enlargeLabel: string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="w-full rounded-lg border border-gov-line shadow-sm"
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={enlargeLabel}
          className="absolute bottom-2 left-2 grid h-10 w-10 place-items-center rounded-lg bg-white/90 text-gov shadow ring-1 ring-gov-line transition hover:bg-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M8 21H5a2 2 0 0 1-2-2v-3m18 0v3a2 2 0 0 1-2 2h-3" />
          </svg>
        </button>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={enlargeLabel}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex flex-col bg-black/80 p-4"
        >
          <div className="mb-2 flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex min-h-[40px] items-center gap-1.5 rounded-full bg-white px-4 text-sm font-bold text-gov-ink shadow hover:bg-gov-tint"
            >
              {closeLabel} <span aria-hidden>×</span>
            </button>
          </div>
          <div
            className="min-h-0 flex-1 overflow-auto rounded-lg bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} className="mx-auto w-full max-w-3xl" />
          </div>
        </div>
      )}
    </>
  );
}
