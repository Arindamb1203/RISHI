"""
patch_nextstep.py
Fixes the TTS+typing sync bug in all explain pages.

Broken pattern: setTimeout(nextStep,3500) fires next step after a
fixed 3.5s regardless of whether TTS has finished reading.

Correct pattern: use say()'s onEnd callback + generation counter so
the next step only starts AFTER the avatar has finished speaking.
"""

import os, re, glob

EXPLAIN_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'explain')
# Script runs from public/, so adjust:
EXPLAIN_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'explain')

# ── Broken patterns to find ──────────────────────────────────────────
# Pattern A: setTimeout(nextStep,3500);stepIdx++;
BROKEN_SUFFIX_A = r'setTimeout\(function\(\)\{d\.classList\.add\("vis"\);\},40\);setTimeout\(nextStep,3500\);stepIdx\+\+;'
# Pattern B: say(s.s);setTimeout(nextStep,3500);stepIdx++;
BROKEN_SUFFIX_B = r'setTimeout\(function\(\)\{d\.classList\.add\("vis"\);\},40\);say\(s\.s\);setTimeout\(nextStep,3500\);stepIdx\+\+;'

# ── Correct replacement ──────────────────────────────────────────────
CORRECT_SUFFIX = 'setTimeout(function(){d.classList.add("vis");},40);stepIdx++;say(s.s||s.t.replace(/<[^>]*>/g,""),function(){if(myGen===nsGen)nextStep();});'

# ── Function signature to patch ──────────────────────────────────────
# Before: function nextStep(){var q=session[idx];
# After:  var nsGen=0;function nextStep(){var myGen=++nsGen;var q=session[idx];
OLD_SIG = 'function nextStep(){var q=session[idx];'
NEW_SIG = 'var nsGen=0;function nextStep(){var myGen=++nsGen;var q=session[idx];'
# If already has nsGen, skip signature patch
HAS_NSGEN = 'var nsGen=0;'

fixed = 0
skipped = 0
errors = 0

html_files = glob.glob(os.path.join(EXPLAIN_DIR, '**', '*.html'), recursive=True)
print(f'Scanning {len(html_files)} explain pages...')

for path in sorted(html_files):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()

        if 'function nextStep' not in content:
            continue

        # Already correct?
        if HAS_NSGEN in content:
            skipped += 1
            continue

        original = content

        # Fix suffix — pattern B first (more specific)
        content = re.sub(BROKEN_SUFFIX_B, CORRECT_SUFFIX, content)
        # Fix suffix — pattern A
        content = re.sub(BROKEN_SUFFIX_A, CORRECT_SUFFIX, content)

        # Fix function signature
        if OLD_SIG in content:
            content = content.replace(OLD_SIG, NEW_SIG, 1)

        if content != original:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            rel = os.path.relpath(path, EXPLAIN_DIR)
            print(f'  FIXED: {rel}')
            fixed += 1
        else:
            skipped += 1

    except Exception as e:
        print(f'  ERROR: {path}: {e}')
        errors += 1

print(f'\nDone. Fixed: {fixed}  |  Already correct: {skipped}  |  Errors: {errors}')
