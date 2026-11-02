import type { Metadata } from "next";

// Internal device-frame demo, not linked from the site. It only re-frames pages
// that are already indexed on their own URLs, so keep it out of search results.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
