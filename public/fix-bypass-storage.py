"""
RISHI — fix-bypass-storage.py
Moves rishi_admin_bypass from localStorage to sessionStorage.
Fixes: bypass leaking to student sessions after admin visits.

Patches: admin.html, syllabus.html, parent.html, rishi-core.js

Run from D:\\rishi\\public:
  python fix-bypass-storage.py
"""

import os, shutil

ROOT = os.path.dirname(os.path.abspath(__file__))

FILES = [
    "admin.html",
    "syllabus.html",
    "parent.html",
    "rishi-core.js",
]

OLD = "localStorage.getItem('rishi_admin_bypass')"
NEW = "sessionStorage.getItem('rishi_admin_bypass')"

OLD_SET   = "localStorage.setItem('rishi_admin_bypass', '1')"
NEW_SET   = "sessionStorage.setItem('rishi_admin_bypass', '1')"

OLD_REM   = "localStorage.removeItem('rishi_admin_bypass')"
NEW_REM   = "sessionStorage.removeItem('rishi_admin_bypass')"

# Also handle the doLogout in admin which clears bypass
OLD_REM2  = "localStorage.removeItem('rishi_admin_bypass');"
NEW_REM2  = "sessionStorage.removeItem('rishi_admin_bypass');"

for fname in FILES:
    fpath = os.path.join(ROOT, fname)
    if not os.path.exists(fpath):
        print(f"  ⚠️  Not found: {fname}")
        continue

    # Backup
    shutil.copy2(fpath, fpath + ".bypassbak")

    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()

    original = content
    content = content.replace(OLD,     NEW)
    content = content.replace(OLD_SET, NEW_SET)
    content = content.replace(OLD_REM, NEW_REM)

    count = original.count(OLD) + original.count(OLD_SET) + original.count(OLD_REM)

    with open(fpath, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"  ✅ {fname} — {count} occurrence(s) patched")

print("""
DONE.

IMPORTANT — do this now:
  1. Open browser DevTools on rishi-ewh.pages.dev
  2. Application → Local Storage → delete 'rishi_admin_bypass' manually
  3. Refresh the student syllabus page
  4. Locking will now work correctly

From now on:
  - Admin bypass only lasts for that browser TAB session
  - Closing the tab clears bypass automatically
  - Students opening a fresh tab are never affected
""")
