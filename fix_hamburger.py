import os, re

PATH = os.path.join('public', 'parent.html')
with open(PATH, 'r', encoding='utf-8') as f:
    h = f.read()
h = h.replace('\r\n', '\n')

# 1. Fix toggleHdrMenu — add stopPropagation and use touchstart too
OLD = """function toggleHdrMenu() {
  var d = document.getElementById('hdr-menu-dropdown');
  if (d) d.style.display = d.style.display === 'none' ? 'block' : 'none';
}"""
NEW = """function toggleHdrMenu(e) {
  if (e) { e.stopPropagation(); e.preventDefault(); }
  var d = document.getElementById('hdr-menu-dropdown');
  if (!d) return;
  var isOpen = d.style.display === 'block';
  d.style.display = isOpen ? 'none' : 'block';
}"""
if OLD in h:
    h = h.replace(OLD, NEW, 1)
    print("toggleHdrMenu: stopPropagation added")
else:
    h = re.sub(r'function toggleHdrMenu\(\) \{.*?\n\}', NEW, h, flags=re.DOTALL, count=1)
    print("toggleHdrMenu: replaced via regex")

# 2. Fix hamburger button onclick to pass event
h = h.replace(
    'id="hdr-menu-btn" onclick="toggleHdrMenu()"',
    'id="hdr-menu-btn" onclick="toggleHdrMenu(event)" ontouchend="toggleHdrMenu(event)"'
)
print("Hamburger btn: passes event, added ontouchend")

# 3. Remove the document click listener that's closing dropdown immediately
h = re.sub(
    r"document\.addEventListener\('click', function\(e\) \{.*?}\);\s*\n",
    '',
    h, flags=re.DOTALL, count=1
)
print("Document click-to-close listener removed")

# 4. Add close button INSIDE dropdown so user can close it
OLD_DD_END = '</div>\n      <button class="btn-out-hdr" onclick="showProfilePanel()"'
if OLD_DD_END in h:
    NEW_DD_END = '<button onclick="toggleHdrMenu(event)" style="display:block;width:100%;text-align:center;padding:8px;background:rgba(255,255,255,.1);border:none;color:rgba(255,255,255,.6);cursor:pointer;font-family:inherit;font-size:13px;border-radius:6px;margin-top:4px;">✕ Close</button>\n      </div>\n      <button class="btn-out-hdr" onclick="showProfilePanel()"'
    h = h.replace(OLD_DD_END, NEW_DD_END, 1)
    print("Close button added inside dropdown")

with open(PATH, 'w', encoding='utf-8', newline='\n') as f:
    f.write(h)
print("Saved")
print()
print("git add .")
print('git commit -m "Parent mobile: fix hamburger stopPropagation, remove conflicting listener"')
print("git push")
