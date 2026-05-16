import os, re

PATH = os.path.join('public', 'parent.html')
with open(PATH, 'r', encoding='utf-8') as f:
    h = f.read()
h = h.replace('\r\n', '\n')

# 1. Remove hamburger button entirely
h = re.sub(r'<button[^>]*id="hdr-menu-btn"[^>]*>☰</button>\s*\n?', '', h)
print("Hamburger button removed")

# 2. Make hdr-title clickable on mobile (add ▾ and onclick)
h = h.replace(
    '<div class="hdr-title">Parent Portal</div>',
    '<div class="hdr-title" id="hdr-menu-trigger" onclick="toggleHdrMenu(event)" style="cursor:pointer;user-select:none;">Parent Portal <span id="hdr-menu-arrow" style="font-size:11px;opacity:.7;">▾</span></div>'
)
print("Parent Portal text is now the menu trigger")

# 3. Update toggleHdrMenu to also flip the arrow
OLD_FN = """function toggleHdrMenu(e) {
  if (e) { e.stopPropagation(); e.preventDefault(); }
  var d = document.getElementById('hdr-menu-dropdown');
  if (!d) return;
  d.style.display = (d.style.display === 'block') ? 'none' : 'block';
}"""

NEW_FN = """function toggleHdrMenu(e) {
  if (e) { e.stopPropagation(); e.preventDefault(); }
  var d = document.getElementById('hdr-menu-dropdown');
  var arrow = document.getElementById('hdr-menu-arrow');
  if (!d) return;
  var open = d.style.display === 'block';
  d.style.display = open ? 'none' : 'block';
  if (arrow) arrow.textContent = open ? '▾' : '▴';
}"""

if 'function toggleHdrMenu' in h:
    h = h.replace(OLD_FN, NEW_FN, 1)
    if 'hdr-menu-arrow' not in h:
        h = re.sub(r'function toggleHdrMenu.*?\n\}', NEW_FN, h, flags=re.DOTALL, count=1)
    print("toggleHdrMenu updated with arrow")
else:
    h = h.replace('</script>', NEW_FN + '\n</script>', 1)
    print("toggleHdrMenu injected")

# 4. Hide trigger arrow on desktop, show on mobile
h = h.replace(
    '#hdr-menu-btn{display:none;}',
    '#hdr-menu-btn{display:none;}\n#hdr-menu-arrow{display:none;}\n@media(max-width:700px){#hdr-menu-arrow{display:inline;}}'
)
print("Arrow CSS added")

with open(PATH, 'w', encoding='utf-8', newline='\n') as f:
    f.write(h)
print("Saved")
print()
print("git add .")
print('git commit -m "Parent: Parent Portal text as menu trigger, remove hamburger"')
print("git push")
