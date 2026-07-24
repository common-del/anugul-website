"""
Apply the official government renames of Angul's district + blocks to every
emitted data file, in place.

Renamed 2026 (English/romanised spellings): Angul -> Anugola, Athamallik ->
Athamalik, Pallahara -> Palalahada, Talcher -> Talachera. (Banarpal,
Chhendipada, Kaniha, Kishore Nagar are unchanged.)

Design decisions:
  * Only DISPLAY VALUES change. Slugs, JSON filenames, and PDF filenames keep
    the original spelling (they are lowercase, e.g. "talcher", so they never
    match a rename key) — this keeps URLs and asset references stable.
  * School names and cluster names are NEVER touched: no school/cluster is
    exactly equal to an old block name, so an exact-whole-string match is safe.
  * mislib.json uses compound unit keys like "B::Angul"; the "B::" prefix is
    handled explicitly.
  * The Odia native spelling of the district is left to the i18n catalogs
    (od.json) — not decided here.

Idempotent: once renamed, the old spellings are gone, so re-running is a no-op.
This is called at the end of build_data.py so a fresh `npm run data` stays
renamed, and can also be run standalone:  python scripts/apply_unit_renames.py
"""

import csv
import io
import json
import os

RENAME = {
    "Angul": "Anugola",
    "Athamallik": "Athamalik",
    "Pallahara": "Palalahada",
    "Talcher": "Talachera",
}

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, ".."))


def _ren(v):
    """Rename a string that is exactly an old name, or a 'B::<name>' key."""
    if isinstance(v, str):
        if v in RENAME:
            return RENAME[v]
        if v.startswith("B::") and v[3:] in RENAME:
            return "B::" + RENAME[v[3:]]
    return v


def _walk(o):
    if isinstance(o, dict):
        return {_ren(k): _walk(x) for k, x in o.items()}
    if isinstance(o, list):
        return [_walk(x) for x in o]
    return _ren(o)


def _count(o):
    """Count how many exact/prefixed occurrences would change (for reporting)."""
    n = 0
    if isinstance(o, dict):
        for k, x in o.items():
            if _ren(k) != k:
                n += 1
            n += _count(x)
    elif isinstance(o, list):
        for x in o:
            n += _count(x)
    else:
        if _ren(o) != o:
            n += 1
    return n


def _json_files():
    rel = [
        "src/data/schools.json",
        "src/data/district.json",
        "src/data/_qa.json",
        "src/data/officials/district.json",
        "src/data/officials/misconceptions.json",
        "src/data/officials/mislib.json",
        "src/data/officials/items.json",
        "src/data/officials/cluster-index.json",
        "public/data/search-index.json",
        "public/data/district-map.json",
    ]
    out = [os.path.join(ROOT, p) for p in rel]
    for sub in ("src/data/officials/blocks", "src/data/officials/clusters", "public/data/school"):
        d = os.path.join(ROOT, sub)
        if os.path.isdir(d):
            out += [os.path.join(d, f) for f in os.listdir(d) if f.endswith(".json")]
    return [p for p in out if os.path.isfile(p)]


def _rewrite_json(path):
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    changed = _count(data)
    if not changed:
        return 0
    data = _walk(data)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    return changed


def _rewrite_csv(path):
    with open(path, "rb") as f:
        raw = f.read()
    has_bom = raw.startswith(b"\xef\xbb\xbf")
    text = raw.decode("utf-8-sig")
    rows = list(csv.reader(io.StringIO(text)))
    if not rows:
        return 0
    header = rows[0]
    if "block" not in header:
        return 0
    bi = header.index("block")
    changed = 0
    for r in rows[1:]:
        if len(r) > bi and r[bi] in RENAME:
            r[bi] = RENAME[r[bi]]
            changed += 1
    if not changed:
        return 0
    buf = io.StringIO()
    csv.writer(buf, lineterminator="\r\n").writerows(rows)
    out = buf.getvalue()
    enc = "utf-8-sig" if has_bom else "utf-8"
    with open(path, "w", encoding=enc, newline="") as f:
        f.write(out)
    return changed


# --- URL slugs (2026-07-09 decision): slugs DO follow the new spellings. ---
# Old URLs keep working via redirects in vercel.json. Targeted field renames
# only (never a blanket walk): a lowercase exact-match walk could collide with
# cluster slugs, which are school-name-based and must not change.
SLUG_RENAME = {
    "angul": "anugola",
    "athamallik": "athamalik",
    "pallahara": "palalahada",
    "talcher": "talachera",
}


def _slug(v):
    return SLUG_RENAME.get(v, v)


def _rewrite_slugs():
    changed = 0
    off = os.path.join(ROOT, "src", "data", "officials")

    # district.json: blocks[].slug
    p = os.path.join(off, "district.json")
    if os.path.isfile(p):
        d = json.load(open(p, encoding="utf-8"))
        for b in d.get("blocks", []):
            if b.get("slug") in SLUG_RENAME:
                b["slug"] = _slug(b["slug"])
                changed += 1
        json.dump(d, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))

    # blocks/<slug>.json: rename file + inner "slug" field
    bdir = os.path.join(off, "blocks")
    if os.path.isdir(bdir):
        for f in list(os.listdir(bdir)):
            stem = f[:-5]
            if f.endswith(".json") and stem in SLUG_RENAME:
                d = json.load(open(os.path.join(bdir, f), encoding="utf-8"))
                if d.get("slug") in SLUG_RENAME:
                    d["slug"] = _slug(d["slug"])
                new = os.path.join(bdir, f"{_slug(stem)}.json")
                json.dump(d, open(new, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
                os.remove(os.path.join(bdir, f))
                changed += 1

    # clusters/*.json: blockSlug field
    cdir = os.path.join(off, "clusters")
    if os.path.isdir(cdir):
        for f in os.listdir(cdir):
            if not f.endswith(".json"):
                continue
            p = os.path.join(cdir, f)
            d = json.load(open(p, encoding="utf-8"))
            if d.get("blockSlug") in SLUG_RENAME:
                d["blockSlug"] = _slug(d["blockSlug"])
                json.dump(d, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
                changed += 1

    # block PDF filenames (contents untouched by decision)
    pdir = os.path.join(ROOT, "public", "data", "downloads", "blocks")
    if os.path.isdir(pdir):
        for f in list(os.listdir(pdir)):
            stem = f[:-4]
            if f.endswith(".pdf") and stem in SLUG_RENAME:
                os.replace(os.path.join(pdir, f), os.path.join(pdir, f"{_slug(stem)}.pdf"))
                changed += 1

    return changed


def apply():
    total = 0
    for p in _json_files():
        total += _rewrite_json(p)
    dl = os.path.join(ROOT, "public", "data", "downloads")
    if os.path.isdir(dl):
        for f in os.listdir(dl):
            if f.endswith(".csv"):
                total += _rewrite_csv(os.path.join(dl, f))
    slugs = _rewrite_slugs()
    print(f"  applied unit renames: {total} value(s)/key(s) + {slugs} slug change(s)")
    return total + slugs


if __name__ == "__main__":
    apply()
