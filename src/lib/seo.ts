import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { fmtNum, fmtPercent } from "@/lib/format";

// Central SEO copy + metadata builder. Every public route resolves a
// title/description here (data-driven where it can be) and wraps it with a
// canonical URL, Open Graph and Twitter card via pageMeta().
//
// Odia strings are best-effort and awaiting native review (same standing
// caveat as the rest of the site's Odia). School names stay English in both
// locales, per the owner's decision.

const BASE = "https://anugolasaksham.in";
const SITE = "Anugola (Angul) Saksham";
const OG_ALT = "Anugola (Angul) Saksham — Government School Report Cards";
const OG_IMAGE = { url: "/og-image.png", width: 1200, height: 630, alt: OG_ALT };

type Copy = { en: string; od: string };
const pick = (c: Copy, l: Locale) => (l === "od" ? c.od : c.en);

// Wrap a resolved title + description into full page metadata. `path` is the
// locale-relative path with trailing slash, e.g. "" (home), "gov/district/",
// "school/21150106101/". Pass index:false to keep a route out of Google.
export function pageMeta(
  locale: Locale,
  path: string,
  title: string,
  description: string,
  opts: { index?: boolean } = {},
): Metadata {
  const url = `${BASE}/${locale}/${path}`;
  const meta: Metadata = {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE,
      locale: locale === "od" ? "or_IN" : "en_IN",
      url,
      title,
      description,
      images: [OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
  };
  if (opts.index === false) meta.robots = { index: false, follow: true };
  return meta;
}

type TD = { title: string; description: string };

export function homeSeo(l: Locale): TD {
  return {
    title: pick({
      en: "Anugola (Angul) Saksham | Government School Report Cards",
      od: "ଅନୁଗୋଳ (Angul) ସକ୍ଷମ | ସରକାରୀ ବିଦ୍ୟାଳୟ ରିପୋର୍ଟ କାର୍ଡ",
    }, l),
    description: pick({
      en: "Report cards for every government school in Anugola (Angul) district, Odisha — SAKSHAM competency-based assessment, learning outcomes and school quality.",
      od: "ଅନୁଗୋଳ (Angul) ଜିଲ୍ଲା, ଓଡ଼ିଶାର ପ୍ରତ୍ୟେକ ସରକାରୀ ବିଦ୍ୟାଳୟ ପାଇଁ ରିପୋର୍ଟ କାର୍ଡ — ସକ୍ଷମ ଦକ୍ଷତା-ଆଧାରିତ ମୂଲ୍ୟାଙ୍କନ, ଶିକ୍ଷଣ ଫଳାଫଳ ଓ ବିଦ୍ୟାଳୟ ଗୁଣବତ୍ତା।",
    }, l),
  };
}

export function districtSeo(l: Locale, avg: number, blockCount: number, schoolCount: number): TD {
  const s = fmtPercent(Math.round(avg), l);
  const b = fmtNum(blockCount, l);
  const n = fmtNum(schoolCount, l);
  return {
    title: pick({
      en: "Anugola (Angul) District School Performance Dashboard",
      od: "ଅନୁଗୋଳ (Angul) ଜିଲ୍ଲା ବିଦ୍ୟାଳୟ ପ୍ରଦର୍ଶନ ଡ୍ୟାସବୋର୍ଡ",
    }, l),
    description: pick({
      en: `District-wide SAKSHAM results for Anugola (Angul), Odisha — overall score ${s}, Grade 5 & 8 learning outcomes, and how all ${b} blocks and ${n} schools compare.`,
      od: `ଅନୁଗୋଳ (Angul), ଓଡ଼ିଶାର ଜିଲ୍ଲା-ସ୍ତରୀୟ ସକ୍ଷମ ଫଳାଫଳ — ସାମଗ୍ରିକ ସ୍କୋର ${s}, ପଞ୍ଚମ ଓ ଅଷ୍ଟମ ଶ୍ରେଣୀର ଶିକ୍ଷଣ ଫଳାଫଳ ଏବଂ ସମସ୍ତ ${b} ବ୍ଲକ୍ ଓ ${n} ବିଦ୍ୟାଳୟର ତୁଳନା।`,
    }, l),
  };
}

export function blockSeo(l: Locale, block: string, avg: number, schoolCount: number): TD {
  const s = fmtPercent(Math.round(avg), l);
  const n = fmtNum(schoolCount, l);
  return {
    title: pick({
      en: `${block} Block School Performance — Anugola (Angul)`,
      od: `${block} ବ୍ଲକ୍ ବିଦ୍ୟାଳୟ ପ୍ରଦର୍ଶନ — ଅନୁଗୋଳ (Angul)`,
    }, l),
    description: pick({
      en: `How government schools in ${block} block, Anugola (Angul) district performed on the SAKSHAM assessment — overall ${s}, ${n} schools, learning outcomes and cluster comparison.`,
      od: `ଅନୁଗୋଳ (Angul) ଜିଲ୍ଲାର ${block} ବ୍ଲକ୍ର ସରକାରୀ ବିଦ୍ୟାଳୟଗୁଡ଼ିକ ସକ୍ଷମ ମୂଲ୍ୟାଙ୍କନରେ କିପରି ପ୍ରଦର୍ଶନ କଲେ — ସାମଗ୍ରିକ ${s}, ${n} ବିଦ୍ୟାଳୟ, ଶିକ୍ଷଣ ଫଳାଫଳ ଓ କ୍ଲଷ୍ଟର ତୁଳନା।`,
    }, l),
  };
}

// name stays English in both locales; block is already display-localized.
export function schoolSeo(l: Locale, name: string, block: string, score10: number): TD {
  const s = `${fmtNum(score10, l)}/${fmtNum(10, l)}`;
  return {
    title: pick({
      en: `${name} — Report Card | Anugola (Angul)`,
      od: `${name} — ରିପୋର୍ଟ କାର୍ଡ | ଅନୁଗୋଳ (Angul)`,
    }, l),
    description: pick({
      en: `Read the full SAKSHAM report card for ${name} in ${block} block, Anugola (Angul) — overall score ${s}, grade-wise learning outcomes, enrolment and school profile.`,
      od: `${block} ବ୍ଲକ୍, ଅନୁଗୋଳ (Angul) ର ${name} ପାଇଁ ସମ୍ପୂର୍ଣ୍ଣ ସକ୍ଷମ ରିପୋର୍ଟ କାର୍ଡ — ସାମଗ୍ରିକ ସ୍କୋର ${s}, ଶ୍ରେଣୀ-ଅନୁସାରେ ଶିକ୍ଷଣ ଫଳାଫଳ, ନାମଲେଖା ଓ ବିଦ୍ୟାଳୟ ବିବରଣୀ।`,
    }, l),
  };
}

export function findSeo(l: Locale): TD {
  return {
    title: pick({
      en: "Find Your School — Anugola (Angul) School Report Cards",
      od: "ଆପଣଙ୍କ ବିଦ୍ୟାଳୟ ଖୋଜନ୍ତୁ — ଅନୁଗୋଳ (Angul) ବିଦ୍ୟାଳୟ ରିପୋର୍ଟ କାର୍ଡ",
    }, l),
    description: pick({
      en: "Search any government school in Anugola (Angul) district, Odisha by name, block or cluster and open its SAKSHAM report card.",
      od: "ଅନୁଗୋଳ (Angul) ଜିଲ୍ଲାର ଯେକୌଣସି ସରକାରୀ ବିଦ୍ୟାଳୟକୁ ନାମ, ବ୍ଲକ୍ କିମ୍ବା କ୍ଲଷ୍ଟର ଅନୁସାରେ ଖୋଜି ତାର ସକ୍ଷମ ରିପୋର୍ଟ କାର୍ଡ ଦେଖନ୍ତୁ।",
    }, l),
  };
}

export function faqSeo(l: Locale): TD {
  return {
    title: pick({
      en: "SAKSHAM Assessment FAQs — Anugola (Angul)",
      od: "ସକ୍ଷମ ମୂଲ୍ୟାଙ୍କନ ପ୍ରଶ୍ନୋତ୍ତର — ଅନୁଗୋଳ (Angul)",
    }, l),
    description: pick({
      en: "Common questions about the SAKSHAM competency-based assessment, school report cards and learning outcomes in Anugola (Angul) district, Odisha.",
      od: "ଅନୁଗୋଳ (Angul) ଜିଲ୍ଲାର ସକ୍ଷମ ଦକ୍ଷତା-ଆଧାରିତ ମୂଲ୍ୟାଙ୍କନ, ବିଦ୍ୟାଳୟ ରିପୋର୍ଟ କାର୍ଡ ଓ ଶିକ୍ଷଣ ଫଳାଫଳ ବିଷୟରେ ସାଧାରଣ ପ୍ରଶ୍ନ।",
    }, l),
  };
}

export function resourcesSeo(l: Locale): TD {
  return {
    title: pick({
      en: "Reports & Resources — Anugola (Angul) Saksham",
      od: "ରିପୋର୍ଟ ଓ ସମ୍ବଳ — ଅନୁଗୋଳ (Angul) ସକ୍ଷମ",
    }, l),
    description: pick({
      en: "Download district and block reports, the SAKSHAM methodology, learning-outcome data and explainer videos for Anugola (Angul), Odisha.",
      od: "ଅନୁଗୋଳ (Angul), ଓଡ଼ିଶା ପାଇଁ ଜିଲ୍ଲା ଓ ବ୍ଲକ୍ ରିପୋର୍ଟ, ସକ୍ଷମ ମୂଲ୍ୟାଙ୍କନ ପଦ୍ଧତି, ଶିକ୍ଷଣ-ଫଳାଫଳ ତଥ୍ୟ ଓ ଭିଡ଼ିଓ ଡାଉନଲୋଡ୍ କରନ୍ତୁ।",
    }, l),
  };
}

export function govSeo(l: Locale): TD {
  return {
    title: pick({
      en: "Anugola (Angul) District & Block Reports | Saksham",
      od: "ଅନୁଗୋଳ (Angul) ଜିଲ୍ଲା ଓ ବ୍ଲକ୍ ରିପୋର୍ଟ | ସକ୍ଷମ",
    }, l),
    description: pick({
      en: "Choose a district or block report to explore government school performance and SAKSHAM learning outcomes across Anugola (Angul), Odisha.",
      od: "ଅନୁଗୋଳ (Angul), ଓଡ଼ିଶାର ସରକାରୀ ବିଦ୍ୟାଳୟ ପ୍ରଦର୍ଶନ ଓ ସକ୍ଷମ ଶିକ୍ଷଣ ଫଳାଫଳ ଦେଖିବାକୁ ଏକ ଜିଲ୍ଲା କିମ୍ବା ବ୍ଲକ୍ ରିପୋର୍ଟ ବାଛନ୍ତୁ।",
    }, l),
  };
}

// ---- Structured data (JSON-LD) ----

export const absUrl = (locale: Locale, path: string) => `${BASE}/${locale}/${path}`;

const CRUMB = {
  home: { en: "Home", od: "ମୂଳପୃଷ୍ଠା" },
  district: { en: "Anugola (Angul) District", od: "ଅନୁଗୋଳ (Angul) ଜିଲ୍ଲା" },
  block: { en: "Block", od: "ବ୍ଲକ୍" },
};

export function orgLd() {
  return {
    "@context": "https://schema.org",
    "@type": "GovernmentOrganization",
    name: SITE,
    alternateName: "SAKSHAM — Anugola (Angul) District",
    url: BASE,
    logo: `${BASE}/og-image.png`,
    areaServed: "Angul district, Odisha, India",
    description:
      "School report cards and SAKSHAM competency-based assessment results for government schools in Anugola (Angul) district, Odisha.",
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE,
    url: BASE,
    inLanguage: ["en", "or"],
  };
}

export function schoolLd(name: string, block: string, udise: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "School",
    name,
    url,
    identifier: { "@type": "PropertyValue", propertyID: "UDISE", value: udise },
    address: {
      "@type": "PostalAddress",
      addressLocality: block,
      addressRegion: "Odisha",
      addressCountry: "IN",
    },
    parentOrganization: {
      "@type": "GovernmentOrganization",
      name: "School & Mass Education Department, Anugola (Angul) District, Odisha",
    },
  };
}

