"use client";

import { useRouter } from "next/navigation";

// Goes to the previous screen. Shown on inner pages (not the home).
// Renders as a compact "‹ Back" pill: on mobile it's the only thing in the
// dark nav bar, so a labelled pill reads as an intentional back control
// rather than a lone icon floating in an empty dark strip.
export default function BackButton({ label }: { label: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label={label}
      className="no-print inline-flex items-center gap-1 rounded-full bg-white/15 py-1.5 pl-2 pr-3.5 text-[13.5px] font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/25"
    >
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
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
      <span>{label}</span>
    </button>
  );
}
