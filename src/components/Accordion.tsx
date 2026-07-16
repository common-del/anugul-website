"use client";

import { useState, type ReactNode } from "react";

// Full-width collapsible panel used for the Block/District report analytical
// sections. Expanded by default (owner 2026-07-16: data-heavy mobile screens
// should show everything on landing; the accordion is for hiding sections
// after reading, not before). Header = label left, caret right; tap toggles.
export default function Accordion({
  label,
  children,
  defaultOpen = true,
}: {
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="overflow-hidden gov-card">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((x) => !x)}
        className="flex w-full items-center justify-between gap-3 p-5 text-left"
      >
        <span className="text-lg font-bold text-gov-ink">{label}</span>
        <svg
          width="20"
          height="20"
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
      {open && <div className="border-t border-gov-line p-5">{children}</div>}
    </section>
  );
}
