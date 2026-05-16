import os, re

PATH = os.path.join('public', 'parent.html')
with open(PATH, 'r', encoding='utf-8') as f:
    h = f.read()
h = h.replace('\r\n', '\n')

# Replace the global syncToCloud with a diagnostic version using alert
OLD_GLOBAL = re.search(r'<script>\nfunction showSyncToast.*?</script>', h, re.DOTALL)
if OLD_GLOBAL:
    h = h.replace(OLD_GLOBAL.group(0), '', 1)
    print("Old global removed")

# Add simple diagnostic version
DIAG = """
<script>
function syncToCloud() {
  if (typeof rishiSync === 'undefined') {
    alert('ERROR: rishiSync not loaded. rishi-sync.js missing from page.');
    return;
  }
  rishiSync.pushAll();
  alert('Sync done! Data pushed to cloud.');
}
</script>
"""
h = h.replace('</body>', DIAG + '</body>')
print("Diagnostic syncToCloud added")

with open(PATH, 'w', encoding='utf-8', newline='\n') as f:
    f.write(h)
print("Saved")
print()
print("git add .")
print('git commit -m "Parent: diagnostic sync to find root cause"')
print("git push")
