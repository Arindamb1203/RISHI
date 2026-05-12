import os, re

PATH = os.path.join('public', 'parent.html')
with open(PATH, 'r', encoding='utf-8') as f:
    h = f.read()
h = h.replace('\r\n', '\n')

# Add Sync button to the header area (near Sign Out)
# Find the Sign Out button in parent.html header
OLD = 'onclick="doLogout()"'
if OLD in h:
    idx = h.find(OLD)
    # Find the full button tag
    btn_start = h.rfind('<button', 0, idx)
    btn_end = h.find('</button>', idx) + len('</button>')
    old_btn = h[btn_start:btn_end]
    new_btn = ('<button onclick="syncToCloud()" style="'
               'background:#1a7a4a;color:#fff;border:none;padding:8px 14px;'
               'border-radius:8px;font-weight:800;cursor:pointer;font-family:inherit;'
               'font-size:13px;margin-right:6px;" title="Sync progress to cloud">'
               '☁ Sync</button>\n    ') + old_btn
    h = h[:btn_start] + new_btn + h[btn_end:]
    print("Sync button added near Sign Out")
else:
    print("MISS: Sign Out button")

# Add syncToCloud function
SYNC_FN = """
function syncToCloud() {
  if (typeof rishiSync === 'undefined') { alert('Sync not available.'); return; }
  var btn = document.querySelector('[onclick="syncToCloud()"]');
  if (btn) { btn.textContent = '⏳ Syncing…'; btn.disabled = true; }
  rishiSync.pushAll();
  setTimeout(function() {
    if (btn) { btn.textContent = '✅ Synced!'; btn.disabled = false; }
    setTimeout(function(){ if(btn) btn.textContent = '☁ Sync'; }, 2000);
  }, 1500);
}
"""

if 'syncToCloud' not in h:
    h = h.replace('function doLogout()', SYNC_FN + '\nfunction doLogout()', 1)
    print("syncToCloud function added")

with open(PATH, 'w', encoding='utf-8', newline='\n') as f:
    f.write(h)
print("Saved parent.html")
print()
print("git add .")
print('git commit -m "Parent: add Sync to Cloud button"')
print("git push")
