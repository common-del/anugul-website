"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";

// Custom block picker for the Block Report heading — a compact pill
// ("Change block: <name> ⌄") that opens a styled dropdown of blocks and
// navigates on pick. Deliberately NOT a native <select> so the styling
// matches the mock.
export default function BlockPicker({
  locale,
  current, // current block name
  slugs, // name -> slug
  label, // "Change block"
}: {
  locale: Locale;
  current: string;
  slugs: Record<string, string>;
  label: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const names = Object.keys(slugs).sort();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((x) => !x)}
        className="flex min-h-[44px] items-center gap-2 rounded-xl border border-gov-line bg-white px-4 text-sm font-semibold text-gov-ink shadow-sm transition hover:bg-gov-tint"
      >
        <span className="truncate">
          {label}: <span className="font-bold">{current}</span>
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className={`shrink-0 text-gov transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute left-0 z-30 mt-1 max-h-72 w-56 overflow-auto rounded-xl border border-gov-line bg-white py-1 shadow-lift"
        >
          {names.map((n) => {
            const sel = n === current;
            return (
              <li key={n}>
                <button
                  type="button"
                  role="option"
                  aria-selected={sel}
                  onClick={() => {
                    setOpen(false);
                    if (!sel) router.push(`/${locale}/gov/${slugs[n]}/`);
                  }}
                  className={`flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-sm transition ${
                    sel
                      ? "bg-gov-tint font-bold text-gov-ink"
                      : "font-semibold text-gov-dark hover:bg-gov-tint"
                  }`}
                >
                  <span className="truncate">{n}</span>
                  {sel && (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0 text-gov">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
