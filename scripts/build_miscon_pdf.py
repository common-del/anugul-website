"""District Misconceptions Report PDF (public download).

Implements the Claude-Design spec (2026-07-09): 17 A4 pages — cover, ranked
at-a-glance summary, then ONE misconception card per page (15), ordered by
district trap_pct desc. Cards lead with the misconception ("what students got
wrong"), then the question (English stem + Odia xstem), all four options with
the correct/most-chosen-wrong rows tinted and tagged with their %, and a
"how to re-teach it" box. Only landscape stimuli are reprinted (a fixed bottom
band); portrait passage scans are noted, not reprinted.

Writes: public/data/downloads/misconceptions_report.pdf
Run after build_mislib.py:  python scripts/build_miscon_pdf.py
"""
import json
import os

import fitz

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, ".."))
FONT_R = os.path.join(HERE, "fonts", "NotoSansOriya-Regular.ttf")
FONT_B = os.path.join(HERE, "fonts", "NotoSansOriya-Bold.ttf")
IMG_DIR = os.path.join(ROOT, "public", "data", "miscon")
DST = os.path.join(ROOT, "public", "data", "downloads", "misconceptions_report.pdf")

mislib = json.load(open(os.path.join(ROOT, "src", "data", "officials", "mislib.json"),
                        encoding="utf-8"))
cards = mislib["cards"]
units_all = mislib["units"]["ALL"]

# ₹ (U+20B9) smoke-test mandated by the design: if the face lacks the glyph,
# substitute "Rs " at generation time instead of shipping tofu.
HAS_RUPEE = fitz.Font(fontfile=FONT_R).has_glyph(0x20B9) != 0
def esc(x):
    s = str(x).replace("&", "&amp;").replace("<", "&lt;")
    if not HAS_RUPEE:
        s = s.replace("₹", "Rs ")
    return s

A4 = fitz.paper_rect("a4")
BOX_FULL = fitz.Rect(36, 30, A4.width - 36, A4.height - 30)
BOX_CARD_IMG = fitz.Rect(36, 30, A4.width - 36, 552)
BAND_IMG = fitz.Rect(36, 566, A4.width - 36, A4.height - 30)

HAS_BOLD = os.path.exists(FONT_B) and os.path.getsize(FONT_B) > 10000
BOLD_FACE = (f"@font-face {{ font-family: noto; src: url({FONT_B.replace(os.sep, '/')}); font-weight: bold; }}\n"
             if HAS_BOLD else "")
CSS = f"""
@font-face {{ font-family: noto; src: url({FONT_R.replace(os.sep, '/')}); }}
{BOLD_FACE}* {{ font-family: noto, sans-serif; }}
body {{ font-size: 10px; color: #143726; }}
h1 {{ font-size: 17px; margin: 0; }}
h2 {{ font-size: 10.5px; margin: 13px 0 3px; color: #0A452F; }}
p {{ margin: 2px 0; }}
table {{ width: 100%; border-collapse: collapse; }}
td, th {{ padding: 3px 5px; border-bottom: 0.5px solid #D5E4DB; text-align: left; font-size: 9.5px; vertical-align: top; }}
th {{ background-color: #EDF5F0; color: #0A452F; }}
.hdr {{ background-color: #0E5A40; color: #ffffff; padding: 12px 14px; }}
.hdr h1 {{ color: #ffffff; }}
.hdr p {{ color: #D5E4DB; margin: 2px 0 0; }}
.strip td {{ border-bottom: 1.5px solid #0E5A40; color: #187A57; font-size: 8.5px; padding: 0 0 4px; }}
.r {{ text-align: right; }}
.lbl {{ font-size: 10.5px; font-weight: bold; color: #b3261e; margin: 10px 0 3px; }}
.mhead {{ font-size: 14.5px; font-weight: bold; color: #143726; margin: 0 0 8px; }}
.statband {{ background-color: #EDF5F0; padding: 7px 10px; }}
.good {{ color: #1e6b3a; }}
.bad {{ color: #b3261e; }}
.muted {{ color: #566579; }}
.small {{ font-size: 8.5px; }}
.odq {{ color: #566579; font-size: 10px; margin-top: 3px; }}
.od {{ color: #566579; font-size: 9.5px; }}
.opts td {{ padding: 5px 6px; }}
.okrow td {{ background-color: #EDF5F0; }}
.traprow td {{ background-color: #F9ECEA; }}
.fix {{ background-color: #EDF5F0; border-left: 3px solid #0E5A40; padding: 6px 9px; margin-top: 12px; }}
.foot {{ color: #566579; font-size: 8px; margin-top: 12px; }}
"""

