# Offload report-card assets to a CDN / object store (deploy: 1.8 GB → ~1.16 GB)

`public/data/` carries 624 MB of report-card assets that ship in every deploy.
Measured from a production build on 2026-09-21:

| Folder | Size | Files |
|---|---|---|
| `public/data/hcards`   | 236 MB | 1,356 School-Head PDFs |
| `public/data/cards`    | 176 MB | 1,356 parent PDFs |
| `public/data/hcardimg` | 164 MB | 1,356 webp previews (3-page stack, 745x3187) |
| `public/data/cardimg`  | 48 MB  | 1,356 webp previews (page 1, 745x2120) |

These are only fetched on demand (a tap to download, or the one inline preview
image per school page), so they belong on a CDN / object store, not in the Next
deploy. The code is already CDN-ready: `src/lib/cards.ts` reads four env vars
and falls back to the in-repo `/data/...` paths when they are unset, so nothing
breaks until you cut over.

```
NEXT_PUBLIC_CARD_BASE      # e.g. https://<cdn-host>/cards
NEXT_PUBLIC_CARDIMG_BASE   # e.g. https://<cdn-host>/cardimg
NEXT_PUBLIC_HCARD_BASE     # e.g. https://<cdn-host>/hcards
NEXT_PUBLIC_HCARDIMG_BASE  # e.g. https://<cdn-host>/hcardimg
```

For context on where the rest of the 1.8 GB goes: 712 MB is prerendered HTML
and 361 MB is the matching RSC payloads (`index.txt`), across 8,605 pages in
two locales. Offloading these assets is the only lever that needs no code
change.

## Why not Vercel Blob
Blob was retired 2026-07-07: exceeding the Hobby *write* cap blocked the whole
store (403 on reads too). Prefer a store with no monthly write cap:
**Cloudflare R2** (10 GB free, zero egress fees) or **Backblaze B2**. Any
S3-compatible store works. A one-time bulk upload is well within free tiers.

## Cutover (you run these — they need your bucket + credentials)

**1. Create a public bucket** on R2 / B2 / S3 and note its public base URL.

**2. Bulk-upload the four folders** (rclone is provider-agnostic; configure a
remote named `cdn` once via `rclone config`):

```bash
rclone copy public/data/cards    cdn:<bucket>/cards    --transfers 32 --checksum
rclone copy public/data/cardimg  cdn:<bucket>/cardimg  --transfers 32 --checksum
rclone copy public/data/hcards   cdn:<bucket>/hcards   --transfers 32 --checksum
rclone copy public/data/hcardimg cdn:<bucket>/hcardimg --transfers 32 --checksum
```
(Set `Content-Type: application/pdf` on the PDFs and `image/webp` on the images
so browsers preview them inline — rclone sets these from the extension by
default on most backends.)

**3. Set the env vars** in Vercel → Project → Settings → Environment Variables
(Production + Preview), pointing at the uploaded paths, then redeploy so they
inline into the build.

**4. Verify** a few downloads on the deployed site (parent card, School-Head
card, and both inline preview images) load from the CDN host.

**5. The deploy shrinks on its own.** `npm run build` runs a `postbuild` step,
`scripts/strip-offloaded-assets.mjs`, which deletes a folder from `out/data/`
only when its env var is set to an absolute `http(s)` URL. With the vars unset
it is a no-op, so steps 1-4 are safe to do in any order and the assets keep
shipping until the CDN is actually serving them.

(The files stay in git as a fallback. To also slim the repo,
`git rm -r --cached public/data/{cards,cardimg,hcards,hcardimg}` and add the
same four lines to `.gitignore`.)

## Rollback
Unset the four env vars and redeploy — the app falls back to the in-repo
`/data/...` paths and the postbuild step stops removing anything.
