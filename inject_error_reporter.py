"""
inject_error_reporter.py — Inject <script src="/error-reporter.js"></script>
into every .html file under public/ (recursive), just before </body>.
Skips files that already have the tag.

Run from D:/rishi/ (repo root).
"""
import os, re

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'public')
TAG = '<script src="/error-reporter.js"></script>'

updated = 0
skipped = 0
total   = 0

for dirpath, dirnames, filenames in os.walk(ROOT):
    # Skip .bak files and backup dirs
    dirnames[:] = [d for d in dirnames if not d.startswith('.')]
    for fname in filenames:
        if not fname.endswith('.html') or fname.endswith('.bak'):
            continue
        fpath = os.path.join(dirpath, fname)
        total += 1
        with open(fpath, 'r', encoding='utf-8', errors='replace') as f:
            html = f.read()
        if TAG in html:
            skipped += 1
            continue
        if '</body>' not in html:
            print(f'  SKIP (no </body>): {fpath}')
            skipped += 1
            continue
        html = html.replace('</body>', TAG + '\n</body>', 1)
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(html)
        updated += 1

print(f"\nTotal HTML files : {total}")
print(f"Updated          : {updated}")
print(f"Skipped (already had tag or no </body>): {skipped}")
print("Done.")
