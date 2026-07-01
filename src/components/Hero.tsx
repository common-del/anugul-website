import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Messages } from "@/lib/i18n/dict";

export default function Hero({ locale, t }: { locale: Locale; t: Messages }) {
  return (
    <section className="px-5 pb-5 pt-6">
      <p className="text-sm font-semibold text-accent-dark">
        {t.home.hero.eyebrow}
      </p>
      <h1 className="mt-1 text-[26px] font-extrabold leading-tight text-brand-ink">
        {t.home.hero.title}
      </h1>
      <Link
        href={`/${locale}/find/`}
        className="mt-4 flex min-h-[54px] items-center justify-center rounded-xl bg-accent px-5 text-lg font-bold text-white shadow-sm active:bg-accent-dark"
      >
        {t.home.hero.cta}
      </Link>
    </section>
  );
}
