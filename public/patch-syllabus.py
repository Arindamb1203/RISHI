"""
RISHI — patch-syllabus.py
Makes syllabus.html class-aware for Classes 6, 7, 8, 9.

Run from D:\\rishi\\public:
  python patch-syllabus.py

Backs up original to syllabus.html.bak before patching.
"""

import os, shutil, re

ROOT    = os.path.dirname(os.path.abspath(__file__))
TARGET  = os.path.join(ROOT, "syllabus.html")
BACKUP  = os.path.join(ROOT, "syllabus.html.bak")

# ── Backup ────────────────────────────────────────────────────────────────────
shutil.copy2(TARGET, BACKUP)
print(f"  ✅ Backup created: syllabus.html.bak")

with open(TARGET, "r", encoding="utf-8") as f:
    html = f.read()

# ══════════════════════════════════════════════════════════════════════════════
# REPLACEMENT 1 — Replace the entire data block + activeTopic line
# ══════════════════════════════════════════════════════════════════════════════

OLD_DATA = r"""<script>
/* ══════════════════════════════════════
   NCERT CLASS 8 MATHS — CORRECT DATA
   ══════════════════════════════════════ */
var TOPICS = ["""

NEW_DATA = """<script>
/* ══════════════════════════════════════════════════════════
   RISHI — MULTI-CLASS SYLLABUS DATA
   Classes 6, 7, 8, 9 | CBSE | Expandable
   ══════════════════════════════════════════════════════════ */

var ALL_CLASS_DATA = {

  /* ── CLASS 8 ─────────────────────────────────────────── */
  8: {
    TOPICS: [
      {id:'algebra',     name:'Algebra',      icon:'🔣', chapters:[2,9,14,15]   },
      {id:'geometry',    name:'Geometry',     icon:'📐', chapters:[3,4,10]      },
      {id:'mensuration', name:'Mensuration',  icon:'📏', chapters:[11,112]      },
      {id:'arithmetic',  name:'Arithmetic',   icon:'🔢', chapters:[1,8,12,13,16]},
      {id:'datahandling',name:'Data Handling',icon:'📊', chapters:[5,17]        }
    ],
    CHAPTERS: {
      1: {name:"Rational Numbers",             built:true,  path:"/explain/class8/arithmetic/rational-numbers.html"},
      2: {name:"Linear Equations",             built:true,  path:"/explain/class8/algebra/linear-equations.html"},
      3: {name:"Understanding Quadrilaterals", built:true,  path:"/explain/class8/geometry/understanding-quadrilaterals.html"},
      4: {name:"Practical Geometry",           built:true,  path:"/explain/class8/geometry/practical-geometry.html"},
      5: {name:"Data Handling",                built:true,  path:"/explain/class8/data-handling/frequency-distribution.html"},
      6: {name:"Squares & Square Roots",       built:false, path:""},
      7: {name:"Cubes & Cube Roots",           built:false, path:""},
      8: {name:"Comparing Quantities",         built:true,  path:"/explain/class8/arithmetic/comparing-quantities.html"},
      9: {name:"Algebraic Expressions",        built:true,  path:"/explain/class8/algebra/algebraic-expressions-identities.html"},
      10:{name:"Visualising Solid Shapes",     built:true,  path:"/explain/class8/geometry/visualising-solid-shapes.html"},
      11:{name:"Area of Plane Figures",        built:true,  path:"/explain/class8/mensuration/area-plane-figures.html"},
      112:{name:"Surface Area & Volume",       built:true,  path:"/explain/class8/mensuration/surface-area-volume.html"},
      12:{name:"Exponents and Powers",         built:true,  path:"/explain/class8/arithmetic/powers-exponents.html"},
      13:{name:"Direct & Inverse Proportions", built:true,  path:"/explain/class8/arithmetic/direct-inverse-proportions.html"},
      14:{name:"Factorisation",                built:true,  path:"/explain/class8/algebra/factorisation.html"},
      15:{name:"Introduction to Graphs",       built:true,  path:"/explain/class8/algebra/introduction-to-graphs.html"},
      16:{name:"Playing with Numbers",         built:true,  path:"/explain/class8/arithmetic/playing-with-numbers.html"},
      17:{name:"Chance and Probability",       built:true,  path:"/explain/class8/data-handling/chance-probability.html"}
    },
    CH_COLORS: {
      1:"#6C63FF",2:"#2563EB",3:"#059669",4:"#0D9488",5:"#D97706",
      6:"#DC2626",7:"#EA580C",8:"#7C3AED",9:"#0891B2",10:"#16A34A",
      11:"#B45309",112:"#92400e",12:"#4338CA",13:"#DB2777",14:"#65A30D",15:"#0284C7",16:"#7E22CE",17:"#0F766E"
    },
    LEGACY_KEYS: {
      2:"explain_linear_done",3:"explain_quadrilaterals_done",
      4:"explain_practical_done",9:"explain_algebraic_done",
      11:"explain_area_done",112:"explain_surface_done",15:"explain_graphs_done"
    },
    PRACTICE_PATHS: {
      1: "/practice/class8/arithmetic/rational-numbers.html",
      8: "/practice/class8/arithmetic/comparing-quantities.html",
      12:"/practice/class8/arithmetic/powers-exponents.html",
      13:"/practice/class8/arithmetic/direct-inverse-proportions.html",
      16:"/practice/class8/arithmetic/playing-with-numbers.html",
      2: "/practice/class8/algebra/linear-equations.html",
      9: "/practice/class8/algebra/algebraic-expressions-identities.html",
      14:"/practice/class8/algebra/factorisation.html",
      15:"/practice/class8/algebra/introduction-to-graphs.html",
      3: "/practice/class8/geometry/understanding-quadrilaterals.html",
      4: "/practice/class8/geometry/practical-geometry.html",
      10:"/practice/class8/geometry/visualising-solid-shapes.html",
      11:"/practice/class8/mensuration/area-plane-figures.html",
      112:"/practice/class8/mensuration/surface-area-volume.html",
      5: "/practice/class8/data-handling/frequency-distribution.html",
      17:"/practice/class8/data-handling/chance-probability.html"
    },
    EXAM_PATHS: {
      1:"/exam.html?ch=01", 2:"/exam.html?ch=02", 3:"/exam.html?ch=03",
      4:"/exam.html?ch=04", 5:"/exam.html?ch=05", 8:"/exam.html?ch=08",
      9:"/exam.html?ch=09", 10:"/exam.html?ch=10",
      11:"/exam.html?ch=11a", 112:"/exam.html?ch=11b",
      12:"/exam.html?ch=12", 13:"/exam.html?ch=13", 14:"/exam.html?ch=14",
      15:"/exam.html?ch=15", 16:"/exam.html?ch=16", 17:"/exam.html?ch=17"
    },
    EXAM_DONE_KEYS: {
      1:"01",2:"02",3:"03",4:"04",5:"05",8:"08",9:"09",10:"10",
      11:"11a",112:"11b",12:"12",13:"13",14:"14",15:"15",16:"16",17:"17"
    }
  },

  /* ── CLASS 9 ─────────────────────────────────────────── */
  9: {
    TOPICS: [
      {id:'arithmetic',         name:'Arithmetic',         icon:'🔢', chapters:[1]           },
      {id:'algebra',            name:'Algebra',            icon:'🔣', chapters:[2,3]          },
      {id:'coord-geometry',     name:'Coord. Geometry',    icon:'📍', chapters:[4]            },
      {id:'geometry',           name:'Geometry',           icon:'📐', chapters:[5,6,7,8,9]    },
      {id:'mensuration',        name:'Mensuration',        icon:'📏', chapters:[10,11]        },
      {id:'datahandling',       name:'Data Handling',      icon:'📊', chapters:[12]           }
    ],
    CHAPTERS: {
      1: {name:"Real Numbers",                     built:false, path:"/explain/class9/arithmetic/real-numbers.html"},
      2: {name:"Polynomials",                      built:false, path:"/explain/class9/algebra/polynomials.html"},
      3: {name:"Linear Equations in Two Variables",built:false, path:"/explain/class9/algebra/linear-equations-two-variables.html"},
      4: {name:"Coordinate Geometry",              built:false, path:"/explain/class9/coordinate-geometry/coordinate-geometry.html"},
      5: {name:"Euclid's Geometry",                built:false, path:"/explain/class9/geometry/euclids-geometry.html"},
      6: {name:"Lines and Angles",                 built:false, path:"/explain/class9/geometry/lines-and-angles.html"},
      7: {name:"Triangles",                        built:false, path:"/explain/class9/geometry/triangles.html"},
      8: {name:"Quadrilaterals",                   built:false, path:"/explain/class9/geometry/quadrilaterals.html"},
      9: {name:"Circles",                          built:false, path:"/explain/class9/geometry/circles.html"},
      10:{name:"Heron's Formula",                  built:false, path:"/explain/class9/mensuration/herons-formula.html"},
      11:{name:"Surface Areas and Volumes",        built:false, path:"/explain/class9/mensuration/surface-areas-volumes.html"},
      12:{name:"Statistics",                       built:false, path:"/explain/class9/data-handling/statistics.html"}
    },
    CH_COLORS: {
      1:"#6C63FF",2:"#2563EB",3:"#7C3AED",4:"#0891B2",5:"#059669",
      6:"#0D9488",7:"#16A34A",8:"#D97706",9:"#DC2626",10:"#B45309",
      11:"#4338CA",12:"#0F766E"
    },
    LEGACY_KEYS: {},
    PRACTICE_PATHS: {
      1: "/practice/class9/arithmetic/real-numbers.html",
      2: "/practice/class9/algebra/polynomials.html",
      3: "/practice/class9/algebra/linear-equations-two-variables.html",
      4: "/practice/class9/coordinate-geometry/coordinate-geometry.html",
      5: "/practice/class9/geometry/euclids-geometry.html",
      6: "/practice/class9/geometry/lines-and-angles.html",
      7: "/practice/class9/geometry/triangles.html",
      8: "/practice/class9/geometry/quadrilaterals.html",
      9: "/practice/class9/geometry/circles.html",
      10:"/practice/class9/mensuration/herons-formula.html",
      11:"/practice/class9/mensuration/surface-areas-volumes.html",
      12:"/practice/class9/data-handling/statistics.html"
    },
    EXAM_PATHS: {},
    EXAM_DONE_KEYS: {
      1:"c9-01",2:"c9-02",3:"c9-03",4:"c9-04",5:"c9-05",6:"c9-06",
      7:"c9-07",8:"c9-08",9:"c9-09",10:"c9-10",11:"c9-11",12:"c9-12"
    }
  },

  /* ── CLASS 7 ─────────────────────────────────────────── */
  7: {
    TOPICS: [
      {id:'arithmetic', name:'Arithmetic', icon:'🔢', chapters:[1,2,3,6,8]},
      {id:'algebra',    name:'Algebra',    icon:'🔣', chapters:[4]         },
      {id:'geometry',   name:'Geometry',   icon:'📐', chapters:[5,7]       }
    ],
    CHAPTERS: {
      1: {name:"Large Numbers Around Us",          built:false, path:"/explain/class7/arithmetic/large-numbers-around-us.html"},
      2: {name:"Arithmetic Expressions",           built:false, path:"/explain/class7/arithmetic/arithmetic-expressions.html"},
      3: {name:"A Peek Beyond the Point",          built:false, path:"/explain/class7/arithmetic/a-peek-beyond-the-point.html"},
      4: {name:"Expressions using Letter-Numbers", built:false, path:"/explain/class7/algebra/expressions-using-letter-numbers.html"},
      5: {name:"Parallel and Intersecting Lines",  built:false, path:"/explain/class7/geometry/parallel-and-intersecting-lines.html"},
      6: {name:"Number Play",                      built:false, path:"/explain/class7/arithmetic/number-play.html"},
      7: {name:"A Tale of Three Intersecting Lines",built:false,path:"/explain/class7/geometry/a-tale-of-three-intersecting-lines.html"},
      8: {name:"Working with Fractions",           built:false, path:"/explain/class7/arithmetic/working-with-fractions.html"}
    },
    CH_COLORS: {
      1:"#6C63FF",2:"#2563EB",3:"#7C3AED",4:"#0891B2",
      5:"#059669",6:"#D97706",7:"#0D9488",8:"#16A34A"
    },
    LEGACY_KEYS: {},
    PRACTICE_PATHS: {
      1: "/practice/class7/arithmetic/large-numbers-around-us.html",
      2: "/practice/class7/arithmetic/arithmetic-expressions.html",
      3: "/practice/class7/arithmetic/a-peek-beyond-the-point.html",
      4: "/practice/class7/algebra/expressions-using-letter-numbers.html",
      5: "/practice/class7/geometry/parallel-and-intersecting-lines.html",
      6: "/practice/class7/arithmetic/number-play.html",
      7: "/practice/class7/geometry/a-tale-of-three-intersecting-lines.html",
      8: "/practice/class7/arithmetic/working-with-fractions.html"
    },
    EXAM_PATHS: {},
    EXAM_DONE_KEYS: {
      1:"c7-01",2:"c7-02",3:"c7-03",4:"c7-04",
      5:"c7-05",6:"c7-06",7:"c7-07",8:"c7-08"
    }
  },

  /* ── CLASS 6 ─────────────────────────────────────────── */
  6: {
    TOPICS: [
      {id:'arithmetic',  name:'Arithmetic',  icon:'🔢', chapters:[1,3,5,7,10]},
      {id:'geometry',    name:'Geometry',    icon:'📐', chapters:[2,8,9]      },
      {id:'mensuration', name:'Mensuration', icon:'📏', chapters:[6]          },
      {id:'datahandling',name:'Data Handling',icon:'📊',chapters:[4]          }
    ],
    CHAPTERS: {
      1:  {name:"Patterns in Mathematics",       built:false, path:"/explain/class6/arithmetic/patterns-in-mathematics.html"},
      2:  {name:"Lines and Angles",              built:false, path:"/explain/class6/geometry/lines-and-angles.html"},
      3:  {name:"Number Play",                   built:false, path:"/explain/class6/arithmetic/number-play.html"},
      4:  {name:"Data Handling and Presentation",built:false, path:"/explain/class6/data-handling/data-handling-and-presentation.html"},
      5:  {name:"Prime Time",                    built:false, path:"/explain/class6/arithmetic/prime-time.html"},
      6:  {name:"Perimeter and Area",            built:false, path:"/explain/class6/mensuration/perimeter-and-area.html"},
      7:  {name:"Fractions",                     built:false, path:"/explain/class6/arithmetic/fractions.html"},
      8:  {name:"Playing with Constructions",    built:false, path:"/explain/class6/geometry/playing-with-constructions.html"},
      9:  {name:"Symmetry",                      built:false, path:"/explain/class6/geometry/symmetry.html"},
      10: {name:"The Other Side of Zero",        built:false, path:"/explain/class6/arithmetic/the-other-side-of-zero.html"}
    },
    CH_COLORS: {
      1:"#6C63FF",2:"#059669",3:"#2563EB",4:"#D97706",5:"#7C3AED",
      6:"#B45309",7:"#0891B2",8:"#0D9488",9:"#16A34A",10:"#DC2626"
    },
    LEGACY_KEYS: {},
    PRACTICE_PATHS: {
      1:  "/practice/class6/arithmetic/patterns-in-mathematics.html",
      2:  "/practice/class6/geometry/lines-and-angles.html",
      3:  "/practice/class6/arithmetic/number-play.html",
      4:  "/practice/class6/data-handling/data-handling-and-presentation.html",
      5:  "/practice/class6/arithmetic/prime-time.html",
      6:  "/practice/class6/mensuration/perimeter-and-area.html",
      7:  "/practice/class6/arithmetic/fractions.html",
      8:  "/practice/class6/geometry/playing-with-constructions.html",
      9:  "/practice/class6/geometry/symmetry.html",
      10: "/practice/class6/arithmetic/the-other-side-of-zero.html"
    },
    EXAM_PATHS: {},
    EXAM_DONE_KEYS: {
      1:"c6-01",2:"c6-02",3:"c6-03",4:"c6-04",5:"c6-05",
      6:"c6-06",7:"c6-07",8:"c6-08",9:"c6-09",10:"c6-10"
    }
  }

}; /* end ALL_CLASS_DATA */

/* ── Active class data (set at init) ── */
var TOPICS, CHAPTERS, CH_COLORS, LEGACY_KEYS, PRACTICE_PATHS, EXAM_PATHS, EXAM_DONE_KEYS;

function loadClassData(classNum) {
  var cd = ALL_CLASS_DATA[classNum] || ALL_CLASS_DATA[8];
  TOPICS         = cd.TOPICS;
  CHAPTERS       = cd.CHAPTERS;
  CH_COLORS      = cd.CH_COLORS;
  LEGACY_KEYS    = cd.LEGACY_KEYS    || {};
  PRACTICE_PATHS = cd.PRACTICE_PATHS || {};
  EXAM_PATHS     = cd.EXAM_PATHS     || {};
  EXAM_DONE_KEYS = cd.EXAM_DONE_KEYS || {};
}

var activeTopic = null; /* set after loadClassData in init */

function G(id){return document.getElementById(id);}
function logout(){localStorage.removeItem('rishi_current_student');window.location.href='/login.html';}

var TOPICS = ["""

