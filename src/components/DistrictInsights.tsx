"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";

// District Report key insights. The best-subject card opens that subject's
// strongest competencies, the attention card its weakest, and the 10/10 card
// lists the schools (each opens its report card).
type LO = { grade: string; subject: string; code: string; desc: string; pct: number };
type Comp = Record<string, { weak: LO[]; best: LO[] }>;
type Sub = { grade: string; subject: string; label: string; pct: string };
type Top = { udise: string; name: string; block: string; cluster: string; score10: string };
type Labels = {
  title: string;
  bestSubject: string;
  needsAttention: string;
  bestCompetencies: string;
  weakestCompetencies: string;
  highPerforming: string;
  highPerformingValue: string;
  openReport: string;
  close: string;
};

const up = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2D3A47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="mt-0.5 shrink-0">
    <path d="M23 6l-9.5 9.5-5-5L1 18" /><path d="M17 6h6v6" />
  </svg>
);
const down = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C24E36" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="mt-0.5 shrink-0">
    <path d="M23 18l-9.5-9.5-5 5L1 6" /><path d="M17 18h6v-6" />
  </svg>
);

function LoList({ items, locale }: { items: LO[]; locale: Locale }) {
  return (
    <ul className="mt-1 space-y-1.5">
      {items.map((l) => (
        <li key={l.code} className="text-xs leading-snug">
          <Link href={`/${locale}/officials/research/outcomes/`} className="font-bold text-gov underline underline-offset-2">
            {l.code}
          </Link>{" "}
          <span className="text-gov-ink">{l.desc.length > 90 ? l.desc.slice(0, 88) + "…" : l.desc}</span>{" "}
          <span className="font-bold tabular-nums text-gov-ink">({Math.round(l.pct)}%)</span>
        </li>
      ))}
    </ul>
  );
}

export default function DistrictInsights({
  locale, labels, best, worst, comp, top,
}: {
  locale: Locale; labels: Labels; best: Sub; worst: Sub; comp: Comp; top: Top[];
}) {
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (k: string) => setOpen((o) => (o === k ? null : k));
  const closeBtn = (
    <button
      type="button"
      onClick={() => setOpen(null)}
      aria-label={labels.close}
      className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full border border-gov-line text-sm hover:bg-gov-tint"
    >
      ×
    </button>
  );
  const subjRow = (k: string, s: Sub, good: boolean, label: string) => {
    const c = comp[`${s.grade}|${s.subject}`];
    return (
      <li key={k}>
        <button
          type="button"
          onClick={() => toggle(k)}
          aria-expanded={open === k}
          className="flex w-full items-start gap-2.5 rounded-xl bg-gov-tint px-3 py-2.5 text-left transition hover:ring-2 hover:ring-gov"
        >
          {good ? up : down}
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold text-muted">{label}</span>
            <span className="font-bold text-gov-ink">{s.label} · {s.pct}</span>
          </span>
          <span aria-hidden className="text-gov">{open === k ? "▲" : "▼"}</span>
        </button>
        {open === k && c && (
          <div className="relative mt-2 rounded-xl border border-gov-line bg-white p-3">
            {closeBtn}
            <div className="pr-8 text-xs font-bold uppercase tracking-wide text-muted">
              {good ? labels.bestCompetencies : labels.weakestCompetencies}
            </div>
            <LoList items={good ? c.best : c.weak} locale={locale} />
          </div>
        )}
      </li>
    );
  };
  return (
    <section className="gov-card flex flex-1 flex-col p-5">
      <h2 className="text-lg font-bold text-gov-ink">{labels.title}</h2>
      <ul className="mt-3 flex flex-1 flex-col gap-2.5 text-sm">
        {subjRow("best", best, true, labels.bestSubject)}
        {subjRow("worst", worst, false, labels.needsAttention)}
        <li>
          <button
            type="button"
            onClick={() => toggle("top")}
            aria-expanded={open === "top"}
            className="flex w-full items-start gap-2.5 rounded-xl bg-gov-tint px-3 py-2.5 text-left transition hover:ring-2 hover:ring-gov"
          >
            {up}
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-muted">{labels.highPerforming}</span>
              <span className="font-bold text-gov-ink">{labels.highPerformingValue}</span>
            </span>
            <span aria-hidden className="text-gov">{open === "top" ? "▲" : "▼"}</span>
          </button>
          {open === "top" && (
            <div className="relative mt-2 rounded-xl border border-gov-line bg-white p-3">
              {closeBtn}
              <ul className="space-y-2 pr-8">
                {top.map((s) => (
                  <li key={s.udise}>
                    <Link href={`/${locale}/school/${s.udise}/`} className="block rounded-lg bg-gov-tint px-3 py-2 hover:ring-2 hover:ring-gov">
                      <span className="block text-sm font-bold text-gov-ink">{s.name} <span className="tabular-nums">· {s.score10}</span></span>
                      <span className="block text-xs text-muted">{s.block} · {s.cluster} → {labels.openReport}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      </ul>
    </section>
  );
}
