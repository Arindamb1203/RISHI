"""
RISHI — patch-admin.py
Makes admin.html class-aware for Classes 6, 7, 8, 9.

Run from D:\\rishi\\public:
  python patch-admin.py

Backs up original to admin.html.bak before patching.
"""

import os, shutil, re

ROOT   = os.path.dirname(os.path.abspath(__file__))
TARGET = os.path.join(ROOT, "admin.html")
BACKUP = os.path.join(ROOT, "admin.html.bak")

shutil.copy2(TARGET, BACKUP)
print("  ✅ Backup: admin.html.bak")

with open(TARGET, "r", encoding="utf-8") as f:
    html = f.read()

# ══════════════════════════════════════════════════════════════════════════════
# REPLACEMENT 1 — Replace hardcoded CH + TOPICS with ALL_CLASS_CH + loader
# ══════════════════════════════════════════════════════════════════════════════

NEW_CH_BLOCK = """/* ── CHAPTER DATA — ALL CLASSES ────────────────────────── */
var ALL_CLASS_CH = {

  /* ── CLASS 8 ── */
  8: {
    CH: {
      1: {n:'Rational Numbers',             topic:'Arithmetic',   color:'#6C63FF', built:true,
          ex:'/explain/class8/arithmetic/rational-numbers.html',
          pr:'/practice/class8/arithmetic/rational-numbers.html',           exam:'/exam.html?ch=01'},
      2: {n:'Linear Equations',             topic:'Algebra',      color:'#2563EB', built:true,
          ex:'/explain/class8/algebra/linear-equations.html',
          pr:'/practice/class8/algebra/linear-equations.html',              exam:'/exam.html?ch=02'},
      3: {n:'Understanding Quadrilaterals', topic:'Geometry',     color:'#059669', built:true,
          ex:'/explain/class8/geometry/understanding-quadrilaterals.html',
          pr:'/practice/class8/geometry/understanding-quadrilaterals.html', exam:'/exam.html?ch=03'},
      4: {n:'Practical Geometry',           topic:'Geometry',     color:'#0D9488', built:true,
          ex:'/explain/class8/geometry/practical-geometry.html',
          pr:'/practice/class8/geometry/practical-geometry.html',           exam:'/exam.html?ch=04'},
      5: {n:'Data Handling',                topic:'Data Handling',color:'#D97706', built:true,
          ex:'/explain/class8/data-handling/frequency-distribution.html',
          pr:'/practice/class8/data-handling/frequency-distribution.html',  exam:'/exam.html?ch=05'},
      6: {n:'Squares & Square Roots',       topic:'Arithmetic',   color:'#888',    built:false,
          ex:null, pr:null, exam:null},
      7: {n:'Cubes & Cube Roots',           topic:'Arithmetic',   color:'#777',    built:false,
          ex:null, pr:null, exam:null},
      8: {n:'Comparing Quantities',         topic:'Arithmetic',   color:'#7C3AED', built:true,
          ex:'/explain/class8/arithmetic/comparing-quantities.html',
          pr:'/practice/class8/arithmetic/comparing-quantities.html',       exam:'/exam.html?ch=08'},
      9: {n:'Algebraic Expressions',        topic:'Algebra',      color:'#0891B2', built:true,
          ex:'/explain/class8/algebra/algebraic-expressions-identities.html',
          pr:'/practice/class8/algebra/algebraic-expressions-identities.html', exam:'/exam.html?ch=09'},
      10:{n:'Visualising Solid Shapes',     topic:'Geometry',     color:'#16A34A', built:true,
          ex:'/explain/class8/geometry/visualising-solid-shapes.html',
          pr:'/practice/class8/geometry/visualising-solid-shapes.html',     exam:'/exam.html?ch=10'},
      11:{n:'Area of Plane Figures',        topic:'Mensuration',  color:'#B45309', built:true,
          ex:'/explain/class8/mensuration/area-plane-figures.html',
          pr:'/practice/class8/mensuration/area-plane-figures.html',        exam:'/exam.html?ch=11a'},
      112:{n:'Surface Area & Volume',       topic:'Mensuration',  color:'#92400e', built:true,
          ex:'/explain/class8/mensuration/surface-area-volume.html',
          pr:'/practice/class8/mensuration/surface-area-volume.html',       exam:'/exam.html?ch=11b'},
      12:{n:'Exponents and Powers',         topic:'Arithmetic',   color:'#4338CA', built:true,
          ex:'/explain/class8/arithmetic/powers-exponents.html',
          pr:'/practice/class8/arithmetic/powers-exponents.html',           exam:'/exam.html?ch=12'},
      13:{n:'Direct & Inverse Proportions', topic:'Arithmetic',   color:'#DB2777', built:true,
          ex:'/explain/class8/arithmetic/direct-inverse-proportions.html',
          pr:'/practice/class8/arithmetic/direct-inverse-proportions.html', exam:'/exam.html?ch=13'},
      14:{n:'Factorisation',                topic:'Algebra',      color:'#65A30D', built:true,
          ex:'/explain/class8/algebra/factorisation.html',
          pr:'/practice/class8/algebra/factorisation.html',                 exam:'/exam.html?ch=14'},
      15:{n:'Introduction to Graphs',       topic:'Algebra',      color:'#0284C7', built:true,
          ex:'/explain/class8/algebra/introduction-to-graphs.html',
          pr:'/practice/class8/algebra/introduction-to-graphs.html',        exam:'/exam.html?ch=15'},
      16:{n:'Playing with Numbers',         topic:'Arithmetic',   color:'#7E22CE', built:true,
          ex:'/explain/class8/arithmetic/playing-with-numbers.html',
          pr:'/practice/class8/arithmetic/playing-with-numbers.html',       exam:'/exam.html?ch=16'},
      17:{n:'Chance & Probability',         topic:'Data Handling',color:'#0369A1', built:true,
          ex:'/explain/class8/data-handling/chance-probability.html',
          pr:'/practice/class8/data-handling/chance-probability.html',      exam:'/exam.html?ch=17'}
    },
    TOPICS: [
      {id:'algebra',      name:'Algebra',       icon:'🔣', chs:[2,9,14,15]},
      {id:'geometry',     name:'Geometry',      icon:'📐', chs:[3,4,10]},
      {id:'mensuration',  name:'Mensuration',   icon:'📏', chs:[11,112]},
      {id:'arithmetic',   name:'Arithmetic',    icon:'🔢', chs:[1,6,7,8,12,13,16]},
      {id:'datahandling', name:'Data Handling', icon:'📊', chs:[5,17]}
    ],
    ALL_BUILT_CHS: [1,2,3,4,5,8,9,10,11,112,12,13,14,15,16,17]
  },

  /* ── CLASS 9 ── */
  9: {
    CH: {
      1: {n:'Real Numbers',                      topic:'Arithmetic',        color:'#6C63FF', built:false,
          ex:'/explain/class9/arithmetic/real-numbers.html',
          pr:'/practice/class9/arithmetic/real-numbers.html',               exam:null},
      2: {n:'Polynomials',                       topic:'Algebra',           color:'#2563EB', built:false,
          ex:'/explain/class9/algebra/polynomials.html',
          pr:'/practice/class9/algebra/polynomials.html',                   exam:null},
      3: {n:'Linear Equations in Two Variables', topic:'Algebra',           color:'#7C3AED', built:false,
          ex:'/explain/class9/algebra/linear-equations-two-variables.html',
          pr:'/practice/class9/algebra/linear-equations-two-variables.html',exam:null},
      4: {n:'Coordinate Geometry',               topic:'Coord. Geometry',   color:'#0891B2', built:false,
          ex:'/explain/class9/coordinate-geometry/coordinate-geometry.html',
          pr:'/practice/class9/coordinate-geometry/coordinate-geometry.html',exam:null},
      5: {n:"Euclid's Geometry",                 topic:'Geometry',          color:'#059669', built:false,
          ex:'/explain/class9/geometry/euclids-geometry.html',
          pr:'/practice/class9/geometry/euclids-geometry.html',             exam:null},
      6: {n:'Lines and Angles',                  topic:'Geometry',          color:'#0D9488', built:false,
          ex:'/explain/class9/geometry/lines-and-angles.html',
          pr:'/practice/class9/geometry/lines-and-angles.html',             exam:null},
      7: {n:'Triangles',                         topic:'Geometry',          color:'#16A34A', built:false,
          ex:'/explain/class9/geometry/triangles.html',
          pr:'/practice/class9/geometry/triangles.html',                    exam:null},
      8: {n:'Quadrilaterals',                    topic:'Geometry',          color:'#D97706', built:false,
          ex:'/explain/class9/geometry/quadrilaterals.html',
          pr:'/practice/class9/geometry/quadrilaterals.html',               exam:null},
      9: {n:'Circles',                           topic:'Geometry',          color:'#DC2626', built:false,
          ex:'/explain/class9/geometry/circles.html',
          pr:'/practice/class9/geometry/circles.html',                      exam:null},
      10:{n:"Heron's Formula",                   topic:'Mensuration',       color:'#B45309', built:false,
          ex:'/explain/class9/mensuration/herons-formula.html',
          pr:'/practice/class9/mensuration/herons-formula.html',            exam:null},
      11:{n:'Surface Areas and Volumes',         topic:'Mensuration',       color:'#4338CA', built:false,
          ex:'/explain/class9/mensuration/surface-areas-volumes.html',
          pr:'/practice/class9/mensuration/surface-areas-volumes.html',     exam:null},
      12:{n:'Statistics',                        topic:'Data Handling',     color:'#0F766E', built:false,
          ex:'/explain/class9/data-handling/statistics.html',
          pr:'/practice/class9/data-handling/statistics.html',              exam:null}
    },
    TOPICS: [
      {id:'arithmetic',     name:'Arithmetic',      icon:'🔢', chs:[1]},
      {id:'algebra',        name:'Algebra',          icon:'🔣', chs:[2,3]},
      {id:'coord-geometry', name:'Coord. Geometry',  icon:'📍', chs:[4]},
      {id:'geometry',       name:'Geometry',         icon:'📐', chs:[5,6,7,8,9]},
      {id:'mensuration',    name:'Mensuration',      icon:'📏', chs:[10,11]},
      {id:'datahandling',   name:'Data Handling',    icon:'📊', chs:[12]}
    ],
    ALL_BUILT_CHS: []
  },

  /* ── CLASS 7 ── */
  7: {
    CH: {
      1:{n:'Large Numbers Around Us',           topic:'Arithmetic', color:'#6C63FF', built:false,
         ex:'/explain/class7/arithmetic/large-numbers-around-us.html',
         pr:'/practice/class7/arithmetic/large-numbers-around-us.html',     exam:null},
      2:{n:'Arithmetic Expressions',            topic:'Arithmetic', color:'#2563EB', built:false,
         ex:'/explain/class7/arithmetic/arithmetic-expressions.html',
         pr:'/practice/class7/arithmetic/arithmetic-expressions.html',      exam:null},
      3:{n:'A Peek Beyond the Point',           topic:'Arithmetic', color:'#7C3AED', built:false,
         ex:'/explain/class7/arithmetic/a-peek-beyond-the-point.html',
         pr:'/practice/class7/arithmetic/a-peek-beyond-the-point.html',     exam:null},
      4:{n:'Expressions using Letter-Numbers',  topic:'Algebra',    color:'#0891B2', built:false,
         ex:'/explain/class7/algebra/expressions-using-letter-numbers.html',
         pr:'/practice/class7/algebra/expressions-using-letter-numbers.html',exam:null},
      5:{n:'Parallel and Intersecting Lines',   topic:'Geometry',   color:'#059669', built:false,
         ex:'/explain/class7/geometry/parallel-and-intersecting-lines.html',
         pr:'/practice/class7/geometry/parallel-and-intersecting-lines.html',exam:null},
      6:{n:'Number Play',                       topic:'Arithmetic', color:'#D97706', built:false,
         ex:'/explain/class7/arithmetic/number-play.html',
         pr:'/practice/class7/arithmetic/number-play.html',                 exam:null},
      7:{n:'A Tale of Three Intersecting Lines',topic:'Geometry',   color:'#0D9488', built:false,
         ex:'/explain/class7/geometry/a-tale-of-three-intersecting-lines.html',
         pr:'/practice/class7/geometry/a-tale-of-three-intersecting-lines.html',exam:null},
      8:{n:'Working with Fractions',            topic:'Arithmetic', color:'#16A34A', built:false,
         ex:'/explain/class7/arithmetic/working-with-fractions.html',
         pr:'/practice/class7/arithmetic/working-with-fractions.html',      exam:null}
    },
    TOPICS: [
      {id:'arithmetic', name:'Arithmetic', icon:'🔢', chs:[1,2,3,6,8]},
      {id:'algebra',    name:'Algebra',    icon:'🔣', chs:[4]},
      {id:'geometry',   name:'Geometry',   icon:'📐', chs:[5,7]}
    ],
    ALL_BUILT_CHS: []
  },

  /* ── CLASS 6 ── */
  6: {
    CH: {
      1: {n:'Patterns in Mathematics',        topic:'Arithmetic',   color:'#6C63FF', built:false,
          ex:'/explain/class6/arithmetic/patterns-in-mathematics.html',
          pr:'/practice/class6/arithmetic/patterns-in-mathematics.html',    exam:null},
      2: {n:'Lines and Angles',               topic:'Geometry',     color:'#059669', built:false,
          ex:'/explain/class6/geometry/lines-and-angles.html',
          pr:'/practice/class6/geometry/lines-and-angles.html',             exam:null},
      3: {n:'Number Play',                    topic:'Arithmetic',   color:'#2563EB', built:false,
          ex:'/explain/class6/arithmetic/number-play.html',
          pr:'/practice/class6/arithmetic/number-play.html',                exam:null},
      4: {n:'Data Handling and Presentation', topic:'Data Handling',color:'#D97706', built:false,
          ex:'/explain/class6/data-handling/data-handling-and-presentation.html',
          pr:'/practice/class6/data-handling/data-handling-and-presentation.html',exam:null},
      5: {n:'Prime Time',                     topic:'Arithmetic',   color:'#7C3AED', built:false,
          ex:'/explain/class6/arithmetic/prime-time.html',
          pr:'/practice/class6/arithmetic/prime-time.html',                 exam:null},
      6: {n:'Perimeter and Area',             topic:'Mensuration',  color:'#B45309', built:false,
          ex:'/explain/class6/mensuration/perimeter-and-area.html',
          pr:'/practice/class6/mensuration/perimeter-and-area.html',        exam:null},
      7: {n:'Fractions',                      topic:'Arithmetic',   color:'#0891B2', built:false,
          ex:'/explain/class6/arithmetic/fractions.html',
          pr:'/practice/class6/arithmetic/fractions.html',                  exam:null},
      8: {n:'Playing with Constructions',     topic:'Geometry',     color:'#0D9488', built:false,
          ex:'/explain/class6/geometry/playing-with-constructions.html',
          pr:'/practice/class6/geometry/playing-with-constructions.html',   exam:null},
      9: {n:'Symmetry',                       topic:'Geometry',     color:'#16A34A', built:false,
          ex:'/explain/class6/geometry/symmetry.html',
          pr:'/practice/class6/geometry/symmetry.html',                     exam:null},
      10:{n:'The Other Side of Zero',         topic:'Arithmetic',   color:'#DC2626', built:false,
          ex:'/explain/class6/arithmetic/the-other-side-of-zero.html',
          pr:'/practice/class6/arithmetic/the-other-side-of-zero.html',     exam:null}
    },
    TOPICS: [
      {id:'arithmetic',  name:'Arithmetic',   icon:'🔢', chs:[1,3,5,7,10]},
      {id:'geometry',    name:'Geometry',     icon:'📐', chs:[2,8,9]},
      {id:'mensuration', name:'Mensuration',  icon:'📏', chs:[6]},
      {id:'datahandling',name:'Data Handling',icon:'📊', chs:[4]}
    ],
    ALL_BUILT_CHS: []
  }

}; /* end ALL_CLASS_CH */

/* ── Active class data (loaded per selected student) ── */
var CH = {};
var TOPICS = [];
var ALL_BUILT_CHS = [];
var LEGACY_MAP = {2:'explain_linear_done',3:'explain_quadrilaterals_done',
  4:'explain_practical_done',9:'explain_algebraic_done',
  11:'explain_area_done',112:'explain_surface_done',15:'explain_graphs_done'};

function loadAdminClassData(classNum) {
  var cd = ALL_CLASS_CH[classNum] || ALL_CLASS_CH[8];
  CH            = cd.CH;
  TOPICS        = cd.TOPICS;
  ALL_BUILT_CHS = cd.ALL_BUILT_CHS;
}

/* Default to Class 8 on load */
loadAdminClassData(8);

"""