# Find where the OLD_DATA block ends — we need to replace from OLD_DATA up to the
# function definitions. We'll find the closing of EXAM_DONE_KEYS and activeTopic line.

# Identify the old block to replace
# Old block starts at "/* ══...NCERT CLASS 8..." and ends just before "function G(id)"
old_start = html.find("/* ══════════════════════════════════════\n   NCERT CLASS 8 MATHS — CORRECT DATA")
old_end   = html.find("var activeTopic = sessionStorage")

if old_start == -1:
    # Try CRLF version
    old_start = html.find("/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\r\n   NCERT CLASS 8 MATHS \u2014 CORRECT DATA")

if old_start == -1 or old_end == -1:
    print("  ❌ ERROR: Could not find data block markers. File may have already been patched.")
    exit(1)

# Find the end of the activeTopic line
old_end_line_end = html.find("\n", old_end) + 1

print(f"  Found data block at chars {old_start}–{old_end_line_end}")

NEW_DATA_BLOCK = """/* ══════════════════════════════════════════════════════════
   RISHI — MULTI-CLASS SYLLABUS DATA
   Classes 6, 7, 8, 9 | CBSE | Expandable
   ══════════════════════════════════════════════════════════ */

var ALL_CLASS_DATA = {

  /* ── CLASS 8 ─────────────────────────────────────────── */
  8: {
    TOPICS: [
      {id:'algebra',     name:'Algebra',      icon:'🔣', chapters:[2,9,14,15]   },
      {id:'geometry',    name:'Geometry',     icon:'📐', chapters:[3,4,10]      },
      {id:'mensuration', name:'Mensuration',  icon:'📏', chapters:[11,112]      },
      {id:'arithmetic',  name:'Arithmetic',   icon:'🔢', chapters:[1,8,12,13,16]},
      {id:'datahandling',name:'Data Handling',icon:'📊', chapters:[5,17]        }
    ],
    CHAPTERS: {
      1: {name:"Rational Numbers",             built:true,  path:"/explain/class8/arithmetic/rational-numbers.html"},
      2: {name:"Linear Equations",             built:true,  path:"/explain/class8/algebra/linear-equations.html"},
      3: {name:"Understanding Quadrilaterals", built:true,  path:"/explain/class8/geometry/understanding-quadrilaterals.html"},
      4: {name:"Practical Geometry",           built:true,  path:"/explain/class8/geometry/practical-geometry.html"},
      5: {name:"Data Handling",                built:true,  path:"/explain/class8/data-handling/frequency-distribution.html"},
      6: {name:"Squares & Square Roots",       built:false, path:""},
      7: {name:"Cubes & Cube Roots",           built:false, path:""},
      8: {name:"Comparing Quantities",         built:true,  path:"/explain/class8/arithmetic/comparing-quantities.html"},
      9: {name:"Algebraic Expressions",        built:true,  path:"/explain/class8/algebra/algebraic-expressions-identities.html"},
      10:{name:"Visualising Solid Shapes",     built:true,  path:"/explain/class8/geometry/visualising-solid-shapes.html"},
      11:{name:"Area of Plane Figures",        built:true,  path:"/explain/class8/mensuration/area-plane-figures.html"},
      112:{name:"Surface Area & Volume",       built:true,  path:"/explain/class8/mensuration/surface-area-volume.html"},
      12:{name:"Exponents and Powers",         built:true,  path:"/explain/class8/arithmetic/powers-exponents.html"},
      13:{name:"Direct & Inverse Proportions", built:true,  path:"/explain/class8/arithmetic/direct-inverse-proportions.html"},
      14:{name:"Factorisation",                built:true,  path:"/explain/class8/algebra/factorisation.html"},
      15:{name:"Introduction to Graphs",       built:true,  path:"/explain/class8/algebra/introduction-to-graphs.html"},
      16:{name:"Playing with Numbers",         built:true,  path:"/explain/class8/arithmetic/playing-with-numbers.html"},
      17:{name:"Chance and Probability",       built:true,  path:"/explain/class8/data-handling/chance-probability.html"}
    },
    CH_COLORS: {
      1:"#6C63FF",2:"#2563EB",3:"#059669",4:"#0D9488",5:"#D97706",
      6:"#DC2626",7:"#EA580C",8:"#7C3AED",9:"#0891B2",10:"#16A34A",
      11:"#B45309",112:"#92400e",12:"#4338CA",13:"#DB2777",14:"#65A30D",15:"#0284C7",16:"#7E22CE",17:"#0F766E"
    },
    LEGACY_KEYS: {
      2:"explain_linear_done",3:"explain_quadrilaterals_done",
      4:"explain_practical_done",9:"explain_algebraic_done",
      11:"explain_area_done",112:"explain_surface_done",15:"explain_graphs_done"
    },
    PRACTICE_PATHS: {
      1: "/practice/class8/arithmetic/rational-numbers.html",
      8: "/practice/class8/arithmetic/comparing-quantities.html",
      12:"/practice/class8/arithmetic/powers-exponents.html",
      13:"/practice/class8/arithmetic/direct-inverse-proportions.html",
      16:"/practice/class8/arithmetic/playing-with-numbers.html",
      2: "/practice/class8/algebra/linear-equations.html",
      9: "/practice/class8/algebra/algebraic-expressions-identities.html",
      14:"/practice/class8/algebra/factorisation.html",
      15:"/practice/class8/algebra/introduction-to-graphs.html",
      3: "/practice/class8/geometry/understanding-quadrilaterals.html",
      4: "/practice/class8/geometry/practical-geometry.html",
      10:"/practice/class8/geometry/visualising-solid-shapes.html",
      11:"/practice/class8/mensuration/area-plane-figures.html",
      112:"/practice/class8/mensuration/surface-area-volume.html",
      5: "/practice/class8/data-handling/frequency-distribution.html",
      17:"/practice/class8/data-handling/chance-probability.html"
    },
    EXAM_PATHS: {
      1:"/exam.html?ch=01",2:"/exam.html?ch=02",3:"/exam.html?ch=03",
      4:"/exam.html?ch=04",5:"/exam.html?ch=05",8:"/exam.html?ch=08",
      9:"/exam.html?ch=09",10:"/exam.html?ch=10",
      11:"/exam.html?ch=11a",112:"/exam.html?ch=11b",
      12:"/exam.html?ch=12",13:"/exam.html?ch=13",14:"/exam.html?ch=14",
      15:"/exam.html?ch=15",16:"/exam.html?ch=16",17:"/exam.html?ch=17"
    },
    EXAM_DONE_KEYS: {
      1:"01",2:"02",3:"03",4:"04",5:"05",8:"08",9:"09",10:"10",
      11:"11a",112:"11b",12:"12",13:"13",14:"14",15:"15",16:"16",17:"17"
    }
  },

  /* ── CLASS 9 ─────────────────────────────────────────── */
  9: {
    TOPICS: [
      {id:'arithmetic',     name:'Arithmetic',      icon:'🔢', chapters:[1]        },
      {id:'algebra',        name:'Algebra',          icon:'🔣', chapters:[2,3]      },
      {id:'coord-geometry', name:'Coord. Geometry',  icon:'📍', chapters:[4]        },
      {id:'geometry',       name:'Geometry',         icon:'📐', chapters:[5,6,7,8,9]},
      {id:'mensuration',    name:'Mensuration',      icon:'📏', chapters:[10,11]    },
      {id:'datahandling',   name:'Data Handling',    icon:'📊', chapters:[12]       }
    ],
    CHAPTERS: {
      1: {name:"Real Numbers",                      built:false, path:"/explain/class9/arithmetic/real-numbers.html"},
      2: {name:"Polynomials",                       built:false, path:"/explain/class9/algebra/polynomials.html"},
      3: {name:"Linear Equations in Two Variables", built:false, path:"/explain/class9/algebra/linear-equations-two-variables.html"},
      4: {name:"Coordinate Geometry",               built:false, path:"/explain/class9/coordinate-geometry/coordinate-geometry.html"},
      5: {name:"Euclid's Geometry",                 built:false, path:"/explain/class9/geometry/euclids-geometry.html"},
      6: {name:"Lines and Angles",                  built:false, path:"/explain/class9/geometry/lines-and-angles.html"},
      7: {name:"Triangles",                         built:false, path:"/explain/class9/geometry/triangles.html"},
      8: {name:"Quadrilaterals",                    built:false, path:"/explain/class9/geometry/quadrilaterals.html"},
      9: {name:"Circles",                           built:false, path:"/explain/class9/geometry/circles.html"},
      10:{name:"Heron's Formula",                   built:false, path:"/explain/class9/mensuration/herons-formula.html"},
      11:{name:"Surface Areas and Volumes",         built:false, path:"/explain/class9/mensuration/surface-areas-volumes.html"},
      12:{name:"Statistics",                        built:false, path:"/explain/class9/data-handling/statistics.html"}
    },
    CH_COLORS: {
      1:"#6C63FF",2:"#2563EB",3:"#7C3AED",4:"#0891B2",5:"#059669",
      6:"#0D9488",7:"#16A34A",8:"#D97706",9:"#DC2626",10:"#B45309",
      11:"#4338CA",12:"#0F766E"
    },
    LEGACY_KEYS: {},
    PRACTICE_PATHS: {
      1:"/practice/class9/arithmetic/real-numbers.html",
      2:"/practice/class9/algebra/polynomials.html",
      3:"/practice/class9/algebra/linear-equations-two-variables.html",
      4:"/practice/class9/coordinate-geometry/coordinate-geometry.html",
      5:"/practice/class9/geometry/euclids-geometry.html",
      6:"/practice/class9/geometry/lines-and-angles.html",
      7:"/practice/class9/geometry/triangles.html",
      8:"/practice/class9/geometry/quadrilaterals.html",
      9:"/practice/class9/geometry/circles.html",
      10:"/practice/class9/mensuration/herons-formula.html",
      11:"/practice/class9/mensuration/surface-areas-volumes.html",
      12:"/practice/class9/data-handling/statistics.html"
    },
    EXAM_PATHS: {},
    EXAM_DONE_KEYS: {
      1:"c9-01",2:"c9-02",3:"c9-03",4:"c9-04",5:"c9-05",6:"c9-06",
      7:"c9-07",8:"c9-08",9:"c9-09",10:"c9-10",11:"c9-11",12:"c9-12"
    }
  },

  /* ── CLASS 7 ─────────────────────────────────────────── */
  7: {
    TOPICS: [
      {id:'arithmetic', name:'Arithmetic', icon:'🔢', chapters:[1,2,3,6,8]},
      {id:'algebra',    name:'Algebra',    icon:'🔣', chapters:[4]         },
      {id:'geometry',   name:'Geometry',   icon:'📐', chapters:[5,7]       }
    ],
    CHAPTERS: {
      1:{name:"Large Numbers Around Us",           built:false, path:"/explain/class7/arithmetic/large-numbers-around-us.html"},
      2:{name:"Arithmetic Expressions",            built:false, path:"/explain/class7/arithmetic/arithmetic-expressions.html"},
      3:{name:"A Peek Beyond the Point",           built:false, path:"/explain/class7/arithmetic/a-peek-beyond-the-point.html"},
      4:{name:"Expressions using Letter-Numbers",  built:false, path:"/explain/class7/algebra/expressions-using-letter-numbers.html"},
      5:{name:"Parallel and Intersecting Lines",   built:false, path:"/explain/class7/geometry/parallel-and-intersecting-lines.html"},
      6:{name:"Number Play",                       built:false, path:"/explain/class7/arithmetic/number-play.html"},
      7:{name:"A Tale of Three Intersecting Lines",built:false, path:"/explain/class7/geometry/a-tale-of-three-intersecting-lines.html"},
      8:{name:"Working with Fractions",            built:false, path:"/explain/class7/arithmetic/working-with-fractions.html"}
    },
    CH_COLORS: {
      1:"#6C63FF",2:"#2563EB",3:"#7C3AED",4:"#0891B2",
      5:"#059669",6:"#D97706",7:"#0D9488",8:"#16A34A"
    },
    LEGACY_KEYS: {},
    PRACTICE_PATHS: {
      1:"/practice/class7/arithmetic/large-numbers-around-us.html",
      2:"/practice/class7/arithmetic/arithmetic-expressions.html",
      3:"/practice/class7/arithmetic/a-peek-beyond-the-point.html",
      4:"/practice/class7/algebra/expressions-using-letter-numbers.html",
      5:"/practice/class7/geometry/parallel-and-intersecting-lines.html",
      6:"/practice/class7/arithmetic/number-play.html",
      7:"/practice/class7/geometry/a-tale-of-three-intersecting-lines.html",
      8:"/practice/class7/arithmetic/working-with-fractions.html"
    },
    EXAM_PATHS: {},
    EXAM_DONE_KEYS: {
      1:"c7-01",2:"c7-02",3:"c7-03",4:"c7-04",
      5:"c7-05",6:"c7-06",7:"c7-07",8:"c7-08"
    }
  },

  /* ── CLASS 6 ─────────────────────────────────────────── */
  6: {
    TOPICS: [
      {id:'arithmetic',  name:'Arithmetic',   icon:'🔢', chapters:[1,3,5,7,10]},
      {id:'geometry',    name:'Geometry',     icon:'📐', chapters:[2,8,9]      },
      {id:'mensuration', name:'Mensuration',  icon:'📏', chapters:[6]          },
      {id:'datahandling',name:'Data Handling',icon:'📊', chapters:[4]          }
    ],
    CHAPTERS: {
      1: {name:"Patterns in Mathematics",        built:false, path:"/explain/class6/arithmetic/patterns-in-mathematics.html"},
      2: {name:"Lines and Angles",               built:false, path:"/explain/class6/geometry/lines-and-angles.html"},
      3: {name:"Number Play",                    built:false, path:"/explain/class6/arithmetic/number-play.html"},
      4: {name:"Data Handling and Presentation", built:false, path:"/explain/class6/data-handling/data-handling-and-presentation.html"},
      5: {name:"Prime Time",                     built:false, path:"/explain/class6/arithmetic/prime-time.html"},
      6: {name:"Perimeter and Area",             built:false, path:"/explain/class6/mensuration/perimeter-and-area.html"},
      7: {name:"Fractions",                      built:false, path:"/explain/class6/arithmetic/fractions.html"},
      8: {name:"Playing with Constructions",     built:false, path:"/explain/class6/geometry/playing-with-constructions.html"},
      9: {name:"Symmetry",                       built:false, path:"/explain/class6/geometry/symmetry.html"},
      10:{name:"The Other Side of Zero",         built:false, path:"/explain/class6/arithmetic/the-other-side-of-zero.html"}
    },
    CH_COLORS: {
      1:"#6C63FF",2:"#059669",3:"#2563EB",4:"#D97706",5:"#7C3AED",
      6:"#B45309",7:"#0891B2",8:"#0D9488",9:"#16A34A",10:"#DC2626"
    },
    LEGACY_KEYS: {},
    PRACTICE_PATHS: {
      1:"/practice/class6/arithmetic/patterns-in-mathematics.html",
      2:"/practice/class6/geometry/lines-and-angles.html",
      3:"/practice/class6/arithmetic/number-play.html",
      4:"/practice/class6/data-handling/data-handling-and-presentation.html",
      5:"/practice/class6/arithmetic/prime-time.html",
      6:"/practice/class6/mensuration/perimeter-and-area.html",
      7:"/practice/class6/arithmetic/fractions.html",
      8:"/practice/class6/geometry/playing-with-constructions.html",
      9:"/practice/class6/geometry/symmetry.html",
      10:"/practice/class6/arithmetic/the-other-side-of-zero.html"
    },
    EXAM_PATHS: {},
    EXAM_DONE_KEYS: {
      1:"c6-01",2:"c6-02",3:"c6-03",4:"c6-04",5:"c6-05",
      6:"c6-06",7:"c6-07",8:"c6-08",9:"c6-09",10:"c6-10"
    }
  }

}; /* end ALL_CLASS_DATA */

/* ── Active variables (populated by loadClassData at init) ── */
var TOPICS, CHAPTERS, CH_COLORS, LEGACY_KEYS, PRACTICE_PATHS, EXAM_PATHS, EXAM_DONE_KEYS;

function loadClassData(classNum) {
  var cd = ALL_CLASS_DATA[classNum] || ALL_CLASS_DATA[8];
  TOPICS         = cd.TOPICS;
  CHAPTERS       = cd.CHAPTERS;
  CH_COLORS      = cd.CH_COLORS;
  LEGACY_KEYS    = cd.LEGACY_KEYS    || {};
  PRACTICE_PATHS = cd.PRACTICE_PATHS || {};
  EXAM_PATHS     = cd.EXAM_PATHS     || {};
  EXAM_DONE_KEYS = cd.EXAM_DONE_KEYS || {};
}

var activeTopic = null; /* set in init after loadClassData */

"""

