import os

PATH = os.path.join('public', 'admin.html')
with open(PATH, 'r', encoding='utf-8') as f:
    h = f.read()

OLD = """<button class="btn btn-ghost" onclick="window.open('/login.html','_blank')">🔐 Student Login</button>"""
NEW = """<button class="btn btn-ghost" onclick="window.open('/login.html','_blank')">🔐 Student Login</button>
          <button class="btn btn-ghost" onclick="openParentDirect()">👨‍👩‍👧 Parent Portal</button>"""

if OLD in h:
    h = h.replace(OLD, NEW, 1)
    print("Parent Portal button added")
else:
    print("MISS: Quick Actions buttons")

# Add openParentDirect function near goParent
OLD2 = "function goParent(idx) {"
NEW2 = """function openParentDirect() {
  var bypass = sessionStorage.getItem('rishi_admin_bypass') === '1';
  var cs = {};
  try { cs = JSON.parse(localStorage.getItem('rishi_current_student')||'{}'); } catch(e){}
  var sName = encodeURIComponent(cs.studentName || 'Student');
  var sId   = encodeURIComponent(cs.studentUsername || cs.studentId || 'default');
  var url = '/parent.html?bypass=1&sName=' + sName + '&sId=' + sId;
  window.open(url, '_blank');
}

function goParent(idx) {"""

if "function goParent(idx) {" in h:
    h = h.replace(OLD2, NEW2, 1)
    print("openParentDirect function added")
else:
    print("MISS: goParent function")

with open(PATH, 'w', encoding='utf-8', newline='\n') as f:
    f.write(h)
print("admin.html saved")
print()
print("git add .")
print('git commit -m "Parent portal: fix password rishi2025, fallback login, admin direct access"')
print("git push")
