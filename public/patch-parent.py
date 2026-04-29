"""
RISHI — patch-parent.py
Makes parent.html and parent-dashboard.html class-aware.

Run from D:\\rishi\\public:
  python patch-parent.py

Backs up both files before patching.
"""

import os, shutil

ROOT = os.path.dirname(os.path.abspath(__file__))

# ── ALL CLASS CHAPTERS DATA (shared across both files) ────────────────────────

ALL_CLASS_CHAPTERS_JS = """
/* ══════════════════════════════════════════════════════════
   RISHI — ALL CLASS CHAPTERS (class-aware)
   ══════════════════════════════════════════════════════════ */
var ALL_CLASS_CHAPTERS = {
  8: {
    chapters: [
      {id:1,  name:"Rational Numbers",              topic:"Arithmetic"},
      {id:2,  name:"Linear Equations",              topic:"Algebra"},
      {id:3,  name:"Understanding Quadrilaterals",  topic:"Geometry"},
      {id:4,  name:"Practical Geometry",            topic:"Geometry"},
      {id:5,  name:"Data Handling",                 topic:"Data Handling"},
      {id:6,  name:"Squares & Square Roots",        topic:"Arithmetic"},
      {id:7,  name:"Cubes & Cube Roots",            topic:"Arithmetic"},
      {id:8,  name:"Comparing Quantities",          topic:"Arithmetic"},
      {id:9,  name:"Algebraic Expressions",         topic:"Algebra"},
      {id:10, name:"Visualising Solid Shapes",      topic:"Geometry"},
      {id:11, name:"Mensuration (Area)",             topic:"Mensuration"},
      {id:112,name:"Mensuration (Surface & Vol)",   topic:"Mensuration"},
      {id:12, name:"Exponents and Powers",          topic:"Arithmetic"},
      {id:13, name:"Direct & Inverse Proportions",  topic:"Arithmetic"},
      {id:14, name:"Factorisation",                 topic:"Algebra"},
      {id:15, name:"Introduction to Graphs",        topic:"Algebra"},
      {id:16, name:"Playing with Numbers",          topic:"Arithmetic"},
      {id:17, name:"Chance and Probability",        topic:"Data Handling"}
    ],
    explainBuilt: {1:1,2:1,3:1,4:1,5:1,8:1,9:1,10:1,11:1,112:1,12:1,13:1,14:1,15:1,16:1,17:1}
  },
  9: {
    chapters: [
      {id:1,  name:"Real Numbers",                       topic:"Arithmetic"},
      {id:2,  name:"Polynomials",                        topic:"Algebra"},
      {id:3,  name:"Linear Equations in Two Variables",  topic:"Algebra"},
      {id:4,  name:"Coordinate Geometry",                topic:"Coordinate Geometry"},
      {id:5,  name:"Euclid's Geometry",                  topic:"Geometry"},
      {id:6,  name:"Lines and Angles",                   topic:"Geometry"},
      {id:7,  name:"Triangles",                          topic:"Geometry"},
      {id:8,  name:"Quadrilaterals",                     topic:"Geometry"},
      {id:9,  name:"Circles",                            topic:"Geometry"},
      {id:10, name:"Heron's Formula",                    topic:"Mensuration"},
      {id:11, name:"Surface Areas and Volumes",          topic:"Mensuration"},
      {id:12, name:"Statistics",                         topic:"Data Handling"}
    ],
    explainBuilt: {}
  },
  7: {
    chapters: [
      {id:1, name:"Large Numbers Around Us",             topic:"Arithmetic"},
      {id:2, name:"Arithmetic Expressions",              topic:"Arithmetic"},
      {id:3, name:"A Peek Beyond the Point",             topic:"Arithmetic"},
      {id:4, name:"Expressions using Letter-Numbers",    topic:"Algebra"},
      {id:5, name:"Parallel and Intersecting Lines",     topic:"Geometry"},
      {id:6, name:"Number Play",                         topic:"Arithmetic"},
      {id:7, name:"A Tale of Three Intersecting Lines",  topic:"Geometry"},
      {id:8, name:"Working with Fractions",              topic:"Arithmetic"}
    ],
    explainBuilt: {}
  },
  6: {
    chapters: [
      {id:1,  name:"Patterns in Mathematics",            topic:"Arithmetic"},
      {id:2,  name:"Lines and Angles",                   topic:"Geometry"},
      {id:3,  name:"Number Play",                        topic:"Arithmetic"},
      {id:4,  name:"Data Handling and Presentation",     topic:"Data Handling"},
      {id:5,  name:"Prime Time",                         topic:"Arithmetic"},
      {id:6,  name:"Perimeter and Area",                 topic:"Mensuration"},
      {id:7,  name:"Fractions",                          topic:"Arithmetic"},
      {id:8,  name:"Playing with Constructions",         topic:"Geometry"},
      {id:9,  name:"Symmetry",                           topic:"Geometry"},
      {id:10, name:"The Other Side of Zero",             topic:"Arithmetic"}
    ],
    explainBuilt: {}
  }
};

/* Active class data — set by loadParentClassData() */
var CHAPTERS = [];
var EXPLAIN_BUILT = {};

function getStudentClass() {
  var sid = sessionStorage.getItem('rishi_parent_student_id') || '';
  if (!sid) return 8;
  var regs = [];
  try { regs = JSON.parse(localStorage.getItem('rishi_registrations') || '[]'); } catch(e) {}
  for (var i = 0; i < regs.length; i++) {
    if (regs[i].studentUsername === sid) return parseInt(regs[i].class || 8);
  }
  return 8;
}

function loadParentClassData() {
  var classNum = getStudentClass();
  var cd = ALL_CLASS_CHAPTERS[classNum] || ALL_CLASS_CHAPTERS[8];
  CHAPTERS     = cd.chapters;
  EXPLAIN_BUILT = cd.explainBuilt;
}

"""

