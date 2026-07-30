import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { getBlockSlugs } from "@/lib/officialsData";

// Emitted as a static /sitemap.xml in the production export. Lists the primary
// navigable pages in both locales (the home carries the highest priority).
// Individual school pages are reachable via internal links + the finder, so
// they are intentionally left out to keep the sitemap focused.
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
  const paths = [...staticPaths, ...blockPaths];

  const urls: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const p of paths) {
      urls.push({
        url: `${BASE}/${locale}/${p}`,
        changeFrequency: "monthly",
        priority: p === "" ? 1 : 0.7,
      });
    }
  }
  return urls;
}
