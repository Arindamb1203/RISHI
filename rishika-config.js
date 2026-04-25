/*
═══════════════════════════════════════════════════════════════
  RISHIKA CONFIG — Paste this entire file at the start of
  every new Claude session to restore full project context.
  Last updated: 24 April 2026
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

▌ FILE STRUCTURE (repo root = D:\rishi\)
  functions/
    tts.js                    ← ElevenLabs TTS proxy (ROOT level, NOT inside public)
    api/
      questions.js            ← GET exam questions from KV
      admin.js                ← POST seed/delete/list KV

  public/
    admin.html                ← Admin panel (password gated)
    login.html                ← Student + parent login (auto-login REMOVED Apr 24)
    parent.html               ← Parent portal entry
    parent-dashboard.html     ← Study plan builder + heatmap
    syllabus.html             ← Student hub (topic rail + chapter cards)
    exam.html                 ← Universal exam page (?ch=01 through ?ch=17)
    rishi-core.js             ← Shared functions (include in EVERY page)
    rishi-diagram.js          ← SVG diagram renderer (18 shape types)
    rishi-sync.js             ← Cross-page sync utilities
    manifest.json             ← PWA manifest

    data/class8/              ← Exam JSON question banks (ch01–ch17)

    explain/class8/
      algebra/                ← linear-equations, algebraic-expressions-identities,
                                 factorisation, introduction-to-graphs
      arithmetic/             ← rational-numbers, comparing-quantities,
                                 powers-exponents, direct-inverse-proportions,
                                 playing-with-numbers
      data-handling/          ← frequency-distribution, chance-probability
      geometry/               ← understanding-quadrilaterals, practical-geometry,
                                 visualising-solid-shapes
      mensuration/            ← area-plane-figures, surface-area-volume

    practice/class8/          ← Same subfolder structure as explain/

▌ CHARACTERS
  Rekha the Turtle  — explain pages. Sprite-sheet animation (PNG canvas).
  Rishika           — practice + exam pages. FaceTime-style UI. Sprite-sheet canvas.

▌ ELEVENLABS TTS
  Proxy:    /tts (POST) via functions/tts.js at repo root
  API key:  RISHI key (ends in 91f7) — set in Cloudflare env vars
  Voice ID: 21m00Tcm4TlvDq8ikWAM (Rachel — free voice)
            (Priyanka BpjGufoPiobT79j2vtj4 is paid library voice — DO NOT USE on free plan)
  Fallback: Browser TTS (sayBrowser) if ElevenLabs fails
  Cloudflare env vars: ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID (both Plaintext)

▌ EXPLAIN PAGE FLOW (all 16 pages — fixed Apr 24)
  1. Page loads → initVoices(function(){startLesson();})  ← auto-triggers
  2. startLesson() → say(introText, proceed) + setTimeout(proceed, 8000) safety
  3. proceed() → setTimeout(showQ, 600)
  4. showQ() → builds question card → setTimeout(startAnim, 800)
  5. startAnim() → plays turtle animation → setTimeout(beginSteps, 600)
  6. beginSteps() → creates step card → setTimeout(nextStep, 350)
  7. nextStep() → say(s.s, function(){ setTimeout(nextStep, 400) }) ← auto-advances
  8. After all steps → showConfirm() → student types answer

▌ EXPLAIN PAGE KEY PATTERNS
  Function G(id) = document.getElementById(id)
  var elAudio = null  (declared at top of each page)
  initVoices(cb) → picks browser voice, calls cb when ready
  say(text, onEnd) → tries ElevenLabs /tts first, falls back to sayBrowser
  rStartTalk(len) / rStopTalk() → Rekha turtle talking animation
  getAnimPlay(animId) → returns function that plays SVG animation
  rishiCheckPlan(chId) → redirects if chapter not in parent plan (bypass: rishi_admin_bypass=1)
  rishiMarkExplainDone(chId) → called on completion

▌ RISHI-CORE.JS KEY FUNCTIONS
  rishiCheckPlan(chId)       — gate: redirects if not in plan
  rishiMarkExplainDone(chId) — marks explain complete
  rishiMarkPracticeDone(chId)— marks practice complete
  rishiIsExplainDone(chId)   — read explain status
  rishiIsPracticeDone(chId)  — read practice status
  rishiIsChapExamDone(chId)  — read exam status
  rishiLogBreak(type, secs)  — logs break to localStorage
  Idle break detector        — 5 min idle → overlay with timer
  NOTE: Smart apostrophes in idle overlay strings caused syntax crash (fixed Apr 24)

▌ CHAPTER MAP (16 active chapters, ch06+ch07 excluded)
  Ch01 Rational Numbers         → arithmetic
  Ch02 Linear Equations         → algebra
  Ch03 Understanding Quadrilaterals → geometry
  Ch04 Practical Geometry       → geometry
  Ch05 Data Handling (Freq Dist)→ data-handling
  Ch08 Comparing Quantities     → arithmetic
  Ch09 Algebraic Expressions    → algebra
  Ch10 Visualising Solid Shapes → geometry
  Ch11a Area of Plane Figures   → mensuration
  Ch11b Surface Area & Volume   → mensuration
  Ch12 Exponents and Powers     → arithmetic
  Ch13 Direct & Inverse Proportions → arithmetic
  Ch14 Factorisation            → algebra
  Ch15 Introduction to Graphs   → algebra
  Ch16 Playing with Numbers     → arithmetic
  Ch17 Chance & Probability     → data-handling

▌ EXAM SYSTEM
  Universal page: /exam.html?ch=01 (zero-padded, 11a, 11b for mensuration)
  52 questions / 100 marks / 90 minutes
  Section A: 20 MCQ × 1 mark | Section B: 10 MCQ × 2 marks
  Section C: 6 MCQ × 3 marks | Section D: 10 Direct input × 3 marks
  Section E: 6 Case study × 2 marks
  Geometry chapters (03,04,10): Section D also MCQ (no drawing)
  Gates: rishiCheckPlan + rishiIsPracticeDone

▌ ADMIN PANEL (/admin)
  Password gated. BYPASS toggle → sets rishi_admin_bypass=1 in localStorage
  Bypass overrides: plan lock, explain done, practice done gates
  Open button → opens page in NEW TAB (fixed Apr 24)
  Exam links wired: /exam.html?ch=01 through ?ch=17 (fixed Apr 24)
  Quick Actions: Syllabus, Parent Portal, Student Login shortcuts (added Apr 24)

▌ LOCALSTORAGE KEYS
  rishi_explain_done_{chId}     → "1"
  rishi_practice_done_{chId}    → "1"
  rishi_chapexam_done_{chIdStr} → "1" (zero-padded e.g. "02", "11a")
  rishi_exam_score_{chIdStr}    → score number
  rishi_coins                   → running total
  rishi_break_log               → JSON array of breaks
  rishi_active_chapters         → JSON {chId: {startDate, targetDate}}
  rishi_current_student         → JSON {studentName, class, board, studentId}
  rishi_admin_bypass            → "1" skips all gates
  rishi_explain_sessions        → JSON {chId: count}
  rishi_practice_sessions       → JSON {chId: count}
  Note: chIdStr is zero-padded ("02", "11a"). chId in functions is integer (2, 11).

▌ EXPLANATION QUALITY STATUS (friendly elder-sister tone rewrites)
  DONE:    rational-numbers (Apr 24)
  PENDING: all other 15 chapters — do one by one as Dabeet progresses

▌ REMAINING WORK (as of Apr 24)
  - Sampurna Pariksha page (final grand exam, unlocks after all 16 chapter exams)
  - Topic exam pages (/topic-exam.html?topic=algebra)
  - Explanation quality rewrite — 15 chapters remaining
  - Practice pages — not tested since Apr 24 fixes (verify flow + voice + avatar)
  - OTP SMS reset — blocked on TRAI DLT registration
  - Ch06, Ch07 (Squares, Cubes) — excluded from current build
  - Ch17 exam JSON — not yet built (explain + practice done)

▌ CRITICAL RULES FOR CLAUDE
  1. NEVER guess at file contents — always read actual file first
  2. NEVER deliver code without checking for probable errors
  3. Always end every session with git add . → git commit → git push
  4. Node.js v24 is available (package.json has "type":"module" — use .mjs for scripts)
  5. Python is NOT installed on Arindam's Windows machine
  6. Response style: extremely concise, no fluff, no repeating back what was said
  7. When making scripts — test against actual uploaded files before delivering
  8. Smart apostrophes (') inside JS single-quoted strings cause syntax crashes — always use \' or &#39;
*/
