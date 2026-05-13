import os, re

PARENT = os.path.join('public', 'parent.html')
with open(PARENT, 'r', encoding='utf-8') as f:
    ph = f.read()
ph = ph.replace('\r\n', '\n')

# 1. Revert dropdown profile button back to correct style (no gold)
ph = re.sub(
    r'<button onclick="showProfilePanel\(\);toggleHdrMenu\(\)"[^>]*>',
    '<button onclick="showProfilePanel();toggleHdrMenu()" style="display:block;width:100%;text-align:left;padding:10px 14px;background:none;border:none;color:white;cursor:pointer;font-family:inherit;font-size:14px;font-weight:700;border-radius:6px;">',
    ph, count=1
)
print("Dropdown button restored")

# 2. Add gold profile button directly to header — after Guide button
ph = re.sub(
    r'(class="btn-out-hdr btn-hide-mobile"[^>]*>&#10067; Guide</button>)',
    r'\1\n      <button onclick="showProfilePanel()" style="font-size:16px;padding:5px 12px;background:#c8922a;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:900;margin:0 2px;" title="Profile">👤</button>',
    ph, count=1
)
print("Gold profile button added to header")

# 3. Add ?tab= handler if missing
if '?tab=' not in ph:
    TAB_JS = """
(function(){
  var tab = new URLSearchParams(window.location.search).get('tab');
  if (tab) document.addEventListener('DOMContentLoaded', function(){
    setTimeout(function(){ if(typeof switchTab==='function') switchTab(tab); }, 300);
  });
})();
"""
    ph = ph.replace('function enterPortal()', TAB_JS + '\nfunction enterPortal()', 1)
    print("Tab param handler added")

with open(PARENT, 'w', encoding='utf-8', newline='\n') as f:
    f.write(ph)
print("Saved")
print()
print("git add .")
print('git commit -m "Parent: gold profile button in header, fix dropdown"')
print("git push")
