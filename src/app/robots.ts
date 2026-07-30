import type { MetadataRoute } from "next";

// Emitted as a static /robots.txt in the production export. Points crawlers
// at the sitemap and the canonical host (anugolasaksham.in).
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://anugolasaksham.in/sitemap.xml",
    host: "https://anugolasaksham.in",
  };
}
