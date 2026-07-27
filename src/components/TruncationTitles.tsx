"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Site-wide tooltip for clipped text. Wherever text is cut off with an ellipsis
// (Tailwind `truncate` or `line-clamp-*`), expose the full text as a native
// `title` so hovering (desktop) shows all of it. Only sets a title when the
// element is actually overflowing, never overrides a title written in markup
// (e.g. ClusterName's), and clears it if a resize makes the text fit again.
// Re-scans on mount, after web-fonts load (they change text width), on route
// change, on resize, and on DOM changes (search results, panels, dropdowns).
export default function TruncationTitles() {
  const pathname = usePathname();

  useEffect(() => {
    const scan = () => {
      const els = document.querySelectorAll<HTMLElement>(
        ".truncate, [class*='line-clamp']",
      );
      els.forEach((el) => {
        const clipped =
          el.scrollWidth > el.clientWidth + 1 ||
          el.scrollHeight > el.clientHeight + 1;
        const auto = el.dataset.autoTitle === "1";
        if (clipped) {
          if (auto || !el.title) {
            const full = (el.textContent || "").replace(/\s+/g, " ").trim();
            if (full) {
              if (el.title !== full) el.title = full;
              el.dataset.autoTitle = "1";
            }
          }
        } else if (auto) {
          el.removeAttribute("title");
          delete el.dataset.autoTitle;
        }
      });
    };

    let timer = 0;
    const debounced = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(scan, 100);
    };

    scan(); // immediate
    debounced(); // catch first-paint layout
    const t2 = window.setTimeout(scan, 500); // safety net
    if (document.fonts?.ready) document.fonts.ready.then(scan).catch(() => {});
    window.addEventListener("resize", debounced);
    // Attributes we set (title/data-*) are not observed, so no feedback loop.
    const mo = new MutationObserver(debounced);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(t2);
      window.removeEventListener("resize", debounced);
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
