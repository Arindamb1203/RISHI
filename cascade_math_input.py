#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
cascade_math_input.py  --  add the shared math typing keyboard to every explain page
====================================================================================
Injects ONE include line before </body>:

    <script src="/rishi-math-input.js?v=1"></script>

That shared file (public/rishi-math-input.js) fills the confirm-question chip
strip with a math keyboard (x², x³, xⁿ, √, ³√, a/b, (), ×10ⁿ, π) + a clean live
preview, on the 127 "basic" pages. It self-skips the 13 rich pages at runtime.
All behaviour lives in the shared file, so this only adds an include -> low risk.

USAGE (run from D:\\rishi):
    python cascade_math_input.py            # dry-run, writes nothing
    python cascade_math_input.py --apply    # inject the include
"""

import os, sys, glob

HERE        = os.path.dirname(os.path.abspath(__file__))
EXPLAIN_DIR = os.path.join(HERE, "public", "explain")
INCLUDE     = '<script src="/rishi-math-input.js?v=1"></script>'
MARKER      = 'rishi-math-input.js'
ANCHOR      = 'id="rawAnswer"'          # only pages that actually have a confirm input
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
    print("cascade_math_input  " + ("(--apply)" if DO_APPLY else "(dry-run)"))
    print("pages found:", len(files))
    print("=" * 66)

    injected = already = noinput = 0
    skipped = []

    for p in files:
        html = read(p); rel = os.path.relpath(p, HERE)
        if MARKER in html:
            already += 1; continue
        if ANCHOR not in html:
            noinput += 1; skipped.append(rel); continue

        eol = "\r\n" if "\r\n" in html else "\n"
        tag = INCLUDE + eol
        new = html.replace("</body>", tag + "</body>", 1) if "</body>" in html else (html + eol + tag)

        injected += 1
        if DO_APPLY:
            write(p, new); print("  INJECTED    ", rel)
        else:
            print("  would inject", rel)

    print("=" * 66)
    print("SUMMARY")
    print("  injected ......... %d %s" % (injected, "" if DO_APPLY else "(dry-run; --apply to write)"))
    print("  already had it ... %d" % already)
    print("  no confirm input . %d" % noinput)
    if skipped:
        print("\nPages without a confirm input (left untouched):")
        for r in skipped: print("   ", r)


if __name__ == "__main__":
    main()
