/*
═══════════════════════════════════════════════════════════════
  RISHIKA CONFIG — Paste this entire file at the start of
  every new Claude session to restore full project context.
  Last updated: 10 May 2026
═══════════════════════════════════════════════════════════════

▌ OWNER
  Arindam Bhowmik — non-technical, sole developer + owner
  All code written by Claude, deployed via git push from VS Code on Windows
  Student testing: Dabeet (student), Priyanka (parent)
  Student ID: dabeet8{class}{last3mobile} e.g. dabeet8171
  Parent ID:  priyanka{last5mobile}       e.g. priyanka47522

▌ REPO & HOSTING
  Repo:    github.com/Arindamb1203/RISHI
  Live:    rishi-ewh.pages.dev
  Host:    Cloudflare Pages (free, unlimited bandwidth)
  Deploy:  git push to main → auto deploys (~30 seconds)
  Build output directory: public
  CRITICAL: git add . must be run from D:\rishi (NOT D:\rishi\public)
            functions\ folder is at repo root, not inside public\

▌ STACK
  Pure HTML / CSS / Vanilla JS — no frameworks, no React
  Works on low-end devices and budget Android phones
  No backend server — Cloudflare Pages Functions for API only

▌ AI — ALL OPENAI (Gemini fully dropped)
  Model: gpt-4.1-mini
  Key:   OPENAI_API_KEY (Cloudflare env var)
  explain-differently.js  → OpenAI gpt-4.1-mini
  generate-questions.js   → OpenAI gpt-4.1-mini
  NEVER use Gemini again. NEVER guess model names — check docs first.

▌ QUESTION BANK SYSTEM (built May 2026)
  Backend:  functions/api/generate-questions.js
            POST /api/generate-questions
            Auth: Bearer RISHI_ADMIN_TOKEN
            Stores in Cloudflare KV (RISHI_QUESTIONS binding)
            KV key format: {board}_{class}_ch{chId}_{tag}
            e.g. cbse_7_ch01_chapter_exam
  Tags:     chapter_exam / practice / topic_exam / sampurna / explain
  Sources:  NCT RDS RSA EXM CBP OLY ORI (admin-only, never shown to students)
  Schema:   id, q, options[4], correct(0-indexed), explanation, source, tag,
            exam_exclusive, difficulty, verified, times_served, times_correct,
            times_wrong, rested, year_last_used
  Admin KV: admin.js handles seed/seed_all/delete/list/get
  questions.js: tries KV with _exam then _chapter_exam tag;
                converts bank format (flat array) → sections format (A/B/C)

▌ QUESTION BANKS GENERATED (as of 10 May 2026)
  Class 7: all 8 chapters ✅ (chapter_exam, 15 Qs each)
  Class 8: PENDING — generate via admin Questions tab
  Class 9: all built chapters ✅ (chapter_exam, 15 Qs each)
  Class 6: not yet

▌ ADMIN PANEL
  URL:  rishi-ewh.pages.dev/admin
  File: public/admin.html ← CORRECT. NEVER public/admin/admin.html
  Cloudflare serves /admin from public/admin.html (flat file in public/)
  public/admin/ folder exists ONLY for question-manager.html (old KV seeder)
  Features: Dashboard, Chapters, Topic Exams, Questions, Student, Logs, Deploy
  Global Class selector (6/7/8/9) drives ALL tabs
  Topic Exams tab has Sampurna Pariksha card per class
  Sampurna URLs:
    Class 7: /sampurna-pariksha.html?class=7
    Class 8: /sampurna-pariksha.html
    Class 9: /sampurna-pariksha.html?class=9

▌ BYPASS SYSTEM
  Key: rishi_admin_bypass — sessionStorage ONLY (never localStorage)
  Mechanism: admin openPage() / goStudent() appends ?bypass=1 to URL
             rishi-core.js detects ?bypass=1 on load → sets sessionStorage
  sessionStorage does NOT persist across tabs — URL param is the bridge
  Bypass respected in: rishiCheckPlan, rishiIsExplainDone, rishiIsPracticeDone,
                       rishiIsChapExamDone, rishiIsTopicExamDone
  sampurna-pariksha.html uses sessionStorage for bypass (fixed from localStorage)

▌ EXAM PAGES
  exam.html:           chapter exams — reads /api/questions — NO voice (never had it)
  topic-exam.html:     class-aware 7/8/9 — TOPIC_MAP_CLASS7/8/9
                       URL: /topic-exam.html?topic=arithmetic&class=7
  sampurna-pariksha.html: class-aware 7/8/9 — ALL_CHAPTERS_CLASS7/8/9
                       URL: /sampurna-pariksha.html?class=7

▌ GENERATOR SYSTEM (generate.py)
  Location: D:\rishi\public\generate.py
  Usage:    cd D:\rishi\public && python generate.py data/classX/chapter-slug.json
  Updates syllabus.html, parent.html, admin.html (built:true) automatically

▌ FILE TREE (as of 10 May 2026)
  D:\rishi\
  +---functions\api\
  |       admin.js / questions.js / explain.js
  |       explain-differently.js   (OpenAI gpt-4.1-mini)
  |       generate-questions.js    (OpenAI MCQ → KV)
  |       deploy.js / tts.js
  +---public\
  |   |   admin.html               MAIN ADMIN (/admin)
  |   |   exam.html / topic-exam.html / sampurna-pariksha.html
  |   |   rishi-core.js / rishi-presence.js / rishi-sync.js / rishi-diagram.js
  |   |   explain-helper.js / syllabus.html / parent.html / parent-dashboard.html
  |   +---admin\  question-manager.html (old, kept)
  |   +---data\cbse\class8\ exam JSONs ch01-ch17
  |   +---explain\class7,8,9\ all ✅
  |   \---practice\class7,8,9\ all ✅

▌ CLASS STATUS
  Class 8 — 16 chapters ✅ (Ch6 Squares, Ch7 Cubes deferred)
  Class 9 — 12 chapters ✅
  Class 7 — 8 chapters ✅ (Ganita Prakash, NCERT 2025-26)
  Class 6 — stubs only

▌ CLASS 7 CHAPTER MAP (Ganita Prakash, NCERT 2025-26)
  Ch1 Large Numbers Around Us       arithmetic  exam:c7-01  KV:01
  Ch2 Arithmetic Expressions        arithmetic  exam:c7-02  KV:02
  Ch3 A Peek Beyond the Point       arithmetic  exam:c7-03  KV:03
  Ch4 Expressions using Letter-Nos  algebra     exam:c7-06  KV:04
  Ch5 Parallel & Intersecting Lines geometry    exam:c7-07  KV:05
  Ch6 Number Play                   arithmetic  exam:c7-04  KV:06
  Ch7 A Tale of Three Int. Lines    geometry    exam:c7-08  KV:07
  Ch8 Working with Fractions        arithmetic  exam:c7-05  KV:08
  NOTE: exam URL uses c7-XX; exam.html maps to apiCh (XX); KV uses 01..08

▌ CLASS 6 CHAPTER MAP (NCERT 2025-26)
  Arithmetic: Patterns in Maths, Number Play, Prime Time, Fractions, Other Side of Zero
  Geometry:   Lines and Angles, Playing with Constructions, Symmetry
  Mensuration: Perimeter and Area
  Data Handling: Data Handling and Presentation

▌ PENDING WORK — PRIORITY ORDER
  [P0] Class 8 question bank — generate via admin (15 Qs/chapter, chapter_exam tag)
  [P1] Presence & Resume System (rishi-presence.js)
       Single injection all pages, localStorage, timing slots,
       online/offline, session resume, exam timer persistence, parent dashboard
  [P2] YouTube video embed (one per chapter, Arindam picks URL, Claude wires)
  [P3] Practice pages verification
  [FUTURE] Class 6 — 10 chapters
  [FUTURE] ICSE / WBBSE

▌ PORTAL STATUS
  syllabus.html:          class-aware 6/7/8/9 ✅
  parent.html:            class-aware, 5 tabs ✅
  admin.html:             class-aware 6/7/8/9, question bank ✅
  topic-exam.html:        class-aware 7/8/9 ✅
  sampurna-pariksha.html: class-aware 7/8/9 ✅

▌ CHARACTERS
  Rishika — ALL pages. Turtle SVG on explain. Sprite on practice.
  Rekha: PERMANENTLY RETIRED. Never use this name.

▌ ELEVENLABS TTS
  Proxy: functions/tts.js (repo root)
  Voice: Priyanka, ID BpjGufoPiobT79j2vtj4
  Fallback: Browser TTS

▌ CRITICAL RULES FOR CLAUDE
  1.  NEVER guess file contents — always read actual file first
  2.  NEVER deliver code without checking for errors
  3.  git add . from D:\rishi (NOT D:\rishi\public)
  4.  Always end session: git add . → commit → push
  5.  Response style: extremely concise, no fluff
  6.  Smart apostrophes in JS = syntax crash. Use \' or &#39;
  7.  tts.js at repo ROOT functions\tts.js — NOT inside public\
  8.  Do things simply — never overcomplicate
  9.  rishi_admin_bypass → sessionStorage ONLY — never localStorage
  10. generate.py handles portal updates automatically
  11. NEVER ask Arindam to edit code manually — deliver complete files
  12. Build order: content JSON → generate.py → git push
  13. data-handling folder uses hyphen not underscore
  14. Admin file: public/admin.html — NEVER public/admin/admin.html
  15. OpenAI only — Gemini is dead in this project
  16. NEVER do partial patches on HTML/JS — always deliver COMPLETE files
      Python string replacement fails silently on Windows CRLF line endings
  17. admin.html path: Cloudflare serves /admin from public/admin.html (flat)
      NOT from public/admin/admin.html (subfolder) — wasted a full session on this
  18. sessionStorage does NOT persist across browser tabs — use URL ?bypass=1
  19. Deliver files via present_files — not by asking Arindam to copy-paste code
  20. Before any fix: read the ACTUAL file in repo, not a previously uploaded version
*/
