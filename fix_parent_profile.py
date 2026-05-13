import os, re

PATH = os.path.join('public', 'parent.html')
with open(PATH, 'r', encoding='utf-8') as f:
    h = f.read()
h = h.replace('\r\n', '\n')

# ── 1. Add Profile button to header (next to Sync button) ──
OLD_SYNC = '>☁ Sync</button>'
NEW_SYNC = '>☁ Sync</button>\n      <button onclick="showProfilePanel()" class="btn-out-hdr btn-hide-mobile" title="Profile &amp; Settings" style="font-size:16px;">👤</button>'
if OLD_SYNC in h:
    h = h.replace(OLD_SYNC, NEW_SYNC, 1)
    print("Profile button added to header")
else:
    print("MISS: Sync button")

# Also add profile to hamburger menu dropdown
OLD_MENU = '<button onclick="syncToCloud();toggleHdrMenu()"'
NEW_MENU = '<button onclick="showProfilePanel();toggleHdrMenu()" style="display:block;width:100%;text-align:left;padding:10px 14px;background:none;border:none;color:white;cursor:pointer;font-family:inherit;font-size:14px;font-weight:700;border-radius:6px;">👤 Profile &amp; Settings</button>\n        <button onclick="syncToCloud();toggleHdrMenu()"'
if OLD_MENU in h:
    h = h.replace(OLD_MENU, NEW_MENU, 1)
    print("Profile added to hamburger menu")
else:
    print("MISS: hamburger menu (OK if not yet added)")

# ── 2. Add Forgot / Change password to parent login ──
OLD_LOGIN_NOTE = '''<div class="login-note">This portal is for parents only. Student progress is monitored here.<br>Default password: rishi2025 &mdash; use with any registered parent username.</div>'''

NEW_LOGIN_NOTE = '''<div style="display:flex;justify-content:space-between;margin-top:14px;margin-bottom:4px;">
    <button onclick="toggleForgotParent()" style="background:none;border:none;color:var(--gold2);cursor:pointer;font-size:14px;font-weight:700;padding:0;font-family:inherit;">🔑 Forgot credentials?</button>
    <button onclick="toggleChangePwParent()" style="background:none;border:none;color:var(--gold2);cursor:pointer;font-size:14px;font-weight:700;padding:0;font-family:inherit;">🔐 Change password</button>
  </div>

  <!-- Forgot credentials -->
  <div id="forgot-parent-panel" style="display:none;background:rgba(245,158,11,.07);border:1.5px solid rgba(245,158,11,.25);border-radius:10px;padding:14px;margin-top:10px;">
    <div style="font-size:14px;font-weight:800;color:var(--gold2);margin-bottom:8px;">Recover via registered mobile</div>
    <input id="forgot-parent-mobile" type="tel" placeholder="Enter registered mobile number" style="width:100%;padding:10px 12px;border:1.5px solid rgba(245,158,11,.4);border-radius:8px;background:rgba(255,255,255,.06);color:white;font-family:inherit;font-size:14px;box-sizing:border-box;margin-bottom:8px;">
    <button onclick="recoverParentCreds()" style="width:100%;padding:10px;background:var(--gold2);border:none;border-radius:8px;font-weight:800;cursor:pointer;font-family:inherit;font-size:14px;color:#000;">Find My Account</button>
    <div id="forgot-parent-result" style="font-size:13px;margin-top:8px;color:var(--gold2);"></div>
  </div>

  <!-- Change password -->
  <div id="changepw-parent-panel" style="display:none;background:rgba(245,158,11,.07);border:1.5px solid rgba(245,158,11,.25);border-radius:10px;padding:14px;margin-top:10px;">
    <div style="font-size:14px;font-weight:800;color:var(--gold2);margin-bottom:8px;">Change Password</div>
    <input id="cp-parent-user" type="text" placeholder="Parent username" style="width:100%;padding:10px 12px;border:1.5px solid rgba(245,158,11,.4);border-radius:8px;background:rgba(255,255,255,.06);color:white;font-family:inherit;font-size:14px;box-sizing:border-box;margin-bottom:8px;">
    <input id="cp-parent-mobile" type="tel" placeholder="Registered mobile number" style="width:100%;padding:10px 12px;border:1.5px solid rgba(245,158,11,.4);border-radius:8px;background:rgba(255,255,255,.06);color:white;font-family:inherit;font-size:14px;box-sizing:border-box;margin-bottom:8px;">
    <input id="cp-parent-new" type="password" placeholder="New password (min 6 chars)" style="width:100%;padding:10px 12px;border:1.5px solid rgba(245,158,11,.4);border-radius:8px;background:rgba(255,255,255,.06);color:white;font-family:inherit;font-size:14px;box-sizing:border-box;margin-bottom:8px;">
    <button onclick="changeParentPw()" style="width:100%;padding:10px;background:var(--gold2);border:none;border-radius:8px;font-weight:800;cursor:pointer;font-family:inherit;font-size:14px;color:#000;">Update Password</button>
    <div id="cp-parent-result" style="font-size:13px;margin-top:8px;color:var(--gold2);"></div>
  </div>

  <div class="login-note">This portal is for parents only. Student progress is monitored here.<br>Default password: rishi2025 &mdash; use with any registered parent username.</div>'''

