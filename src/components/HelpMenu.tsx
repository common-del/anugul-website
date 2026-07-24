"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// Help ▾ dropdown in the title bar: FAQs, Contact Us, Resources.
export default function HelpMenu({
  label,
  items,
}: {
  label: string;
  items: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex min-h-[48px] items-center gap-1.5 px-4 text-[15px] font-semibold text-white/85 hover:text-white"
      >
        {label}
        <span
          aria-hidden
          className="inline-block text-xs transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        >
          ▾
        </span>
      </button>
      {open && (
        <div className="absolute left-2 top-full z-40 min-w-[180px] rounded-xl border border-gov-line bg-white p-1.5 shadow-lg">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-semibold text-gov-ink hover:bg-gov-tint"
            >
              {it.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
