// Drops report-card assets from the static export once they are served from a
// CDN instead. Runs as `postbuild`, so `npm run build` picks it up.
//
// A folder is removed only when its NEXT_PUBLIC_*_BASE env var points at an
// absolute URL — the same var src/lib/cards.ts reads. With the vars unset the
// build is untouched and the assets ship as before, so this is a no-op until
// the CDN cutover is done. See scripts/OFFLOAD_PDFS.md.
import { rmSync, statSync, readdirSync } from "node:fs";
import { join } from "node:path";

const OUT = "out/data";

const FOLDERS = [
  ["NEXT_PUBLIC_CARD_BASE", "cards"],
  ["NEXT_PUBLIC_CARDIMG_BASE", "cardimg"],
  ["NEXT_PUBLIC_HCARD_BASE", "hcards"],
  ["NEXT_PUBLIC_HCARDIMG_BASE", "hcardimg"],
];

function dirBytes(dir) {
  let total = 0;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    total += e.isDirectory() ? dirBytes(p) : statSync(p).size;
  }
  return total;
}

let freed = 0;
for (const [envVar, folder] of FOLDERS) {
  const base = process.env[envVar];
  if (!base) continue;
  if (!/^https?:\/\//.test(base)) {
    console.warn(`[offload] ${envVar} is not an absolute URL, keeping ${folder}`);
    continue;
  }
  const dir = join(OUT, folder);
  try {
    statSync(dir);
  } catch {
    continue;
  }
  const bytes = dirBytes(dir);
  rmSync(dir, { recursive: true, force: true });
  freed += bytes;
  console.log(`[offload] removed ${dir} (${(bytes / 1048576).toFixed(1)} MB) — served from ${base}`);
}

if (freed) console.log(`[offload] export is ${(freed / 1048576).toFixed(1)} MB smaller`);
