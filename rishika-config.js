/*
═══════════════════════════════════════════════════════════════
  RISHIKA CONFIG — Paste this entire file at the start of
  every new Claude session to restore full project context.
  Last updated: 13 May 2026
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
  explain-differently.js → OpenAI gpt-4.1-mini
  generate-questions.js  → OpenAI gpt-4.1-mini
  NEVER use Gemini. NEVER guess model names.

▌ QUESTION BANK SYSTEM (built May 2026)
  Backend:  functions/api/generate-questions.js
            POST /api/generate-questions, Auth: Bearer RISHI_ADMIN_TOKEN
            Stores in Cloudflare KV (RISHI_QUESTIONS binding)
            KV key: {board}_{class}_ch{chId}_{tag} e.g. cbse_7_ch01_chapter_exam
  Tags:     chapter_exam / practice / topic_exam / sampurna / explain
  Sources:  NCT RDS RSA EXM CBP OLY ORI (admin-only metadata)
  Schema:   id, q, options[4], correct(0-indexed), explanation, source, tag,
            exam_exclusive, difficulty, verified, times_served, times_correct,
            times_wrong, rested, year_last_used
  questions.js: tries KV _exam then _chapter_exam; converts bank format → sections format
  Admin KV: admin.js — seed/seed_all/delete/list/get

▌ QUESTION BANKS (as of 13 May 2026)
  Class 7: all 8 chapters ✅ (chapter_exam, 15 Qs each)
  Class 8: PENDING — generate via admin Questions tab
  Class 9: all built chapters ✅ (chapter_exam, 15 Qs each)
  Class 6: not yet

▌ ADMIN PANEL
  URL:  rishi-ewh.pages.dev/admin  password: rishi2025
  File: public/admin.html ← ONLY correct path
  NEVER public/admin/admin.html — wasted full session on this mistake
  public/admin/ folder: question-manager.html only (old KV seeder)
  Tabs: Dashboard, Chapters, Topic Exams, Questions, Student, Logs, Deploy
  Global Class selector (6/7/8/9) drives ALL tabs
  Dashboard: Live Stats (registered/online/offline/revenue/referrals)
             Registered Students table — columns: Student ID | Parent ID | Phone |
             Explain | Practice | Chapter Exam | Topic Exam | Sampurna | Reference
             Each button opens as that student with bypass. Reference = placeholder.
  Topic Exams tab: per-class topics + Sampurna Pariksha card
  Sampurna URLs: Class7:/sampurna-pariksha.html?class=7
                 Class8:/sampurna-pariksha.html
                 Class9:/sampurna-pariksha.html?class=9

▌ BYPASS SYSTEM
  Key: rishi_admin_bypass — sessionStorage ONLY (never localStorage)
  admin openPage() / goStudent() / openAsStudent() append ?bypass=1 to URL
  rishi-core.js detects ?bypass=1 → sets sessionStorage on load
  Bypass in: rishiCheckPlan, rishiIsExplainDone, rishiIsPracticeDone,
             rishiIsChapExamDone, rishiIsTopicExamDone
  sampurna-pariksha.html: sessionStorage (was localStorage — fixed)
  sessionStorage does NOT persist across tabs — URL param is the bridge

▌ PARENT PORTAL
  URL:  rishi-ewh.pages.dev/parent
  File: public/parent.html (2700+ lines — always read before editing)
  Default password: rishi2025
  Login has: Forgot credentials + Change password (mobile number verification)
  Header: RISHI logo | Parent Portal | Student badge | Leaderboard | Guide |
          👤 Profile (gold button) | ☁ Sync (green) | Sign Out
  Mobile: hamburger ☰ replaces Leaderboard/Guide; shows dropdown menu
  Profile panel: parent ID, student ID, mobile, Reset Password,
                 Subscription History (placeholder), Referral (placeholder)
  Tabs: Study Plan | Performance | Analytics | Study Slots | Live Status
  ☁ Sync button: pushes all localStorage data to Cloudflare D1
  Cross-device sync: rishi_plans + rishi_plans_ added to rishi-sync.js
  ?tab= URL param: parent.html opens correct tab when linked from dashboard

▌ PARENT DASHBOARD
  URL:  rishi-ewh.pages.dev/parent-dashboard
  File: public/parent-dashboard.html
  Has nav strip below header: Study Plan|Performance|Analytics|Study Slots|Live Status
  ← Portal button returns to parent.html

▌ SYNC SYSTEM (rishi-sync.js)
  Syncs to Cloudflare D1 via /d1-sync endpoint
  SYNC_EXACT includes: rishi_active_chapters, rishi_plans, rishi_chapter_progress,
                       rishi_explain_sessions, rishi_practice_sessions, etc.
  SYNC_PREFIX includes: rishi_explain_done_, rishi_practice_done_,
                        rishi_chapexam_done_, rishi_plans_
  rishiSync.pushAll() — pushes all local data to D1 (call from device with data)
  rishiSync.pull()    — pulls student data from D1
  Active Study Plans blank fix: call pushAll() from Priyanka's phone after login

▌ PRICING
  Subscription: ₹599/month (updated from ₹299 in register.html + landing.html)

▌ LOGIN PAGES
  Student login (login.html): Username + Password, Forgot credentials,
                               Change password, Parent Login button,
                               Register / Home / Payment links at bottom
                               WAIT — Arindam removed bottom nav (students don't need it)
                               Current: Forgot credentials + Change password only
  Parent login (parent.html): Username + Password + Access Parent Portal button
                               Forgot credentials (mobile verify) + Change password

▌ SYLLABUS
  syllabus.html: shows Student ID + Parent ID + Class bar at top
  class-aware 6/7/8/9

▌ EXAM PAGES
  exam.html:           chapter exams — NO voice (never had it, not a regression)
  topic-exam.html:     class-aware 7/8/9 — TOPIC_MAP_CLASS7/8/9
                       URL: /topic-exam.html?topic=arithmetic&class=7
  sampurna-pariksha.html: class-aware 7/8/9 — ALL_CHAPTERS_CLASS7/8/9
                       URL: /sampurna-pariksha.html?class=7

▌ DATABASE FOLDER
  D:\rishi\database\schema.sql — D1 schema documentation
  Tables: student_data, registrations, payments, password_resets

▌ GENERATOR SYSTEM (generate.py)
  Location: D:\rishi\public\generate.py  ← PROTECTED, never delete
  Usage: cd D:\rishi\public && python generate.py data/classX/chapter-slug.json
  Updates syllabus.html, parent.html, admin.html automatically

▌ FILE TREE (as of 13 May 2026)
  D:\rishi\
  +---database\schema.sql
  +---functions\api\
  |       admin.js / questions.js / explain.js / explain-differently.js
  |       generate-questions.js / deploy.js / tts.js / d1-sync.js
  +---public\
  |   |   admin.html           MAIN ADMIN (/admin)
  |   |   exam.html / topic-exam.html / sampurna-pariksha.html
  |   |   login.html / register.html / landing.html / coming-soon.html
  |   |   parent.html / parent-dashboard.html
  |   |   rishi-core.js / rishi-presence.js / rishi-sync.js / rishi-diagram.js
  |   |   explain-helper.js / syllabus.html / generate.py (PROTECTED)
  |   +---admin\  question-manager.html
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

▌ PENDING WORK — PRIORITY ORDER
  [P0] Class 8 question bank — generate via admin Questions tab (15 Qs/chapter)
  [P0] Active Study Plans sync — Priyanka must tap ☁ Sync on her phone to push to D1
  [P1] Presence & Resume System (rishi-presence.js)
       Single injection all pages, localStorage, timing slots,
       online/offline, session resume, exam timer persistence
  [P2] YouTube video embed (one per chapter, Arindam picks URL, Claude wires)
  [P3] Practice pages verification
  [FUTURE] Class 6 — 10 chapters
  [FUTURE] ICSE / WBBSE

▌ PORTAL STATUS
  syllabus.html:          class-aware 6/7/8/9, shows student+parent IDs ✅
  parent.html:            mobile-responsive, profile panel, sync button ✅
  parent-dashboard.html:  nav strip added ✅
  admin.html:             class-aware, rich student table, live stats ✅
  topic-exam.html:        class-aware 7/8/9 ✅
  sampurna-pariksha.html: class-aware 7/8/9 ✅
  login.html:             parent login button, forgot/change password ✅
  register.html:          ₹599 pricing ✅
  landing.html:           ₹599 pricing ✅

▌ CHARACTERS
  Rishika — ALL pages. Turtle SVG on explain. Sprite on practice.
  Rekha: PERMANENTLY RETIRED. Never use this name.

▌ ELEVENLABS TTS
  Proxy: functions/tts.js (repo root, NOT inside public)
  Voice: Priyanka, ID BpjGufoPiobT79j2vtj4 / Fallback: Browser TTS

▌ CRITICAL RULES FOR CLAUDE
  1.  NEVER guess file contents — always read actual current file first
  2.  NEVER deliver code without checking for errors
  3.  git add . from D:\rishi (NOT D:\rishi\public)
  4.  Always end session: git add . → commit → push
  5.  Response style: extremely concise, no fluff
  6.  Smart apostrophes in JS = syntax crash. Use \' or &#39;
  7.  tts.js at repo ROOT functions\tts.js
  8.  Do things simply — never overcomplicate
  9.  rishi_admin_bypass → sessionStorage ONLY
  10. generate.py handles portal updates — NEVER delete it
  11. NEVER ask Arindam to edit code manually — deliver files
  12. data-handling folder uses hyphen not underscore
  13. Admin: public/admin.html ONLY — never public/admin/admin.html
  14. OpenAI only — Gemini dead
  15. NEVER partial patches — Python CRLF causes silent failures
  16. Always read the deployed file (ask Arindam to upload current version)
      NOT a previously uploaded/cached version
  17. Python scripts: ALWAYS use regex (re.sub) not exact string replace
      Exact strings fail on Windows CRLF and after previous patches
  18. parent.html is 2700+ lines — complex file, always read before touching
  19. Cloudflare serves /admin from public/admin.html flat file
  20. sessionStorage NOT shared across tabs — always pass ?bypass=1 in URL
  21. Price is ₹599 everywhere (not ₹299)
  22. Cleanup: run cleanup.py from D:\rishi to remove temp fix scripts
  23. database/schema.sql documents D1 table structure
*/
