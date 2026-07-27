import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PrintButton from "@/components/PrintButton";
import MisconFull from "@/components/MisconFull";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { getMislib } from "@/lib/officialsData";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Officials misconceptions page — now the full-fidelity cards (stimulus, full
// stem, all options, correct/trap response %s, misconception + teaching note),
// exactly as in the SAKSHAM Academic LO report. Printable.
export default function MisconceptionsPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const o = t.officials;
  const mislib = getMislib();

  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-6">
        <h1 className="text-2xl font-extrabold leading-tight text-gov-ink">
          {o.misconTitle}
        </h1>
        <div className="mt-3">
          <MisconFull
            cards={mislib.cards}
            rows={mislib.units.ALL ?? []}
            copy={t.v2}
            subjectLabels={t.subjects}
            gradeLabels={t.grades}
            locale={locale}
          />
        </div>
        <div className="no-print mt-5">
          <PrintButton label={o.printPage} />
        </div>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
