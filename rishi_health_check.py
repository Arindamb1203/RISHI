#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
rishi_health_check.py  —  RISHI explain/practice page health checker + auto-fixer
=================================================================================
Scans EVERY explain and practice page across ALL boards (CBSE + ICSE) and ALL
classes (6/7/8/9), checks for the bugs handled in the 9-10 Jun 2026 session, and
auto-corrects the safe/deterministic ones. Pages that are already correct are
SKIPPED untouched. Pages that are broken/missing are FIXED instantly.

PRIMARY GUARANTEE (the explicit requirement):
  Audio (ElevenLabs <audio> via /tts  AND  browser speechSynthesis) MUST stop the
  moment the page is left/hidden — on pagehide, beforeunload, and
  visibilitychange(hidden). This holds for BOTH explain and practice pages.

USAGE:
  python rishi_health_check.py            # DRY RUN — report only, writes nothing
  python rishi_health_check.py --apply    # apply the auto-fixes

The script is IDEMPOTENT: re-running after --apply skips everything (no churn).

CHECK MATRIX
  [FIX ] audio-stop-on-exit  (explain + practice)  -> inject universal guard if inadequate
  [FIX ] goPractice path     (explain)             -> repair if it doesn't mirror the explain path
  [WARN] goExam param        (explain)             -> flag if it still uses ?chapter= (needs manual ch id)
  [WARN] explain-helper.js   (explain)             -> flag if the <script> tag is missing
  [WARN] confirmShown decl   (explain)             -> flag if referenced but never declared with var
  [WARN] emoji-strip marker  (explain + practice)  -> flag if RISHI-STRIP-EMOJI-SPEECH missing
  [WARN] favicon injector    (explain + practice)  -> flag if RISHI-FAVICON-GANESHA missing
  [WARN] practice audio purity (practice)          -> flag if a practice page uses <audio>/new Audio()/ /tts