export function districtLd(locale: Locale, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: pick({
      en: "Anugola (Angul) District — SAKSHAM School Performance",
      od: "ଅନୁଗୋଳ (Angul) ଜିଲ୍ଲା — ସକ୍ଷମ ବିଦ୍ୟାଳୟ ପ୍ରଦର୍ଶନ",
    }, locale),
    description,
    url: absUrl(locale, "gov/district/"),
    creator: { "@type": "GovernmentOrganization", name: SITE },
    spatialCoverage: "Angul district, Odisha, India",
    variableMeasured: ["Overall SAKSHAM score", "Grade 5 score", "Grade 8 score", "Learning outcomes"],
    isAccessibleForFree: true,
  };
}

function crumbLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function schoolBreadcrumbLd(
  locale: Locale,
  name: string,
  blockDisplay: string,
  blockSlug: string | undefined,
  udise: string,
) {
  const items = [
    { name: pick(CRUMB.home, locale), url: absUrl(locale, "") },
    { name: pick(CRUMB.district, locale), url: absUrl(locale, "gov/district/") },
  ];
  if (blockSlug) {
    items.push({
      name: `${blockDisplay} ${pick(CRUMB.block, locale)}`,
      url: absUrl(locale, `gov/${blockSlug}/`),
    });
  }
  items.push({ name, url: absUrl(locale, `school/${udise}/`) });
  return crumbLd(items);
}