SUBJ_DISPLAY = {"SST": "Social Science"}
SHORT = {  # editorial slugs for the summary table (design deliverable)
    "5|EVS|12": "Condensation confused with evaporation",
    "8|Odia|12": "Cause of deforestation misread from passage",
    "8|SST|4": "Forest fires blamed on nature, not people",
    "8|Science|5": "Starch-test steps confused with plant's needs",
    "8|Odia|8": "Absolute statement picked over main idea",
    "8|English|6": "Turtle facts: answer not found in passage",
    "8|Science|14": "Flat line on distance-time graph read as moving",
    "8|SST|11": "Handicraft decline pinned on taxes, not mill cloth",
    "8|Odia|14": "Strong-sounding opinion over text-supported one",
    "8|Odia|13": "Informative style confused with description",
    "8|Maths|10": "Ratio left unsimplified (decimals not cleared)",
    "8|Odia|3": "Literal event chosen over the story's theme",
    "5|Maths|2": "Adding first instead of rounding first",
    "8|Odia|4": "Narrative style confused with emotive",
    "8|English|12": "Green theme matched instead of the analogy",
}

order = sorted(units_all, key=lambda r: (-r["trap_pct"], r["key_pct"], r["g"], r["sub"], r["qno"]))
TOTAL = len(order) + 2
n_min = min(u["n"] for u in units_all)
n_max = max(u["n"] for u in units_all)

COVER = f"""
<div class="hdr">
<p>SAKSHAM · ଶିକ୍ଷାବର୍ଷ 2025-26</p>
<h1>Misconceptions Report</h1>
<p>The {len(order)} most important wrong answers students chose — and how to teach past them</p>
<p>Anugola District · Odisha</p>
</div>
<h2>ABOUT THIS REPORT</h2>
<p>In the 2025-26 SAKSHAM assessment, some wrong answers were not chosen at random.
Large numbers of children picked the same wrong option because they share the same
wrong idea — a misconception. This report collects the {len(order)} clearest cases from across
the district: what each question asked, which wrong answer pulled students in, what
that reveals about their thinking, and a practical way to re-teach the idea.</p>
<div class="statband" style="margin-top:8px">
<p><b>{len(order)}</b> misconceptions · Grades <b>5</b> and <b>8</b> · <b>6</b> subjects</p>
<p>Each question was answered by <b>{n_min:,}</b>-<b>{n_max:,}</b> students across Anugola district</p>
</div>
<h2>HOW TO READ EACH CARD</h2>
<p><b>1. The wrong idea.</b> Every card leads with the misconception, in plain words.</p>
<p><b>2. The question.</b> The item as students saw it (with the Odia original where
available) and all four options. The <b class="good">correct answer</b> and the
<b class="bad">most-chosen wrong answer</b> are marked, each with the share of
students who picked it.</p>
<p><b>3. How to re-teach it.</b> A short, concrete classroom response for teachers.</p>
<p class="small muted" style="margin-top:8px">Percentages are district-wide. They do not
add to 100 because some students chose other options or left the question blank. Where a
question followed a reading passage, the passage is not reprinted; each card gives the
context needed. One question's graph is reprinted on its card.</p>
<p class="foot">Public document · SAKSHAM 2025-26 · Generated from the same data as the
Anugola school report-card website · Page 1 of {TOTAL}</p>
"""

def _sum_row(rank, u):
    key = f"{u['g']}|{u['sub']}|{u['qno']}"
    return (f'<tr><td>{rank}</td><td>{u["g"]}</td>'
            f'<td>{esc(SUBJ_DISPLAY.get(u["sub"], u["sub"]))}</td>'
            f'<td>{esc(SHORT.get(key, ""))}</td>'
            f'<td class="r"><b class="bad">{u["trap_pct"]}%</b></td>'
            f'<td class="r"><b class="good">{u["key_pct"]}%</b></td>'
            f'<td class="r">{rank + 2}</td></tr>')

sum_rows = "".join(_sum_row(rank, u) for rank, u in enumerate(order, 1))

SUMMARY = f"""
<table class="strip"><tr><td>AT A GLANCE</td>
<td class="r">SAKSHAM 2025-26 · ANUGOLA DISTRICT</td></tr></table>
<div class="mhead" style="margin-top:10px">The {len(order)} misconceptions, ranked by how many
students chose the wrong answer</div>
<table style="margin-top:4px">
<tr><th>#</th><th>Grade</th><th>Subject</th><th>The wrong idea, in short</th>
<th class="r">Wrong</th><th class="r">Correct</th><th class="r">Page</th></tr>
{sum_rows}
</table>
<p class="small muted" style="margin-top:8px">Wrong = share choosing the most-chosen
wrong answer. Correct = share choosing the right answer. District-wide;
{n_min:,}-{n_max:,} students answered each question.</p>
<p class="foot">Page 2 of {TOTAL}</p>
"""


