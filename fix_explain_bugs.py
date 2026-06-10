#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fix_explain_bugs.py -- fix 3 explain-page bugs (found on powers-exponents, but
several pages share them):

  1. goPractice() points to /practice.html?chapter=SLUG  -> that page does NOT
     exist -> lands on the RISHI landing page. Correct = the page's own practice
     file (same path with /explain/ -> /practice/).
  2. goExam() points to /exam.html?chapter=SLUG -> wrong param. Correct =
     /exam.html?ch=NN (authoritative ch from syllabus, table below).
  3. showQ() does not reset confirmShown -> the confirm question only shows on
     Q1; Q2+ hit `if(confirmShown)return` and show nothing until a refresh.
     Working pages (e.g. squares) reset it: stepIdx=0;nudgeCount=0;confirmShown=false;

USAGE (from D:\\rishi):
    python fix_explain_bugs.py            # dry run
    python fix_explain_bugs.py --apply
"""
import os, re, sys, glob

HERE = os.path.dirname(os.path.abspath(__file__))
EXPLAIN = os.path.join(HERE, "public", "explain")
APPLY = "--apply" in sys.argv

# basename (no .html) -> exam ch  (verified against syllabus.html)
EXAM_CH = {
  "rational-numbers":"01","understanding-quadrilaterals":"03","practical-geometry":"04",
  "frequency-distribution":"05","comparing-quantities":"08","algebraic-expressions-identities":"09",
  "visualising-solid-shapes":"10","area-plane-figures":"11a","surface-area-volume":"11b",
  "powers-exponents":"12","direct-inverse-proportions":"13","factorisation":"14",
  "introduction-to-graphs":"15","playing-with-numbers":"16","chance-probability":"17",
  "linear-equations":"02",
}

PRAC_RE = re.compile(r'location\.href\s*=\s*["\']/practice\.html\?chapter=[^"\']*["\']')
EXAM_RE = re.compile(r'location\.href\s*=\s*["\']/exam\.html\?chapter=[^"\']*["\']')

def read(p):
    with open(p, "r", encoding="utf-8", newline="") as f: return f.read()
def write(p, t):
    with open(p, "w", encoding="utf-8", newline="") as f: f.write(t)

def main():
    files = sorted(glob.glob(os.path.join(EXPLAIN, "**", "*.html"), recursive=True))
    n_prac = n_exam = n_conf = 0
    changed = []
    for p in files:
        html = read(p)
        orig = html
        rel = os.path.relpath(p, EXPLAIN).replace("\\", "/")        # class8/arithmetic/foo.html
        base = os.path.splitext(os.path.basename(p))[0]
        notes = []

        # 1. practice link -> deterministic
        if PRAC_RE.search(html):
            html = PRAC_RE.sub('location.href="/practice/' + rel + '"', html)
            n_prac += 1; notes.append("practice")

        # 2. exam link -> /exam.html?ch=NN (only if we have an authoritative ch)
        if EXAM_RE.search(html) and base in EXAM_CH:
            html = EXAM_RE.sub('location.href="/exam.html?ch=' + EXAM_CH[base] + '"', html)
            n_exam += 1; notes.append("exam")

        # 3. confirmShown reset in showQ (only the exact safe pattern; skip if already reset)
        if "if(confirmShown)return" in html and "nudgeCount=0;confirmShown=false" not in html \
           and "stepIdx=0;nudgeCount=0;" in html:
            html = html.replace("stepIdx=0;nudgeCount=0;", "stepIdx=0;nudgeCount=0;confirmShown=false;", 1)
            n_conf += 1; notes.append("confirmShown")

        if html != orig:
            changed.append((rel, notes))
            if APPLY: write(p, html)

    print("=" * 70)
    print("MODE:", "APPLIED" if APPLY else "DRY-RUN")
    print("practice-link fixes :", n_prac)
    print("exam-link fixes     :", n_exam)
    print("confirmShown fixes  :", n_conf)
    print("files changed       :", len(changed))
    print("-" * 70)
    for rel, notes in changed:
        print("  %-55s %s" % (rel, ",".join(notes)))

if __name__ == "__main__":
    main()
