"""
fix_buttons.py — Run from D:\rishi>
Fixes: Seed button → View button in chapter cards
       Removes Seed All from bulk ops
"""
import os, re

PATH = os.path.join('public', 'admin', 'admin.html')

with open(PATH, 'r', encoding='utf-8') as f:
    html = f.read()

original = html

# ── FIX 1: Replace buttons div in card builder ────────────────────────────
# Find the buttons row (the div after the controls row that has Generate/Seed/Delete)
# We look for the pattern with qb-gen-btn and replace the whole buttons div

OLD_BTN = re.search(
    r"'\<div style=\"display:flex;gap:6px;\"\>' \+.*?'\<\/div\>'[;\.]",
    html, re.DOTALL
)

if OLD_BTN:
    print("Found buttons div at char:", OLD_BTN.start())
    print("Content:", repr(OLD_BTN.group(0)[:300]))
else:
    print("Pattern A not found, trying pattern B...")
    OLD_BTN = re.search(
        r"'<div style=\"display:flex;gap:6px;\">.*?</div>'",
        html, re.DOTALL
    )
    if OLD_BTN:
        print("Found with pattern B:", repr(OLD_BTN.group(0)[:300]))
    else:
        print("Not found with pattern B either")

# Try finding by qb-gen-btn which is unique
gen_pos = html.find("'qb-gen-btn-'")
if gen_pos == -1:
    gen_pos = html.find('"qb-gen-btn-"')
print("\nqb-gen-btn position:", gen_pos)
if gen_pos > 0:
    print("Context around it:")
    print(repr(html[gen_pos-200:gen_pos+400]))

# Find qb-seed-btn if it exists
seed_pos = html.find('qb-seed-btn-')
print("\nqb-seed-btn position:", seed_pos)
if seed_pos > 0:
    print("Context:")
    print(repr(html[seed_pos-100:seed_pos+200]))

# Find Seed All button
seed_all = html.find('Seed All to KV')
print("\nSeed All position:", seed_all)
if seed_all > 0:
    print("Context:")
    print(repr(html[seed_all-100:seed_all+100]))
