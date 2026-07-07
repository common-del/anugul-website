"""Extracts the full-fidelity misconception library from the SAKSHAM Academic
LO report (the embedded `const D=` dataset) — item stimulus images, stem,
extended stem, all options (with Odia originals), correct/trap options, the
percentage choosing each, the misconception text and the teaching response.
Nothing is truncated; the site renders these cards exactly as the HTML does.

Writes:
  src/data/officials/mislib.json      { cards: {id: card}, units: {unit: rows} }
  public/data/miscon/<id>.png         stimulus images (decoded from base64)

Run after build_data.py:  python scripts/build_mislib.py
Source override: env SAKSHAM_SOURCE (same as build_data.py).
"""
import base64
import json
import os
import re

SRC_DIR = os.environ.get("SAKSHAM_SOURCE", r"D:\Claude_Cowork_CSF\SAKSHAM_Analysis")
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, ".."))
OUT_JSON = os.path.join(ROOT, "src", "data", "officials", "mislib.json")
IMG_DIR = os.path.join(ROOT, "public", "data", "miscon")
os.makedirs(IMG_DIR, exist_ok=True)

html = open(os.path.join(SRC_DIR, "SAKSHAM_Academic_LO_Report.html"),
            encoding="utf-8", errors="ignore").read()
m = re.search(r"const D=(\{)", html)
obj, _ = json.JSONDecoder().raw_decode(html[m.end(1) - 1:])

mislib = obj["mislib"]
misu = obj["acad"]["misu"]

cards = {}
for key, card in mislib.items():
    g, sub, qno = key.split("|")
    cid = f"{g}_{sub}_{qno}"
    c = dict(card)
    img = c.pop("img", None)
    if img and img.startswith("data:image/"):
        head, b64 = img.split(",", 1)
        ext = "png" if "png" in head else "jpg"
        fn = f"{cid}.{ext}"
        with open(os.path.join(IMG_DIR, fn), "wb") as f:
            f.write(base64.b64decode(b64))
        c["img"] = f"/data/miscon/{fn}"
    cards[key] = c

# keep the district (ALL) and per-block unit rows; clusters would balloon the
# payload and the site renders district + block views only
units = {k: v for k, v in misu.items() if k == "ALL" or k.startswith("B::")}

json.dump({"cards": cards, "units": units},
          open(OUT_JSON, "w", encoding="utf-8"), ensure_ascii=False,
          separators=(",", ":"))
imgs = len([f for f in os.listdir(IMG_DIR)])
print(f"mislib: {len(cards)} cards ({imgs} stimulus images), "
      f"units: {sorted(units.keys())}")
