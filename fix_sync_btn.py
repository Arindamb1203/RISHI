import os

PATH = os.path.join('public', 'parent.html')
with open(PATH, 'r', encoding='utf-8') as f:
    h = f.read()
h = h.replace('\r\n', '\n')

OLD = '<button class="btn-out-hdr" onclick="logout()">Sign Out</button>'
NEW = '''<button onclick="syncToCloud()" style="background:#1a7a4a;color:#fff;border:none;padding:8px 16px;border-radius:8px;font-weight:800;cursor:pointer;font-family:inherit;font-size:14px;margin-right:6px;">☁ Sync</button><button class="btn-out-hdr" onclick="logout()">Sign Out</button>'''

if OLD in h:
    h = h.replace(OLD, NEW, 1)
    print("Sync button added")
else:
    print("MISS")

if 'syncToCloud' not in h:
    SYNC_FN = """
function syncToCloud() {
  if (typeof rishiSync === 'undefined') { alert('Sync not available.'); return; }
  var btn = event.target;
  btn.textContent = '⏳…'; btn.disabled = true;
  rishiSync.pushAll();
  setTimeout(function(){
    btn.textContent = '✅ Done!'; btn.disabled = false;
    setTimeout(function(){ btn.textContent = '☁ Sync'; }, 2000);
  }, 1500);
}
"""
    h = h.replace('function logout()', SYNC_FN + '\nfunction logout()', 1)
    print("syncToCloud function added")

with open(PATH, 'w', encoding='utf-8', newline='\n') as f:
    f.write(h)
print("Saved")
print()
print("git add .")
print('git commit -m "Parent: Sync to Cloud button"')
print("git push")
