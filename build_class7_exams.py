"""
build_class7_exams.py — Run from D:\rishi>
python build_class7_exams.py

What this does:
1. Updates functions/api/questions.js:
   - Also checks KV with _chapter_exam tag (bank format)
   - Converts bank format (flat array) to sections format (what exam pages expect)
2. Updates public/topic-exam.html:
   - Adds TOPIC_MAP_CLASS7
   - Makes class detection include Class 7

No manual edits needed. Run, then: git add . && git commit && git push
"""

import re, os, sys

def read(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read().replace('\r\n', '\n')

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)
    print("  Saved:", path)

errors = []

# ─────────────────────────────────────────────────────────────
# 1. questions.js — add chapter_exam KV fallback + format convert
# ─────────────────────────────────────────────────────────────
QJS = os.path.join('functions', 'api', 'questions.js')
qjs = read(QJS)

# Add bankToSections helper before onRequestGet
BANK_HELPER = """
// Convert new question bank format (flat array) → old sections format
function bankToSections(bankData) {
  const letters = ['a','b','c','d'];
  const qs = (bankData.questions || []).map(function(q) {
    return {
      id:          q.id,
      text:        q.q,
      options:     { a: q.options[0], b: q.options[1], c: q.options[2], d: q.options[3] },
      correct:     letters[Math.min(q.correct, 3)] || 'a',
      difficulty:  q.difficulty || 'medium',
      explanation: q.explanation || ''
    };
  });
  return {
    meta: {
      board:        (bankData.meta && bankData.meta.board)       || 'cbse',
      class:        (bankData.meta && bankData.meta.class)       || 8,
      chapter_id:   (bankData.meta && bankData.meta.chId)        || '',
      chapter_name: (bankData.meta && bankData.meta.chapterName) || '',
      topic_group:  ''
    },
    sections: {
      A: {
        type:        'mcq',
        label:       'Conceptual',
        marks_per_q: 1,
        questions:   qs
      }
    }
  };
}

"""

if 'bankToSections' not in qjs:
    qjs = qjs.replace('export async function onRequestGet', BANK_HELPER + 'export async function onRequestGet', 1)
    print("questions.js: bankToSections helper added")
else:
    print("questions.js: bankToSections already present")

# Update KV lookup to also try _chapter_exam tag and convert format
OLD_KV = """    // 1. Try KV first
    if (env.RISHI_QUESTIONS) {
      const kvData = await env.RISHI_QUESTIONS.get(kvKey);
      if (kvData) {
        return new Response(kvData, {
          status: 200,
          headers: corsHeaders("application/json"),
        });
      }
    }"""

NEW_KV = """    // 1. Try KV first (try both _exam and _chapter_exam tags)
    if (env.RISHI_QUESTIONS) {
      const kvKey2 = `${board}_${cls}_ch${chIdPadded}_chapter_exam`;
      let kvData = await env.RISHI_QUESTIONS.get(kvKey);
      if (!kvData) kvData = await env.RISHI_QUESTIONS.get(kvKey2);
      if (kvData) {
        // Parse and check if it's the new bank format (has questions array)
        try {
          const parsed = JSON.parse(kvData);
          if (parsed.questions && Array.isArray(parsed.questions)) {
            // New bank format → convert to sections format
            return new Response(JSON.stringify(bankToSections(parsed)), {
              status: 200,
              headers: corsHeaders("application/json"),
            });
          }
        } catch(e) {}
        // Old format — return as-is
        return new Response(kvData, {
          status: 200,
          headers: corsHeaders("application/json"),
        });
      }
    }"""

if OLD_KV in qjs:
    qjs = qjs.replace(OLD_KV, NEW_KV, 1)
    print("questions.js: KV lookup updated")
else:
    errors.append("questions.js: KV lookup pattern not found")
    print("ERROR: questions.js KV pattern not found")

write(QJS, qjs)

# ─────────────────────────────────────────────────────────────
# 2. topic-exam.html — add TOPIC_MAP_CLASS7 + class 7 detection
# ─────────────────────────────────────────────────────────────
TEHTML = os.path.join('public', 'topic-exam.html')
te = read(TEHTML)

# Add TOPIC_MAP_CLASS7 after TOPIC_MAP_CLASS9
TOPIC7 = """
var TOPIC_MAP_CLASS7 = {
  arithmetic: { name:'Arithmetic', icon:'&#128290;', chapters:['01','02','03','06','08'] },
  algebra:    { name:'Algebra',    icon:'&#128291;', chapters:['04']                     },
  geometry:   { name:'Geometry',   icon:'&#128208;', chapters:['05','07']                }
};
"""

if 'TOPIC_MAP_CLASS7' not in te:
    # Insert after TOPIC_MAP_CLASS9 closing
    te = re.sub(
        r'(var TOPIC_MAP_CLASS9 = \{.*?^\};)',
        r'\1' + TOPIC7,
        te, flags=re.DOTALL | re.MULTILINE, count=1
    )
    print("topic-exam.html: TOPIC_MAP_CLASS7 added")
else:
    print("topic-exam.html: TOPIC_MAP_CLASS7 already present")

# Update class detection to include class 7
OLD_CLASS = "TOPIC_MAP  = (STUDENT_CLASS === 9) ? TOPIC_MAP_CLASS9 : TOPIC_MAP_CLASS8;"
NEW_CLASS = ("TOPIC_MAP  = (STUDENT_CLASS === 7) ? TOPIC_MAP_CLASS7\n"
             "             : (STUDENT_CLASS === 9) ? TOPIC_MAP_CLASS9\n"
             "             : TOPIC_MAP_CLASS8;")

if OLD_CLASS in te:
    te = te.replace(OLD_CLASS, NEW_CLASS, 1)
    print("topic-exam.html: class detection updated to include class 7")
else:
    errors.append("topic-exam.html: class detection pattern not found")
    print("ERROR: class detection pattern not found")

write(TEHTML, te)

# ─────────────────────────────────────────────────────────────
# DONE
# ─────────────────────────────────────────────────────────────
print()
if errors:
    print("ERRORS (fix manually):")
    for e in errors: print(" -", e)
else:
    print("All changes applied successfully.")

print()
print("git add .")
print('git commit -m "Class 7 exams: KV bank integration, topic-exam Class 7 support"')
print("git push")
