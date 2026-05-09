#!/usr/bin/env python3
"""
Patch admin.html — adds Class 7 exam paths
Run from D:\rishi\public\  :  python patch_admin7.py
"""
import pathlib, sys

PUBLIC = pathlib.Path(__file__).parent.resolve()
ADMIN  = PUBLIC / "admin.html"

if not ADMIN.exists():
    print("ERROR: admin.html not found"); sys.exit(1)

src = ADMIN.read_text(encoding="utf-8")
orig = src

# Chapter name (lowercase search) → exam key mapping
# Order matches admin.html internal numbering
NAME_TO_KEY = {
    "large numbers around us":            "c7-01",
    "arithmetic expressions":             "c7-02",
    "a peek beyond the point":            "c7-03",
    "number play":                        "c7-04",
    "working with fractions":             "c7-05",
    "expressions using letter-numbers":   "c7-06",
    "parallel and intersecting lines":    "c7-07",
    "a tale of three intersecting lines": "c7-08",
}

patched = 0
for name, key in NAME_TO_KEY.items():
    exam_url = f"/exam.html?ch={key}"
    pos = src.lower().find(name)
    if pos == -1:
        print(f"  NOT FOUND in admin.html: {name}")
        continue
    window = src[pos:pos+500]
    if "exam:null" not in window:
        if key in window:
            print(f"  Already set: {key}")
        else:
            print(f"  exam:null not found near: {name}")
        continue
    new_window = window.replace("exam:null", f"exam:'{exam_url}'", 1)
    src = src[:pos] + new_window + src[pos+500:]
    print(f"  PATCHED: [{name}] → exam:'{exam_url}'")
    patched += 1

if src != orig:
    ADMIN.write_text(src, encoding="utf-8")
    print(f"\nDone. {patched} paths added to admin.html")
    print("\nNow run:")
    print("  cd D:\\rishi")
    print('  git add .')
    print('  git commit -m "Patch admin.html Class 7 exam paths"')
    print("  git push")
else:
    print(f"\nNo changes made ({patched} already set or not found)")
