"""
fix_view_btn.py — Run from D:\rishi>
"""
import os, re

PATH = os.path.join('public', 'admin', 'admin.html')

with open(PATH, 'r', encoding='utf-8') as f:
    html = f.read()

original = html

# Remove display:none from any qb-prev-btn button style
html = re.sub(
    r'(id="qb-prev-btn-[^"]*"[^>]*?)background:[^;]+;color:[^;]+;(font-family:[^;]+;)display:none;',
    r'\1background:#1a7a4a;color:#fff;\2',
    html
)

html = re.sub(
    r'(id="qb-prev-btn-[^"]*"[^>]*?style="[^"]*?)display:none;',
    r'\1',
    html
)

if html != original:
    with open(PATH, 'w', encoding='utf-8') as f:
        f.write(html)
    print("Fixed.")
    print("  git add .")
    print('  git commit -m "Fix View button: always visible, solid green"')
    print("  git push")
else:
    print("Already fixed on disk. Force redeploy:")
    print("  git commit --allow-empty -m 'Force redeploy'")
    print("  git push")
