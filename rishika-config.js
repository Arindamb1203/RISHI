/*
═══════════════════════════════════════════════════════════════
  RISHIKA CONFIG — Paste this entire file at the start of
  every new Claude session to restore full project context.
  Last updated: 25 April 2026 — evening (KV seeded, exam system live)
═══════════════════════════════════════════════════════════════

▌ OWNER
  Arindam Bhowmik — non-technical, sole developer + owner
  All code written by Claude, deployed via git push from VS Code on Windows
  Student testing: Dabeet (student), Priyanka (parent)

▌ REPO & HOSTING
  Repo:    github.com/Arindamb1203/RISHI
  Live:    rishi-ewh.pages.dev
  Host:    Cloudflare Pages (free, unlimited bandwidth)
  Deploy:  git push to main → auto deploys (~30 seconds)
  Build output directory: public

▌ STACK
  Pure HTML / CSS / Vanilla JS — no frameworks, no React
  Works on low-end devices and budget Android phones
  No backend server — Cloudflare Pages Functions for API only

▌ FILE TREE (actual repo as of 25 Apr 2026)
  D:\rishi\
  |
  +---functions\                        ROOT level — NOT inside public
  |   |   tts.js                        ElevenLabs TTS proxy
  |   \---api\
  |           admin.js                  POST seed/delete/list KV
  |           questions.js              GET exam questions (KV then static fallback)
  |
  +---public\
  |   |   admin.html                    Admin panel (password gated)
  |   |   exam.html                     Universal exam page (?ch=01 to ?ch=17)
  |   |   login.html
  |   |   parent.html
  |   |   parent-dashboard.html
  |   |   register.html
  |   |   rishi-core.js                 Shared functions — include on EVERY page
  |   |   rishi-diagram.js              SVG diagram renderer (18 shape types)
  |   |   rishi-sync.js                 Cross-page sync utilities
  |   |   syllabus.html                 Student hub (topic rail + chapter cards)
  |   |   manifest.json
  |   |   sw.js
  |   |   favicon.svg
  |   |   landing.html
  |   |   coming-soon.html
  |   |
  |   +---admin\
  |   |       question-manager.html     Full KV admin/seed panel
  |   |
  |   +---data\
  |   |   +---class8\                   Practice question JSON banks (flat folder)
  |   |   |       algebraic-expressions-identities.json
  |   |   |       area-plane-figures.json
  |   |   |       chance-probability.json
  |   |   |       comparing-quantities.json
  |   |   |       direct-inverse-proportions.json
  |   |   |       factorisation.json
  |   |   |       frequency-distribution.json
  |   |   |       introduction-to-graphs.json
  |   |   |       linear-equations.json
  |   |   |       playing-with-numbers.json
  |   |   |       powers-exponents.json
  |   |   |       practical-geometry.json
  |   |   |       rational-numbers.json
  |   |   |       surface-area-volume.json
  |   |   |       understanding-quadrilaterals.json
  |   |   |       visualising-solid-shapes.json
  |   |   |
  |   |   \---cbse\class8\              Exam JSON banks — grouped by topic folder
  |   |       +---ch01\                 Arithmetic group
  |   |       |       ch01-exam.json    Rational Numbers
  |   |       |       ch08-exam.json    Comparing Quantities
  |   |       |       ch12-exam.json    Exponents and Powers
  |   |       |       ch13-exam.json    Direct & Inverse Proportions
  |   |       +---ch02\                 Algebra group
  |   |       |       ch02-exam.json    Linear Equations
  |   |       |       ch09-exam.json    Algebraic Expressions
  |   |       |       ch14-exam.json    Factorisation
  |   |       +---ch03\                 Geometry group
  |   |       |       ch03-exam.json    Understanding Quadrilaterals
  |   |       |       ch04-exam.json    Practical Geometry
  |   |       |       ch10-exam.json    Visualising Solid Shapes
  |   |       +---ch05\                 Data Handling group
  |   |       |       ch05-exam.json    Frequency Distribution
  |   |       +---ch11\                 Mensuration group
  |   |       |       ch11a-exam.json   Area of Plane Figures
  |   |       |       ch11b-exam.json   Surface Area & Volume
  |   |       +---ch15\
  |   |       |       ch15-exam.json    Introduction to Graphs
  |   |       \---ch16\
  |   |               ch16-exam.json    Playing with Numbers
  |   |
  |   +---explain\class8\
  |   |   +---algebra\
  |   |   |       linear-equations.html
  |   |   |       algebraic-expressions-identities.html
  |   |   |       factorisation.html
  |   |   |       introduction-to-graphs.html
  |   |   +---arithmetic\
  |   |   |       rational-numbers.html
  |   |   |       comparing-quantities.html
  |   |   |       powers-exponents.html
  |   |   |       direct-inverse-proportions.html
  |   |   |       playing-with-numbers.html
  |   |   +---data-handling\
  |   |   |       frequency-distribution.html
  |   |   |       chance-probability.html
  |   |   +---geometry\
  |   |   |       understanding-quadrilaterals.html
  |   |   |       practical-geometry.html
  |   |   |       visualising-solid-shapes.html
  |   |   \---mensuration\
  |   |           area-plane-figures.html
  |   |           surface-area-volume.html
  |   |
  |   +---practice\class8\             Same subfolder structure as explain\
  |   |   +---algebra\                 (4 files)
  |   |   +---arithmetic\              (5 files)
  |   |   +---data-handling\           (2 files)
  |   |   +---geometry\                (3 files)
  |   |   \---mensuration\             (2 files)
  |   |
  |   +---images\rishika\sprites\
  |   |       celebrate.jpeg
  |   |       disappointed-s1.jpeg
  |   |       disappointed-s2.png
  |   |       neutral-talking.png
  |   |       praise.jpeg
  |   |
  |   +---icons\
  |   |       icon-192.png
  |   |       icon-512.png
  |   |
  |   \---functions\
  |           tts.js                   STALE DUPLICATE — delete this file

▌ CHARACTERS
  Rekha the Turtle  — explain pages. Sprite-sheet animation (PNG canvas).
  Rishika           — practice + exam pages. FaceTime-style UI. Sprite-sheet canvas.
  Rishika states: talking (loops), praise (correct), celebrate (high score),
                  disappointed (wrong)

▌ ELEVENLABS TTS
  Proxy:    /tts (POST) via functions/tts.js at repo root
  Voice ID: 21m00Tcm4TlvDq8ikWAM (Rachel — free voice)
            Priyanka BpjGufoPiobT79j2vtj4 = paid voice — DO NOT USE on free plan
  Fallback: Browser TTS (sayBrowser) if ElevenLabs fails
  Cloudflare env vars: ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID (both Plaintext)

▌ EXPLAIN PAGE FLOW (all 16 pages — fixed Apr 24)
  1. Page loads → initVoices(function(){startLesson();})
  2. startLesson() → say(introText, proceed) + setTimeout(proceed, 8000) safety
  3. proceed() → setTimeout(showQ, 600)
  4. showQ() → builds question card → setTimeout(startAnim, 800)
  5. startAnim() → plays turtle animation → setTimeout(beginSteps, 600)
  6. beginSteps() → creates step card → setTimeout(nextStep, 350)
  7. nextStep() → say(s.s, function(){ setTimeout(nextStep, 400) })
  8. After all steps → showConfirm() → student types answer

▌ EXPLAIN PAGE KEY PATTERNS
  var elAudio = null  (declared at top of each page)
  initVoices(cb) → picks browser voice, calls cb when ready
  say(text, onEnd) → tries ElevenLabs /tts first, falls back to sayBrowser
  rStartTalk(len) / rStopTalk() → Rekha turtle talking animation
  getAnimPlay(animId) → returns function that plays SVG animation
  rishiCheckPlan(chId) → redirects if chapter not in parent plan
  rishiMarkExplainDone(chId) → called on completion
  Bypass: rishi_admin_bypass=1 in localStorage skips all gates

▌ RISHI-CORE.JS KEY FUNCTIONS
  rishiCheckPlan(chId)             — gate: redirects if not in plan
  rishiMarkExplainDone(chId)       — marks explain complete
  rishiMarkPracticeDone(chId)      — marks practice complete
  rishiIsExplainDone(chId)         — read explain status
  rishiIsPracticeDone(chId)        — read practice status
  rishiMarkChapExamDone(chIdStr)   — marks exam done, increments attempt counter
  rishiExamAttemptCount(chIdStr)   — returns attempt count
  rishiSaveExamScore(chIdStr, n)   — saves high score, returns previous high
  rishiGetExamHighScore(chIdStr)   — returns stored high score
  rishiAddCoins(n)                 — adds coins, returns new total
  rishiGetCoins()                  — returns current coin total
  rishiExamCoins(score, prevHigh, attemptNum, sectionAAllCorrect, zeroWrong)
                                   — returns {base, bonus, total, badge, grade}
  rishiLogBreak(type, secs)        — logs break to localStorage
  Idle break detector              — 5 min idle → overlay with timer
  NOTE: Smart apostrophes in idle overlay strings caused syntax crash (fixed Apr 24)

▌ CHAPTER MAP (16 active, ch06+ch07 excluded)
  Ch01  Rational Numbers              → arithmetic
  Ch02  Linear Equations              → algebra
  Ch03  Understanding Quadrilaterals  → geometry
  Ch04  Practical Geometry            → geometry
  Ch05  Data Handling (Freq Dist)     → data-handling
  Ch08  Comparing Quantities          → arithmetic
  Ch09  Algebraic Expressions         → algebra
  Ch10  Visualising Solid Shapes      → geometry
  Ch11a Area of Plane Figures         → mensuration
  Ch11b Surface Area & Volume         → mensuration
  Ch12  Exponents and Powers          → arithmetic
  Ch13  Direct & Inverse Proportions  → arithmetic
  Ch14  Factorisation                 → algebra
  Ch15  Introduction to Graphs        → algebra
  Ch16  Playing with Numbers          → arithmetic
  Ch17  Chance & Probability          → data-handling

▌ EXAM SYSTEM
  Universal page: /exam.html?ch=01 (zero-padded, 11a, 11b for mensuration)
  52 questions / 100 marks / 90 minutes
  Section A: 20 MCQ × 1 mark  | Section B: 10 MCQ × 2 marks
  Section C:  6 MCQ × 3 marks | Section D: 10 Direct input × 3 marks
  Section E:  6 Case study × 2 marks
  Geometry chapters (03,04,10): Section D also MCQ (no drawing)
  Gates: rishiCheckPlan(intId) + rishiIsPracticeDone(chIdStr)
  Diagrams: RishiDiagram.render(slot, question.diagram) — shown when field present
  Chapters with diagrams: ch03(39), ch04(39), ch10(29), ch11a(46), ch11b(47), ch16(50)
  Total: 250 diagrams across 6 chapters

▌ EXAM COIN & GRADE SYSTEM
  90-100 → 500 coins  ⭐ Chapter Topper
  75-89  → 300 coins  🥈 Chapter Star
  60-74  → 175 coins  🥉 Chapter Pass
  40-59  →  75 coins  ✅ Cleared
  <40    →  20 coins  🔁 Try Again
  Bonuses: +50 first attempt pass | +75 improved score
           +100 all Section A correct | +150 zero wrong

▌ SYLLABUS PAGE
  EXAM_PATHS map: chId (integer) → /exam.html?ch=XX
  EXAM_DONE_KEYS map: chId → padded string (2→"02", 11→"11a", 112→"11b")
  isChapExamDone() uses EXAM_DONE_KEYS to match what exam.html writes
  Exam button states: locked (After Practice) / Start Exam (link) / Done·Retry (link)
  Topic Exam unlock: progress bar → medal when all chapter exams in topic done

▌ QUESTIONS.JS FOLDER MAP
  "01"→ch01  "08"→ch01  "12"→ch01  "13"→ch01
  "02"→ch02  "09"→ch02  "14"→ch02
  "03"→ch03  "04"→ch03  "10"→ch03
  "05"→ch05
  "11a"→ch11  "11b"→ch11
  "15"→ch15
  "16"→ch16

▌ ADMIN PANEL
  /admin/question-manager.html — password gated, not linked from student UI
  Cloudflare env vars: RISHI_ADMIN_TOKEN (set), ELEVENLABS_API_KEY (set), ELEVENLABS_VOICE_ID (set)
  KV namespace: RISHI_QUESTIONS — created, bound, ALL 16 CHAPTERS SEEDED ✅
  admin.js and questions.js both have FOLDER_MAP for correct JSON path resolution

▌ LOCALSTORAGE KEYS
  rishi_explain_done_{chId}      → "1"  (integer e.g. 2)
  rishi_practice_done_{chId}     → "1"  (integer e.g. 2)
  rishi_chapexam_done_{chIdStr}  → "1"  (padded e.g. "02", "11a")
  rishi_exam_score_{chIdStr}     → score number
  rishi_exam_attempts_{chIdStr}  → attempt count
  rishi_coins                    → running total
  rishi_break_log                → JSON array of breaks
  rishi_active_chapters          → JSON {chId: {startDate, targetDate}}
  rishi_current_student          → JSON {studentName, class, board, studentId}
  rishi_admin_bypass             → "1" skips all gates
  rishi_explain_sessions         → JSON {chId: count}
  rishi_practice_sessions        → JSON {chId: count}

▌ EXPLANATION QUALITY STATUS
  DONE:    rational-numbers (Apr 24)
  PENDING: all other 15 chapters — do one by one as Dabeet progresses

▌ REMAINING WORK (as of 25 Apr 2026)
  - Delete public\functions\tts.js (stale duplicate)
  - Sampurna Pariksha page (final grand exam, unlocks after all 16 chapter exams) ← NEXT
  - Topic exam pages (/topic-exam.html?topic=algebra) — Option A sampling
  - Explanation quality rewrite — 15 chapters remaining
  - Practice pages — not tested since Apr 24 fixes (verify flow + voice + avatar)
  - OTP SMS reset — blocked on TRAI DLT registration
  - Ch06, Ch07 (Squares, Cubes) — excluded from current build
  - Ch17 exam JSON — not yet built (explain + practice done)
  - Add question-manager section inside admin.html (currently separate page)

▌ CRITICAL RULES FOR CLAUDE
  1. NEVER guess at file contents — always read actual file first
  2. NEVER deliver code without checking for probable errors
  3. Always end every session with: git add . → git commit → git push
  4. Node.js v24 available. package.json has "type":"module" — use .mjs for scripts
  5. Python is NOT installed on Arindam's Windows machine
  6. Response style: extremely concise, no fluff, no repeating back what was said
  7. When making scripts — test against actual uploaded files before delivering
  8. Smart apostrophes (') inside JS single-quoted strings = syntax crash. Use \' or &#39;
  9. tts.js lives at repo ROOT functions\tts.js — NOT inside public\
  10. Exam JSONs are grouped by topic folder — questions.js uses FOLDER_MAP to resolve paths
*/
