"use client";

import { useEffect } from "react";

// Active ONLY when the site is embedded in the /demo device frames (top !==
// self). Broadcasts navigation to the parent and follows navigation commands,
// so the phone and computer frames stay on the same page. Inert for real
// visitors.
export default function DemoSync() {
  useEffect(() => {
    if (window.self === window.top) return;

    const announce = () =>
      window.parent.postMessage(
        { type: "demo-nav", href: location.pathname + location.search },
        location.origin,
      );

    const wrap = <T extends typeof history.pushState>(fn: T): T =>
      function (this: History, ...args: Parameters<T>) {
        const r = fn.apply(this, args);
        setTimeout(announce, 0);
        return r;
      } as T;
    history.pushState = wrap(history.pushState.bind(history));
    history.replaceState = wrap(history.replaceState.bind(history));
    window.addEventListener("popstate", announce);

    const onMessage = (e: MessageEvent) => {
      if (e.origin !== location.origin) return;
      const d = e.data;
      // Only follow a rooted, same-origin path ("/..." but not "//..."), so the
      // relayed href can never become a javascript:/external navigation sink —
      // mirrors the ?start= check the demo page applies. Defense-in-depth.
      const rooted =
        !!d &&
        typeof d.href === "string" &&
        d.href.startsWith("/") &&
        !d.href.startsWith("//");
      if (d && d.type === "demo-goto" && rooted) {
        if (location.pathname + location.search !== d.href) {
          window.location.href = d.href; // full load: simple + static-safe
        }
      }
    };
    window.addEventListener("message", onMessage);
    announce();

    return () => {
      window.removeEventListener("popstate", announce);
      window.removeEventListener("message", onMessage);
    };
  }, []);
  return null;
}
