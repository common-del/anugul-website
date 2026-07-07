"""Render every page of each printed parent report card, stacked into one small
WebP preview shown inline on the school page (clicking it downloads the full PDF
from Blob). Angul cards are 2-page, all other blocks 1-page — both handled by
stacking all pages vertically.

Source: the original Output PDFs (same tree the Blob cards were built from),
restricted to the udises in the card manifest (public/data/pdf-cards.json).
Out:    public/data/cardimg/<UDISE>.webp
Run:    python scripts/build_cardimg.py   (idempotent — skips existing)
"""
import json, os, re, time
import fitz
from PIL import Image

SRC = os.environ.get("CARD_SRC", r"C:\Users\CSF\Desktop\Anugul_Parent\Output")
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, "..", "public", "data", "cardimg"))
MANIFEST = os.path.normpath(os.path.join(HERE, "..", "public", "data", "pdf-cards.json"))
DPI, Q, GAP = 90, 73, 14  # GAP = white pixels between stacked pages
os.makedirs(OUT, exist_ok=True)
keep = set(json.load(open(MANIFEST, encoding="utf-8")))

udise_re = re.compile(r"(\d{11})")
files = []
for root, _, names in os.walk(SRC):
    for n in names:
        if n.lower().endswith(".pdf"):
            files.append(os.path.join(root, n))
files.sort()

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

done = skipped = 0
seen = set()
t0 = time.time()
for i, f in enumerate(files):
    m = udise_re.match(os.path.basename(f))
    if not m:
        continue
    u = m.group(1)
    if u in seen or u not in keep:
        continue
    seen.add(u)
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
print(f"cardimg: made {done}, skipped {skipped}, total {len(sizes)} files, "
      f"avg {sum(sizes)//len(sizes)//1024} KB, total {sum(sizes)//1024//1024} MB, {time.time()-t0:.0f}s")
