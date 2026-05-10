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
            Generates MCQs via OpenAI, stores in Cloudflare KV (RISHI_QUESTIONS binding)
            KV key format: {board}_{class}_ch{chId}_{tag}
            e.g. cbse_7_ch01_chapter_exam
  Tags:     chapter_exam / practice / topic_exam / sampurna / explain
  Sources:  NCT(NCERT) RDS(RD Sharma) RSA(RS Aggarwal) EXM(Exemplar)
            CBP(CBSE PY) OLY(Olympiad) ORI(Original)
  Schema per question:
    id, q, options[4], correct(0-indexed), explanation,
    source, tag, exam_exclusive, difficulty(easy/medium/hard),
    verified, times_served, times_correct, times_wrong, rested, year_last_used
  Admin KV actions (functions/api/admin.js):
    seed, seed_all, delete, list, get

▌ QUESTION BANKS GENERATED (as of 10 May 2026)
  Class 7: all 8 chapters ✅ (chapter_exam tag, 15 Qs each)
  Class 8: PENDING — not yet generated
  Class 9: all built chapters ✅ (chapter_exam tag, 15 Qs each)
  Class 6: not yet

▌ ADMIN PANEL
  URL:  rishi-ewh.pages.dev/admin
  File: public/admin.html  ← CORRECT PATH
  NOTE: public/admin/admin.html must NOT exist (wrong path, causes confusion)
        public/admin/ folder exists for question-manager.html only
  Features: Dashboard, Chapters, Topic Exams, Questions, Student, Logs, Deploy
  Questions tab: global Class 6/7/8/9 selector, per-chapter AI generation,
                 View button (green) loads questions from KV, activity log
  Topic Exams tab: per-class topic list + Sampurna Pariksha card
  Sampurna URL for Class 8: /sampurna-pariksha.html

▌ GENERATOR SYSTEM (generate.py)
  Location: D:\rishi\public\generate.py
  Usage:    cd D:\rishi\public
            python generate.py data/class9/chapter-slug.json
  What it does:
    1. Reads content JSON from data/classX/chapter-slug.json
    2. Generates explain/classX/topic/chapter-slug.html
    3. Generates practice/classX/topic/chapter-slug.html
    4. Updates syllabus.html, parent.html, admin.html (built:true)

▌ FILE TREE (actual repo as of 10 May 2026)
  D:\rishi\
  |
  +---.github\workflows\
  |       test.yml / test-explain.yml / test-practice.yml
  |       test-exam.yml / test-admin.yml / test-parent.yml / test-landing.yml
  |
  +---functions\                        ROOT level — NOT inside public
  |   |   tts.js                        ElevenLabs TTS proxy
  |   \---api\
  |           admin.js                  seed/seed_all/delete/list/get actions
  |           questions.js
  |           explain.js
  |           explain-differently.js    OpenAI gpt-4.1-mini (Gemini removed)
  |           generate-questions.js     OpenAI MCQ generator → KV storage
  |           deploy.js
  |
  +---public\
  |   |   admin.html                    MAIN ADMIN — served at /admin
  |   |   exam.html / topic-exam.html / sampurna-pariksha.html
  |   |   login.html / register.html / landing.html / coming-soon.html
  |   |   parent.html / parent-dashboard.html
  |   |   rishi-core.js / rishi-presence.js / rishi-sync.js / rishi-diagram.js
  |   |   explain-helper.js
  |   |   syllabus.html
  |   |   generate.py
  |   |
  |   +---admin\
  |   |       question-manager.html     old dark-theme KV seeder (kept, not primary)
  |   |
  |   +---data\
  |   |   +---class8\                   16 practice QB JSONs (old format)
  |   |   +---class9\                   12 content JSONs ✅
  |   |   +---cbse\class8\             exam JSONs ch01-ch17
  |   |
  |   +---explain\
  |   |   +---class8\                   16 pages ✅
  |   |   +---class9\                   12 pages ✅
  |   |   +---class7\                   8 pages ✅
  |   |   \---class6\                   stubs only
  |   |
  |   +---practice\                     same structure
  |   \---images\rishika\sprites\

