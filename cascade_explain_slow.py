#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
cascade_explain_slow.py  --  roll the shared "slow & paced narration" upgrade
=============================================================================
Adds ONE include line to every standard-template explain page:

    <script src="/rishi-explain-slow.js?v=1"></script>

That shared file (public/rishi-explain-slow.js) overrides the global nextStep()
with a paced version (minimum dwell per step + hard cap) so narration never
races -- the universal "too fast" fix. ALL behaviour lives in the shared file;
this script only injects the include, so it is low-risk and easy to undo.

WHAT IT TOUCHES
  * Standard pages = those with the template auto-start  setTimeout(startAnim,800)
  * SKIPS the bespoke v3 page (defines `function buildScene` -> squares), which
    already has the slow narrated engine.
  * SKIPS any page already carrying the include (idempotent).
  * Anything that matches neither is reported and left untouched.

USAGE (run from D:\\rishi):
    python cascade_explain_slow.py            # dry-run, writes nothing
    python cascade_explain_slow.py --apply    # actually inject the include
"""

import os, sys, glob

HERE        = os.path.dirname(os.path.abspath(__file__))
EXPLAIN_DIR = os.path.join(HERE, "public", "explain")
INCLUDE     = '<script src="/rishi-explain-slow.js?v=1"></script>'
MARKER      = 'rishi-explain-slow.js'          # idempotency check
STD_ANCHOR  = 'setTimeout(startAnim,800)'      # standard-template auto-start
V3_MARKER   = 'function buildScene'            # the bespoke v3 page (squares)
DO_APPLY    = "--apply" in sys.argv


def read(p):
    with open(p, "r", encoding="utf-8", newline="") as f:
        return f.read()

def write(p, t):
    with open(p, "w", encoding="utf-8", newline="") as f:
        f.write(t)


def main():
    if not os.path.isdir(EXPLAIN_DIR):
        print("ERROR: not found ->", EXPLAIN_DIR); sys.exit(1)

    files = sorted(glob.glob(os.path.join(EXPLAIN_DIR, "**", "*.html"), recursive=True))
    print("cascade_explain_slow  " + ("(--apply)" if DO_APPLY else "(dry-run)"))
    print("pages found:", len(files))
    print("=" * 70)

    injected = already = v3 = nonstd = 0
    skipped_nonstd = []

    for p in files:
        html = read(p)
        rel  = os.path.relpath(p, HERE)

        if MARKER in html:
            already += 1
            continue
        if V3_MARKER in html:
            v3 += 1
            print("  v3 (skip)   ", rel)
            continue
        if STD_ANCHOR not in html:
            nonstd += 1
            skipped_nonstd.append(rel)
            continue

        eol = "\r\n" if "\r\n" in html else "\n"
        tag = INCLUDE + eol
        if "</body>" in html:
            new = html.replace("</body>", tag + "</body>", 1)
        else:
            new = html + eol + tag

        injected += 1
        if DO_APPLY:
            write(p, new)
            print("  INJECTED    ", rel)
        else:
            print("  would inject", rel)

    print("=" * 70)
    print("SUMMARY")
    print("  injected ........ %d %s" % (injected, "" if DO_APPLY else "(dry-run; re-run with --apply)"))
    print("  already had it .. %d" % already)
    print("  v3 page skipped . %d" % v3)
    print("  non-standard .... %d" % nonstd)
    if skipped_nonstd:
        print("\nNon-standard pages (left untouched -- review if you expected them):")
        for r in skipped_nonstd:
            print("   ", r)


if __name__ == "__main__":
    main()
