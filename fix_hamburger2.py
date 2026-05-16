import os, re

PATH = os.path.join('public', 'parent.html')
with open(PATH, 'r', encoding='utf-8') as f:
    h = f.read()
h = h.replace('\r\n', '\n')

# Fix: use only ontouchstart (not onclick+ontouchend — double fires on mobile)
h = h.replace(
    'id="hdr-menu-btn" onclick="toggleHdrMenu(event)" ontouchend="toggleHdrMenu(event)"',
    'id="hdr-menu-btn" ontouchstart="toggleHdrMenu(event)" onclick="toggleHdrMenu(event)"'
)

# Fix toggleHdrMenu to prevent double fire
OLD = """function toggleHdrMenu(e) {
  if (e) { e.stopPropagation(); e.preventDefault(); }
  var d = document.getElementById('hdr-menu-dropdown');
  if (!d) return;
  var isOpen = d.style.display === 'block';
  d.style.display = isOpen ? 'none' : 'block';
}"""
NEW = """var _hdrMenuLastToggle = 0;
function toggleHdrMenu(e) {
  if (e) { e.stopPropagation(); e.preventDefault(); }
  var now = Date.now();
  if (now - _hdrMenuLastToggle < 300) return; // prevent double fire
  _hdrMenuLastToggle = now;
  var d = document.getElementById('hdr-menu-dropdown');
  if (!d) return;
  d.style.display = d.style.display === 'block' ? 'none' : 'block';
}"""
if OLD in h:
    h = h.replace(OLD, NEW, 1)
    print("toggleHdrMenu: debounce added")
else:
    h = re.sub(r'var _hdrMenuLastToggle.*?function toggleHdrMenu.*?\n\}|function toggleHdrMenu.*?\n\}',
               NEW, h, flags=re.DOTALL, count=1)
    print("toggleHdrMenu: replaced via regex")

with open(PATH, 'w', encoding='utf-8', newline='\n') as f:
    f.write(h)
print("Saved")
print()
print("git add .")
print('git commit -m "Parent: fix hamburger double-fire on mobile"')
print("git push")
