import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { getBlockSlugs } from "@/lib/officialsData";
import { getSchools } from "@/lib/schools";

// Emitted as a static /sitemap.xml in the production export. Lists every
// public, indexable page in both locales: home, the report landings, district
// and block reports, and every individual school report card. Officer routes
// (/officials, /principal) are noindexed and intentionally excluded.
export const dynamic = "force-static";

const BASE = "https://anugolasaksham.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "",
    "find/",
    "gov/",
    "gov/district/",
    "resources/",
    "faq/",
    "contact/",
    "website-policies/",
  ];
  const blockPaths = getBlockSlugs().map((b) => `gov/${b.slug}/`);
  const schoolPaths = Object.keys(getSchools()).map((u) => `school/${u}/`);

  const urls: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const p of staticPaths) {
      urls.push({
        url: `${BASE}/${locale}/${p}`,
        changeFrequency: "monthly",
        priority: p === "" ? 1 : 0.7,
      });
    }
    for (const p of blockPaths) {
      urls.push({ url: `${BASE}/${locale}/${p}`, changeFrequency: "monthly", priority: 0.7 });
    }
    for (const p of schoolPaths) {
      urls.push({ url: `${BASE}/${locale}/${p}`, changeFrequency: "yearly", priority: 0.5 });
    }
  }
  return urls;
}