export function blockBreadcrumbLd(locale: Locale, blockDisplay: string, blockSlug: string) {
  return crumbLd([
    { name: pick(CRUMB.home, locale), url: absUrl(locale, "") },
    { name: pick(CRUMB.district, locale), url: absUrl(locale, "gov/district/") },
    { name: `${blockDisplay} ${pick(CRUMB.block, locale)}`, url: absUrl(locale, `gov/${blockSlug}/`) },
  ]);
}

function stripMd(s: string) {
  return s
    .replace(/\*\*/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

export function faqPageLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: stripMd(it.a) },
    })),
  };
}

export function schoolParagraph(locale: Locale, name: string, block: string): string {
  return pick({
    en: `This report card presents how ${name} in ${block} block, Anugola (Angul) district performed on the SAKSHAM competency-based assessment — its overall score, grade-wise learning outcomes, enrolment and other quality indicators, to help parents, the community and education officials understand and act on the school's performance.`,
    od: `ଏହି ରିପୋର୍ଟ କାର୍ଡ ଅନୁଗୋଳ (Angul) ଜିଲ୍ଲାର ${block} ବ୍ଲକ୍ର ${name} ସକ୍ଷମ ମୂଲ୍ୟାଙ୍କନରେ କିପରି ପ୍ରଦର୍ଶନ କଲା ଦର୍ଶାଏ — ସାମଗ୍ରିକ ସ୍କୋର, ଶ୍ରେଣୀ-ଅନୁସାରେ ଶିକ୍ଷଣ ଫଳାଫଳ, ନାମଲେଖା ଓ ଅନ୍ୟ ଗୁଣବତ୍ତା ସୂଚକ, ଯାହା ଅଭିଭାବକ, ସମ୍ପ୍ରଦାୟ ଓ ଶିକ୍ଷା ଅଧିକାରୀଙ୍କୁ ବିଦ୍ୟାଳୟର ପ୍ରଦର୍ଶନ ବୁଝି କାର୍ଯ୍ୟ କରିବାରେ ସାହାଯ୍ୟ କରେ।`,
  }, locale);
}
