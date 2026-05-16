import os, re

PATH = os.path.join('public', 'parent.html')
with open(PATH, 'r', encoding='utf-8') as f:
    h = f.read()

# Count script tags
scripts = [m.start() for m in re.finditer(r'<script', h)]
print("Script tags at positions:", scripts)

# Find toggleHdrMenu
idx = h.find('function toggleHdrMenu')
print("toggleHdrMenu at:", idx)
if idx > 0:
    print(repr(h[idx:idx+200]))

# Find hdr-menu-trigger
idx2 = h.find('hdr-menu-trigger')
print("\nhdr-menu-trigger at:", idx2)
if idx2 > 0:
    print(repr(h[max(0,idx2-20):idx2+150]))

# Find dropdown
idx3 = h.find('hdr-menu-dropdown')
print("\nDropdown style:", h[idx3+20:idx3+80])
