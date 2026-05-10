"""
diagnose_admin.py — Run from D:\rishi>
Shows exactly what the card button section looks like in your file.
"""
import os, re

PATH = os.path.join('public', 'admin', 'admin.html')

with open(PATH, 'r', encoding='utf-8') as f:
    html = f.read()

# Find qbBuildGrid function
m = re.search(r'function qbBuildGrid\(\)(.*?)(?=\n\})', html, re.DOTALL)
if m:
    body = m.group(1)
    # Find the buttons div section
    btn = re.search(r"'<div style=\"display:flex;gap:6px.*", body, re.DOTALL)
    if btn:
        print("=== CARD BUTTONS SECTION ===")
        print(repr(btn.group(0)[:800]))
    else:
        print("Buttons div not found. Showing last 600 chars of qbBuildGrid:")
        print(repr(body[-600:]))
else:
    print("qbBuildGrid not found at all.")

# Also check bulk ops
print("\n=== BULK OPS SECTION ===")
b = re.search(r'Bulk Operations.*?</div>', html, re.DOTALL)
if b:
    print(repr(b.group(0)[:600]))
