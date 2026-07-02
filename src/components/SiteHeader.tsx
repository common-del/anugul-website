import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Messages } from "@/lib/i18n/dict";
import LanguageToggle from "./LanguageToggle";
import BackButton from "./BackButton";

export default function SiteHeader({
  locale,
  t,
  showBack = false,
}: {
  locale: Locale;
  t: Messages;
  showBack?: boolean;
}) {
  return (
    <header>
      <div className="bg-brand-dark px-4 py-1.5 text-center text-[13px] text-white/90">
        <div className="mx-auto w-full max-w-5xl">{t.site.strapline}</div>
      </div>
      <div className="bg-brand text-white">
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex items-center justify-between gap-3 px-4 pt-3">
            <div className="flex min-w-0 items-center gap-2.5">
              {showBack && <BackButton label={t.back} />}
              <Link
                href={`/${locale}/`}
                aria-label={t.site.name}
                className="flex min-w-0 items-center gap-2.5"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/seal-of-odisha.svg"
                    alt="Government of Odisha"
                    className="h-8 w-8 object-contain"
                  />
                </span>
                <span className="truncate text-lg font-bold leading-tight">
                  {t.site.name}
                </span>
              </Link>
            </div>
            <LanguageToggle current={locale} />
          </div>
          <p className="px-4 pb-3 pt-1.5 text-[11px] leading-snug text-white/85">
            {t.site.subtitle}
          </p>
        </div>
      </div>
    </header>
  );
}
