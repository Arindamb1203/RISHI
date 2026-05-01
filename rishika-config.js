/*
═══════════════════════════════════════════════════════════════
  RISHIKA CONFIG — Paste this entire file at the start of
  every new Claude session to restore full project context.
  Last updated: 1 May 2026 — evening
  (automated testing pipeline + admin deploy button)
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

▌ FILE TREE (actual repo as of 29 Apr 2026)
  D:\rishi\
  |
  +---.github\workflows\                 AUTOMATED TESTING PIPELINE (runs on every git push)
  |       test.yml                       Heartbeat — 4 key pages
  |       test-explain.yml              All 16 Class 8 explain pages
  |       test-practice.yml             All 16 Class 8 practice pages
  |       test-exam.yml                 exam.html, topic-exam.html, sampurna-pariksha.html
  |       test-admin.yml                admin.html, admin/question-manager.html
  |       test-parent.yml               parent.html, parent-dashboard.html
  |       test-landing.yml              landing.html, login.html, register.html, coming-soon.html
  |
  +---functions\                        ROOT level — NOT inside public
  |   |   tts.js                        ElevenLabs TTS proxy
  |   \---api\
  |           admin.js                  POST seed/delete/list KV — ALL 17 chapters
  |           questions.js              GET exam questions (KV then static fallback)
  |           explain.js                POST Gemini Flash proxy for wrong-answer explanations
  |           explain-differently.js    POST Gemini re-explanation (I Don't Understand button)
  |                                     maxOutputTokens: 200, prompt ~50 tokens (fits 250 TPM free tier)
  |           deploy.js                 POST proxy → Cloudflare Pages deploy hook
  |                                     Called by admin Deploy tab button (/api/deploy)
  |
  +---public\
  |   |   admin.html                    Admin panel — warm cream theme, 7 tabs:
  |   |                                   Dashboard / Chapters / Topic Exams /
  |   |                                   Questions (KV seed) / Student / Logs / Deploy
  |   |                                   Deploy tab: one-click deploy to rishi-ewh.pages.dev
  |   |                                     via Cloudflare Pages deploy hook (proxied through /api/deploy)
  |   |                                   Deploy tab: "View Test Results on GitHub" link
  |   |                                   Students: search, subscription edit (class+board+status)
  |   |                                   Edit modal: white background, Class 6/7/8/9 + Board dropdown
  |   |   exam.html                     Universal exam page (?ch=01 to ?ch=17)
  |   |                                   exam timer saved every 10s, auto-resumes
  |   |   topic-exam.html               Universal topic exam (?topic=algebra etc)
  |   |   sampurna-pariksha.html        Grand final exam — all 17 chapters
  |   |   login.html                    first-login password setup screen
  |   |   parent.html                   5 tabs + Live Status + Study Slots +
  |   |                                   redesigned guide page (warm, animated slabs)
  |   |                                   leaderboard button
  |   |                                   CLASS-AWARE: reads student class from registrations
  |   |                                   renderProgress() function added (was missing — caused delete bug)
  |   |   parent-dashboard.html         Analytics dashboard (separate page — legacy)
  |   |                                   CLASS-AWARE: reads student class from registrations
  |   |   register.html                 mobile-based unique IDs, firstLogin flags,
  |   |                                   30-day auto trial, no default password
  |   |   rishi-core.js                 Shared functions — include on EVERY student page
  |   |                                   rishi_admin_bypass uses sessionStorage (NOT localStorage)
  |   |                                   CRITICAL: fixes bypass leak to student sessions
  |   |   rishi-presence.js             timing slots, heartbeat, exam resume,
  |   |                                   expiry warnings — injected into all pages
  |   |   rishi-diagram.js              SVG diagram renderer (18 shape types)
  |   |   rishi-sync.js                 Cross-page sync utilities
  |   |   explain-helper.js             "I Don't Understand" button — Gemini re-explain
  |   |                                   calls /api/explain-differently
  |   |   syllabus.html                 CLASS-AWARE for Classes 6, 7, 8, 9
  |   |                                   ALL_CLASS_DATA object with TOPICS/CHAPTERS per class
  |   |                                   loadClassData(classNum) called at init
  |   |                                   "Rishika is by your side today!" (not Rekha)
  |   |   manifest.json
  |   |   sw.js
  |   |   favicon.svg
  |   |   landing.html
  |   |   coming-soon.html
  |   |   inject-meta.py               DONE — injected rishi-board/class meta to all Class 8 pages
  |   |   setup-classes.py             DONE — created Class 6/7/9 folder shells
  |   |   (cleanup.py removed all .bak and patch scripts)
  |   |
  |   +---admin\
  |   |       question-manager.html     OLD — now integrated into admin.html Questions tab
  |   |
  |   +---data\
  |   |   +---class8\                   Practice question JSON banks (flat folder, 16 files)
  |   |   +---class9\                   Practice question JSON banks
  |   |   |       real-numbers.json     ✅ BUILT — 15 questions, all 6 sources
  |   |   |       polynomials.json      stub (empty)
  |   |   |       linear-equations-two-variables.json  stub
  |   |   |       coordinate-geometry.json  stub
  |   |   |       euclids-geometry.json     stub
  |   |   |       lines-and-angles.json     stub
  |   |   |       triangles.json            stub
  |   |   |       quadrilaterals.json       stub
  |   |   |       circles.json              stub
  |   |   |       herons-formula.json       stub
  |   |   |       surface-areas-volumes.json stub
  |   |   |       statistics.json           stub
  |   |   +---class7\                   Practice question JSON banks (all stubs)
  |   |   +---class6\                   Practice question JSON banks (all stubs)
  |   |   \---cbse\class8\              Exam JSON banks — grouped by topic folder
  |   |       +---ch01\ +---ch02\ +---ch03\ +---ch05\ +---ch11\ +---ch15\ +---ch16\ +---ch17\
  |   |
  |   +---explain\
  |   |   +---class8\                   16 pages — all built, meta-tagged, verified
  |   |   |   +---algebra\             (linear-equations, algebraic-expressions, factorisation, introduction-to-graphs)
  |   |   |   +---arithmetic\          (rational-numbers, comparing-quantities, powers-exponents, direct-inverse-proportions, playing-with-numbers)
  |   |   |   +---data-handling\       (frequency-distribution, chance-probability)
  |   |   |   +---geometry\            (understanding-quadrilaterals, practical-geometry, visualising-solid-shapes)
  |   |   |   \---mensuration\         (area-plane-figures, surface-area-volume)
  |   |   +---class9\
  |   |   |   +---arithmetic\          real-numbers.html ✅ BUILT & VERIFIED
  |   |   |   +---algebra\             polynomials.html (stub), linear-equations-two-variables.html (stub)
  |   |   |   +---coordinate-geometry\ coordinate-geometry.html (stub)
  |   |   |   +---geometry\            euclids-geometry.html, lines-and-angles.html, triangles.html,
  |   |   |   |                        quadrilaterals.html, circles.html (all stubs)
  |   |   |   \---mensuration\         herons-formula.html, surface-areas-volumes.html (stubs)
  |   |   +---class7\                  (all stubs — 8 chapters)
  |   |   \---class6\                  (all stubs — 10 chapters)
  |   |
  |   +---practice\
  |   |   +---class8\                  16 pages — all built and verified
  |   |   +---class9\
  |   |   |   +---arithmetic\          real-numbers.html ✅ BUILT & VERIFIED
  |   |   |   +---algebra\             stubs
  |   |   |   +---coordinate-geometry\ stub
  |   |   |   +---geometry\            stubs
  |   |   |   \---mensuration\         stubs
  |   |   +---class7\                  (all stubs)
  |   |   \---class6\                  (all stubs)
  |   |
  |   +---images\rishika\sprites\
  |   |       celebrate.jpeg
  |   |       disappointed-s1.jpeg
  |   |       disappointed-s2.png
  |   |       neutral-talking.png
  |   |       praise.jpeg
  |   |
  |   \---icons\
  |           icon-192.png
  |           icon-512.png

▌ MULTI-CLASS ARCHITECTURE (locked 29 Apr 2026)
  FOLDER STRUCTURE (locked — do not change):
    explain/classX/topic/chapter.html
    practice/classX/topic/chapter.html
    data/classX/chapter.json
    data/cbse/class8/chXX/ (exam JSONs — unchanged)

  META TAGS on every explain/practice HTML:
    <meta name="rishi-board" content="cbse">
    <meta name="rishi-class" content="8"> (or 9, 7, 6)

  ADMIN BYPASS: now uses sessionStorage (not localStorage)
    Fixes: bypass no longer leaks to student sessions after admin visit

  CHAPTER BUILD STATUS:
    Class 8: ALL 16 chapters complete (explain + practice + exam JSONs)
             Squares+Sq Roots (ch06) and Cubes+Cube Roots (ch07) — deferred
    Class 9: Real Numbers ✅ complete (explain + practice + question bank)
             All other 11 chapters — stubs only
    Class 7: All stubs
    Class 6: All stubs

▌ CLASS 9 CHAPTER MAP
  Arithmetic:        Real Numbers (ch1) ✅
  Algebra:           Polynomials (ch2), Linear Equations in Two Vars (ch3)
  Coord. Geometry:   Coordinate Geometry (ch4)
  Geometry:          Euclid's Geometry (ch5), Lines & Angles (ch6), Triangles (ch7),
                     Quadrilaterals (ch8), Circles (ch9)
  Mensuration:       Heron's Formula (ch10), Surface Areas & Volumes (ch11)
  Data Handling:     Statistics (ch12)

▌ CLASS 7 CHAPTER MAP (new NCERT 2025-26, Ganita Prakash)
  Arithmetic: Large Numbers Around Us, Arithmetic Expressions,
              A Peek Beyond the Point, Number Play, Working with Fractions
  Algebra:    Expressions using Letter-Numbers
  Geometry:   Parallel and Intersecting Lines, A Tale of Three Intersecting Lines

▌ CLASS 6 CHAPTER MAP (new NCERT 2025-26)
  Arithmetic:   Patterns in Mathematics, Number Play, Prime Time,
                Fractions, The Other Side of Zero
  Geometry:     Lines and Angles, Playing with Constructions, Symmetry
  Mensuration:  Perimeter and Area
  Data Handling: Data Handling and Presentation

▌ SYLLABUS.HTML — CLASS-AWARE DATA
  ALL_CLASS_DATA object contains TOPICS, CHAPTERS, CH_COLORS,
  PRACTICE_PATHS, EXAM_PATHS, EXAM_DONE_KEYS for classes 6, 7, 8, 9
  loadClassData(classNum) called in window.onload after reading st.class
  To mark a chapter live: set built:true in the relevant class's CHAPTERS object

▌ CHARACTERS
  Rishika — ALL pages (explain + practice). Turtle SVG bottom-left.
             "Rishika is by your side today!" — Rekha is RETIRED
  No avatar on exam.html or topic-exam.html (by design)

▌ USER ID SYSTEM
  Student ID: {firstname}{class}{last3ofmobile}  e.g. dabeet8171
  Parent ID:  {firstname}{last5ofmobile}          e.g. priyanka47522
  Password:   Set by user on FIRST LOGIN
  Trial: 30 days auto from registration date
  Subscription fields: subscriptionStatus / subscriptionExpiry / discontinuedDate / rejoinedDate

▌ ADMIN BYPASS SYSTEM
  rishi_admin_bypass=1 in sessionStorage → skips ALL gates (clears on tab close)
  goStudent(idx) sets bypass + calls loadAdminClassData(class) before opening syllabus
  syllabus.html getPlanActive() → returns '__all__' if bypass=1

▌ ADMIN EDIT MODAL
  Shows: Status, Expiry Date, Discontinued Date, Rejoined Date, Class, Board
  Class options: 6, 7, 8 (default), 9
  Board options: CBSE (default), ICSE, WBBSE
  White background (fixes gold-on-gold readability bug)

▌ ELEVENLABS TTS
  Proxy:    /tts (POST) via functions/tts.js at repo root
  Voice ID: 21m00Tcm4TlvDq8ikWAM (Rachel — free voice)
  Fallback: Browser TTS (sayBrowser) if ElevenLabs fails or returns error

▌ GEMINI API
  explain-differently.js: re-explains when student presses "I Don't Understand"
    Endpoint: /api/explain-differently (POST)
    maxOutputTokens: 200 (reduced from 700 to fit 250 TPM free tier)
    Prompt: ~50 tokens (reduced from ~120)
    Cycles through 4 methods: story, worked example, analogy, pattern-based
    Sends last 2 steps only (not full history) to reduce token count
  explain.js: wrong-answer explanation in topic exam
    Model: gemini-2.5-flash
    URL:   https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
    Cloudflare env var: GEMINI_API_KEY (Plaintext, set ✅)

▌ EXPLAIN PAGE FLOW (all explain pages)
  1. Page loads → initVoices(function(){startLesson();})
  2. startLesson() → say(introText, proceed) + setTimeout(proceed, 8000) safety
  3. proceed() → setTimeout(showQ, 600)
  4. showQ() → builds question card → setTimeout(startAnim, 800)
  5. startAnim() → plays SVG animation → setTimeout(beginSteps, 600)
  6. beginSteps() → creates step card → setTimeout(nextStep, 350)
  7. nextStep() → shows steps one by one → showConfirm()
  8. showConfirm() → student types answer (no chips — explain-helper removes them)
  explain-helper.js: adds "I Don't Understand" button alongside "I Understand!"
    Calls /api/explain-differently with concept + chapter + last 2 steps

▌ PRACTICE PAGE FLOW
  CHAP_ID = chapter number (1-based per class)
  15 questions per session
  5 correct streak → unlocks exam (rishiMarkPracticeDone)
  Wrong answer → steps + Rishika's Trick + "Is it clear?" Yes/No + Try Again
  Coins: +5 per correct on first attempt
  Rishika avatar: sprite-based canvas animation (celebrate/praise/disappointed/talking)
  Links to /rishi-core.js externally (Class 9 pages — not inlined)
  IMPORTANT: Class 8 practice pages have rishi-core.js INLINED (legacy)
             Class 9+ practice pages link to /rishi-core.js externally

▌ QUESTION BANK SOURCES (locked for all classes/boards)
  1. NCERT Exercises
  2. NCERT Exemplar
  3. RD Sharma
  4. RS Aggarwal
  5. CBSE Past Papers (last 10 years)
  6. Olympiad (IMO, MOF, ISMO)
  7. CBSE Sample Papers (last 2 years)

▌ RISHI-CORE.JS KEY FUNCTIONS
  rishiCheckPlan(chId)             — gate: redirects if not in plan
  rishiMarkExplainDone(chId)       — marks explain complete
  rishiMarkPracticeDone(chId)      — marks practice complete
  rishiIsExplainDone(chId)         — read explain status
  rishiIsPracticeDone(chId)        — read practice status
  rishiMarkChapExamDone(chIdStr)   — marks exam done
  rishiExamAttemptCount(chIdStr)   — returns attempt count
  rishiSaveExamScore(chIdStr, n)   — saves high score
  rishiGetExamHighScore(chIdStr)   — returns stored high score
  rishiAddCoins(n) / rishiGetCoins()
  rishiLogBreak(type, secs)
  rishiMarkTopicExamDone(topic) / rishiIsTopicExamDone(topic)
  rishiSaveTopicExamScore / rishiTopicExamAttemptCount
  rishiTopicExamCoins(pct, prevPct, attemptNum)
  Idle break detector: 5 min idle → overlay with timer

▌ TOPIC EXAM SYSTEM
  Universal page: /topic-exam.html?topic=algebra
  32 questions / 60 marks / 45 minutes / no avatar
  Gate: all chapter exams in topic must be done (or admin bypass)
  Grades: Topic Master(≥90%) / Topic Star(≥75%) / Topic Pass(≥60%) / Try Again(<60%)

▌ CLASS 8 EXAM SYSTEM
  Universal page: /exam.html?ch=01 (zero-padded, 11a/11b for mensuration)
  52 questions / 100 marks / 90 minutes
  Section A: 20 MCQ×1 | B: 10 MCQ×2 | C: 6 MCQ×3 | D: 10 direct×3 | E: 6 case×2
  Exam timer auto-saved every 10s → auto-resumes on re-entry (4hr TTL)

▌ PARENT PORTAL (parent.html)
  5 tabs: Study Plan / Performance / Analytics / Study Slots / Live Status
  CLASS-AWARE: loads correct chapter list based on student's registered class
  CHAPTERS loaded via loadParentClassData() in initMainPortal()
  renderProgress() exists (fixed missing function bug that cleared study plans)
  Study plan lock: saves to rishi_active_chapters + rishi_active_chapters_{studentId}
  Live Status: polls localStorage every 10s

▌ LOCALSTORAGE KEYS
  rishi_explain_done_{chId}           → "1"
  rishi_practice_done_{chId}          → "1"
  rishi_chapexam_done_{chIdStr}       → "1"
  rishi_exam_score_{chIdStr}          → score number
  rishi_exam_attempts_{chIdStr}       → attempt count
  rishi_topicexam_done_{topic}        → "1"
  rishi_topicexam_score_{topic}       → score out of 60
  rishi_topicexam_attempts_{topic}    → attempt count
  rishi_coins                         → running total
  rishi_break_log                     → JSON array of breaks
  rishi_active_chapters               → JSON {chId: {startDate, targetDate}}
  rishi_active_chapters_{studentId}   → per-student version
  rishi_current_student               → JSON {studentName, class, board, studentId}
  rishi_registrations                 → JSON array of registration objects
  rishi_slots                         → JSON [{start:"09:00",end:"12:00"}]
  rishi_presence_online/offline/page/log
  rishi_exam_resume_{chIdStr}         → JSON {timerSecs, currentIdx, ts}
  rishi_expiry_warned                 → ISO date string

▌ SESSIONSTORAGE KEYS
  rishi_admin_bypass                  → "1" (clears on tab close — fixes bypass leak)
  rishi_parent_auth                   → "1"
  rishi_parent_student_id             → student username
  rishi_parent_student_name           → student display name
  rishi_instr_seen                    → "1"
  rishi_syllabus_topic                → last active topic id

▌ REMAINING WORK — PRIORITY ORDER (29 Apr 2026)

  [CURRENT — IN PROGRESS]
  Class 9 content — chapter by chapter:
    ✅ Ch1: Real Numbers (explain + practice + QB)
    ⬜ Ch2: Polynomials (next)
    ⬜ Ch3: Linear Equations in Two Variables
    ⬜ Ch4: Coordinate Geometry
    ⬜ Ch5: Euclid's Geometry
    ⬜ Ch6: Lines and Angles
    ⬜ Ch7: Triangles
    ⬜ Ch8: Quadrilaterals
    ⬜ Ch9: Circles
    ⬜ Ch10: Heron's Formula
    ⬜ Ch11: Surface Areas and Volumes
    ⬜ Ch12: Statistics
  After Class 9 complete → Class 7 → Class 6
  After CBSE complete → ICSE Class 8 → WBBSE Class 8

  [AFTER CURRENT]
  Class 8 namespace conflict:
    Class 8 and Class 9 both use chId=1 for their first chapter
    localStorage keys overlap (rishi_explain_done_1 etc.)
    Safe because students are single-class — but needs proper namespacing later
    Fix when time allows: prefix keys with class e.g. rishi_c9_explain_done_1

  [P2]
  YouTube video embed — 1 video per chapter, "▶ Watch Video" button on explain pages

  [P4]
  Vedic Maths / Calculation Shortcuts mini-module

  [P6]
  Ch06 Squares & Square Roots + Ch07 Cubes & Cube Roots (Class 8)

  [P7]
  Leaderboard cross-device — needs D1 cloud sync

▌ CRITICAL RULES FOR CLAUDE
  1. NEVER guess at file contents — always read actual file first
  2. NEVER deliver code without checking for probable errors
  3. git add . from D:\rishi (NOT D:\rishi\public) — functions\ is at repo root
  4. Always end every session: git add . → git commit → git push
  5. Python available on Windows machine
  6. Response style: extremely concise, no fluff
  7. Smart apostrophes (') in JS single-quoted strings = syntax crash. Use \' or &#39;
  8. tts.js lives at repo ROOT functions\tts.js — NOT inside public\
  9. Do things the simple, straight way — never overcomplicate
  10. rishi_admin_bypass is in sessionStorage (not localStorage) — do not change this
  11. When marking a chapter as built: set built:true in syllabus.html ALL_CLASS_DATA
      and deliver the full corrected syllabus.html — never ask Arindam to edit code
  12. NEVER ask Arindam to edit any code manually — always deliver complete files
  13. Build order per chapter: Question Bank JSON → Explain HTML → Practice HTML → mark built:true in syllabus
  14. Cloudflare Pages deploy hook URL stored in functions/api/deploy.js (do not expose in frontend)
      Hook ID: 1ab15965-e25b-4d76-9f2d-1693fb1abdd5
*/