# Find and replace the CH block + TOPICS + ALL_BUILT_CHS + LEGACY_MAP
pattern = r'/\* \u2500\u2500 CHAPTER DATA \u2500+\s*\*/\s*\nvar CH = \{.*?var ALL_BUILT_CHS = \[[^\]]*\];'
match = re.search(pattern, html, re.DOTALL)

if match:
    html = html[:match.start()] + NEW_CH_BLOCK + html[match.end():]
    print("  ✅ admin.html: CH + TOPICS + ALL_BUILT_CHS block replaced")
else:
    # Try simpler approach — find from "/* ── CHAPTER DATA" to end of ALL_BUILT_CHS line
    start_marker = "/* ── CHAPTER DATA ──────────────────────────────────────── */"
    end_marker = "var ALL_BUILT_CHS = [1,2,3,4,5,8,9,10,11,112,12,13,14,15,16,17];"

    si = html.find(start_marker)
    ei = html.find(end_marker)

    if si != -1 and ei != -1:
        end_of_line = html.find("\n", ei) + 1
        html = html[:si] + NEW_CH_BLOCK + html[end_of_line:]
        print("  ✅ admin.html: CH block replaced (marker approach)")
    else:
        print("  ❌ admin.html: Could not find CH block — check manually")

# ══════════════════════════════════════════════════════════════════════════════
# REPLACEMENT 2 — Update goStudent() to call loadAdminClassData
# ══════════════════════════════════════════════════════════════════════════════

