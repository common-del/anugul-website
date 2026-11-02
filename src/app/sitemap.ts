import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { getBlockSlugs } from "@/lib/officialsData";
import { getSchools } from "@/lib/schools";
import { CONTENT_UPDATED, langAlternates } from "@/lib/seo";

// Emitted as a static /sitemap.xml in the production export. Lists every
// public, indexable page in both locales: home, the report landings, district
// and block reports, and every individual school report card. Officer routes
// (/officials, /principal) and the noindexed helper pages (about-saksham,
// roles, compare, analytics, sitemap, no-result schools) are excluded.
// Each URL carries its or/en/x-default hreflang pair, built by the same helper
// as the page tags so the two cannot disagree.
export const dynamic = "force-static";

const BASE = "https://anugolasaksham.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "",
    "find/",
    "school-head/",
    "gov/",
    "gov/district/",
    "resources/",
    "faq/",
    "contact/",
    "website-policies/",
  ];
  const blockPaths = getBlockSlugs().map((b) => `gov/${b.slug}/`);
  const schoolPaths = Object.keys(getSchools()).map((u) => `school/${u}/`);

  const entry = (
    locale: string,
    p: string,
    changeFrequency: "monthly" | "yearly",
    priority: number,
  ): MetadataRoute.Sitemap[number] => ({
    url: `${BASE}/${locale}/${p}`,
    lastModified: CONTENT_UPDATED,
    changeFrequency,
    priority,
    alternates: { languages: langAlternates(p) },
  });

  const urls: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const p of staticPaths) urls.push(entry(locale, p, "monthly", p === "" ? 1 : 0.7));
    for (const p of blockPaths) urls.push(entry(locale, p, "monthly", 0.7));
    for (const p of schoolPaths) urls.push(entry(locale, p, "yearly", 0.5));
  }
  return urls;
}
