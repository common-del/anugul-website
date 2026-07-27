import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ContactForm from "@/components/ContactForm";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Feedback / grievance route — emails the dedicated website inbox via the
// visitor's own mail app (same mailto approach as Contact), with a grievance
// subject line. (owner 2026-07-27)
const FEEDBACK_EMAIL = "anugolasaksham@gmail.com";

export default function FeedbackPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const v = t.v2;

  return (
    <PageShell zone="full">
      <SiteHeader locale={locale} t={t} showBack />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <h1 className="text-2xl font-extrabold leading-tight text-gov-ink">{v.feedbackTitle}</h1>
        <p className="mt-2 leading-relaxed text-gov-ink">{v.feedbackIntro}</p>
        <ContactForm
          email={FEEDBACK_EMAIL}
          labels={{
            name: v.contactName,
            namePh: v.contactNamePh,
            msg: v.contactMsg,
            msgPh: v.contactMsgPh,
            send: v.contactSend,
            subject: v.feedbackSubject,
            noEmail: v.contactNoEmail,
          }}
        />
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
