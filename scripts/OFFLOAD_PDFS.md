# Offload report-card assets to a CDN / object store (deploy size: 485 MB → ~15 MB)

`public/data/` carries ~470 MB of report-card assets that ship in every deploy:

| Folder | Size | Files |
|---|---|---|
| `public/data/hcards` | 240 MB | 1,356 School-Head PDFs |
| `public/data/cards`  | 179 MB | 1,356 parent PDFs |
| `public/data/cardimg`| 51 MB  | 1,356 webp previews |

These are only fetched on demand (a tap to download, or the one inline preview
image per school page), so they belong on a CDN / object store, not in the Next
deploy. The code is already CDN-ready: `src/lib/cards.ts` reads three env vars
and falls back to the in-repo `/data/...` paths when they are unset, so nothing
breaks until you cut over.

```
NEXT_PUBLIC_CARD_BASE      # e.g. https://<cdn-host>/cards
NEXT_PUBLIC_CARDIMG_BASE   # e.g. https://<cdn-host>/cardimg
NEXT_PUBLIC_HCARD_BASE     # e.g. https://<cdn-host>/hcards
```

## Why not Vercel Blob
Blob was retired 2026-07-07: exceeding the Hobby *write* cap blocked the whole
store (403 on reads too). Prefer a store with no monthly write cap:
**Cloudflare R2** (10 GB free, zero egress fees) or **Backblaze B2**. Any
S3-compatible store works. A one-time bulk upload is well within free tiers.

## Cutover (you run these — they need your bucket + credentials)

**1. Create a public bucket** on R2 / B2 / S3 and note its public base URL.

**2. Bulk-upload the three folders** (rclone is provider-agnostic; configure a
remote named `cdn` once via `rclone config`):

```bash
rclone copy public/data/cards   cdn:<bucket>/cards   --transfers 32 --checksum
rclone copy public/data/cardimg cdn:<bucket>/cardimg --transfers 32 --checksum
rclone copy public/data/hcards  cdn:<bucket>/hcards  --transfers 32 --checksum
```
(Set `Content-Type: application/pdf` on the PDFs and `image/webp` on the images
so browsers preview them inline — rclone sets these from the extension by
default on most backends.)

**3. Set the env vars** in Vercel → Project → Settings → Environment Variables
(Production + Preview), pointing at the uploaded paths, then redeploy so they
inline into the build.

**4. Verify** a few downloads on the deployed site (parent card, School-Head
card, and an inline preview image) load from the CDN host.

**5. Stop shipping the assets in the deploy.** Create `.vercelignore` at the
repo root:
```
public/data/cards
public/data/cardimg
public/data/hcards
```
Redeploy → the deploy drops ~470 MB. (The files stay in git as a fallback; to
also slim the repo, `git rm -r --cached public/data/{cards,cardimg,hcards}` and
add the same three lines to `.gitignore`.)

## Rollback
Unset the three env vars (or delete `.vercelignore`) and redeploy — the app
falls back to the in-repo `/data/...` paths.
