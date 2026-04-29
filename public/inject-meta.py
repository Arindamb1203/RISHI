"""
RISHI — inject-meta.py
Injects rishi-board and rishi-class meta tags into all
explain/class8 and practice/class8 HTML files.

Run from D:\\rishi\\public:
  python inject-meta.py

Safe: only modifies files missing the meta tags.
Logs every file touched.
"""

import os, re

ROOT      = os.path.dirname(os.path.abspath(__file__))
BOARD     = "cbse"
CLASS_NUM = "8"

FOLDERS = [
    os.path.join(ROOT, "explain",  "class8"),
    os.path.join(ROOT, "practice", "class8"),
]

META_BOARD = f'<meta name="rishi-board" content="{BOARD}">'
META_CLASS = f'<meta name="rishi-class" content="{CLASS_NUM}">'

INJECT_AFTER = re.compile(r'(<meta\s+name=["\']viewport["\'][^>]*>)', re.IGNORECASE)

touched = []
skipped = []

for folder in FOLDERS:
    for dirpath, _, files in os.walk(folder):
        for fname in files:
            if not fname.endswith(".html"):
                continue
            fpath = os.path.join(dirpath, fname)
            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read()

            # Skip if already injected
            if 'name="rishi-board"' in content:
                skipped.append(fpath.replace(ROOT, ""))
                continue

            # Inject after viewport meta
            replacement = r'\1\n' + META_BOARD + '\n' + META_CLASS
            new_content, count = INJECT_AFTER.subn(replacement, content, count=1)

            if count == 0:
                print(f"  WARNING — viewport meta not found, skipped: {fname}")
                skipped.append(fpath.replace(ROOT, ""))
                continue

            with open(fpath, "w", encoding="utf-8") as f:
                f.write(new_content)

            rel = fpath.replace(ROOT, "")
            touched.append(rel)
            print(f"  ✅ Injected: {rel}")

print(f"\n--- DONE ---")
print(f"Injected : {len(touched)} files")
print(f"Skipped  : {len(skipped)} files (already had tags or no viewport meta)")
