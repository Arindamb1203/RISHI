/*
═══════════════════════════════════════════════════════════════
  RISHIKA CONFIG — Paste this entire file at the start of
  every new Claude session to restore full project context.
  Last updated: 15 May 2026 (evening)
═══════════════════════════════════════════════════════════════

▌ OWNER
  Arindam Bhowmik — non-technical, sole developer + owner
  All code written by Claude, deployed via git push from VS Code on Windows
  Student: Dabeet Bhowmik — ID: RISHI-DABEET-001
  Parent:  Priyanka — ID: PARENT-PRIYANKA-002, password: rishi2025
  git add . always from D:\rishi (NOT D:\rishi\public)

▌ REPO & HOSTING
  Repo:    github.com/Arindamb1203/RISHI
  Live:    rishi-ewh.pages.dev
  Host:    Cloudflare Pages — auto deploys on git push (~30s)
  Build output directory: public
  functions\ folder at repo ROOT — not inside public\

▌ STACK
  Pure HTML / CSS / Vanilla JS — no frameworks
  Cloudflare Pages Functions for API only

▌ AI — ALL OPENAI (Gemini fully dropped)
  Model: gpt-4.1-mini
  Key:   OPENAI_API_KEY (Cloudflare env var)
  explain-differently.js  OpenAI gpt-4.1-mini
  generate-questions.js   OpenAI gpt-4.1-mini
  NEVER use Gemini. NEVER guess model names.

▌ QUESTION BANK SYSTEM
  Backend:  functions/api/generate-questions.js
            POST /api/generate-questions, Auth: Bearer RISHI_ADMIN_TOKEN
            Stores in Cloudflare KV (RISHI_QUESTIONS binding)
            KV key: {board}_{class}_ch{chId}_{tag} e.g. cbse_7_ch01_chapter_exam
  questions.js: tries KV _exam then _chapter_exam; converts bank format to sections

▌ QUESTION BANKS (as of 15 May 2026)
  Class 7: all 8 chapters  (chapter_exam, 15 Qs each)
  Class 8: all 16 chapters  (chapter_exam, 15 Qs each) — generated 15 May
  Class 9: all built chapters  (chapter_exam, 15 Qs each)
  Class 6: PENDING — generate via admin Questions tab

▌ ADMIN PANEL
  URL:  rishi-ewh.pages.dev/admin  password: rishi2025
  File: public/admin.html — ONLY correct path. NEVER public/admin/admin.html
  Tabs: Dashboard | Topic Exams | Questions | Student | Logs | Deploy
  NOTE: Chapters tab REMOVED 15 May — was reading admin localStorage not student data
  Global Class selector (6/7/8/9) drives ALL tabs
  Tab persistence: localStorage rishi_admin_tab — restored on refresh
  Dashboard: Live Stats + Registered Students table
             All Open buttons append ?bypass=1 — pages unlock automatically
  Activity Log: colour-coded (amber=generating, green=success, red=error+Retry)
                Progress bar during Generate All shows X/total
  Topic Exams tab: all classes 6/7/8/9 wired with correct URLs
  Sampurna: Class6:/sampurna-pariksha.html?class=6
            Class7:/sampurna-pariksha.html?class=7
            Class8:/sampurna-pariksha.html
            Class9:/sampurna-pariksha.html?class=9

▌ BYPASS SYSTEM (fully fixed 15 May 2026)
  Key: rishi_admin_bypass — sessionStorage ONLY (never localStorage)
  Flow: admin openPage()/openAsStudent() append ?bypass=1 to URL
        rishi-core.js IIFE on load detects ?bypass=1 sets sessionStorage immediately
        All pages then read bypass from sessionStorage
  Bypass-aware in rishi-core.js:
    rishiCheckPlan, rishiIsExplainDone, rishiIsPracticeDone,
    rishiIsChapExamDone, rishiIsTopicExamDone
  Bypass-aware in syllabus.html (LOCAL copies — no rishi-core.js there):
    isExplainDone, isPracticeDone, isChapExamDone, rishiIsTopicExamDone
    + bypass URL detection IIFE at top of syllabus script
  RULE 23: Any bypass fix to rishi-core.js must ALSO be applied to syllabus.html

▌ PARENT PORTAL
  URL:  rishi-ewh.pages.dev/parent
  File: public/parent.html (2700+ lines — always read before editing)
  Default password: rishi2025
  Tabs: Study Plan | Performance | Analytics | Study Slots | Live Status
  Sync button pushes localStorage to Cloudflare D1

▌ PARENT DASHBOARD
  URL: rishi-ewh.pages.dev/parent-dashboard
  File: public/parent-dashboard.html

▌ SYNC SYSTEM (rishi-sync.js)
  Syncs to Cloudflare D1 via /d1-sync endpoint
  rishiSync.pushAll() from Priyanka phone to fix blank Study Plans

▌ PRICING
  Subscription: 599/month everywhere

▌ SYLLABUS
  syllabus.html: class-aware 6/7/8/9
  CRITICAL: does NOT include rishi-core.js — has own local done-check functions
            has bypass URL detection IIFE and bypass checks in all done functions

▌ EXAM PAGES
  exam.html:           chapter exams — NO voice
  topic-exam.html:     class-aware 6/7/8/9 — TOPIC_MAP_CLASS6/7/8/9
  sampurna-pariksha.html: class-aware 6/7/8/9 — ALL_CHAPTERS_CLASS6/7/8/9

▌ CLASS 6 CHAPTER MAP (NCERT Ganita Prakash 2025-26)
  Ch1  Patterns in Mathematics       arithmetic    exam:c6-01  KV:01
  Ch2  Lines and Angles              geometry      exam:c6-02  KV:02
  Ch3  Number Play                   arithmetic    exam:c6-03  KV:03
  Ch4  Data Handling and Presentation data-handling exam:c6-04  KV:04
  Ch5  Prime Time                    arithmetic    exam:c6-05  KV:05
  Ch6  Perimeter and Area            mensuration   exam:c6-06  KV:06
  Ch7  Fractions                     arithmetic    exam:c6-07  KV:07
  Ch8  Playing with Constructions    geometry      exam:c6-08  KV:08
  Ch9  Symmetry                      geometry      exam:c6-09  KV:09
  Ch10 The Other Side of Zero        arithmetic    exam:c6-10  KV:10
  Paths: explain/class6/<topic>/<slug>.html
         practice/class6/<topic>/<slug>.html
         data/cbse/class6/chXX/chXX-exam.json

▌ CLASS 7 CHAPTER MAP (Ganita Prakash, NCERT 2025-26)
  Ch1 Large Numbers Around Us       arithmetic  exam:c7-01  KV:01
  Ch2 Arithmetic Expressions        arithmetic  exam:c7-02  KV:02
  Ch3 A Peek Beyond the Point       arithmetic  exam:c7-03  KV:03
  Ch4 Expressions using Letter-Nos  algebra     exam:c7-06  KV:04
  Ch5 Parallel and Intersecting Lines geometry  exam:c7-07  KV:05
  Ch6 Number Play                   arithmetic  exam:c7-04  KV:06
  Ch7 A Tale of Three Int. Lines    geometry    exam:c7-08  KV:07
  Ch8 Working with Fractions        arithmetic  exam:c7-05  KV:08

▌ DATABASE
  D:\rishi\database\schema.sql — D1 schema
  Tables: student_data, registrations, payments, password_resets

▌ GENERATOR SYSTEM
  generate.py — PROTECTED. D:\rishi\public\generate.py — NEVER delete
  Usage: cd D:\rishi\public && python generate.py data/classX/chapter-slug.json

▌ PYTHON SCRIPTS IN public\
  generate.py              PROTECTED — per-chapter portal wiring
  build_class6.py          AI content generator for Class 6 (already run)
  update_class6_portals.py Class 6 portal wiring (already run)
  batch_generate.py / batch_exam_generate.py / check7.py / patch_admin7.py

▌ FILE TREE (as of 15 May 2026)
  D:\rishi\
  +---database\schema.sql
  +---functions\api\
  |       admin.js / questions.js / explain.js / explain-differently.js
  |       generate-questions.js / deploy.js / tts.js / d1-sync.js
  +---public\
  |   |   index.html  (redirect to landing.html)
  |   |   admin.html / exam.html / topic-exam.html / sampurna-pariksha.html
  |   |   login.html / register.html / landing.html / coming-soon.html
  |   |   parent.html / parent-dashboard.html / syllabus.html
  |   |   rishi-core.js / rishi-presence.js / rishi-sync.js / rishi-diagram.js
  |   |   explain-helper.js / generate.py (PROTECTED)
  |   +---admin\  question-manager.html
  |   +---data\cbse\class6..9\  exam JSONs
  |   +---data\class6..9\  chapter data JSONs
  |   +---explain\class6..9\  all topic subfolders
  |   \---practice\class6..9\ all topic subfolders

▌ CLASS STATUS
  Class 8 — 16 chapters  (Ch6 Squares, Ch7 Cubes deferred)
  Class 9 — 12 chapters 
  Class 7 — 8 chapters 
  Class 6 — 10 chapters  content + portals done, KV banks pending

▌ RISHI-CORE.JS (updated 15 May 2026)
  Top of file: IIFE detects ?bypass=1 in URL sets sessionStorage immediately
  All bypass checks use sessionStorage('rishi_admin_bypass') === '1'

▌ RISHI-PRESENCE.JS (v2 — updated 15 May 2026)
  Fixed: bypass uses sessionStorage; heartbeat writes rishi_presence_online_<sid>
  New: Session resume for explain + practice pages (zero page changes needed)
       Saves window.idx on heartbeat/visibility/unload
       Shows "Continue from Q?" prompt on load (1.5s delay)
       Explain resume: window.idx = n; window.showQ()
       Practice resume: window.loadQ(n)
       Auto-clears on completion / 24hr TTL
  Unchanged: rishiSaveExamState / rishiGetExamResume / rishiClearExamResume

▌ PENDING WORK
  [P0] Class 6 KV question banks — Admin Class 6 Generate All
  [P0] Active Study Plans sync — Priyanka tap Sync on phone
  [P2] YouTube video embed (Arindam picks URL, Claude wires)
  [P3] Practice pages verification + Class 6 quality check
  [FUTURE] ICSE / WBBSE

▌ PORTAL STATUS
  index.html:             redirect to landing.html
  syllabus.html:          class-aware 6/7/8/9, bypass fully fixed
  parent.html:            mobile-responsive, sync, profile panel
  parent-dashboard.html:  nav strip
  admin.html:             6 tabs, bypass, coloured log, progress bar
  topic-exam.html:        class-aware 6/7/8/9
  sampurna-pariksha.html: class-aware 6/7/8/9
  login.html / register.html / landing.html: all current

▌ CHARACTERS
  Rishika — ALL pages. Turtle SVG on explain. Sprite on practice.
  Rekha: PERMANENTLY RETIRED. Never use.

▌ ELEVENLABS TTS
  Proxy: functions/tts.js (repo root)
  Voice: Priyanka, ID BpjGufoPiobT79j2vtj4 / Fallback: Browser TTS

▌ CRITICAL RULES FOR CLAUDE
  1.  ABSOLUTE MANDATE: NEVER assume any file path, structure, content, format, naming
      Always read the actual current file first. Ask if unavailable. No exceptions.
  2.  NEVER deliver code without error checking
  3.  git add . from D:\rishi (NOT D:\rishi\public)
  4.  Always end session: git add . commit push
  5.  Response style: extremely concise, no fluff
  6.  Smart apostrophes in JS = syntax crash. Use \' or &#39;
  7.  tts.js at repo ROOT functions\tts.js — NOT inside public\
  8.  Do things simply — never overcomplicate
  9.  rishi_admin_bypass sessionStorage ONLY — never localStorage
  10. generate.py PROTECTED — never delete
  11. NEVER ask Arindam to edit code manually — deliver files via present_files
  12. data-handling folder uses hyphen not underscore
  13. Admin: public/admin.html ONLY
  14. OpenAI only — Gemini dead
  15. NEVER partial patches — deliver COMPLETE files
  16. Always read the CURRENT file — never use previously uploaded version
  17. Python patches: use regex or line-based logic — exact string replace fails on CRLF
  18. parent.html 2700+ lines — always read before touching
  19. sessionStorage NOT shared across tabs — always pass ?bypass=1 in URL
  20. Price is 599 everywhere
  21. syllabus.html has LOCAL done-check functions — bypass fix there is SEPARATE from rishi-core.js
  22. Admin Chapters tab REMOVED 15 May — never re-add
  23. Deliver files via present_files — never ask copy-paste
*/
