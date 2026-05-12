import os, re

EXPLAIN_ROOT = r"D:\rishi\public\explain"

def patch_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        h = f.read()

    # Skip non-explain pages (e.g. rishika-avatars folder etc.)
    if 'function showConfirm()' not in h and 'function nextStep()' not in h:
        return None  # not an explain page

    results = []
    changed = False

    # ── FIX 1: Add confirmShown to var declaration ──
    # Try common variants
    for OLD in [
        "var session=[],idx=0,stepIdx=0,nudgeCount=0,completed=false;",
        "var session=[],idx=0,stepIdx=0,nudgeCount=0,completed=false,confirmShown=false;"
    ]:
        if OLD in h and "confirmShown=false;" not in h:
            h = h.replace(OLD,
                "var session=[],idx=0,stepIdx=0,nudgeCount=0,completed=false,confirmShown=false;", 1)
            results.append("FIX1-OK")
            changed = True
            break
    else:
        if "confirmShown=false;" in h:
            results.append("FIX1-SKIP(already)")
        else:
            results.append("FIX1-MISS")

    # ── FIX 2: Reset confirmShown in showQ ──
    if "confirmShown=false;" in h and "stepIdx=0; nudgeCount=0; confirmShown=false;" not in h:
        if "stepIdx=0; nudgeCount=0;" in h:
            h = h.replace("stepIdx=0; nudgeCount=0;", "stepIdx=0; nudgeCount=0; confirmShown=false;", 1)
            results.append("FIX2-OK")
            changed = True
        else:
            results.append("FIX2-MISS")
    elif "stepIdx=0; nudgeCount=0; confirmShown=false;" in h:
        results.append("FIX2-SKIP(already)")

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
fixed = 0
missed = []

for root, dirs, files in os.walk(EXPLAIN_ROOT):
    # Skip avatar / asset folders
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
            missed.append(rel)
        else:
            fixed += 1
        print(f"{rel}: {' | '.join(res)}")

print()
print(f"Total explain pages found : {total}")
print(f"Fully patched             : {fixed}")
if missed:
    print(f"Pages with MISS (manual needed): {len(missed)}")
    for m in missed:
        print(f"  - {m}")
else:
    print("No missed fixes!")
print()
print("git add .")
print('git commit -m "Fix all explain pages: repeated confirm section + missing submitTyped"')
print("git push")
