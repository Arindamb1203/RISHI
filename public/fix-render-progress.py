"""
RISHI — fix-render-progress.py
Adds the missing renderProgress() function to parent.html.

Run from D:\\rishi\\public:
  python fix-render-progress.py
"""

import os, shutil

ROOT   = os.path.dirname(os.path.abspath(__file__))
TARGET = os.path.join(ROOT, "parent.html")
BACKUP = os.path.join(ROOT, "parent.html.bak2")

shutil.copy2(TARGET, BACKUP)
print("  ✅ Backup: parent.html.bak2")

with open(TARGET, "r", encoding="utf-8") as f:
    html = f.read()

# Insert renderProgress just before deletePlan
OLD = "function deletePlan(planId) {"
NEW = """function renderProgress() {
  /* Refreshes progress indicators on the study plan tab after any plan change */
  renderActivePlans();
  renderExamGrid();
}

function deletePlan(planId) {"""

if OLD in html:
    html = html.replace(OLD, NEW, 1)
    print("  ✅ renderProgress() added before deletePlan()")
else:
    print("  ❌ deletePlan not found — check manually")

with open(TARGET, "w", encoding="utf-8") as f:
    f.write(html)

print("\nDONE. Now re-create the study plan in parent portal and test locking.")