# ══════════════════════════════════════════════════════════════════════════════
# PATCH parent.html
# ══════════════════════════════════════════════════════════════════════════════

PARENT_FILE = os.path.join(ROOT, "parent.html")
PARENT_BAK  = os.path.join(ROOT, "parent.html.bak")

shutil.copy2(PARENT_FILE, PARENT_BAK)
print(f"  ✅ Backup: parent.html.bak")

with open(PARENT_FILE, "r", encoding="utf-8") as f:
    p = f.read()

# 1. Replace hardcoded CHAPTERS + EXPLAIN_BUILT block
OLD_CH_PARENT = """var CHAPTERS = [
  {id:1,  name:"Rational Numbers",                      topic:"Arithmetic"},
  {id:2,  name:"Linear Equations in One Variable",      topic:"Algebra"},
  {id:3,  name:"Understanding Quadrilaterals",           topic:"Geometry"},
  {id:4,  name:"Practical Geometry",                    topic:"Geometry"},
  {id:5,  name:"Data Handling",                         topic:"Data Handling"},
  {id:8,  name:"Comparing Quantities",                  topic:"Arithmetic"},
  {id:9,  name:"Algebraic Expressions and Identities",  topic:"Algebra"},
  {id:10, name:"Visualising Solid Shapes",              topic:"Geometry"},
  {id:11, name:"Mensuration",                           topic:"Mensuration"},
  {id:12, name:"Exponents and Powers",                  topic:"Arithmetic"},
  {id:13, name:"Direct and Inverse Proportions",        topic:"Arithmetic"},
  {id:14, name:"Factorisation",                         topic:"Algebra"},
  {id:15, name:"Introduction to Graphs",               topic:"Algebra"},
  {id:16, name:"Playing with Numbers",                  topic:"Arithmetic"}
];"""

if OLD_CH_PARENT in p:
    p = p.replace(OLD_CH_PARENT, ALL_CLASS_CHAPTERS_JS)
    print("  ✅ parent.html: CHAPTERS block replaced")
else:
    # Try without exact whitespace - find and replace the block
    import re
    pattern = r'var CHAPTERS = \[\s*\{id:1,\s*name:"Rational Numbers".*?\];'
    match = re.search(pattern, p, re.DOTALL)
    if match:
        p = p[:match.start()] + ALL_CLASS_CHAPTERS_JS + p[match.end():]
        print("  ✅ parent.html: CHAPTERS block replaced (regex)")
    else:
        print("  ❌ parent.html: CHAPTERS block NOT found — manual check needed")

# 2. Replace old EXPLAIN_BUILT
OLD_EXPLAIN_BUILT = "var EXPLAIN_BUILT = {1:1, 2:1, 3:1, 4:1, 8:1, 12:1, 13:1};"
if OLD_EXPLAIN_BUILT in p:
    p = p.replace(OLD_EXPLAIN_BUILT, "/* EXPLAIN_BUILT now loaded dynamically via loadParentClassData() */")
    print("  ✅ parent.html: old EXPLAIN_BUILT removed")