html = html[:old_start] + NEW_DATA_BLOCK + html[old_end_line_end:]
print("  ✅ Data block replaced")

# ══════════════════════════════════════════════════════════════════════════════
# REPLACEMENT 2 — Update renderSampurna to be class-aware (dynamic chapter list)
# ══════════════════════════════════════════════════════════════════════════════

OLD_SAMPURNA_START = "/* ── Sampurna ── */\r\nfunction renderSampurna(){\r\n  var done=0,all=[1,2,3,4,5,8,9,10,11,112,12,13,14,15,16,17];"
OLD_SAMPURNA_START2 = "/* ── Sampurna ── */\nfunction renderSampurna(){\n  var done=0,all=[1,2,3,4,5,8,9,10,11,112,12,13,14,15,16,17];"

if OLD_SAMPURNA_START in html:
    sampurna_marker = OLD_SAMPURNA_START
elif OLD_SAMPURNA_START2 in html:
    sampurna_marker = OLD_SAMPURNA_START2
else:
    print("  ⚠️  WARNING: renderSampurna marker not found — skipping patch 2")
    sampurna_marker = None

if sampurna_marker:
    s_start = html.find(sampurna_marker)
    s_end   = html.find("\n/* ── Stats Bar ── */")
    if s_end == -1:
        s_end = html.find("\r\n/* ── Stats Bar ── */")

    NEW_SAMPURNA = """/* ── Sampurna ── */
function renderSampurna(){
  /* Dynamic — works for any class */
  var allCids = Object.keys(CHAPTERS).map(Number);
  var builtCids = allCids.filter(function(cid){ return CHAPTERS[cid].built; });
  var total = builtCids.length;
  var done = 0;
  for(var i=0;i<builtCids.length;i++){ if(isChapExamDone(builtCids[i])) done++; }
  var pct = total>0 ? Math.round(done/total*100) : 0;
  var spDone  = localStorage.getItem('rishi_sp_done')==='1';
  var spScore = localStorage.getItem('rishi_sp_score')||'0';
  var html='';
  if(total===0){
    html='<div class="sampurna-box locked"><div class="sampurna-ico">🏆</div><div class="sampurna-title">GRAND EXAM</div><div class="sampurna-sub">Content coming soon for this class.</div></div>';
  } else if(done===total){
    var btnHtml=spDone
      ?'<div style="margin-bottom:6px;font-size:12px;font-weight:700;color:var(--sage);">&#10003; Done &middot; Best: '+spScore+'/100</div><a href="/sampurna-pariksha.html" style="display:inline-block;padding:10px 28px;background:var(--gold-pale);color:var(--amber);border:2px solid var(--gold);border-radius:12px;font-weight:900;font-size:14px;text-decoration:none;">&#128257; Retry</a>'
      :'<a href="/sampurna-pariksha.html" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,var(--amber),var(--gold));color:#1a1a00;border-radius:12px;font-weight:900;font-size:15px;text-decoration:none;box-shadow:0 4px 16px rgba(215,160,0,.3);">&#127942; Start Grand Exam</a>';
    html='<div class="sampurna-box unlocked"><div class="sampurna-ico">&#127942;</div><div class="sampurna-title">GRAND EXAM</div><div class="sampurna-sub">All '+total+' chapters mastered! Grand exam unlocked.</div>'+btnHtml+'</div>';
  } else {
    html='<div class="sampurna-box locked"><div class="sampurna-ico">&#127942;</div><div class="sampurna-title">GRAND EXAM</div><div class="sampurna-sub">Complete all '+total+' chapter exams to unlock.<br>'+done+' of '+total+' done.</div><div class="sampurna-prog"><div class="sampurna-fill" style="width:'+pct+'%"></div></div></div>';
  }
  G('sampurnaSection').innerHTML=html;
}

"""
    html = html[:s_start] + NEW_SAMPURNA + html[s_end:]
    print("  ✅ renderSampurna patched")

