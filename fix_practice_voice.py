#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fix_practice_voice.py  --  stop Rishika's voice when a practice page is exited.

PROBLEM: every practice page narrates via window.speechSynthesis, but none cancel
it on exit. speechSynthesis is a browser-global, so when the student leaves
(Syllabus / Back / Games / tab close) the voice keeps talking onto the next page.

FIX: inject one small idempotent <script> just before </body> that cancels speech
on pagehide / beforeunload / visibilitychange(hidden). Marked RISHI-STOP-VOICE-ON-EXIT
so re-running skips already-fixed pages.

USAGE (from D:\\rishi):
    python fix_practice_voice.py            # report only (dry run)
    python fix_practice_voice.py --apply    # actually inject the snippet
"""
import os, sys, glob

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "public", "practice")
MARKER = "RISHI-STOP-VOICE-ON-EXIT"
APPLY = "--apply" in sys.argv

SNIPPET = (
    "<script>\n"
    "/* " + MARKER + " */\n"
    "(function(){\n"
    "  function stopVoice(){ try{ if(window.speechSynthesis) window.speechSynthesis.cancel(); }catch(e){} }\n"
    "  window.addEventListener('pagehide', stopVoice);\n"
    "  window.addEventListener('beforeunload', stopVoice);\n"
    "  document.addEventListener('visibilitychange', function(){ if(document.visibilityState==='hidden') stopVoice(); });\n"
    "})();\n"
    "</script>\n"
)

def read(p):
    with open(p, "r", encoding="utf-8", newline="") as f:
        return f.read()

def write(p, t):
    with open(p, "w", encoding="utf-8", newline="") as f:
        f.write(t)

def main():
    if not os.path.isdir(ROOT):
        print("ERROR: not found ->", ROOT); sys.exit(1)
    files = sorted(glob.glob(os.path.join(ROOT, "**", "*.html"), recursive=True))
    fixed = skipped = no_anchor = 0
    for p in files:
        html = read(p)
        if MARKER in html:
            skipped += 1; continue
        if "</body>" not in html:
            no_anchor += 1
            print("  NO </body> (skipped):", os.path.relpath(p, HERE)); continue
        eol = "\r\n" if "\r\n" in html else "\n"
        snip = SNIPPET.replace("\n", eol)
        # insert before the LAST </body>
        idx = html.rfind("</body>")
        new = html[:idx] + snip + html[idx:]
        if APPLY:
            write(p, new)
        fixed += 1

    mode = "APPLIED" if APPLY else "DRY-RUN (use --apply to write)"
    print("=" * 60)
    print("practice pages scanned :", len(files))
    print("would-fix / fixed      :", fixed, "  [%s]" % mode)
    print("already had marker     :", skipped)
    print("no </body> anchor      :", no_anchor)

if __name__ == "__main__":
    main()