# 3. Add loadParentClassData() call in initMainPortal
OLD_INIT_PORTAL = "function initMainPortal() {\n  document.getElementById('main-portal').className = '';"
NEW_INIT_PORTAL = "function initMainPortal() {\n  loadParentClassData();\n  document.getElementById('main-portal').className = '';"

if OLD_INIT_PORTAL in p:
    p = p.replace(OLD_INIT_PORTAL, NEW_INIT_PORTAL)
    print("  ✅ parent.html: loadParentClassData() added to initMainPortal")
else:
    # CRLF version
    OLD_INIT_PORTAL_CRLF = "function initMainPortal() {\r\n  document.getElementById('main-portal').className = '';"
    NEW_INIT_PORTAL_CRLF = "function initMainPortal() {\r\n  loadParentClassData();\r\n  document.getElementById('main-portal').className = '';"
    if OLD_INIT_PORTAL_CRLF in p:
        p = p.replace(OLD_INIT_PORTAL_CRLF, NEW_INIT_PORTAL_CRLF)
        print("  ✅ parent.html: loadParentClassData() added to initMainPortal (CRLF)")
    else:
        print("  ⚠️  parent.html: initMainPortal not found — add loadParentClassData() manually")

with open(PARENT_FILE, "w", encoding="utf-8") as f:
    f.write(p)
print("  ✅ parent.html written\n")

# ══════════════════════════════════════════════════════════════════════════════
# PATCH parent-dashboard.html
# ══════════════════════════════════════════════════════════════════════════════

DASH_FILE = os.path.join(ROOT, "parent-dashboard.html")
DASH_BAK  = os.path.join(ROOT, "parent-dashboard.html.bak")

shutil.copy2(DASH_FILE, DASH_BAK)
print(f"  ✅ Backup: parent-dashboard.html.bak")

with open(DASH_FILE, "r", encoding="utf-8") as f:
    d = f.read()

# Dashboard uses a different CHAPTERS format (with color field) — replace separately
OLD_CH_DASH_START = 'var CHAPTERS = [\n  {id:1,  name:"Rational Numbers"'
OLD_EXPLAIN_BUILT_DASH = "var EXPLAIN_BUILT = {1:1, 2:1, 3:1, 4:1, 8:1, 12:1, 13:1};"

import re
dash_ch_pattern = r'var CHAPTERS = \[\s*\{id:1,\s*name:"Rational Numbers".*?\];'
dash_match = re.search(dash_ch_pattern, d, re.DOTALL)

if dash_match:
    d = d[:dash_match.start()] + ALL_CLASS_CHAPTERS_JS + d[dash_match.end():]
    print("  ✅ parent-dashboard.html: CHAPTERS block replaced")
else:
    print("  ❌ parent-dashboard.html: CHAPTERS block NOT found")

if OLD_EXPLAIN_BUILT_DASH in d:
    d = d.replace(OLD_EXPLAIN_BUILT_DASH, "/* EXPLAIN_BUILT now loaded dynamically via loadParentClassData() */")
    print("  ✅ parent-dashboard.html: old EXPLAIN_BUILT removed")

# Add loadParentClassData call — dashboard typically calls a render function on load
# Find window.onload or DOMContentLoaded in dashboard
dash_onload_patterns = [
    "window.onload = function() {",
    "window.onload=function(){",
    "window.onload = function(){"
]
for pat in dash_onload_patterns:
    if pat in d:
        d = d.replace(pat, pat + "\n  loadParentClassData();", 1)
        print(f"  ✅ parent-dashboard.html: loadParentClassData() added to window.onload")
        break
else:
    print("  ⚠️  parent-dashboard.html: window.onload not found — add loadParentClassData() manually at top of init")

with open(DASH_FILE, "w", encoding="utf-8") as f:
    f.write(d)
print("  ✅ parent-dashboard.html written\n")

print("="*50)
print("DONE")
print("="*50)
print("""
Both files patched. 

Test:
  1. Log in as Class 8 parent — should see Class 8 chapters (same as before)
  2. Log in as Class 9 parent — should see Class 9 chapters
  3. Set a study plan for Class 8 student — lock should still work on syllabus

Backups saved as .bak files if rollback needed.
""")
