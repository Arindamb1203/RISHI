#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fix_emoji_speech.py -- stop the system (browser) voice from reading emoji aloud.

PROBLEM: when the browser speechSynthesis voice speaks narration that contains an
emoji (e.g. the intro "Hi <name>! the system voice literally says
"smiling face". (Explain pages hit this when ElevenLabs /tts fails and they fall
back to speechSynthesis; practice pages always use speechSynthesis.)

FIX: inject one idempotent <script> (marker RISHI-STRIP-EMOJI-SPEECH) before
</body> that monkey-patches speechSynthesis.speak() to strip emoji/symbol chars
from the utterance text just before speaking. This ONLY touches the system-voice
path -- ElevenLabs (fetch /tts) is untouched and still receives the full text.

Targets: explain + practice pages (the page types that narrate).

USAGE (from D:\\rishi):
    python fix_emoji_speech.py            # dry run
    python fix_emoji_speech.py --apply    # inject
"""
import os, sys, glob

HERE = os.path.dirname(os.path.abspath(__file__))
ROOTS = [os.path.join(HERE, "public", "explain"),
         os.path.join(HERE, "public", "practice")]
MARKER = "RISHI-STRIP-EMOJI-SPEECH"
APPLY = "--apply" in sys.argv

# Monkey-patch speechSynthesis.speak to strip emoji/pictographs/symbols + ZWJ/VS16.
SNIPPET = (
    "<script>\n"
    "/* " + MARKER + " */\n"
    "(function(){\n"
    "  if(!window.speechSynthesis||!window.SpeechSynthesisUtterance)return;\n"
    "  var _speak=window.speechSynthesis.speak.bind(window.speechSynthesis);\n"
    "  var EMO=/[\\u{1F000}-\\u{1FAFF}\\u{2600}-\\u{27BF}\\u{2B00}-\\u{2BFF}\\u{1F1E6}-\\u{1F1FF}\\u{FE00}-\\u{FE0F}\\u{200D}]/gu;\n"
    "  window.speechSynthesis.speak=function(u){\n"
    "    try{ if(u&&typeof u.text==='string'){ u.text=u.text.replace(EMO,' ').replace(/\\s+/g,' ').trim(); } }catch(e){}\n"
    "    return _speak(u);\n"
    "  };\n"
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
    files = []
    for r in ROOTS:
        if os.path.isdir(r):
            files += glob.glob(os.path.join(r, "**", "*.html"), recursive=True)
    files = sorted(files)
    fixed = skipped = no_anchor = 0
    for p in files:
        html = read(p)
        if MARKER in html:
            skipped += 1; continue
        if "</body>" not in html:
            no_anchor += 1; print("  NO </body>:", os.path.relpath(p, HERE)); continue
        eol = "\r\n" if "\r\n" in html else "\n"
        snip = SNIPPET.replace("\n", eol)
        idx = html.rfind("</body>")
        new = html[:idx] + snip + html[idx:]
        if APPLY:
            write(p, new)
        fixed += 1
    mode = "APPLIED" if APPLY else "DRY-RUN (use --apply to write)"
    print("=" * 60)
    print("explain+practice pages scanned :", len(files))
    print("would-fix / fixed              :", fixed, "  [%s]" % mode)
    print("already had marker             :", skipped)
    print("no </body> anchor              :", no_anchor)

if __name__ == "__main__":
    main()
