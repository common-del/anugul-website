"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";

// "Block Reports" card on the /gov landing. A plain button + React state
// (replaces a native <details> disclosure that a user reported broken):
// clicking the card reveals the 8-block chooser and scrolls it into view, so
// the response to the click is always visible.
export default function BlockReportsCard({
  locale,
  blocks,
  labels,
}: {
  locale: Locale;
  blocks: { name: string; slug: string }[];
  labels: { title: string; desc: string; choose: string };
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  return (
    <div className="gov-card-link overflow-hidden">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => {
          setOpen((x) => {
            const next = !x;
            if (next)
              setTimeout(
                () => panelRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }),
                0,
              );
            return next;
          });
        }}
        className="flex w-full cursor-pointer flex-col items-center gap-3 p-6 text-center"
      >
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gov-tint text-gov">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <path d="M8 13h8M8 17h5" />
          </svg>
        </span>
        <span className="text-lg font-extrabold text-gov-ink">{labels.title}</span>
        <span className="text-sm text-muted">{labels.desc}</span>
        <span
          aria-hidden
          className={`mt-auto grid h-9 w-9 place-items-center rounded-full bg-gov text-white transition-transform ${open ? "rotate-90" : ""}`}
        >
          →
        </span>
      </button>
      {open && (
        <div ref={panelRef} className="border-t border-gov-line bg-gov-tint/60 p-3">
          <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            {labels.choose}
          </p>
          <ul className="grid grid-cols-2 gap-1.5">
            {blocks.map((b) => (
              <li key={b.slug}>
                <Link
                  href={`/${locale}/gov/${b.slug}/`}
                  className="block rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gov-dark ring-1 ring-gov-line transition hover:bg-gov hover:text-white"
                >
                  {b.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
