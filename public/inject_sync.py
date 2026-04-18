"""
RISHI — inject_sync.py v3
Targets practice pages + syllabus + parent pages specifically.
Inserts rishi-sync.js before </head>
"""

import os

SYNC_TAG = '<script src="/rishi-sync.js"></script>'

TARGET_FILES = [
    r'public\practice\class8\algebra\algebraic-expressions-identities.html',
    r'public\practice\class8\algebra\factorisation.html',
    r'public\practice\class8\algebra\introduction-to-graphs.html',
    r'public\practice\class8\algebra\linear-equations.html',
    r'public\practice\class8\arithmetic\comparing-quantities.html',
    r'public\practice\class8\arithmetic\direct-inverse-proportions.html',
    r'public\practice\class8\arithmetic\playing-with-numbers.html',
    r'public\practice\class8\arithmetic\powers-exponents.html',
    r'public\practice\class8\arithmetic\rational-numbers.html',
    r'public\practice\class8\data-handling\chance-probability.html',
    r'public\practice\class8\data-handling\frequency-distribution.html',
    r'public\practice\class8\geometry\practical-geometry.html',
    r'public\practice\class8\geometry\understanding-quadrilaterals.html',
    r'public\practice\class8\geometry\visualising-solid-shapes.html',
    r'public\practice\class8\mensuration\area-plane-figures.html',
    r'public\practice\class8\mensuration\surface-area-volume.html',
    r'public\syllabus.html',
    r'public\parent.html',
    r'public\parent-dashboard.html',
]

updated, already, missing = [], [], []

for path in TARGET_FILES:
    if not os.path.exists(path):
        missing.append(path)
        continue

    try:
        with open(path, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
    except Exception as e:
        print(f"ERROR reading {path}: {e}")
        continue

    if SYNC_TAG in content:
        already.append(path)
        continue

    # Find </head> case-insensitive
    idx = content.lower().find('</head>')
    if idx == -1:
        print(f"WARNING: no </head> in {path}")
        continue

    content = content[:idx] + SYNC_TAG + '\n' + content[idx:]
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    updated.append(path)

print(f"\n✅ Updated {len(updated)} files:")
for f in updated: print(f"   {f}")

if already:
    print(f"\n⏭  Already done ({len(already)}):")
    for f in already: print(f"   {f}")

if missing:
    print(f"\n❌ Not found ({len(missing)}):")
    for f in missing: print(f"   {f}")

print("\nDone. Now run:")
print("  git add .")
print('  git commit -m "Add rishi-sync.js to all pages"')
print("  git push")