"""

import os, sys, glob, re, io

ROOT      = os.path.dirname(os.path.abspath(__file__))
PUBLIC    = os.path.join(ROOT, "public")
APPLY     = "--apply" in sys.argv
NL        = "\r\n"                     # every page is CRLF (verified)

AUDIO_MARKER = "RISHI-AUDIO-STOP-ON-EXIT-V2"
VOICE_MARKER = "RISHI-STOP-VOICE-ON-EXIT"   # legacy practice marker (speech-only)

# ---- universal audio-stop-on-exit guard ---------------------------------------
# Self-contained + idempotent. Stops:
#   * browser speechSynthesis (system-voice fallback, practice narration)
#   * EVERY HTMLMediaElement (ElevenLabs `new Audio()` + any <audio>/<video>)
# It tracks media via a play() monkey-patch so detached `new Audio()` objects
# (which are NOT in the DOM) are also paused. Fires on pagehide / beforeunload /
# visibilitychange(hidden). Also calls the page's own stopAllAudio() if present.
_GUARD_LINES = [
    "<script>",
    "/* " + AUDIO_MARKER + " — stop ALL narration (ElevenLabs audio + speechSynthesis) when the page is left or hidden */",
    "(function(){",
    "  if(window.__rishiAudioStopV2)return; window.__rishiAudioStopV2=1;",
    "  var tracked=[];",
    "  try{",
    "    var _play=HTMLMediaElement.prototype.play;",
    "    HTMLMediaElement.prototype.play=function(){ if(tracked.indexOf(this)<0)tracked.push(this); return _play.apply(this,arguments); };",
    "  }catch(e){}",
    "  function stopAll(){",
    "    try{ if(window.speechSynthesis) window.speechSynthesis.cancel(); }catch(e){}",
    "    for(var i=0;i<tracked.length;i++){ try{ tracked[i].pause(); tracked[i].currentTime=0; }catch(e){} }",
    "    try{ var n=document.querySelectorAll('audio,video'); for(var j=0;j<n.length;j++){ try{ n[j].pause(); n[j].currentTime=0; }catch(e){} } }catch(e){}",
    "    try{ if(typeof window.stopAllAudio==='function') window.stopAllAudio(); }catch(e){}",
    "  }",
    "  window.__rishiStopAllAudio=stopAll;",
    "  window.addEventListener('pagehide', stopAll);",
    "  window.addEventListener('beforeunload', stopAll);",
    "  document.addEventListener('visibilitychange', function(){ if(document.visibilityState==='hidden') stopAll(); });",
    "})();",
    "</script>",
    "",
]
GUARD_BLOCK = NL.join(_GUARD_LINES)


def read(path):
    with open(path, "rb") as f:
        return f.read().decode("utf-8")


def write(path, text):
    with open(path, "wb") as f:
        f.write(text.encode("utf-8"))


def list_pages(kind):
    """kind = 'explain' or 'practice'. Returns posix relpaths under public/."""
    out = []
    for p in glob.glob(os.path.join(PUBLIC, kind, "**", "*.html"), recursive=True):
        if p.endswith(".bak"):
            continue
        out.append(os.path.relpath(p, PUBLIC).replace("\\", "/"))
    return sorted(out)


# ---- audio adequacy logic -----------------------------------------------------
def uses_speech(c):
    return "speechSynthesis" in c


def uses_media(c):
    return ("new Audio(" in c) or ("<audio" in c) or ('fetch("/tts"' in c) or ("fetch('/tts'" in c)


def audio_adequate(c):
    """A page is adequate iff every audio mechanism it uses is stopped on exit
    (pagehide + beforeunload + visibilitychange-hidden)."""
    if AUDIO_MARKER in c:
        return True                       # universal guard already present
    needs = uses_speech(c) or uses_media(c)
    if not needs:
        return True                       # no audio at all -> nothing to stop
    if uses_media(c):
        return False                      # media must use the universal guard (legacy handlers miss visibilitychange)
    # speech-only page: legacy voice marker (pagehide+beforeunload+visibilitychange) is sufficient
    return VOICE_MARKER in c


def inject_guard(c):
    idx = c.rfind("</body>")
    if idx == -1:
        return None
    return c[:idx] + GUARD_BLOCK + c[idx:]


# ---- goPractice path ----------------------------------------------------------
GOPRAC_RE = re.compile(r'(function\s+goPractice\s*\(\)\s*\{[^\n]*?location\.href\s*=\s*")([^"]*)(")')

def expected_practice_href(relpath):
    return "/" + relpath.replace("explain/", "practice/", 1)

def check_gopractice(relpath, c):
    """Returns (new_content_or_None, status, detail)."""
    m = GOPRAC_RE.search(c)
    if not m:
        return None, "WARN", "no goPractice(){...location.href} found"
    cur = m.group(2)
    exp = expected_practice_href(relpath)
    if cur == exp:
        return None, "OK", cur
    # mismatch — only auto-fix when the deterministic target really exists on disk
    target_fs = os.path.join(PUBLIC, exp.lstrip("/").replace("/", os.sep))
    if os.path.exists(target_fs):
        new = c[:m.start(2)] + exp + c[m.end(2):]
        return new, "FIX", "%s -> %s" % (cur, exp)
    return None, "WARN", "goPractice='%s' but expected '%s' (target missing)" % (cur, exp)


# ---- read-only audits ---------------------------------------------------------
GOEXAM_RE = re.compile(r'function\s+goExam\s*\(\)\s*\{[^\n]*?\}')

# confirmShown must be DECLARED (not just assigned as an implicit global). The
# canonical class8 declaration ends the state var-line with ",confirmShown=false".
def check_confirmshown(c):
    """Returns (new_content_or_None, status, detail)."""
    if "confirmShown" not in c:
        return None, "OK", "not used"
    if re.search(r'var\b[^;\n]*confirmShown', c):
        return None, "OK", "declared"
    anchor = ",PER_SESSION=10;"
    if anchor in c:
        new = c.replace(anchor, ",PER_SESSION=10,confirmShown=false;", 1)
        return new, "FIX", "declared confirmShown in var line"
    return None, "WARN", "confirmShown referenced, undeclared, no ,PER_SESSION=10; anchor (manual)"


def audit(relpath, c, kind):
    flags = []
    if kind == "explain":
        m = GOEXAM_RE.search(c)
        if m and "exam.html?chapter=" in m.group(0):
            flags.append("goExam still uses ?chapter= (needs ?ch=NN)")
        if "explain-helper.js" not in c:
            flags.append("explain-helper.js <script> tag missing")
    if kind == "practice":
        if uses_media(c):
            flags.append("practice page uses <audio>/new Audio()/tts (expected speechSynthesis-only)")
    # shared
    if "RISHI-STRIP-EMOJI-SPEECH" not in c:
        flags.append("RISHI-STRIP-EMOJI-SPEECH marker missing")
    if "RISHI-FAVICON-GANESHA" not in c:
        flags.append("favicon injector missing")
    return flags


# ---- main ---------------------------------------------------------------------
def main():
    print("=" * 78)
    print("RISHI HEALTH CHECK  —  %s" % ("APPLY (writing fixes)" if APPLY else "DRY RUN (no writes)"))
    print("=" * 78)

    stats = {"scanned": 0, "audio_fixed": 0, "link_fixed": 0, "confirm_fixed": 0, "warn": 0, "clean": 0}
    warn_lines = []

    for kind in ("explain", "practice"):
        pages = list_pages(kind)
        print("\n#### %s : %d pages ####" % (kind.upper(), len(pages)))
        for rel in pages:
            stats["scanned"] += 1
            fs = os.path.join(PUBLIC, rel.replace("/", os.sep))
            c = read(fs)
            orig = c
            actions = []

            # FIX 1: audio-stop-on-exit guard
            if not audio_adequate(c):
                ni = inject_guard(c)
                if ni is None:
                    warn_lines.append("%s : cannot inject audio guard (no </body>)" % rel)
                    stats["warn"] += 1
                else:
                    c = ni
                    actions.append("AUDIO-GUARD injected")
                    stats["audio_fixed"] += 1

            # FIX 2: goPractice path (explain only)
            if kind == "explain":
                new, st, detail = check_gopractice(rel, c)
                if st == "FIX" and new is not None:
                    c = new
                    actions.append("goPractice fixed (%s)" % detail)
                    stats["link_fixed"] += 1
                elif st == "WARN":
                    warn_lines.append("%s : %s" % (rel, detail))
                    stats["warn"] += 1

                # FIX 3: confirmShown declaration (explain only)
                new, st, detail = check_confirmshown(c)
                if st == "FIX" and new is not None:
                    c = new
                    actions.append("confirmShown declared")
                    stats["confirm_fixed"] += 1
                elif st == "WARN":
                    warn_lines.append("%s : %s" % (rel, detail))
                    stats["warn"] += 1

            # WARN audits
            for fl in audit(rel, c, kind):
                warn_lines.append("%s : %s" % (rel, fl))
                stats["warn"] += 1

            # write
            if actions:
                if APPLY and c != orig:
                    write(fs, c)
                tag = "FIXED " if APPLY else "WOULD-FIX "
                print("  %s%s :: %s" % (tag, rel, "; ".join(actions)))
            else:
                stats["clean"] += 1

    print("\n" + "=" * 78)
    print("WARN / MANUAL-REVIEW items: %d" % len(warn_lines))
    for w in warn_lines:
        print("  ! " + w)
    print("\n" + "-" * 78)
    print("SUMMARY")
    print("  scanned ............ %d" % stats["scanned"])
    print("  audio guard %s ... %d" % ("injected" if APPLY else "to inject", stats["audio_fixed"]))
    print("  goPractice %s .... %d" % ("fixed   " if APPLY else "to fix  ", stats["link_fixed"]))
    print("  confirmShown %s . %d" % ("declared" if APPLY else "to declr", stats["confirm_fixed"]))
    print("  warnings ........... %d" % stats["warn"])
    print("  already-clean ...... %d" % stats["clean"])
    if not APPLY and (stats["audio_fixed"] or stats["link_fixed"] or stats["confirm_fixed"]):
        print("\n  >> DRY RUN. Re-run with --apply to write these fixes.")
    print("=" * 78)


if __name__ == "__main__":
    main()
