import os, re

EXPLAIN_ROOT = r"D:\rishi\public\explain"

def patch_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        h = f.read()

    if 'function showConfirm()' not in h and 'function nextStep()' not in h:
        return None

    results = []
    changed = False

    # ── FIX 1: Add confirmShown to var session declaration (regex, flexible) ──
    if 'confirmShown' not in h:
        # Match "var session=[...], idx=0, ..." with any spacing/formatting
        m = re.search(r'(var\s+session\s*=\s*\[\s*\]\s*,[^\n;]+)(;)', h)
        if m:
            old_decl = m.group(0)
            # Append ,confirmShown=false before the semicolon
            new_decl = m.group(1) + ',confirmShown=false' + m.group(2)
            h = h.replace(old_decl, new_decl, 1)
            results.append("FIX1-OK")
            changed = True
        else:
            # Fallback: inject a standalone var before function init or window.onload
            for anchor in ['function init(){', 'window.onload=init']:
                if anchor in h:
                    h = h.replace(anchor, 'var confirmShown=false;\n' + anchor, 1)
                    results.append("FIX1-OK(injected)")
                    changed = True
                    break
            else:
                results.append("FIX1-MISS")
    else:
        results.append("FIX1-SKIP(already)")

    # ── FIX 2: Reset confirmShown in showQ (flexible spacing) ──
    if 'confirmShown=false' in h:
        if 'confirmShown=false;' in h and 'nudgeCount=0; confirmShown=false' not in h and 'nudgeCount=0;confirmShown=false' not in h:
            # Try various spacing patterns for stepIdx/nudgeCount reset
            for pat in [
                'stepIdx=0; nudgeCount=0;',
                'stepIdx=0;nudgeCount=0;',
                'stepIdx = 0; nudgeCount = 0;',
                'stepIdx=0; nudgeCount=0 ;',
            ]:
                if pat in h:
                    h = h.replace(pat, pat + ' confirmShown=false;', 1)
                    results.append("FIX2-OK")
                    changed = True
                    break
            else:
                # Try regex fallback
                m2 = re.search(r'(stepIdx\s*=\s*0\s*;?\s*nudgeCount\s*=\s*0\s*;)', h)
                if m2:
                    old = m2.group(0)
                    h = h.replace(old, old + ' confirmShown=false;', 1)
                    results.append("FIX2-OK(regex)")
                    changed = True
                else:
                    results.append("FIX2-MISS")
        else:
            results.append("FIX2-SKIP(already)")
    else:
        results.append("FIX2-SKIP(no confirmShown)")

    # ── FIX 3: Guard showConfirm ──
    OLD3 = "function showConfirm(){"
    NEW3 = "function showConfirm(){if(confirmShown)return;confirmShown=true;"
    if NEW3 in h:
        results.append("FIX3-SKIP(already)")
    elif OLD3 in h:
        h = h.replace(OLD3, NEW3, 1)
        results.append("FIX3-OK")
        changed = True
    else:
        results.append("FIX3-MISS")

    # ── FIX 4: Add submitTyped() before goNext ──
    SUBMIT_DEF = "function submitTyped(){"
    OLD4 = "function goNext(){"
    NEW4 = (
        "function submitTyped(){\n"
        "  var ra=G(\"rawAnswer\");if(!ra)return;\n"
        "  var raw=ra.value.trim().toLowerCase();if(!raw){ra.focus();return;}\n"
        "  handleAnswer(raw);\n"
        "}\n"
        "function goNext(){"
    )
    if SUBMIT_DEF in h:
        results.append("FIX4-SKIP(already)")
    elif OLD4 in h:
        h = h.replace(OLD4, NEW4, 1)
        results.append("FIX4-OK")
        changed = True
    else:
        results.append("FIX4-MISS")

    # ── FIX 5: Remove duplicate explain-helper.js ──
    DUPE = '<script src="/explain-helper.js"></script>\n<script src="/explain-helper.js"></script>'
    if DUPE in h:
        h = h.replace(DUPE, '<script src="/explain-helper.js"></script>', 1)
        results.append("FIX5-OK")
        changed = True
    else:
        results.append("FIX5-clean")

    if changed:
        with open(path, 'w', encoding='utf-8', newline='\n') as f:
            f.write(h)

    return results

# ── Walk all explain pages ──
total = 0
fully_ok = 0
missed = []

for root, dirs, files in os.walk(EXPLAIN_ROOT):
    dirs[:] = [d for d in dirs if d not in ['rishika-avatars', 'assets', 'img']]
    for fname in files:
        if not fname.endswith('.html'):
            continue
        fpath = os.path.join(root, fname)
        res = patch_file(fpath)
        if res is None:
            continue
        total += 1
        rel = os.path.relpath(fpath, EXPLAIN_ROOT)
        has_miss = any("MISS" in r for r in res)
        if has_miss:
            missed.append((rel, [r for r in res if "MISS" in r]))
        else:
            fully_ok += 1
        print(f"{rel}: {' | '.join(res)}")

print()
print(f"Total explain pages : {total}")
print(f"Fully patched       : {fully_ok}")
if missed:
    print(f"Still need manual   : {len(missed)}")
    for m, reasons in missed:
        print(f"  - {m}  ({', '.join(reasons)})")
else:
    print("All pages fully patched!")
print()
print("git add .")
print('git commit -m "Fix all explain pages: repeated confirm + missing submitTyped"')
print("git push")
