"""Render every page of each School-Head (3-page) report card, stacked into one
small WebP preview shown inline on the principal page — the head equivalent of
build_cardimg.py. Unlike the parent cards, the source PDFs are already in-repo
(public/data/hcards), so this needs no external source tree.

Out: public/data/hcardimg/<UDISE>.webp
Run: python scripts/build_hcardimg.py   (idempotent — skips existing)
"""
import os, glob, time
import fitz
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, ".."))
SRC = os.path.join(ROOT, "public", "data", "hcards")
OUT = os.path.join(ROOT, "public", "data", "hcardimg")
DPI, Q, GAP = 90, 73, 14  # match build_cardimg.py
os.makedirs(OUT, exist_ok=True)


def stack(doc):
    imgs = []
    for pg in doc:
        pix = pg.get_pixmap(dpi=DPI)
        imgs.append(Image.frombytes("RGB", [pix.width, pix.height], pix.samples))
    if len(imgs) == 1:
        return imgs[0]
    w = max(im.width for im in imgs)
    h = sum(im.height for im in imgs) + GAP * (len(imgs) - 1)
    canvas = Image.new("RGB", (w, h), "white")
    y = 0
    for im in imgs:
        canvas.paste(im, ((w - im.width) // 2, y))
        y += im.height + GAP
    return canvas


files = sorted(glob.glob(os.path.join(SRC, "*.pdf")))
done = skipped = 0
t0 = time.time()
for i, f in enumerate(files):
    u = os.path.splitext(os.path.basename(f))[0]
    dst = os.path.join(OUT, f"{u}.webp")
    if os.path.exists(dst) and os.path.getsize(dst) > 0:
        skipped += 1
        continue
    try:
        d = fitz.open(f)
        stack(d).save(dst, "WEBP", quality=Q, method=4)
        d.close()
        done += 1
    except Exception as e:
        print("ERR", os.path.basename(f), e, flush=True)
    if (i + 1) % 300 == 0:
        print(f"  {i+1}/{len(files)} ({time.time()-t0:.0f}s)", flush=True)

sizes = [os.path.getsize(os.path.join(OUT, x)) for x in os.listdir(OUT) if x.endswith(".webp")]
print(f"hcardimg: made {done}, skipped {skipped}, total {len(sizes)} files, "
      f"avg {sum(sizes)//len(sizes)//1024} KB, total {sum(sizes)//1024//1024} MB, {time.time()-t0:.0f}s")
