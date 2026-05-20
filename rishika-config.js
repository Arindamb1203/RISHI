/*
===============================================================
  RISHIKA CONFIG — Paste this entire file at the start of
  every new Claude session to restore full project context.
  Last updated: 19 May 2026 (ICSE build started — Class 7 generator ready)
===============================================================

| OWNER
  Arindam Bhowmik — non-technical, sole developer + owner
  All code written by Claude, deployed via git push from VS Code on Windows
  Student: Dabeet Bhowmik — ID: RISHI-DABEET-001
  Parent:  Priyanka — ID: PARENT-PRIYANKA-002, password: rishi2025
  git add . always from D:\rishi (NOT D:\rishi\public)

| REPO & HOSTING
  Repo:    github.com/Arindamb1203/RISHI
  Live:    rishi-ewh.pages.dev
  Host:    Cloudflare Pages — auto deploys on git push (~30s)
  Build output directory: public
  functions\ folder at repo ROOT — not inside public\

| STACK
  Pure HTML / CSS / Vanilla JS — no frameworks
  Cloudflare Pages Functions for API only

| AI — ALL OPENAI (Gemini fully dropped)
  Model: gpt-4.1-mini
  Key:   OPENAI_API_KEY (Cloudflare env var)
  explain-differently.js  OpenAI gpt-4.1-mini
  generate-questions.js   OpenAI gpt-4.1-mini
  NEVER use Gemini. NEVER guess model names.

| QUESTION BANK SYSTEM
  Backend:  functions/api/generate-questions.js
            POST /api/generate-questions, Auth: Bearer RISHI_ADMIN_TOKEN
            Stores in Cloudflare KV (RISHI_QUESTIONS binding)
            KV key: {board}_{class}_ch{chId}_{tag} e.g. cbse_7_ch01_chapter_exam
  questions.js: tries KV _exam then _chapter_exam; converts bank format to sections

| QUESTION BANKS (as of 15 May 2026)
  Class 7: all 8 chapters  (chapter_exam, 15 Qs each)
  Class 8: all 16 chapters  (chapter_exam, 15 Qs each) — generated 15 May
  Class 9: all built chapters  (chapter_exam, 15 Qs each)
  Class 6: DONE — all 10 keys verified via wrangler (cbse_6_ch01..ch10_chapter_exam)

| ADMIN PANEL
  URL:  rishi-ewh.pages.dev/admin  password: rishi2025
  File: public/admin.html — ONLY correct path. NEVER public/admin/admin.html
  Tabs: Dashboard | Topic Exams | Questions | Student | Logs | Deploy | Users
  NOTE: Chapters tab REMOVED 15 May — was reading admin localStorage not student data
  NOTE: Student/Logs/Deploy tab HTML divs were missing — FIXED 19 May (added static HTML)
  switchTab() is now null-safe and includes 'users'
  Global Class selector (6/7/8/9) drives ALL tabs
  Tab persistence: localStorage rishi_admin_tab — restored on refresh
  Dashboard: Live Stats + Registered Students table
             Ref button REMOVED from student table (19 May)
             All Open buttons append ?bypass=1 — pages unlock automatically
  Activity Log: colour-coded (amber=generating, green=success, red=error+Retry)
                Progress bar during Generate All shows X/total
  Topic Exams tab: all classes 6/7/8/9 wired with correct URLs
  Sampurna: Class6:/sampurna-pariksha.html?class=6
            Class7:/sampurna-pariksha.html?class=7
            Class8:/sampurna-pariksha.html
            Class9:/sampurna-pariksha.html?class=9

| ADMIN REF CODE SYSTEM (fully wired 19 May 2026)
  Code format: ARISHI-XXXX1234 (4 random uppercase chars + 4 digits)
  Generated in: admin.html Users tab → "Admin Ref Code" button
  Each generation: new unique code, previous active code auto-superseded
  On generation: stored in localStorage rishi_admin_ref_codes[] + synced to D1 rishi_admin_codes table
  Code fields: {code, created_at, used, superseded, used_by, used_at}
  D1 table: rishi_admin_codes (code PK, created_at, used, used_by, used_at)

  VALIDATION FLOW (d1-sync.js validate-referral):
    ARISHI- prefix → checks rishi_admin_codes table → returns {type:'admin', fullRecharge:true, discount:599}
    Other codes → checks rishi_referrals table → returns {type:'referral', discount:100}

  REDEMPTION FLOW:
    ARISHI- → UPDATE rishi_admin_codes SET used=1
    Other   → UPDATE rishi_referrals SET status='used'

  register.html:
    applyRefCode(): if type==='admin' → _regIsAdminCode=true, _regFinalAmount=0
    Shows "Admin Full Recharge — ₹599 waived" (₹0 payable)
    saveToLocalStorage(): adds school (alias of schoolName), referredBy, payments{YYYY-MM:'Admin'},
      subscriptionStatus:'subscribed' (if admin code), then calls redeem-referral

  payment.html confirmPayment():
    After payment confirmed: writes payments[YYYY-MM] = 'UPI'|'BT'|'CRCRD'|'Admin'|'UPI+R' etc.
    to rishi_registrations in localStorage, then syncs full registration to D1 via action:'register'
    Admin code among appliedCodes → mode = 'Admin'
    Non-admin referral code → appends '+R' to mode

  admin.html USERS tab:
    school field: reads r.school || r.schoolName (both field names handled)
    Month strip: Admin mode = red (#c0392b) box

  PAYMENT MODE CODES:
    UPI    = UPI payment, no referral
    BT     = Bank Transfer, no referral
    CRCRD  = Credit/Debit Card, no referral
    Admin  = Admin-granted free month
    UPI+R  = UPI + parent referral code used
    BT+R   = Bank Transfer + referral
    CRCRD+R = Card + referral
  New tab: 👥 Users — full registered user directory
  Two top buttons:
    "Admin Ref Code — ₹599 Full Recharge" → modal shows code ADMIN-RISHI599
      with Copy button. Used to give a parent a free full-month subscription.
    "Download Excel Report" → XLSX via SheetJS CDN (cdnjs.cloudflare.com)
      Multi-row per student (one row per paid month). Filename: RISHI-Users-YYYY-MM-DD.xlsx
  Table columns: Parent ID | Student ID | Number | Class | School | Board | Subscribed Months | Referred ↗
  Month Strip (Subscribed Months column):
    12 colored boxes — one per month, last 12 months ending current month
    Single letter label (J F M A M J J A S O N D)
    Colors: Green=#1a7a4a (UPI) | Blue=#2563eb (BT) | Purple=#7c3aed (CRCRD) | Grey=not paid
    ★ overlay on box = referral used (e.g. UPI+R, BT+R, CRCRD+R)
    Hover tooltip: "Mar 2026 — UPI+R"
  Referred ↗ column:
    Gold badge showing count — clickable → modal showing referred users
    Modal columns: Student ID | Parent ID | Number | Month Strip
    Zero referrals: grey "0" badge, not clickable
  Registration data model fields (full):
    studentName, studentUsername, parentName, parentUsername,
    primaryMobile, board, class, school (may be blank),
    subscriptionStatus, subscriptionExpiry, discontinuedDate, rejoinedDate,
    referredBy (parentUsername of referrer), _isTest,
    payments: { "YYYY-MM": "UPI" | "BT" | "CRCRD" | "UPI+R" | "BT+R" | "CRCRD+R" }

| BYPASS SYSTEM (fully fixed 15 May 2026)
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

| LOGIN SYSTEM (updated 18 May 2026)
  Single login page: /login.html — the ONLY login UI. Dark blue parent form GONE.
  login.html findAccount() lookup order:
    1. PARENT-xxx prefix check: username starting with "PARENT-" is accepted if
       password matches PARENT_PASS (rishi2025) or a stored pw_override.
       Handles manually-assigned IDs like PARENT-PRIYANKA-002.
       WHY NEEDED: Registration auto-generates parent usernames (e.g. priyanka12345),
       so PARENT-PRIYANKA-002 never appears in rishi_registrations.
       Real registered parents are NOT affected — their usernames never start with PARENT-.
    2. localStorage rishi_registrations loop — finds all registered students/parents
    3. D1 cloud lookup — cross-device (every registration auto-syncs to D1)
  parent.html: checkAuth() redirects to /login.html if not authenticated
  logout() also redirects to /login.html
  Password show/hide eye button on login.html password field (click to show/hide)
  PARENT_PASS = 'rishi2025' in login.html and register.html
  STUDENT_PASS = 'Study@Rishi1' (default, set on first login)

| PARENT DASHBOARD REFERRAL SYSTEM (built 19 May 2026)
  File: public/parent-dashboard.html
  Referral banner: "Refer a friend — both get ₹100 discount" (prominent/bold)
  Clicking banner opens referral form row-by-row:
    Fields: First Name of student, Last Name, WhatsApp number, Reference code (auto-generated)
  "Share" button sends WhatsApp message with link + code: "Use code to get ₹100 off"
  Each referral adds a new row (new unique code per referral)
  referredBy field written to registration when code used
  Admin USERS tab shows referral count per parent (clickable)
  Admin USERS tab Ref Code: ADMIN-RISHI599 → ₹599 full recharge (admin-only, no discount)


  URL:  rishi-ewh.pages.dev/parent
  File: public/parent.html (2700+ lines — always read before editing)
  Default password: rishi2025
  Tabs: Study Plan | Performance | Analytics | Study Slots | Live Status
  Sync button pushes localStorage to Cloudflare D1
  Fixed 18 May: JS SyntaxError on lines 1241+1319 (unescaped quotes in innerHTML strings)

| PARENT DASHBOARD
  URL: rishi-ewh.pages.dev/parent-dashboard
  File: public/parent-dashboard.html

| SYNC SYSTEM (rishi-sync.js + d1-sync.js)
  Syncs to Cloudflare D1 via /d1-sync endpoint
  register.html auto-calls /d1-sync action:'register' on every signup
  payment.html auto-calls /d1-sync action:'register' after payment confirms (with payments{} updated)
  d1-sync.js actions: set / get / register / find-account / find-by-mobile / save-pw /
                      store-referral / validate-referral / redeem-referral / store-admin-code
  rishi_accounts table: username, role, mobile, data(JSON), pw_override, updated_at
  rishi_referrals table: code, referrer_username, referee details, created_at, used_by, used_at, status
  rishi_admin_codes table: code, created_at, used(0/1), used_by, used_at

| PRICING
  Subscription: 599/month everywhere

| SYLLABUS
  syllabus.html: class-aware 6/7/8/9
  CRITICAL: does NOT include rishi-core.js — has own local done-check functions
            has bypass URL detection IIFE and bypass checks in all done functions

| EXAM PAGES
  exam.html:           chapter exams — NO voice
  topic-exam.html:     class-aware 6/7/8/9 — TOPIC_MAP_CLASS6/7/8/9
  sampurna-pariksha.html: class-aware 6/7/8/9 — ALL_CHAPTERS_CLASS6/7/8/9

| CLASS 6 CHAPTER MAP (NCERT Ganita Prakash 2025-26)
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

| CLASS 7 CHAPTER MAP (Ganita Prakash, NCERT 2025-26)
  Ch1 Large Numbers Around Us       arithmetic  exam:c7-01  KV:01
  Ch2 Arithmetic Expressions        arithmetic  exam:c7-02  KV:02
  Ch3 A Peek Beyond the Point       arithmetic  exam:c7-03  KV:03
  Ch4 Expressions using Letter-Nos  algebra     exam:c7-06  KV:04
  Ch5 Parallel and Intersecting Lines geometry  exam:c7-07  KV:05
  Ch6 Number Play                   arithmetic  exam:c7-04  KV:06
  Ch7 A Tale of Three Int. Lines    geometry    exam:c7-08  KV:07
  Ch8 Working with Fractions        arithmetic  exam:c7-05  KV:08

| DATABASE
  D:\rishi\database\schema.sql — D1 schema
  Tables: student_data, registrations, payments, password_resets
  rishi_accounts: username, role, mobile, data(JSON), pw_override, updated_at

| GENERATOR SYSTEM
  generate.py — PROTECTED. D:\rishi\public\generate.py — NEVER delete
  Usage: cd D:\rishi\public && python generate.py data/classX/chapter-slug.json

| PYTHON SCRIPTS IN public\
  generate.py              PROTECTED — per-chapter portal wiring
  build_class6.py          AI content generator for Class 6 (run + bug-fixed 19 May)
  build_icse_class7.py     AI content generator for ICSE Class 7 (ready, not run yet)
  fix_class6_bugs.py       Batch patcher for Class 6 bugs (reusable)
  update_class6_portals.py Class 6 portal wiring (already run)
  batch_generate.py / batch_exam_generate.py / check7.py / patch_admin7.py

| FILE TREE (as of 19 May 2026)
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
  |   +---explain\class6..9\  CBSE — all topic subfolders
  |   +---explain\icse\class7\ ICSE Class 7 — pending build
  |   +---practice\class6..9\ CBSE — all topic subfolders
  |   \---practice\icse\class7\ ICSE Class 7 — pending build

| CLASS STATUS (CBSE)
  Class 8 — 16 chapters  (Ch6 Squares, Ch7 Cubes deferred)
  Class 9 — 12 chapters
  Class 7 — 8 chapters
  Class 6 — 10 chapters  content + portals + KV banks all done
             Bug fix 19 May: CHAP_ID, goPractice/goExam links, SVGs — all 20 pages patched
             build_class6.py inject() fixed — all 4 bugs prevented in future builds
             fix_class6_bugs.py created for reuse

| CLASS STATUS (ICSE) — started 19 May 2026
  Class 7 — build_icse_class7.py ready (22 chapters, ~$0.62, ~51 min)
             Folder: explain/icse/class7/<topic>/<slug>.html
                     practice/icse/class7/<topic>/<slug>.html
             Topics: arithmetic(11) algebra(2) geometry(6) mensuration(1) data-handling(2)
             Next: run --chapter integers to test, then --all
  Class 6, 8, 9 — pending after Class 7 pilot

| RISHI-CORE.JS (updated 15 May 2026)
  Top of file: IIFE detects ?bypass=1 in URL sets sessionStorage immediately
  All bypass checks use sessionStorage('rishi_admin_bypass') === '1'

| RISHI-PRESENCE.JS (v2 — updated 15 May 2026)
  Fixed: bypass uses sessionStorage; heartbeat writes rishi_presence_online_<sid>
  New: Session resume for explain + practice pages (zero page changes needed)
       Saves window.idx on heartbeat/visibility/unload
       Shows "Continue from Q?" prompt on load (1.5s delay)
       Explain resume: window.idx = n; window.showQ()
       Practice resume: window.loadQ(n)
       Auto-clears on completion / 24hr TTL
  Unchanged: rishiSaveExamState / rishiGetExamResume / rishiClearExamResume

| PENDING WORK
  [DONE] Class 6 KV question banks — verified via wrangler, all 10 keys exist in KV
  [DONE] Active Study Plans sync — rishi_accounts has dabeet+priyanka, rishi_sync has 2 rows
  [DONE] Class 6 bug fix — CHAP_ID, goPractice/goExam links, SVGs patched 19 May
  [P2] YouTube video embed (one per chapter — Arindam picks URL, Claude wires)
  [P3] Practice pages verification (CBSE classes 7/8/9)
  [ICSE-NEXT] Run build_icse_class7.py --chapter integers → verify → --all → portal wiring
  [ICSE-FUTURE] Classes 6, 8, 9 after Class 7 pilot complete

| PORTAL STATUS
  index.html:             redirect to landing.html
  syllabus.html:          class-aware 6/7/8/9, bypass fully fixed
  parent.html:            mobile-responsive, sync, profile panel, syntax fixed 18 May
  parent-dashboard.html:  nav strip
  admin.html:             7 tabs (Dashboard/Topic Exams/Questions/Student/Logs/Deploy/Users),
                          bypass, coloured log, progress bar, USERS tab with month strip,
                          referral counts, Admin Ref Code, Excel export (19 May)
  topic-exam.html:        class-aware 6/7/8/9
  sampurna-pariksha.html: class-aware 6/7/8/9
  login.html:             single golden UI, show/hide password, PARENT-xxx fix (18 May)
  register.html / landing.html: current

| CHARACTERS
  Rishika — ALL pages. Turtle SVG on explain. Sprite on practice.
  Rekha: PERMANENTLY RETIRED. Never use.

| ELEVENLABS TTS
  Proxy: functions/tts.js (repo root)
  Voice: Priyanka, ID BpjGufoPiobT79j2vtj4 / Fallback: Browser TTS

| CRITICAL RULES FOR CLAUDE
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
  18. parent.html 2700+ lines — always read before editing
  19. sessionStorage NOT shared across tabs — always pass ?bypass=1 in URL
  20. Price is 599 everywhere
  21. syllabus.html has LOCAL done-check functions — bypass fix there is SEPARATE from rishi-core.js
  22. Admin Chapters tab REMOVED 15 May — never re-add
  23. Deliver files via present_files — never ask copy-paste
  24. PARENT-xxx usernames are manually assigned admin IDs handled by prefix check in
      findAccount() BEFORE the registration loop. Real registered parents have
      auto-generated usernames (firstname+mobile digits) — never PARENT- prefix.
  25. innerHTML strings in JS use single-quote delimiters — always escape inner single
      quotes as \' to avoid SyntaxError. Rule 6 applies inside JS strings too.
*/