# ══════════════════════════════════════════════════════════════════════════════
# REPLACEMENT 3 — Update renderStats to be class-aware
# ══════════════════════════════════════════════════════════════════════════════

OLD_STATS = "/* ── Stats Bar ── */\r\nfunction renderStats(){\r\n  var allBuilt=[1,2,3,4,5,8,9,10,11,112,12,13,14,15,16,17];"
OLD_STATS2 = "/* ── Stats Bar ── */\nfunction renderStats(){\n  var allBuilt=[1,2,3,4,5,8,9,10,11,112,12,13,14,15,16,17];"

if OLD_STATS in html:
    stats_marker = OLD_STATS
elif OLD_STATS2 in html:
    stats_marker = OLD_STATS2
else:
    print("  ⚠️  WARNING: renderStats marker not found — skipping patch 3")
    stats_marker = None

if stats_marker:
    rs_start = html.find(stats_marker)
    rs_end   = html.find("\n/* ── Init ── */")
    if rs_end == -1:
        rs_end = html.find("\r\n/* ── Init ── */")

    NEW_STATS = """/* ── Stats Bar ── */
function renderStats(){
  var allCids = Object.keys(CHAPTERS).map(Number);
  var builtCids = allCids.filter(function(cid){ return CHAPTERS[cid].built; });
  var total = builtCids.length;
  if(total===0){ G('statsBar').innerHTML=''; return; }
  var explained=0, practiced=0, examDone=0;
  for(var i=0;i<builtCids.length;i++){
    var cid=builtCids[i];
    if(isExplainDone(cid))  explained++;
    if(isPracticeDone(cid)) practiced++;
    if(isChapExamDone(cid)) examDone++;
  }
  var items=[
    {lbl:'Explained', val:explained, tot:total, col:'var(--amber)'},
    {lbl:'Practised', val:practiced, tot:total, col:'var(--sage)'},
    {lbl:'Exam Done', val:examDone,  tot:total, col:'var(--green)'}
  ];
  var html='';
  for(var j=0;j<items.length;j++){
    var it=items[j];
    var pct=Math.round(it.val/it.tot*100);
    html+='<div style="flex:1;padding:10px 14px;border-right:1px solid var(--gold-pale);text-align:center;">';
    html+='<div style="font-family:Orbitron,sans-serif;font-size:18px;font-weight:900;color:'+it.col+'">'+it.val+'<span style="font-size:11px;color:var(--soft)">/'+it.tot+'</span></div>';
    html+='<div style="font-size:10px;font-weight:800;color:var(--soft);text-transform:uppercase;letter-spacing:.5px;margin-top:2px;">'+it.lbl+'</div>';
    html+='<div style="height:4px;background:var(--gold-pale);border-radius:2px;margin-top:5px;overflow:hidden;"><div style="height:100%;width:'+pct+'%;background:'+it.col+';border-radius:2px;transition:width .8s ease;"></div></div>';
    html+='</div>';
  }
  G('statsBar').innerHTML=html;
}

"""
    html = html[:rs_start] + NEW_STATS + html[rs_end:]
    print("  ✅ renderStats patched")