OLD_GO_STUDENT = """  localStorage.setItem('rishi_current_student', JSON.stringify(st));
  localStorage.setItem('rishi_admin_bypass', '1'); /* skip all locks */
  window.open('/syllabus.html', '_blank');"""

NEW_GO_STUDENT = """  localStorage.setItem('rishi_current_student', JSON.stringify(st));
  localStorage.setItem('rishi_admin_bypass', '1'); /* skip all locks */
  loadAdminClassData(parseInt(r.class || 8));
  window.open('/syllabus.html', '_blank');"""

if OLD_GO_STUDENT in html:
    html = html.replace(OLD_GO_STUDENT, NEW_GO_STUDENT)
    print("  ✅ admin.html: goStudent() updated to call loadAdminClassData")
else:
    print("  ⚠️  admin.html: goStudent() pattern not found — check manually")

# ── Write output ──────────────────────────────────────────────────────────────
with open(TARGET, "w", encoding="utf-8") as f:
    f.write(html)

print(f"\n{'='*50}")
print("DONE — admin.html patched.")
print("Backup saved as admin.html.bak")
print(f"{'='*50}")
print("""
Test:
  1. Log in to admin — Class 8 chapter tree should look exactly as before
  2. Click a Class 9 student → Open Syllabus → Class 9 chapters should show
  3. Navigate to explain/practice links — should go to correct class folders
""")
