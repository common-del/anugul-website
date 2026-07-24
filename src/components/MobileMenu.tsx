"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type NavItem = { key: "home" | "reports"; href: string; label: string };
type HelpItem = { href: string; label: string };

// Mobile-only (sm-) header menu. A hamburger button sits in the logo row and
// opens a full-height drawer that slides in from the right, holding the primary
// nav (Home, Reports, Help). Desktop keeps the green title bar instead, so the
// whole component is hidden at sm+ by its wrapper in SiteHeader.
export default function MobileMenu({
  active,
  items,
  helpLabel,
  helpItems,
  menuLabel,
  closeLabel,
}: {
  active: "home" | "reports" | "none";
  items: NavItem[];
  helpLabel: string;
  helpItems: HelpItem[];
  menuLabel: string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  // While open: lock body scroll and close on Escape.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  // Nav row: active gets a left-edge orange accent bar + orange text; the
  // transparent border on inactive rows keeps the text aligned.
  const rowClass = (isActive: boolean) =>
    `flex min-h-[48px] items-center border-l-4 px-4 text-[15px] font-bold ${
      isActive
        ? "border-accent text-accent"
        : "border-transparent text-gov-ink hover:bg-gov-tint"
    }`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={menuLabel}
        aria-expanded={open}
        className="grid h-11 w-11 place-items-center rounded-lg text-gov-dark hover:bg-gov-tint"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Kept mounted so the panel can slide; pointer-events off and hidden
          from assistive tech while closed. */}
      <div
        className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          onClick={close}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label={menuLabel}
          className={`absolute inset-y-0 right-0 flex w-72 max-w-[82%] flex-col bg-white shadow-lift transition-transform duration-300 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex justify-end border-b border-gov-line p-2">
            <button
              type="button"
              onClick={close}
              aria-label={closeLabel}
              className="grid h-11 w-11 place-items-center rounded-lg text-gov-dark hover:bg-gov-tint"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden
              >
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          </div>

          <nav className="flex flex-col py-1" aria-label={menuLabel}>
            {items.map((it) => (
              <Link
                key={it.key}
                href={it.href}
                aria-current={active === it.key ? "page" : undefined}
                onClick={close}
                className={rowClass(active === it.key)}
              >
                {it.label}
              </Link>
            ))}

            {/* Help expands to reveal its sub-items. */}
            <button
              type="button"
              onClick={() => setHelpOpen((v) => !v)}
              aria-expanded={helpOpen}
              className={`${rowClass(false)} justify-between`}
            >
              {helpLabel}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className="transition-transform"
                style={{ transform: helpOpen ? "rotate(180deg)" : "none" }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {helpOpen &&
              helpItems.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={close}
                  className="flex min-h-[44px] items-center border-l-4 border-transparent py-2 pl-8 pr-4 text-[14px] font-semibold text-gov-ink hover:bg-gov-tint"
                >
                  {it.label}
                </Link>
              ))}
          </nav>
        </div>
      </div>
    </>
  );
}
