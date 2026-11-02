// Lightweight GA4 event helper. gtag is loaded only after the visitor accepts
// analytics (see ConsentBanner), so every call safely no-ops without consent —
// no events fire, no cookies, nothing. site_language (od/en) is attached to
// every event from the URL path, so all interactions can be split by Odia vs
// English in GA4.
type Params = Record<string, string | number | boolean | undefined>;

export function track(event: string, params: Params = {}): void {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag !== "function") return;
  const lang = window.location.pathname.startsWith("/od/") ? "od" : "en";
  gtag("event", event, { site_language: lang, ...params });
}
