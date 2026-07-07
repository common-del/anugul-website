"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";

type Item = { id: string; q: string; a: string; tags: string[] };
type Group = "all" | "parents" | "heads" | "researchers" | "government";

type Labels = {
  search: string;
  groupsLabel: string;
  groups: { all: string; parents: string; heads: string; researchers: string; government: string };
  noResults: string;
  stillTitle: string;
  stillText: string;
  contactCta: string;
};

export default function FaqAccordion({
  items,
  labels,
  locale,
}: {
  items: Item[];
  labels: Labels;
  locale: Locale;
}) {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<Group>("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter(
      (it) =>
        (group === "all" || it.tags.includes(group)) &&
        (!needle || `${it.q} ${it.a}`.toLowerCase().includes(needle)),
    );
  }, [items, q, group]);

  const groups: Group[] = ["all", "parents", "heads", "researchers", "government"];

  return (
    <div>
      <div className="flex items-center gap-2 rounded-xl border border-gov-line bg-white px-4 focus-within:border-gov">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden className="shrink-0 text-muted">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={labels.search}
          aria-label={labels.search}
          className="min-h-[50px] w-full bg-transparent text-base text-gov-ink outline-none"
        />
      </div>

      <p className="mt-4 text-sm font-bold text-gov-ink">{labels.groupsLabel}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {groups.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGroup(g)}
            aria-pressed={group === g}
            className={`min-h-[40px] rounded-full px-4 text-sm font-semibold ring-1 ${
              group === g
                ? "bg-gov text-white ring-gov"
                : "bg-white text-gov-dark ring-gov-line hover:bg-gov-tint"
            }`}
          >
            {labels.groups[g]}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2.5">
        {filtered.map((it) => (
          <details key={it.id} className="group rounded-xl border border-gov-line bg-white">
            <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3.5 font-bold text-gov-ink">
              {it.q}
              <span aria-hidden className="shrink-0 text-gov transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="border-t border-gov-line px-4 py-3 text-[15px] leading-relaxed text-muted">
              {it.a}
            </p>
          </details>
        ))}
        {filtered.length === 0 && (
          <p className="rounded-xl border border-gov-line bg-white px-4 py-4 text-sm text-muted">
            {labels.noResults}
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gov-tint p-5">
        <div>
          <p className="font-bold text-gov-ink">{labels.stillTitle}</p>
          <p className="text-sm text-muted">{labels.stillText}</p>
        </div>
        <Link
          href={`/${locale}/contact/`}
          className="rounded-xl bg-gov px-5 py-2.5 text-sm font-bold text-white"
        >
          {labels.contactCta}
        </Link>
      </div>
    </div>
  );
}
