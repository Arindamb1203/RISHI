#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RISHI — Class 6 Portal Wiring
Updates all 5 portal files to activate Class 6.

Run from: D:\\rishi\\public\\
Usage:    python update_class6_portals.py
"""

import shutil, sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent.resolve()

FILES = {
    'syllabus':  SCRIPT_DIR / 'syllabus.html',
    'admin':     SCRIPT_DIR / 'admin.html',
    'topic':     SCRIPT_DIR / 'topic-exam.html',
    'sampurna':  SCRIPT_DIR / 'sampurna-pariksha.html',
    'parent':    SCRIPT_DIR / 'parent.html',
}

def log(msg, level='OK'):
    icons = {'OK':'[OK]','ERR':'[XX]','WORK':'[..]','WARN':'[!!]'}
    print(f"{icons.get(level,'    ')} {msg}", flush=True)

def fail(msg):
    log(msg, 'ERR'); sys.exit(1)

def validate():
    for name, path in FILES.items():
        if not path.exists():
            fail(f"{path.name} not found")
    log("All 5 files found")

def backup(path):
    shutil.copy2(path, str(path) + '.bak')

def replace_block(path, old, new, label):
    content = path.read_text(encoding='utf-8')
    if old not in content:
        log(f"NOT FOUND: {label} in {path.name}", 'WARN')
        return False
    path.write_text(content.replace(old, new, 1), encoding='utf-8')
    log(f"{path.name} — {label}")
    return True

# ═══════════════════════════════════════════════════════
# 1. SYLLABUS — flip built:false → built:true for class6
# ═══════════════════════════════════════════════════════
def patch_syllabus():
    log("syllabus.html ...", 'WORK')
    path = FILES['syllabus']
    backup(path)
    content = path.read_text(encoding='utf-8')
    lines = content.split('\n')
    changed = 0
    for i, line in enumerate(lines):
        if 'built:false' in line and '/explain/class6/' in line:
            lines[i] = line.replace('built:false', 'built:true ', 1)
            changed += 1
    path.write_text('\n'.join(lines), encoding='utf-8')
    log(f"syllabus.html — {changed}/10 chapters set built:true")

# ═══════════════════════════════════════════════════════
# 2. ADMIN — replace entire class6 CH block
# ═══════════════════════════════════════════════════════
ADMIN_OLD = """      1: {n:'Patterns in Mathematics',        topic:'Arithmetic',   color:'#6C63FF', built:false,
          ex:'/explain/class6/arithmetic/patterns-in-mathematics.html',
          pr:'/practice/class6/arithmetic/patterns-in-mathematics.html',    exam:null},
      2: {n:'Lines and Angles',               topic:'Geometry',     color:'#059669', built:true ,
          ex:'/explain/class6/geometry/lines-and-angles.html',
          pr:'/practice/class6/geometry/lines-and-angles.html',             exam:null},
      3: {n:'Number Play',                    topic:'Arithmetic',   color:'#2563EB', built:true ,
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
      {id:'arithmetic',  name:'Arithmetic',   icon:'\U0001f522', chs:[1,3,5,7,10]},
      {id:'geometry',    name:'Geometry',     icon:'\U0001f4d0', chs:[2,8,9]},
      {id:'mensuration', name:'Mensuration',  icon:'\U0001f4cf', chs:[6]},
      {id:'datahandling',name:'Data Handling',icon:'\U0001f4ca', chs:[4]}
    ],
    ALL_BUILT_CHS: []"""

ADMIN_NEW = """      1: {n:'Patterns in Mathematics',        topic:'Arithmetic',   color:'#6C63FF', built:true ,
          ex:'/explain/class6/arithmetic/patterns-in-mathematics.html',
          pr:'/practice/class6/arithmetic/patterns-in-mathematics.html',    exam:'/exam.html?ch=c6-01'},
      2: {n:'Lines and Angles',               topic:'Geometry',     color:'#059669', built:true ,
          ex:'/explain/class6/geometry/lines-and-angles.html',
          pr:'/practice/class6/geometry/lines-and-angles.html',             exam:'/exam.html?ch=c6-02'},
      3: {n:'Number Play',                    topic:'Arithmetic',   color:'#2563EB', built:true ,
          ex:'/explain/class6/arithmetic/number-play.html',
          pr:'/practice/class6/arithmetic/number-play.html',                exam:'/exam.html?ch=c6-03'},
      4: {n:'Data Handling and Presentation', topic:'Data Handling',color:'#D97706', built:true ,
          ex:'/explain/class6/data-handling/data-handling-and-presentation.html',
          pr:'/practice/class6/data-handling/data-handling-and-presentation.html',exam:'/exam.html?ch=c6-04'},
      5: {n:'Prime Time',                     topic:'Arithmetic',   color:'#7C3AED', built:true ,
          ex:'/explain/class6/arithmetic/prime-time.html',
          pr:'/practice/class6/arithmetic/prime-time.html',                 exam:'/exam.html?ch=c6-05'},
      6: {n:'Perimeter and Area',             topic:'Mensuration',  color:'#B45309', built:true ,
          ex:'/explain/class6/mensuration/perimeter-and-area.html',
          pr:'/practice/class6/mensuration/perimeter-and-area.html',        exam:'/exam.html?ch=c6-06'},
      7: {n:'Fractions',                      topic:'Arithmetic',   color:'#0891B2', built:true ,
          ex:'/explain/class6/arithmetic/fractions.html',
          pr:'/practice/class6/arithmetic/fractions.html',                  exam:'/exam.html?ch=c6-07'},
      8: {n:'Playing with Constructions',     topic:'Geometry',     color:'#0D9488', built:true ,
          ex:'/explain/class6/geometry/playing-with-constructions.html',
          pr:'/practice/class6/geometry/playing-with-constructions.html',   exam:'/exam.html?ch=c6-08'},
      9: {n:'Symmetry',                       topic:'Geometry',     color:'#16A34A', built:true ,
          ex:'/explain/class6/geometry/symmetry.html',
          pr:'/practice/class6/geometry/symmetry.html',                     exam:'/exam.html?ch=c6-09'},
      10:{n:'The Other Side of Zero',         topic:'Arithmetic',   color:'#DC2626', built:true ,
          ex:'/explain/class6/arithmetic/the-other-side-of-zero.html',
          pr:'/practice/class6/arithmetic/the-other-side-of-zero.html',     exam:'/exam.html?ch=c6-10'}
    },
    TOPICS: [
      {id:'arithmetic',  name:'Arithmetic',   icon:'\U0001f522', chs:[1,3,5,7,10]},
      {id:'geometry',    name:'Geometry',     icon:'\U0001f4d0', chs:[2,8,9]},
      {id:'mensuration', name:'Mensuration',  icon:'\U0001f4cf', chs:[6]},
      {id:'datahandling',name:'Data Handling',icon:'\U0001f4ca', chs:[4]}
    ],
    ALL_BUILT_CHS: [1,2,3,4,5,6,7,8,9,10]"""

def patch_admin():
    log("admin.html ...", 'WORK')
    path = FILES['admin']
    backup(path)
    replace_block(path, ADMIN_OLD, ADMIN_NEW, 'all 10 chapters built:true + exam paths + ALL_BUILT_CHS')

# ═══════════════════════════════════════════════════════
# 3. TOPIC-EXAM — add TOPIC_MAP_CLASS6 + wire init
# ═══════════════════════════════════════════════════════
TOPIC_MAP_NEW = """var TOPIC_MAP_CLASS6 = {
  arithmetic:  { name:'Arithmetic',   icon:'&#128290;', chapters:['01','03','05','07','10'] },
  geometry:    { name:'Geometry',     icon:'&#128208;', chapters:['02','08','09']           },
  mensuration: { name:'Mensuration',  icon:'&#128207;', chapters:['06']                    },
  datahandling:{ name:'Data Handling',icon:'&#128202;', chapters:['04']                    }
};
var TOPIC_MAP_CLASS7 ="""

def patch_topic_exam():
    log("topic-exam.html ...", 'WORK')
    path = FILES['topic']
    backup(path)
    replace_block(path,
        'var TOPIC_MAP_CLASS7 =',
        TOPIC_MAP_NEW,
        'TOPIC_MAP_CLASS6 added')
    replace_block(path,
        '  TOPIC_MAP  = (STUDENT_CLASS === 7) ? TOPIC_MAP_CLASS7',
        '  TOPIC_MAP  = (STUDENT_CLASS === 6) ? TOPIC_MAP_CLASS6\n             : (STUDENT_CLASS === 7) ? TOPIC_MAP_CLASS7',
        'init wired for class 6')

# ═══════════════════════════════════════════════════════
# 4. SAMPURNA — add ALL_CHAPTERS_CLASS6 + wire init
# ═══════════════════════════════════════════════════════
def patch_sampurna():
    log("sampurna-pariksha.html ...", 'WORK')
    path = FILES['sampurna']
    backup(path)
    replace_block(path,
        'var ALL_CHAPTERS_CLASS7 =',
        "var ALL_CHAPTERS_CLASS6 = ['01','02','03','04','05','06','07','08','09','10'];\nvar ALL_CHAPTERS_CLASS7 =",
        'ALL_CHAPTERS_CLASS6 added')
    replace_block(path,
        '  ALL_CHAPTERS  = (STUDENT_CLASS === 7) ? ALL_CHAPTERS_CLASS7',
        '  ALL_CHAPTERS  = (STUDENT_CLASS === 6) ? ALL_CHAPTERS_CLASS6\n              : (STUDENT_CLASS === 7) ? ALL_CHAPTERS_CLASS7',
        'init wired for class 6')

# ═══════════════════════════════════════════════════════
# 5. PARENT — set explainBuilt for class6
# ═══════════════════════════════════════════════════════
def patch_parent():
    log("parent.html ...", 'WORK')
    path = FILES['parent']
    backup(path)
    replace_block(path,
        '    explainBuilt: {}\n  }\n};',
        '    explainBuilt: {1:1, 2:1, 3:1, 4:1, 5:1, 6:1, 7:1, 8:1, 9:1, 10:1}\n  }\n};',
        'explainBuilt set for all 10 chapters')

# ═══════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════
def main():
    print()
    print('=' * 50)
    print('  RISHI Class 6 Portal Wiring')
    print('=' * 50)
    print()

    validate()
    print()

    patch_syllabus()
    print()
    patch_admin()
    print()
    patch_topic_exam()
    print()
    patch_sampurna()
    print()
    patch_parent()

    print()
    print('=' * 50)
    print('  ALL PORTALS UPDATED')
    print('=' * 50)
    print()
    print("NEXT:")
    print("  cd D:\\rishi")
    print("  git add .")
    print('  git commit -m "Class 6: portal wiring complete"')
    print("  git push")

if __name__ == '__main__':
    main()