▌ CLASS STATUS
  Class 8 — ALL 16 CHAPTERS ✅ (Ch6 Squares, Ch7 Cubes deferred)
  Class 9 — ALL 12 CHAPTERS ✅
  Class 7 — ALL 8 CHAPTERS ✅ (Ganita Prakash, new NCERT 2025-26)
  Class 6 — stubs only

▌ CLASS 7 CHAPTER MAP (Ganita Prakash, new NCERT 2025-26)
  Ch1 Large Numbers Around Us      (arithmetic)  exam: c7-01
  Ch2 Arithmetic Expressions       (arithmetic)  exam: c7-02
  Ch3 A Peek Beyond the Point      (arithmetic)  exam: c7-03
  Ch4 Expressions using Letter-Numbers (algebra) exam: c7-06
  Ch5 Parallel and Intersecting Lines (geometry) exam: c7-07
  Ch6 Number Play                  (arithmetic)  exam: c7-04
  Ch7 A Tale of Three Intersecting Lines (geometry) exam: c7-08
  Ch8 Working with Fractions       (arithmetic)  exam: c7-05

▌ CLASS 6 CHAPTER MAP (new NCERT 2025-26)
  Arithmetic:    Patterns in Mathematics, Number Play, Prime Time,
                 Fractions, The Other Side of Zero
  Geometry:      Lines and Angles, Playing with Constructions, Symmetry
  Mensuration:   Perimeter and Area
  Data Handling: Data Handling and Presentation

▌ PENDING WORK — PRIORITY ORDER
  [P0] Class 8 question bank — generate via admin Questions tab
  [P1] Class 7 topic-exam.html — build using question bank
  [P1] Class 7 sampurna-pariksha.html — build using question bank
  [P1] Replace Class 7 chapter exam JSONs with bank questions
  [P1] Presence & Resume System (rishi-presence.js)
       Single injection across all 48 pages, localStorage only
       Timing slots, online/offline tracking, session resume
       Exam timer persistence, real-time parent dashboard view
  [P2] YouTube video embed (one per chapter, Arindam picks, Claude wires)
  [P3] Practice pages verification
  [FUTURE] Class 6 — 10 chapters
  [FUTURE] ICSE Class 8 → WBBSE Class 8

▌ PORTAL STATUS
  syllabus.html: class-aware for 6,7,8,9 ✅
  parent.html:   class-aware, 5 tabs ✅
  admin.html:    class-aware 6/7/8/9, Question bank manager ✅

▌ CHARACTERS
  Rishika — ALL pages. Turtle SVG on explain pages. Sprite on practice pages.
  Rekha: RETIRED. Never use this name again.

▌ ELEVENLABS TTS
  Proxy: /tts via functions/tts.js
  Voice: Priyanka, ID BpjGufoPiobT79j2vtj4
  Fallback: Browser TTS

▌ EXPLAIN PAGE FLOW
  initVoices → startLesson → showQ → startAnim → beginSteps → showConfirm
  explain-helper.js adds "I Don't Understand" → /api/explain-differently (OpenAI)

▌ PRACTICE PAGE FLOW
  15 questions, 5-streak unlocks exam
  Coins: +5 per correct first attempt

▌ CRITICAL RULES FOR CLAUDE
  1.  NEVER guess file contents — always read actual file first
  2.  NEVER deliver code without checking for errors
  3.  git add . from D:\rishi (NOT D:\rishi\public)
  4.  Always end every session: git add . → commit → push
  5.  Response style: extremely concise, no fluff
  6.  Smart apostrophes in JS = syntax crash. Use \' or &#39;
  7.  tts.js at repo ROOT functions\tts.js — NOT inside public\
  8.  Do things simply — never overcomplicate
  9.  rishi_admin_bypass in sessionStorage — never change this
  10. generate.py handles portal updates automatically
  11. NEVER ask Arindam to edit code manually — deliver complete files
  12. Build order: content JSON → run generate.py → git push
  13. data-handling folder uses hyphen (not underscore)
  14. Admin file is public/admin.html — NOT public/admin/admin.html
  15. OpenAI only — no Gemini anywhere in this project
  16. Python scripts for patching HTML are unreliable due to Windows line endings —
      always deliver complete files from scratch, never partial patches
*/
