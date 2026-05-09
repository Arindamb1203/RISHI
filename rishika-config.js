/*
═══════════════════════════════════════════════════════════════
  RISHIKA CONFIG — Paste this entire file at the start of
  every new Claude session to restore full project context.
  Last updated: 9 May 2026
  (Class 9 complete. Class 8 complete. Class 7 explain+practice
   complete. Class 7 exam JSONs ALL 8 BUILT & DEPLOYED.
   Gemini fully replaced by OpenAI gpt-4.1-mini.)
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
  OPENAI_API_KEY (gpt-4.1-mini — replaces Gemini for everything)
  RISHI_ADMIN_TOKEN
  D1 binding: DB (database: rishi-db)
  NOTE: GEMINI_API_KEY still in Cloudflare but being phased out.
        All new code uses OPENAI_API_KEY only.
        Remove GEMINI_API_KEY after full OpenAI migration is done.

▌ OPENAI API
  Model: gpt-4.1-mini
  Key: OPENAI_API_KEY (Cloudflare env var)
  Usage tier: 1 | Credit: $5.00 loaded
  Replaces Gemini for: explain AI, practice AI, question generation, everything
  GEMINI IS NO LONGER USED — do not write any new Gemini code

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
  CRITICAL: Section E uses key "cases" (not "questions") — match Class 9 format exactly
  Each question must have: source (ncert/ncert_exemplar/rd_sharma/olympiad/cbse_sample)
  Each section must have: count field
  Section D must have: answer_type field (fraction/integer/expression/decimal/text)

▌ EXAM KEY FORMAT
  Class 8: 01,02,...,17 (with 11a,11b)
  Class 9: c9-01 to c9-12
  Class 7: c7-01 to c7-08
  Class 6: c6-01 to c6-10 (reserved)

▌ FILE TREE (as of 9 May 2026)
  D:\rishi\
  +---functions\
  |   |   tts.js
  |   \---api\
  |           questions.js   CLASS 7 FOLDER MAP ADDED (deployed)
  |           admin.js / explain.js / explain-differently.js / deploy.js
  |           NOTE: explain.js and explain-differently.js still use Gemini
  |                 — to be migrated to OpenAI next session
  |
  +---public\
      |   admin.html          CLASS 7 EXAM PATHS ADDED & PATCHED (deployed)
      |   exam.html           CLASS 7 CHAPTER MAP ADDED (deployed)
      |   topic-exam.html     NEEDS REBUILD for Class 7
      |   sampurna-pariksha.html  NEEDS REBUILD for Class 7
      |   syllabus.html       CLASS 7 EXAM_PATHS FILLED (deployed)
      |   parent.html / login.html / register.html / landing.html
      |   rishi-core.js / rishi-presence.js / rishi-sync.js / explain-helper.js
      |   generate.py / batch_generate.py / batch_exam_generate.py
      |   rishi_cleanup.py    (cleanup + Class 8 exam file fixer — already run)
      |   fix_class7.py       (Class 7 exam placer + admin patcher — already run)
      |   class7_exam_data.json (Class 7 exam JSON bundle — keep)
      |
      +---data\
      |   +---class7\   8 content JSONs ALL VERIFIED
      |   +---class8\   16 practice QB JSONs
      |   +---class9\   12 content JSONs
      |   +---class6\   stubs only
      |   \---cbse\
      |       +---class8\  Exam JSONs — files now in correct chXX folders (fixed)
      |       +---class9\  Exam JSONs ch01-ch12 (complete, NCERT-sourced)
      |       \---class7\  Exam JSONs ch01-ch08 (BUILT — generic quality,
      |                    to be REBUILT with OpenAI question bank system)
      |
      +---explain\  class8 class9 class7 all built. class6 stubs.
      +---practice\ same.
      +---admin\
              question-manager.html  (existing agent — review before building new system)

▌ CLASS 9 — FULLY COMPLETE
  12 chapters: explain + practice + chapter exams + topic exams + sampurna
  Exam JSONs: NCERT/Exemplar sourced, have source field, correct structure

▌ CLASS 8 — FULLY COMPLETE
  16 chapters (ch06,ch07 deferred): explain + practice + chapter exams + topic exams + sampurna
  Exam JSONs: in correct chXX folders (fixed today)

▌ CLASS 7 — CURRENT STATUS
  Explain + Practice: ALL 8 CHAPTERS DONE ✓
  Chapter Exams: ALL 8 BUILT but GENERIC quality — need rebuild with OpenAI system
    ch01 Large Numbers Around Us       BUILT (generic)
    ch02 Arithmetic Expressions        BUILT (generic)
    ch03 A Peek Beyond the Point       BUILT (generic)
    ch04 Number Play                   BUILT (generic)
    ch05 Working with Fractions        BUILT (generic)
    ch06 Expressions using Letter-Numbers BUILT (generic)
    ch07 Parallel and Intersecting Lines  BUILT (generic)
    ch08 A Tale of Three Intersecting Lines BUILT (generic)
  Portal files: topic-exam.html + sampurna-pariksha.html need rebuild for Class 7
  admin.html: Class 7 exam paths patched ✓
  Checker: fix_class7.py — run after git push to verify all green

▌ CLASS 6 — NOT STARTED
  Chapters: Patterns in Mathematics, Number Play, Prime Time,
    Fractions, The Other Side of Zero, Lines and Angles,
    Playing with Constructions, Symmetry, Perimeter and Area,
    Data Handling and Presentation

▌ QUESTIONS.JS FOLDER MAP
  Class 8: topic-grouped
  Class 9: 1:1 mapping ch01-ch12
  Class 7: 1:1 mapping ch01-ch08 (deployed)
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

▌ RISHI THEME — ALWAYS LIGHT
  Background: #fdf6ec | Cards: #fffdf8 | Text: #2a2218
  Gold: #d4a017 | Fonts: Orbitron + Nunito
  NO DARK BACKGROUNDS EVER

▌ REMAINING WORK — IN ORDER
  1. Git push → run fix_class7.py checker → confirm all green (Class 7 wrap-up)
  2. Rebuild topic-exam.html + sampurna-pariksha.html for Class 7
  3. Check admin/question-manager.html — understand existing agent before building
  4. Migrate explain.js + explain-differently.js from Gemini → OpenAI
  5. Build OpenAI question bank system:
     - Questions sourced from NCERT, NCERT Exemplar, RD Sharma, Olympiad
     - Tagged: explain / practice / chapter_exam / topic_exam / sampurna
     - Each question has source field
  6. Build placeholder checker/creator py
  7. Build question distributor py
  8. Wire admin seeding → triggers OpenAI to refresh question bank
  9. Rebuild Class 7 exam JSONs using new system (replace generic ones)
  10. Class 6 — full build (explain + practice + exams)
  11. ICSE Class 8 / WBBSE Class 8
  12. Payment gateway (credit-referral in d1-sync.js)
  13. YouTube video embed (one per chapter)

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
  16. GEMINI IS DEAD — never write Gemini code. Use OpenAI gpt-4.1-mini only
  17. Exam JSON structure must match Class 9 format exactly:
      Section E key = "cases" (not "questions")
      Every question needs "source" field
      Every section needs "count" field
      Section D needs "answer_type" field
*/