def option_rows(card, u):
    rows = []
    for L in "ABCD":
        if L not in card["opts"]:
            continue
        eng = esc(card["opts"][L])
        od = (card.get("oopts") or {}).get(L)
        od_line = f'<br><span class="od">{esc(od)}</span>' if od and od != card["opts"][L] else ""
        if L == card["key"]:
            cls, tag = ' class="okrow"', (f'<b class="good">CORRECT</b><br>'
                                          f'<span class="good">{u["key_pct"]}% of students</span>')
        elif L == card["trap"]:
            cls, tag = ' class="traprow"', (f'<b class="bad">MOST-CHOSEN WRONG</b><br>'
                                            f'<span class="bad">{u["trap_pct"]}% of students</span>')
        else:
            cls, tag = "", ""
        rows.append(f'<tr{cls}><td><b>{L}</b></td><td>{eng}{od_line}</td><td class="small">{tag}</td></tr>')
    return "".join(rows)


def stim_kind(card):
    img = card.get("img")
    if not img:
        return None, None
    path = os.path.join(ROOT, "public", img.lstrip("/").replace("/", os.sep))
    if not os.path.exists(path):
        return None, None
    pm = fitz.Pixmap(path)
    kind = "band" if pm.width >= pm.height else "passage"
    return kind, path


def card_page(rank, key, u):
    card = cards[key]
    kind, img_path = stim_kind(card)
    subj = esc(SUBJ_DISPLAY.get(u["sub"], u["sub"]).upper())
    xstem = card.get("xstem")
    odq = f'<p class="odq">{esc(xstem)}</p>' if xstem and xstem != card["stem"] else ""
    stim_note = {
        "band": '<p class="small muted" style="margin-top:3px">The graph students saw is reprinted at the bottom of this page.</p>',
        "passage": '<p class="small muted" style="margin-top:3px">This question followed a printed passage (not reprinted here).</p>',
    }.get(kind, "")
    lowconf = ("" if u.get("conf") == "ok" else
               ' <span class="muted">Fewer responses than usual — treat these figures as indicative.</span>')
    html = f"""
<table class="strip"><tr><td>MISCONCEPTION {rank} OF {len(order)}</td>
<td class="r">GRADE {u["g"]} · {subj} · LO {esc(card["lo"])} · Q{u["qno"]}</td></tr></table>
<p class="lbl">WHAT STUDENTS GOT WRONG</p>
<div class="mhead">{esc(card["mis"])}</div>
<div class="statband">Of <b>{u["n"]:,}</b> students, <b class="bad">{u["trap_pct"]}%</b>
chose {card["trap"]} — the most-chosen wrong answer — while
<b class="good">{u["key_pct"]}%</b> chose the correct answer {card["key"]}.{lowconf}</div>
<h2>THE QUESTION</h2>
<p><b>{esc(card["stem"])}</b></p>
{odq}
{stim_note}
<h2>WHAT STUDENTS ANSWERED</h2>
<table class="opts">{option_rows(card, u)}</table>
<div class="fix"><b>HOW TO RE-TEACH IT</b><br>{esc(card["note"])}</div>
<p class="foot">Source: SAKSHAM 2025-26 assessment · Anugola district government
schools · Page {rank + 2} of {TOTAL}</p>
"""
    return html, kind, img_path


doc = fitz.open()
for html in (COVER, SUMMARY):
    page = doc.new_page(width=A4.width, height=A4.height)
    page.insert_htmlbox(BOX_FULL, html, css=CSS)

for rank, u in enumerate(order, 1):
    key = f"{u['g']}|{u['sub']}|{u['qno']}"
    html, kind, img_path = card_page(rank, key, u)
    page = doc.new_page(width=A4.width, height=A4.height)
    page.insert_htmlbox(BOX_CARD_IMG if kind == "band" else BOX_FULL, html, css=CSS)
    if kind == "band":
        pm = fitz.Pixmap(img_path)
        s = min(BAND_IMG.width / pm.width, BAND_IMG.height / pm.height)
        w, h = pm.width * s, pm.height * s
        x0 = BAND_IMG.x0 + (BAND_IMG.width - w) / 2
        y0 = BAND_IMG.y0 + (BAND_IMG.height - h) / 2
        page.insert_image(fitz.Rect(x0, y0, x0 + w, y0 + h), filename=img_path)

doc.subset_fonts()
doc.save(DST, deflate=True, garbage=3)
doc.close()
print(f"misconceptions_report.pdf: {TOTAL} pages, rupee glyph={'native' if HAS_RUPEE else 'Rs-substituted'}, "
      f"bold face={'embedded' if HAS_BOLD else 'regular-only'} "
      f"({os.path.getsize(DST) / 1024:.0f} KB)")
