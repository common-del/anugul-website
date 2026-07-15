import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FaqAccordion from "@/components/FaqAccordion";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function FaqPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const v = t.v2;
  return (
    <PageShell zone="full">
      <SiteHeader locale={locale} t={t} showBack />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <h1 className="text-2xl font-extrabold leading-tight text-gov-ink">
          {v.faqTitle}
        </h1>
        <p className="mt-1 text-muted">{v.faqIntro}</p>
        <div className="mt-4">
          <FaqAccordion
            items={v.faqItems}
            locale={locale}
            labels={{
              search: v.faqSearch,
              groupsLabel: v.faqGroupsLabel,
              groups: {
                all: v.faqAll,
                parents: v.faqParents,
                heads: v.faqHeads,
                researchers: v.faqResearchers,
                government: v.faqGovernment,
              },
              noResults: v.faqNoResults,
              stillTitle: v.faqStillTitle,
              stillText: v.faqStillText,
              contactCta: v.contactTitle,
            }}
          />
        </div>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
