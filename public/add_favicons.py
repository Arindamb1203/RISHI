"""
Inserts the RISHI favicon <link> tags into the <head> of every .html file.
Run it from inside your public/ folder:

    cd D:\rishi\public
    python add_favicons.py

Safe to run more than once: files already patched are skipped (marker check).
"""
import os, re

BLOCK = """<!-- RISHI-FAVICONS -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="shortcut icon" href="/favicon.ico">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">"""

MARKER = "RISHI-FAVICONS"
HEAD = re.compile(r"(<head[^>]*>)", re.IGNORECASE)

added = skipped = nohead = 0
for root, _, files in os.walk("."):
    for name in files:
        if not name.lower().endswith(".html"):
            continue
        path = os.path.join(root, name)
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            html = f.read()
        if MARKER in html:
            skipped += 1
            continue
        if not HEAD.search(html):
            print("  NO <head>, skipped:", path)
            nohead += 1
            continue
        html = HEAD.sub(lambda m: m.group(1) + "\n  " + BLOCK, html, count=1)
        with open(path, "w", encoding="utf-8") as f:
            f.write(html)
        added += 1
        print("  patched:", path)

print(f"\nDone. patched={added}  already-had={skipped}  no-head={nohead}")
