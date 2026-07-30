import type { Metadata } from "next";

// Officer-only views duplicate the public school/block report content, so keep
// the whole /officials subtree out of Google — it shouldn't compete with the
// public pages for the same searches.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function OfficialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
