import os, re

PATH = os.path.join('public', 'parent.html')
with open(PATH, 'r', encoding='utf-8') as f:
    h = f.read()
h = h.replace('\r\n', '\n')

# Check where syncToCloud is
idx = h.find('function syncToCloud')
print("syncToCloud at position:", idx)

# Remove existing trapped version
h = re.sub(r'\nfunction syncToCloud\(\) \{.*?\}\n', '\n', h, flags=re.DOTALL, count=1)
print("Removed trapped syncToCloud")

# Also remove showSyncToast if trapped
h = re.sub(r'\nfunction showSyncToast\(.*?\}\n', '\n', h, flags=re.DOTALL, count=1)

# Add both as global before </body>
GLOBAL_SCRIPT = """
<script>
function showSyncToast(msg, bg) {
  bg = bg || '#0f2240';
  var t = document.getElementById('sync-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'sync-toast';
    t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);padding:14px 28px;border-radius:12px;font-size:15px;font-weight:800;color:#fff;z-index:99999;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,.3);transition:opacity .4s;max-width:90vw;font-family:Nunito,sans-serif;';
    document.body.appendChild(t);
  }
  t.style.background = bg;
  t.style.opacity = '1';
  t.textContent = msg;
  clearTimeout(t._timer);
  if (bg !== '#0f2240') {
    t._timer = setTimeout(function(){ t.style.opacity = '0'; }, 3000);
  }
}
function syncToCloud() {
  if (typeof rishiSync === 'undefined') { showSyncToast('Sync not available', '#c0392b'); return; }
  showSyncToast('\u23f3 Syncing to cloud\u2026', '#0f2240');
  rishiSync.pushAll();
  setTimeout(function(){ showSyncToast('\u2705 Synced! Data saved.', '#1a7a4a'); }, 1800);
}
</script>
"""

h = h.replace('</body>', GLOBAL_SCRIPT + '</body>')
print("syncToCloud + showSyncToast added as global")

with open(PATH, 'w', encoding='utf-8', newline='\n') as f:
    f.write(h)
print("Saved")
print()
print("git add .")
print('git commit -m "Parent: syncToCloud global, toast notification"')
print("git push")