# ══════════════════════════════════════════════════════════════════════════════
# REPLACEMENT 4 — Update window.onload to call loadClassData + set activeTopic
# ══════════════════════════════════════════════════════════════════════════════

OLD_INIT = "  buildTopicRail();\r\n  buildChapterList();\r\n  renderSampurna();\r\n  renderStats();\r\n};"
OLD_INIT2 = "  buildTopicRail();\n  buildChapterList();\n  renderSampurna();\n  renderStats();\n};"

# Also need to find the localStorage.setItem line to insert loadClassData after it
OLD_ONLOAD_SET = "  localStorage.setItem('rishi_current_student',JSON.stringify(st));"

new_render_block = """  loadClassData(parseInt(st.class||8));
  activeTopic = sessionStorage.getItem('rishi_syllabus_topic') || TOPICS[0].id;
  buildTopicRail();
  buildChapterList();
  renderSampurna();
  renderStats();
};"""

if OLD_INIT in html:
    html = html.replace(OLD_INIT, new_render_block)
    print("  ✅ window.onload render block patched (CRLF)")
elif OLD_INIT2 in html:
    html = html.replace(OLD_INIT2, new_render_block)
    print("  ✅ window.onload render block patched (LF)")
else:
    print("  ⚠️  WARNING: window.onload render block not found")

# ── Write output ──────────────────────────────────────────────────────────────
with open(TARGET, "w", encoding="utf-8") as f:
    f.write(html)

print(f"\n{'='*50}")
print("DONE — syllabus.html patched successfully.")
print("Original backed up to syllabus.html.bak")
print(f"{'='*50}")
print("\nNext: Test Class 8 login still works, then test with a Class 9 account.")