if OLD_LOGIN_NOTE in h:
    h = h.replace(OLD_LOGIN_NOTE, NEW_LOGIN_NOTE, 1)
    print("Forgot/Change password added to parent login")
else:
    print("MISS: login note")

# ── 3. Add the JS functions for forgot/change password ──
FN_JS = """
function toggleForgotParent() {
  var p = document.getElementById('forgot-parent-panel');
  var c = document.getElementById('changepw-parent-panel');
  if (c) c.style.display = 'none';
  if (p) p.style.display = p.style.display === 'none' ? 'block' : 'none';
}
function toggleChangePwParent() {
  var p = document.getElementById('forgot-parent-panel');
  var c = document.getElementById('changepw-parent-panel');
  if (p) p.style.display = 'none';
  if (c) c.style.display = c.style.display === 'none' ? 'block' : 'none';
}
function recoverParentCreds() {
  var mobile = document.getElementById('forgot-parent-mobile').value.trim();
  var result = document.getElementById('forgot-parent-result');
  if (!mobile) { result.textContent = 'Enter your mobile number.'; return; }
  var regs = [];
  try { regs = JSON.parse(localStorage.getItem('rishi_registrations')||'[]'); } catch(e){}
  var found = regs.find(function(r){ return (r.primaryMobile||'').replace(/\\D/g,'') === mobile.replace(/\\D/g,''); });
  if (found) {
    var overrides = {};
    try { overrides = JSON.parse(localStorage.getItem('rishi_pw_overrides')||'{}'); } catch(e){}
    var pw = overrides[found.parentUsername] || 'rishi2025';
    result.innerHTML = '&#10003; Found! Username: <strong>' + found.parentUsername + '</strong><br>Password: <strong>' + pw + '</strong>';
  } else {
    result.textContent = 'Mobile number not found. Contact admin.';
  }
}
function changeParentPw() {
  var user   = document.getElementById('cp-parent-user').value.trim();
  var mobile = document.getElementById('cp-parent-mobile').value.trim();
  var newPw  = document.getElementById('cp-parent-new').value;
  var result = document.getElementById('cp-parent-result');
  if (!user || !mobile || !newPw) { result.textContent = 'Fill all fields.'; return; }
  if (newPw.length < 6) { result.textContent = 'Password must be at least 6 characters.'; return; }
  var regs = [];
  try { regs = JSON.parse(localStorage.getItem('rishi_registrations')||'[]'); } catch(e){}
  var found = regs.find(function(r){
    return r.parentUsername === user && (r.primaryMobile||'').replace(/\\D/g,'') === mobile.replace(/\\D/g,'');
  });
  if (found) {
    var overrides = {};
    try { overrides = JSON.parse(localStorage.getItem('rishi_pw_overrides')||'{}'); } catch(e){}
    overrides[user] = newPw;
    localStorage.setItem('rishi_pw_overrides', JSON.stringify(overrides));
    result.innerHTML = '&#10003; Password updated. Use it on next login.';
    document.getElementById('cp-parent-new').value = '';
  } else {
    result.textContent = 'Username and mobile do not match.';
  }
}
"""

if 'toggleForgotParent' not in h:
    h = h.replace('function toggleHdrMenu()', FN_JS + '\nfunction toggleHdrMenu()', 1)
    if 'toggleForgotParent' not in h:
        h = h.replace('function enterPortal()', FN_JS + '\nfunction enterPortal()', 1)
    print("Forgot/Change password JS added")

with open(PATH, 'w', encoding='utf-8', newline='\n') as f:
    f.write(h)
print("\nSaved parent.html")
print()
print("git add .")
print('git commit -m "Parent: profile button, forgot/change password on login"')
print("git push")
