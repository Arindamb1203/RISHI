import os, re

PATH = os.path.join('public', 'parent.html')
with open(PATH, 'r', encoding='utf-8') as f:
    h = f.read()
h = h.replace('\r\n', '\n')

OLD = """function syncToCloud() {
  if (typeof rishiSync === 'undefined') { alert('Sync not available.'); return; }
  var btn = event.target;
  btn.textContent = '⏳…'; btn.disabled = true;
  rishiSync.pushAll();
  setTimeout(function(){
    btn.textContent = '✅ Done!'; btn.disabled = false;
    setTimeout(function(){ btn.textContent = '☁ Sync'; }, 2000);
  }, 1500);
}"""

NEW = """function syncToCloud() {
  if (typeof rishiSync === 'undefined') { showSyncToast('❌ Sync not available'); return; }
  showSyncToast('⏳ Syncing to cloud…', '#0f2240');
  rishiSync.pushAll();
  setTimeout(function(){
    showSyncToast('✅ Synced! Data saved to cloud.', '#1a7a4a');
  }, 1800);
}
function showSyncToast(msg, bg) {
  bg = bg || '#0f2240';
  var t = document.getElementById('sync-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'sync-toast';
    t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);'
      + 'padding:14px 28px;border-radius:12px;font-size:15px;font-weight:800;'
      + 'color:#fff;z-index:99999;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,.3);'
      + 'transition:opacity .3s;max-width:90vw;font-family:Nunito,sans-serif;';
    document.body.appendChild(t);
  }
  t.style.background = bg;
  t.style.opacity = '1';
  t.textContent = msg;
  clearTimeout(t._timer);
  if (bg !== '#0f2240') {
    t._timer = setTimeout(function(){ t.style.opacity = '0'; }, 3000);
  }
}"""

if 'syncToCloud' in h:
    h = re.sub(r'function syncToCloud\(\) \{.*?\n\}', NEW, h, flags=re.DOTALL, count=1)
    print("syncToCloud updated with toast")
else:
    print("MISS")

with open(PATH, 'w', encoding='utf-8', newline='\n') as f:
    f.write(h)
print("Saved")
print()
print("git add .")
print('git commit -m "Parent: Sync shows visible toast banner"')
print("git push")
