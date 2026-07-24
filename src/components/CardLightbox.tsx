"use client";

import { useState } from "react";

// Report-card preview + lightbox. The preview is a TEASER: capped at a fixed
// height for every school regardless of page count; anything taller is
// cropped with a white fade at the bottom edge and a "Page 1 of N" badge.
// The enlarge control opens the full, uncropped document (all pages) in a
// full-screen scrollable overlay. Page count is derived from the stacked
// image's aspect ratio (one A4 page ≈ 1.414 h/w), so it needs no extra data.
const CAP_PX = 384; // preview height cap (= Tailwind max-h-96)
const A4_RATIO = 1.414;

export default function CardLightbox({
  src,
  alt,
  enlargeLabel,
  closeLabel,
  pageLabel, // e.g. "Page 1 of {n}"
  digits, // optional localised digit set, e.g. "୦୧୨୩୪୫୬୭୮୯"
}: {
  src: string;
  alt: string;
  enlargeLabel: string;
  closeLabel: string;
  pageLabel: string;
  digits?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pages, setPages] = useState(1);
  const [cropped, setCropped] = useState(false);

  // Runs from BOTH onLoad and the ref callback: a cached image can be
  // complete before hydration attaches onLoad, which would otherwise leave
  // the crop fade and page badge unset.
  const measure = (img: HTMLImageElement | null) => {
    if (!img || !img.complete || !img.naturalWidth) return;
    const ratio = img.naturalHeight / img.naturalWidth;
    setPages(Math.max(1, Math.round(ratio / A4_RATIO)));
    const w = img.offsetWidth || img.parentElement?.offsetWidth || 0;
    setCropped(w * ratio > CAP_PX + 1);
  };

  const local = (n: number) =>
    String(n)
      .split("")
      .map((d) => (digits ? digits[Number(d)] ?? d : d))
      .join("");

  return (
    <>
      <div
        className="relative overflow-hidden rounded-lg border border-gov-line shadow-sm"
        style={{ maxHeight: CAP_PX }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          ref={measure}
          onLoad={(e) => measure(e.currentTarget)}
          className="w-full"
        />
        {cropped && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent"
          />
        )}
        {pages > 1 && (
          <span className="absolute bottom-2 right-2 rounded-full bg-gov-ink/85 px-2.5 py-1 text-[11px] font-bold text-white">
            {pageLabel.replace("{n}", local(pages))}
          </span>
        )}
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
