"""
RISHI – Class8 Restructure Script
Run from D:\rishi\  →  python restructure_rishi.py

What it does:
  1. Creates explain/class8/ and practice/class8/
  2. Moves all 5 topic folders inside class8/
  3. Updates every /explain/[topic]/ and /practice/[topic]/ path
     in ALL .html and .js files to include /class8/

Safe to re-run — skips moves if destination already exists.
"""

import os
import shutil

BASE = r'D:\rishi\public'

TOPICS   = ['algebra', 'arithmetic', 'data-handling', 'geometry', 'mensuration']
SECTIONS = ['explain', 'practice']

# ── Step 1: Move folders ─────────────────────────────────────────────────────
print("=== STEP 1: Moving folders ===")
for section in SECTIONS:
    class8_dir = os.path.join(BASE, section, 'class8')
    os.makedirs(class8_dir, exist_ok=True)

    for topic in TOPICS:
        src = os.path.join(BASE, section, topic)
        dst = os.path.join(BASE, section, 'class8', topic)

        if os.path.exists(src) and not os.path.exists(dst):
            shutil.move(src, dst)
            print(f"  Moved : {section}/{topic} -> {section}/class8/{topic}")
        elif os.path.exists(dst):
            print(f"  Skip  : {section}/class8/{topic} already exists")
        else:
            print(f"  WARN  : {section}/{topic} not found – nothing to move")

# ── Step 2: Build replacement pairs ─────────────────────────────────────────
replacements = []
for section in SECTIONS:
    for topic in TOPICS:
        old = f'/{section}/{topic}/'
        new = f'/{section}/class8/{topic}/'
        replacements.append((old, new))

# ── Step 3: Update all .html and .js files ───────────────────────────────────
print("\n=== STEP 2: Updating path references ===")
updated_files = []

for root, dirs, files in os.walk(BASE):
    # Skip node_modules or .git if somehow inside public
    dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules']]
    for fname in files:
        if not (fname.endswith('.html') or fname.endswith('.js')):
            continue
        fpath = os.path.join(root, fname)
        try:
            with open(fpath, 'r', encoding='utf-8') as f:
                original = f.read()
        except Exception as e:
            print(f"  ERROR reading {fpath}: {e}")
            continue

        updated = original
        for old, new in replacements:
            updated = updated.replace(old, new)

        if updated != original:
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(updated)
            rel = os.path.relpath(fpath, BASE)
            print(f"  Updated: {rel}")
            updated_files.append(rel)

# ── Step 4: Verify nothing remains ───────────────────────────────────────────
print("\n=== STEP 3: Verification ===")
issues = []
for root, dirs, files in os.walk(BASE):
    dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules']]
    for fname in files:
        if not (fname.endswith('.html') or fname.endswith('.js')):
            continue
        fpath = os.path.join(root, fname)
        try:
            with open(fpath, 'r', encoding='utf-8') as f:
                content = f.read()
        except:
            continue
        for section in SECTIONS:
            for topic in TOPICS:
                old = f'/{section}/{topic}/'
                if old in content:
                    rel = os.path.relpath(fpath, BASE)
                    issues.append(f"  STILL HAS OLD PATH '{old}' in: {rel}")

if issues:
    print("WARNING – old paths still found:")
    for i in issues:
        print(i)
else:
    print("  All clear — no old paths remaining.")

# ── Summary ───────────────────────────────────────────────────────────────────
print(f"\n=== DONE ===")
print(f"Files updated: {len(updated_files)}")
print("Next step:")
print("  git add .")
print('  git commit -m "Restructure: add class8 level to explain and practice folders"')
print("  git push")
