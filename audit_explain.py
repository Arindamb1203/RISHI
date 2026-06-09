#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
audit_explain.py  --  RISHI explain-page auditor
=================================================
Scans EVERY explain page (CBSE class6-9 + ICSE class6-9) and checks 2 things:

  1. ANIMATION   -- is the "Live Animation" a real visual animation, or just
                    fading text?  (real = uses shapes / SMIL / CSS keyframes /
                    known visual builders like pill(), _tile(), _bar() ...)
  2. I DON'T     -- is the shared "I Don't Understand" engine included?
     UNDERSTAND    (i.e. <script src="/explain-helper.js"></script> present)

Behaviour (matches owner's instruction "if found skip untouched, else correct"):
  * I Don't Understand button .... AUTO-FIXABLE.  With --fix it inserts the
    standard <script src="/explain-helper.js"></script> tag on any page missing
    it (placed right before /error-reporter.js, else before </body>).
  * Animation ..................... NOT auto-fixable.  A real animation has to be
    designed per concept by hand (see powers-exponents.html as the template) --
    a script cannot invent creative SVG scenes without producing the same
    "text-pretending-to-be-animation" garbage we are trying to remove.  So
    text-only pages are REPORTED for manual rewrite, never silently rewritten.

USAGE (run from D:\\rishi):
    python audit_explain.py            # report only, touches nothing
    python audit_explain.py --fix      # report + auto-insert the missing button
                                        #   tag (animations still report-only)

A full report is also written to  audit_explain_report.txt
"""

import os
import re
import sys
import glob

HERE        = os.path.dirname(os.path.abspath(__file__))
EXPLAIN_DIR = os.path.join(HERE, "public", "explain")
HELPER_TAG  = '<script src="/explain-helper.js"></script>'
REPORTER    = '<script src="/error-reporter.js"></script>'
REPORT_FILE = os.path.join(HERE, "audit_explain_report.txt")

DO_FIX = "--fix" in sys.argv


# ---------------------------------------------------------------- helpers
def read(path):
    with open(path, "r", encoding="utf-8", newline="") as f:
        return f.read()

def write(path, text):
    with open(path, "w", encoding="utf-8", newline="") as f:
        f.write(text)

def board_class(path):
    """Return a human label like 'CBSE 8' / 'ICSE 6' from the file path."""
    p = path.replace("\\", "/")
    board = "ICSE" if "/explain/icse/" in p else "CBSE"
    m = re.search(r"/class(\d)", p)
    cls = m.group(1) if m else "?"
    return board, cls


# ---------------------------------------------------------------- checks
def has_button(html):
    return "explain-helper.js" in html

# Signals that an animation is a REAL visual one (not just fading <text>).
SHAPE_RE   = re.compile(r"<(?:circle|line|polygon|path|ellipse|image|use)\b")
SMIL_RE    = re.compile(r"<animate\b|<animateTransform\b|<animateMotion\b")
KEYFRAME_RE = re.compile(r"@keyframes")
BUILDER_RE = re.compile(r"\b(?:pill|_tile|_bar|_line|arrow|drawBar|drawArrow|barChart|numberLine|dotGrid)\s*\(")
TEXT_IN_SVG_RE = re.compile(r"<text\b")

def classify_anim(html):
    """Return (verdict, evidence_dict). verdict in REAL / TEXT-ONLY / UNSURE."""
    shapes    = len(SHAPE_RE.findall(html))
    smil      = len(SMIL_RE.findall(html))
    keyframes = len(KEYFRAME_RE.findall(html))
    builders  = len(BUILDER_RE.findall(html))
    texts     = len(TEXT_IN_SVG_RE.findall(html))
    ev = dict(shapes=shapes, smil=smil, keyframes=keyframes,
              builders=builders, texts=texts)

    score = shapes + smil + keyframes + builders
    if score > 0:
        return "REAL", ev
    # no visual signals at all
    if texts > 0:
        return "TEXT-ONLY", ev
    return "UNSURE", ev


def fix_button(html):
    """Insert the standard helper tag. Returns new html (or same if can't)."""
    if has_button(html):
        return html, False
    eol = "\r\n" if "\r\n" in html else "\n"
    tag = HELPER_TAG + eol
    if REPORTER in html:
        return html.replace(REPORTER, tag + REPORTER, 1), True
    if "</body>" in html:
        return html.replace("</body>", tag + "</body>", 1), True
    # last resort: append
    return html + eol + tag, True


# ---------------------------------------------------------------- main
def main():
    if not os.path.isdir(EXPLAIN_DIR):
        print("ERROR: not found ->", EXPLAIN_DIR)
        sys.exit(1)

    files = sorted(glob.glob(os.path.join(EXPLAIN_DIR, "**", "*.html"),
                             recursive=True))
    lines = []
    def out(s=""):
        print(s)
        lines.append(s)

    out("RISHI explain-page audit" + ("  (--fix ON)" if DO_FIX else "  (report only)"))
    out("scanned root: " + EXPLAIN_DIR)
    out("files found : %d" % len(files))
    out("=" * 78)

    n_btn_ok = n_btn_fixed = 0
    text_only = []      # animation needs manual rewrite
    unsure    = []
    btn_missing = []

    hdr = "%-6s %-4s  %-34s  %-10s  %-12s" % ("BOARD", "CLS", "FILE", "ANIM", "BUTTON")
    out(hdr)
    out("-" * 78)

    for path in files:
        html = read(path)
        board, cls = board_class(path)
        name = os.path.basename(path)

        anim, ev = classify_anim(html)

        if has_button(html):
            btn = "ok"
            n_btn_ok += 1
        else:
            btn_missing.append(path)
            if DO_FIX:
                html, changed = fix_button(html)
                if changed:
                    write(path, html)
                    btn = "FIXED"
                    n_btn_fixed += 1
                else:
                    btn = "MISSING!"
            else:
                btn = "MISSING"

        if anim == "TEXT-ONLY":
            text_only.append(path)
        elif anim == "UNSURE":
            unsure.append(path)

        flag = "" if anim == "REAL" else "  <-- review"
        out("%-6s %-4s  %-34s  %-10s  %-12s%s" %
            (board, cls, name[:34], anim, btn, flag))

    out("=" * 78)
    out("SUMMARY")
    out("  pages scanned ............ %d" % len(files))
    out("  button present ........... %d" % n_btn_ok)
    out("  button missing ........... %d" % len(btn_missing))
    if DO_FIX:
        out("  button AUTO-FIXED ........ %d" % n_btn_fixed)
    out("  animation REAL ........... %d" % (len(files) - len(text_only) - len(unsure)))
    out("  animation TEXT-ONLY ...... %d   (manual rewrite needed)" % len(text_only))
    out("  animation UNSURE ......... %d   (eyeball these)" % len(unsure))

    if text_only:
        out("")
        out("TEXT-ONLY animations (rewrite by hand, template = powers-exponents.html):")
        for p in text_only:
            out("   " + os.path.relpath(p, HERE))
    if unsure:
        out("")
        out("UNSURE (no shapes AND no text detected in animation - check manually):")
        for p in unsure:
            out("   " + os.path.relpath(p, HERE))
    if btn_missing and not DO_FIX:
        out("")
        out("Button MISSING (run with --fix to auto-insert):")
        for p in btn_missing:
            out("   " + os.path.relpath(p, HERE))

    write(REPORT_FILE, "\n".join(lines))
    out("")
    out("report written -> " + os.path.relpath(REPORT_FILE, HERE))


if __name__ == "__main__":
    main()
