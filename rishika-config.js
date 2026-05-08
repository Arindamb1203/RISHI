/*
═══════════════════════════════════════════════════════════════
  RISHIKA CONFIG — Paste this entire file at the start of
  every new Claude session to restore full project context.
  Last updated: 8 May 2026
  (Class 9 complete. Class 7 explain+practice complete.
   Class 7 exam JSONs IN PROGRESS — ch01 started.)
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
  CRITICAL: git add . from D:\rishi (NOT D:\rishi\public)
            functions\ folder is at repo root, not inside public\

▌ STACK
  Pure HTML / CSS / Vanilla JS — no frameworks, no React
  No backend server — Cloudflare Pages Functions for API only

▌ CLOUDFLARE ENVIRONMENT VARIABLES
  ELEVENLABS_API_KEY / ELEVENLABS_VOICE_ID (Sarah EXAVITQu4vr4xnSDxMaL — free)
  GEMINI_API_KEY / RISHI_ADMIN_TOKEN
  D1 binding: DB (database: rishi-db)

▌ D1 DATABASE
  Tables: rishi_sync, rishi_accounts, rishi_referrals
  File: functions/d1-sync.js (REPO ROOT — not inside public\)
  Client: public/rishi-sync.js (localStorage interceptor)

▌ GENERATOR SYSTEM (generate.py)
  Location: D:\rishi\public\generate.py
  Usage: cd D:\rishi\public && python generate.py data/classX/chapter-slug.json
  Updates: explain page, practice page, syllabus.html, parent.html, admin.html

▌ EXAM JSON FORMAT
  Path: D:\rishi\public\data\cbse\classX\chXX\chXX-exam.json
  Schema: sections A(20x1) B(10x2) C(6x3) D(10x3) E(2 cases x 3 subparts)
  = 52 questions / 100 marks

▌ EXAM KEY FORMAT
  Class 8: 01,02,...,17 (with 11a,11b)
  Class 9: c9-01 to c9-12
  Class 7: c7-01 to c7-08
  Class 6: c6-01 to c6-10 (reserved)

▌ FILE TREE (as of 8 May 2026)
  D:\rishi\
  +---functions\
  |   |   tts.js
  |   \---api\
  |           questions.js   CLASS 7 FOLDER MAP ADDED (deployed)
  |           admin.js / explain.js / explain-differently.js / deploy.js
  |
  +---public\
      |   admin.html          CLASS 7 EXAM PATHS ADDED (ready to deploy after exams done)
      |   exam.html           CLASS 7 CHAPTER MAP ADDED (deployed)
      |   topic-exam.html     CLASS 7 TOPIC MAP ADDED (ready to deploy after exams done)
      |   sampurna-pariksha.html  CLASS 7 CHAPTERS ADDED (ready to deploy after exams done)
      |   syllabus.html       CLASS 7 EXAM_PATHS FILLED (deployed)
      |   parent.html / login.html / register.html / landing.html
      |   rishi-core.js / rishi-presence.js / rishi-sync.js / explain-helper.js
      |   generate.py / batch_generate.py / batch_exam_generate.py
      |
      +---data\
      |   +---class7\   8 content JSONs ALL VERIFIED
      |   +---class8\   16 practice QB JSONs
      |   +---class9\   12 content JSONs
      |   +---class6\   stubs only
      |   \---cbse\
      |       +---class8\  Exam JSONs ch01-ch17
      |       +---class9\  Exam JSONs ch01-ch12
      |       \---class7\  EXAM JSONs IN PROGRESS
      |
      +---explain\  class8 class9 class7 all built. class6 stubs.
      +---practice\ same.

▌ CLASS 9 — FULLY COMPLETE
  12 chapters: explain + practice + chapter exams + topic exams + sampurna

▌ CLASS 8 — FULLY COMPLETE
  16 chapters (ch06,ch07 deferred): explain + practice + chapter exams + topic exams + sampurna

▌ CLASS 7 — CURRENT STATUS
  Explain + Practice: ALL 8 CHAPTERS DONE
  Content JSON fixes:
    number-play.json: 6 confirm answers fixed
    a-peek-beyond-the-point.json: 9 confirm answers fixed
    large-numbers-around-us.json: all correct
    arithmetic-expressions.json: all correct
    working-with-fractions.json: written by Claude, verified
    expressions-using-letter-numbers.json: written by Claude, verified
    parallel-and-intersecting-lines.json: written by Claude, verified
    a-tale-of-three-intersecting-lines.json: written by Claude, verified

  Chapter Exams — IN PROGRESS:
    ch01 Large Numbers Around Us       STARTED (incomplete — resume first)
    ch02 Arithmetic Expressions        NOT STARTED
    ch03 A Peek Beyond the Point       NOT STARTED
    ch04 Number Play                   NOT STARTED
    ch05 Working with Fractions        NOT STARTED
    ch06 Expressions using Letter-Numbers NOT STARTED
    ch07 Parallel and Intersecting Lines  NOT STARTED
    ch08 A Tale of Three Intersecting Lines NOT STARTED

  Portal files ready in Claude outputs (deploy AFTER all 8 exams done):
    topic-exam.html / sampurna-pariksha.html / admin.html

▌ CLASS 7 CHAPTER MAP (Ganita Prakash, new NCERT 2025-26)
  Ch1 Large Numbers Around Us   (arithmetic)  c7-01
  Ch2 Arithmetic Expressions    (arithmetic)  c7-02
  Ch3 A Peek Beyond the Point   (arithmetic)  c7-03
  Ch4 Number Play               (arithmetic)  c7-04
  Ch5 Working with Fractions    (arithmetic)  c7-05
  Ch6 Expressions using Letter-Numbers (algebra) c7-06
  Ch7 Parallel and Intersecting Lines (geometry) c7-07
  Ch8 A Tale of Three Intersecting Lines (geometry) c7-08

▌ CLASS 7 TOPIC MAP
  arithmetic: 01,02,03,04,05
  algebra:    06
  geometry:   07,08

▌ CLASS 6 — NOT STARTED
  Chapters: Patterns in Mathematics, Number Play, Prime Time,
    Fractions, The Other Side of Zero, Lines and Angles,
    Playing with Constructions, Symmetry, Perimeter and Area,
    Data Handling and Presentation

▌ QUESTIONS.JS FOLDER MAP
  Class 8: topic-grouped
  Class 9: 1:1 mapping ch01-ch12
  Class 7: 1:1 mapping ch01-ch08 (added)
  API: GET /api/questions?board=cbse&class=7&ch=01&type=exam

▌ AUTH
  Student: {firstname}{class}{last3mobile} / Study@Rishi1
  Parent:  {firstname}{last5mobile} / Parent@Rishi1
  Fallback: parent / rishi2024
  Admin: rishi2025
  rishi_admin_bypass: sessionStorage ONLY

▌ ELEVENLABS TTS
  functions/tts.js at REPO ROOT
  Free voice: Sarah EXAVITQu4vr4xnSDxMaL
  DO NOT USE Priyanka BpjGufoPiobT79j2vtj4 (paid)

▌ GEMINI API
  Model: gemini-2.5-flash
  URL: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
  Key: GEMINI_API_KEY (Cloudflare env var)

▌ RISHI THEME — ALWAYS LIGHT
  Background: #fdf6ec | Cards: #fffdf8 | Text: #2a2218
  Gold: #d4a017 | Fonts: Orbitron + Nunito
  NO DARK BACKGROUNDS EVER

▌ REMAINING WORK — IN ORDER
  1. Class 7 chapter exams — 8 JSONs (IN PROGRESS)
  2. Deploy portal files (topic-exam, sampurna, admin) after exams done
  3. Class 7 topic exams + sampurna (automatic once portals deployed)
  4. Class 6 — full build (explain + practice + exams)
  5. ICSE Class 8 / WBBSE Class 8
  6. Payment gateway (credit-referral in d1-sync.js)
  7. YouTube video embed (one per chapter)

▌ CRITICAL RULES FOR CLAUDE
  1. NEVER guess file contents — always read actual file first
  2. NEVER deliver code without checking for errors
  3. git add . from D:\rishi (NOT D:\rishi\public)
  4. Always end session: git add . → commit → push
  5. Response: extremely concise, no fluff
  6. Smart apostrophes in JS = crash. Use \' or &#39;
  7. tts.js at REPO ROOT functions\tts.js
  8. Do things simply — never overcomplicate
  9. rishi_admin_bypass in sessionStorage ONLY
  10. NEVER ask Arindam to edit code manually
  11. data-handling folder: hyphen not underscore
  12. SVG canvas max-height 195px on explain pages
  13. All setTimeout via at() on explain pages
  14. initVoices(callback) before any say() call
  15. functions/d1-sync.js at REPO ROOT — not in public\
*/
