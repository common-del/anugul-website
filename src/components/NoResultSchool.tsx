import Link from "next/link";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import type { Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { blockName, clusterName } from "@/lib/placeNames";

type Dict = ReturnType<typeof getDict>;

// Shown for schools that took part in SAKSHAM but whose results are not
// available (answer-sheet data not sourced). Used by both the parent (/school)
// and principal (/principal) routes. Carries no scores and touches no aggregate.
export default function NoResultSchool({
  locale,
  t,
  name,
  block,
  cluster,
  findHref,
}: {
  locale: Locale;
  t: Dict;
  name: string;
  block: string;
  cluster: string;
  findHref: string;
}) {
  const v = t.v2;
  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack active="reports" />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <section className="gov-card p-6 text-center">
          <h1 className="text-xl font-extrabold leading-tight text-gov-ink">{name}</h1>
          <p className="mt-1.5 text-sm font-semibold text-muted">
            {blockName(block, locale)} · {clusterName(cluster, locale)}
          </p>
          <div className="mt-5 flex items-start gap-3 rounded-xl bg-gov-tint p-5 text-left">
            <svg
              width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B5530C"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden className="mt-0.5 shrink-0"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v5M12 16h.01" />
            </svg>
            <p className="text-[15px] leading-relaxed text-gov-ink">{v.noResultLine}</p>
          </div>
          <Link
            href={findHref}
            className="mt-6 inline-block rounded-xl bg-gov px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
          >
            {t.school.backToFind}
          </Link>
        </section>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
