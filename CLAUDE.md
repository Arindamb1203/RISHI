# RISHI — Claude Code Project Guide

> **SESSION RULE:** Before every `git push`, update this file with anything new — files added, bugs fixed, architecture changes, content status updates. This is the single source of truth.

---

## Owner & Workflow
- **Arindam Bhowmik** — non-technical sole owner. All code written by Claude.
- Never ask him to edit code manually. Blanket permission granted for all file edits, bash commands, Python runs, and git operations.
- Responses: extremely concise, no fluff.
- Deploys: Windows 11, VS Code, git push from `D:\rishi` (NOT `D:\rishi\public`)

## Repo & Hosting
- **Repo:** github.com/Arindamb1203/RISHI
- **Live:** rishi-ewh.pages.dev
- **Host:** Cloudflare Pages — auto-deploy on git push (~30s); build output: `public`
- `functions\` at repo ROOT — not inside `public\`

## Stack
- Pure HTML / CSS / Vanilla JS — no frameworks, no React, no Node
- AI: OpenAI **gpt-4.1-mini** via `OPENAI_API_KEY`. **NEVER Gemini.**
- Database: Cloudflare D1 (`d1-sync` endpoint); schema at `D:\rishi\database\schema.sql`
- KV: `RISHI_QUESTIONS` binding, key format: `{board}_{class}_ch{chId}_{tag}`
- Pricing: **₹599/month everywhere**

## Test Accounts
- Student: Dabeet Bhowmik — ID: `RISHI-DABEET-001`
- Parent: Priyanka — ID: `PARENT-PRIYANKA-002`, password: `rishi2026` (pw_override set in D1)
- Admin password: `rishi2025`
- Admin code prefix: `ARISHI-*` (activates pay button for free registration)

## Key Files
| File | Notes |
|------|-------|
| `public/admin.html` | Admin dashboard — ONLY correct path (never `public/admin/admin.html`) |
| `public/parent.html` | 2700+ lines — always Read before editing |
| `public/syllabus.html` | Class-aware 6/7/8/9 + ICSE ic6/ic7/ic8/ic9 — has LOCAL done-check functions (NOT rishi-core.js) |
| `public/register.html` | Registration + payment |
| `public/exam.html` | Chapter exams — no voice, no avatar (removed 24 May 2026) |
| `public/topic-exam.html` | Reads board from URL params only |
| `public/sampurna-pariksha.html` | Reads board from URL params only |
| `public/landing.html` | 6-slide pre-launch page (r0–r5); slides 0-5 navigated by Continue; "Skip to Register" = go(5) |
| `functions/tts.js` | TTS at repo ROOT, not in public\ |
| `public/rishi-core.js` | Shared logic, IIFE detects `?bypass=1`; captures JS errors to `rishi_error_log`; logs breaks with studentId |
| `public/rishi-sync.js` | Syncs rishi_* keys to D1 |
| `public/rishi-presence.js` | Session resume for explain + practice |
| `public/rishi-animate.js` | Shared daily-life explain-animation engine (no-cache, `?v=N`). `RishiAnim.pickSkin/svg/steps/caption(concept,m,skin)`. Self-animating SVG scenes + skin-aware conversational narration. PILOT page: class8 squares. See "Daily-life conversational animations" log |
| `public/rishi-explain-slow.js` | Shared no-cache override that paces the global `nextStep()` on the 138 standard explain pages (min-dwell + hard cap) so narration never races when TTS is down. Injected by `cascade_explain_slow.py`. Skips the v3 page (squares). See "Cascade slow narration" log |
| `public/error-reporter.js` | Floating Rishika "Report Issue" widget — injected on all pages except /admin and /landing |
| `functions/api/fix-error.js` | AI error diagnosis — plain English output for non-technical admin |
| `functions/api/verify-question.js` | AI question verifier — checks if reported question is correct; returns replacement Q if wrong; stores verdict in D1 |
| `functions/api/report-error.js` | Saves user error reports to D1 `rishi_error_reports` table |
| `functions/api/admin-reports.js` | Returns all error reports including ai_verdict + ai_status |
| `functions/api/monitor.js` | Mobile monitor API — POST with {pw}; returns reports + sessions + systemErrors + syncActivity |
| `public/monitor.html` | Mobile PWA monitoring app — password gated, auto-polls /api/monitor every 30s, browser notifications on new reports, Reports/Active/System tabs |
| `functions/api/admin-mark-fixed.js` | Sets report status = 'fixed' |
| `public/parent-blogs.html` | Standalone blogs page for parents — placeholder "Coming Soon" layout with video card skeletons; auth guard checks `rishi_parent_student_id` |
| `public/admin-blogs.html` | Standalone admin blogs management page — placeholder mode; has own password login (same rishi2025); form + video library skeleton |
| `public/parent-dashboard.html` | Analytics dashboard for parent portal — auto-detects student from sessionStorage `rishi_parent_student_id`; hero readiness ring + KPIs; Chapter Intelligence cards; Topic Intelligence; Break Analytics with Games filter; collapsible Success factors |

## Content Structure
### CBSE (no board prefix in paths)
- `explain/class6/`, `explain/class7/`, `explain/class8/`, `explain/class9/`
- `practice/class6/`, `practice/class7/`, `practice/class8/`, `practice/class9/`
- `data/class6..9/` — question bank JSONs
- `data/cbse/class6..9/chXX/` — chapter exam JSONs

### ICSE (board prefix in paths)
- `explain/icse/class6/`, `explain/icse/class7/`, `explain/icse/class8/`, `explain/icse/class9/`
- `practice/icse/class6/`, `practice/icse/class7/`, `practice/icse/class8/`, `practice/icse/class9/`
- `data/icse/class6..9/chXX/` — chapter exam JSONs

### Class Keys in parent.html / syllabus.html / admin.html
| Board | Class | Key | Progress prefix |
|-------|-------|-----|----------------|
| CBSE | 6 | `6` | `` (empty) |
| CBSE | 7 | `7` | `` (empty) |
| CBSE | 8 | `8` | `` (empty) |
| CBSE | 9 | `9` | `` (empty) |
| ICSE | 6 | `'ic6'` | `ic6_` |
| ICSE | 7 | `'ic7'` | `ic7_` |
| ICSE | 8 | `'ic8'` | `ic8_` |
| ICSE | 9 | `'ic9'` | `ic9_` |

## Content Status (as of 01 Jun 2026)
| Class | Explain+Practice | Chapter Exams |
|-------|-----------------|---------------|
| CBSE 6 | 10 chapters ✓ | Done ✓ |
| CBSE 7 | 8 chapters ✓ | Done ✓ |
| CBSE 8 | **18 chapters ✓** | Done ✓ |
| CBSE 9 | 12 chapters ✓ | Done ✓ |
| ICSE 6 | 28 chapters ✓ | Done ✓ |
| ICSE 7 | 22 chapters ✓ | Done ✓ |
| ICSE 8 | 21 chapters ✓ | Done ✓ |
| ICSE 9 | 20 chapters ✓ | Done ✓ |

### CBSE Class 8 — all 18 chapters
Ch1 Rational Numbers, Ch2 Linear Equations, Ch3 Understanding Quadrilaterals, Ch4 Practical Geometry, Ch5 Data Handling, Ch6 Squares & Square Roots, Ch7 Cubes & Cube Roots, Ch8 Comparing Quantities, Ch9 Algebraic Expressions, Ch10 Visualising Solid Shapes, Ch11a Mensuration (Area), Ch11b Mensuration (Surface & Vol), Ch12 Exponents & Powers, Ch13 Direct & Inverse Proportions, Ch14 Factorisation, Ch15 Introduction to Graphs, Ch16 Playing with Numbers, Ch18 Story of Numbers

Notable corrections (29 May 2026):
- Squares practice Q10: answer corrected to 64 (2000 − 1936 = 64)

Bug fixes (06 Jun 2026):
- `explain/class8/arithmetic/playing-with-numbers.html` — `confirmShown` variable was missing from declarations; caused crash when student clicked "I Understand!" button
- Squares exam A7: "from 170" (not 190); A10: fixed all-same options
- Ch18 Story of Numbers: full practice QB + exam JSON rewritten from NCERT

Explain-page bugs — site-wide fix (10 Jun 2026, `fix_explain_bugs.py`):
- **(a) "Go to Practice" landed on the RISHI landing page:** `goPractice()` on 15 class-8 explain pages pointed to `/practice.html?chapter=SLUG` — that page doesn't exist → 404 → landing. Correct = the page's own practice file (deterministic `/explain/…`→`/practice/…`). Fixed on all 15.
- **(b) Exam button wrong param:** `goExam()` used `/exam.html?chapter=SLUG` instead of `/exam.html?ch=NN`. Fixed on all 15 using authoritative ch from syllabus (incl. 11→`11a`, 112→`11b`).
- **(c) Confirm question only showed on Q1:** `showQ()` reset `stepIdx`/`nudgeCount` but NOT `confirmShown`, so Q2+ hit `if(confirmShown)return` and showed nothing until refresh. **135 explain pages** were missing the reset (working pages like squares had `stepIdx=0;nudgeCount=0;confirmShown=false;`). Inserted the reset on all 135 (same safe transform; `confirmShown` is already declared in each page's var line).
- `fix_explain_bugs.py` (repo ROOT): `--apply` to run; dry-run by default. Validated — 0 new JS parse failures (4 files had PRE-EXISTING parser quirks at HEAD, unrelated — likely smart-apostrophes; not touched). powers-exponents was fixed manually first so the script correctly skipped it.

Plan revert / not-reflecting-on-student — ROOT FIX (10 Jun 2026):
- **Symptom:** parent changes Unit-Test plan (e.g. swap Ch16→Ch18); parent portal shows it, but (a) it reverts to old after a few minutes, and (b) the student (Dabeet) syllabus still shows the OLD plan.
- **Root cause:** `rishi_active_chapters` (and `rishi_plans`) are **parent-authored**, but they were in `rishi-sync.js` `SYNC_EXACT`, so the STUDENT device pushed its **stale** local copy back to D1 — on every page load (it pushes BEFORE it pulls, lines ~153-161), every 30s, and on unload. That overwrote the parent's fresh value in D1 → revert + student sees old. (Pull side already said "cloud wins" but push destroyed cloud first.)
- **Fix (`rishi-sync.js`):** added `READ_ONLY_EXACT=['rishi_active_chapters','rishi_plans']` + `READ_ONLY_PREFIX=['rishi_plans_']` and `shouldPush(key)=shouldSync(key)&&!isReadOnly(key)`. ALL push paths (setItem interceptor, load loop, 30s timer, unload, `pushAll`) now use `shouldPush` → the student device PULLS these (cloud-wins) but NEVER pushes them. Parent stays the sole author. `_headers` already no-caches rishi-sync.js so no `?v` bump needed.
- **After deploy:** parent should Modify→Save the plan once more to write the correct value to D1 cleanly (in case D1 currently holds a stale student-pushed copy); then reload the student syllabus — it now sticks. Complementary to the parent.html `_planDirtyUntil` poll-guard.
- **NOTE:** `factorisation.html` (student explain page) locally writes `rishi_active_chapters` (line 537, legacy `rishiCheckPlan`-style) — now harmless (won't be pushed; overwritten by next cloud pull).

STALE DEPLOY + site-wide audio-stop hardening (10 Jun 2026, later session — `rishi_health_check.py`):
- **"Practice button → /landing" was NOT a code bug.** `goPractice()` in `powers-exponents.html` was already correct in repo + GitHub (`/practice/class8/arithmetic/powers-exponents.html`). The LIVE Cloudflare Pages build was **stale** — it never deployed commit `6715c66` (pushed 10:46, still serving old `/practice.html?chapter=exponents_and_powers` 8 hrs later). Since `index.html` redirects `/`→`/landing.html` and rishion.in serves index for ANY missing path, the dead link landed on landing. **Fix = forced redeploy** via empty commit `b1c2de0`; verified live (`rishi-ewh.pages.dev` + `rishion.in`, cache-busted). **Lesson: after a push, VERIFY the live site actually updated (`curl` the deployed file) — auto-deploy can silently lag/fail.**
- **`rishi_health_check.py` (repo ROOT)** — scans all 280 explain+practice pages (CBSE+ICSE, class 6/7/8/9). Dry-run by default; `--apply` to write. Idempotent (re-run = 0 changes). Skips already-correct pages, fixes the rest. Auto-fixes: (1) audio-stop-on-exit guard, (2) `goPractice` path = deterministic mirror of explain path, (3) `confirmShown` declaration. Read-only WARN audits: `goExam ?chapter=`, `explain-helper.js` tag, emoji-strip marker, favicon injector, practice audio purity.
- **Audio-stop-on-exit (the core fix):** injected `RISHI-AUDIO-STOP-ON-EXIT-V2` IIFE before `</body>` on **all 140 explain pages**. Explain pages use ElevenLabs `new Audio()` (via `/tts`) + `speechSynthesis`, but only stopped on `beforeunload` (140) / `pagehide` (111) and **never on `visibilitychange`** → audio kept playing on tab-switch/minimise/mobile-nav. The V2 guard monkey-patches `HTMLMediaElement.prototype.play` to track every (even detached `new Audio()`) media element, and on `pagehide`+`beforeunload`+`visibilitychange(hidden)` cancels `speechSynthesis` + pauses all tracked media + all DOM `<audio>/<video>` + calls page's `stopAllAudio()`. Independent self-contained block → works even on the 4 pre-existing smart-apostrophe pages. **Practice pages (140) were already covered** by `RISHI-STOP-VOICE-ON-EXIT` (speech-only, all 3 events) → left untouched.
- **`confirmShown` hardening:** 20 CBSE class7/class9 explain pages referenced `confirmShown` but only got yesterday's `showQ` reset (`confirmShown=false`), not the **declaration** — it worked as an implicit global (assign-before-read, non-strict) but didn't match the class8 standard (`...PER_SESSION=10,confirmShown=false;`). Fixed deterministically (precise anchor) so all 140 now declare it on the var line. Note `?chapter=`-anchor pages without `,PER_SESSION=10;` would WARN (none did).
- **Validated:** node `--check` parse diff (HEAD vs now) on all 140 explain → **0 newly broken**; 4 pre-existing failures unchanged (number-play, euclids-geometry, herons-formula, icse direct-inverse-variation — known smart-apostrophe quirks). No double-injection; practice pages 0 modified.

Powers-exponents fixes + math input (10 Jun 2026):
- **#1 "I Understand / I Don't Understand" not appearing:** the buttons are added by `nextStep()` only after the last step's `say()` `onEnd` fires. With ElevenLabs down (502/quota), `say()` falls back to `speechSynthesis`, whose `onEnd` can stall → chain never reaches the button branch. Fix (powers-exponents): wrapped the per-step advance in a once-guard `_go()` + a safety `setTimeout(_go, max(4500, len*95))` so steps/buttons advance even if narration stalls. (explain-helper.js IS present + confirmShown declared — those were already fine.)
- **#2 math typing helper was the BASIC version on powers-exponents** (just echoed plain text). Only 12/140 explain pages have the rich katex engine (`mathNormalise`/`mathToLatex`/`mathRender` — `x2→x²`, `sqrt()→√`, `(a)/(b)→frac`, live KaTeX render + shortcut chips). Ported the core engine into powers-exponents with exponent-themed `MATH_DEFAULTS` (x²,x³,xⁿ,x⁻¹,√,×10ⁿ,a/b). Kept the LETTER-only `x2→x^2` rule so numeric answers like "32" are NOT mangled to 3². `showConfirm` now calls `mathUpdate()` (was `buildSuggChips(makeChips(q))`) so chips show immediately. **NOTE: 127 other pages still have the basic math input — rollout pending (best as a shared `math-input.js`).**
- **#3 parent plan edit "not reflecting":** `savePlans()` wrote localStorage + fired a fire-and-forget D1 `set`, but the 10s poll (`loadStudentFromD1`) blindly overwrote ALL localStorage keys (incl. `rishi_plans_*`) with D1 data on every tick — so an edit got clobbered by stale D1 before the write propagated. Fix: `savePlans()` sets `window._planDirtyUntil` (25s, shortened to 4s on write success, kept 25s on failure); the poll's overwrite loop skips `rishi_plans_<sid>` while within that window. Local edit now survives until D1 confirms.

Daily-life conversational animations — PILOT (11 Jun 2026, `public/rishi-animate.js`):
- **What:** explain-page animations upgraded from abstract math (factor-trees, dot-grids, number-lines) to **real-life scenes** (chairs in a hall, floor tiles, LED pixels, laddoo boxes, cricket seats, saplings…) with **conversational, question-first narration** ("If all 196 chairs must form one square hall, how many per row?" → the scene answers it). PILOT page only: `explain/class8/arithmetic/squares-and-square-roots.html` (CBSE 8 ch06). Other 139 pages untouched — Python roll-out is a LATER session.
- **Architecture (decided after reading code):** generic engine lives in a SHARED, no-cache, versioned **`public/rishi-animate.js`** (`?v=1`; added to `_headers`); per-page CONTENT stays data-driven in the page's QB. The engine is the reusable part so a future Python script can adopt it across all 140 pages.
- **Config format (what a page/generator must emit per QB question):** `{ concept:"<name>", m:{…maths data…}, q, qs, cq, cqs, ans, nudges }`. The `q/qs/cq/cqs/ans/nudges` (question + confirm + answers + hints) are the page's own assessment — **unchanged**. Only `anim`+`steps` were replaced by `concept`+`m`. The engine supplies the scene SVG **and** the skin-aware step-by-step narration.
- **Engine API:** `RishiAnim.pickSkin(concept,m)` (random skin, no immediate repeat), `RishiAnim.svg(concept,m,skin)`, `RishiAnim.steps(concept,m,skin)` (returns `[{t,s}]` skin-aware, conversational), `RishiAnim.caption(concept,m,skin)`. Scenes are **self-animating** (CSS `@keyframes`, play on DOM insert) so Replay just re-renders.
- **≥10 skins per concept:** a shared pool of **14 daily-life item-skins** (chairs/tiles/LED/laddoo/photos/badges/saplings/stadium seats/solar panels/chocolate/mosaic/stamps/parking/carrom) — every concept draws from it, random per page load, **re-randomised on Replay**.
- **7 concepts (v1, square/√ family):** `arrange` (N items→square, side=√N; also concept mode), `gap` (counts between n² and (n+1)² = 2n), `oddlayers` (1+3+5+…=n²), `lastdigit` (ends 2/3/7/8 → never a square), `areaSide` (square AREA, fraction or decimal → SIDE), `adjust` (add/remove to reach nearest square — sub & mul), `product` (product of two squares is a square). 15 squares questions map onto these.
- **Page wiring:** `<script src="/rishi-animate.js?v=2"></script>` in `<head>`; QB rewritten to `concept`/`m`; `getAnimSVG/getAnimPlay` replaced by thin override wrappers (later function decls win — old code left as harmless dead code); `showQ` sets `q._skin`+`q.steps`; `replayAnim` re-picks the skin. **Ported the powers-exponents `_go()` once-guard + `setTimeout(_go,max(4500,len*95))`** into `nextStep` (was missing here) so steps advance even with TTS down (502). All KEPT intact: TTS chaining, confirm question, `confirmShown`, `explain-helper.js`, audio-stop-on-exit V2, emoji-strip, favicon, goPractice/goExam, progress keys, cream/gold theme.
- **Validated:** `node --check` engine OK; all 4 inline scripts parse 0 errors; `audit_explain.py` → squares stays **REAL**, button present (140/140); runtime-executed all 15 concept/m combos (svg+steps+caption render, no throw) + confirmed skin re-randomisation. TTS-down path sound by construction (animation play is pure-timer; steps guarded by `_go()`).

Rich chapters 4 & 5 — Comparing Quantities + Rational Numbers (12 Jun 2026, `rishi-animate.js?v=4`):
- **Process is now a fixed recipe** (same 6 wiring edits + 15 QB `anim→concept/m` edits per page; showcase pinned via `buildSession` stable-sort; `_playGen` replay guard). All standard-template pages share byte-identical flow so the transform is mechanical. Each chapter: add concept family to engine → validate all scenes render (node + runtime, no undefined) → wire page → 0 parse errors + audit REAL → deploy → verify live on rishion.in.
- **Comparing Quantities (ch8)** — `COMPARING QUANTITIES family` (15 concepts): showcase `profitPct` (cost bar → sell bar → profit-gap → %); `lossSP`,`percentOf`,`pctChange`,`simpleInterest`,`compoundInterest`(coin-stack growth),`discountSP`,`profitSP`,`gstTotal`,`markedPrice`,`siVsCi`,`netChange`,`siRate`,`ciRate`. Bar models + ₹ labels. `MONEY_SKINS` (12 shop contexts). `mBar`/`pctStrip` helpers.
- **Rational Numbers (ch1)** — `RATIONAL family` (13 concepts): showcase `betweenRationals` (reusable **`numLine`** number-line: infinitely many between two → take the middle); `betweenInts` (number line), `addInverse`/`addInverseSum`,`mulInverse`/`mulInverseProd`,`property` (assoc/closure by name),`addFrac`,`mulFrac`,`divFrac`,`findX`,`standardForm`,`rationalConcept`. Abstract → no skin. `sayFrac()` reads "-3/5" as "minus 3 over 5".
- `pickSkin` now pool-aware: `CUBE_CONCEPTS`→CUBE_SKINS, `MONEY_CONCEPTS`→MONEY_SKINS, else SKINS (exponent/rational concepts ignore skin).
- **Rich chapters so far: Squares · Cubes · Exponents · Comparing Quantities · Rational Numbers (5).** Engine `rishi-animate.js` internal `version:3` label is stale/cosmetic (cache-bust is the `?v=` query, currently v4) — not bumped, harmless.

Exponents & Powers = 3rd rich chapter (12 Jun 2026, `rishi-animate.js?v=4`):
- **`explain/class8/arithmetic/powers-exponents.html`** wired to v3 (was the special `_scene`-override page; flow funcs were standard shape so same transform applied: buildScene/playScene/finishAnim, concept/m per Q, expGrow pinned first, `_playGen` replay guard, no Play/Step buttons). Old `_scene`/getAnimSVG/getAnimPlay/_go-nextStep left as dead code. `rishi-math-input.js` already self-skips this page (it has `MATH_DEFAULTS`); `rishi-explain-slow.js` now self-skips it too (defines `buildScene`).
- **EXPONENT FAMILY added to engine** (14 concepts): showcase `expGrow` = explosive-growth doubling (tiles ×base each step → reveal); laws as 3-beat narrated reveals: `expProduct` (add), `expQuotient` (subtract), `expZero`, `expPower` (multiply), `expNeg` (reciprocal), `expProd`/`expQuot` (distribute), `stdFormSmall`/`stdFormBig` (standard form), `expNegBase` (even power → +), `expSameExp` (combine bases), `expCompare` (2¹⁰ vs 10²), `expSolve` (2ˣ=64). Exponent concepts ignore skin (algebraic). `EXP_CONCEPTS` registry.
- Validated: engine `node --check`, all 14 exponent scenes render (no undefined/function-leak), squares+cubes unaffected, page 0 parse errors, audit REAL.

Math typing keyboard cascade + Cubes as 2nd rich chapter (12 Jun 2026):
- **Math keyboard — shared, all 140 explain pages (`rishi-math-input.js` + `cascade_math_input.py`):** the confirm-question chip strip was EMPTY on the 127 "basic" pages (answer-chips hidden by `explain-helper.js` `makeChips→[]`; only 13 pages ever had the rich helper). Shared no-cache file watches for `#rawAnswer` and fills `#suggChips` with a math keyboard (x²,x³,xⁿ,√,**∛**,a/b,(),×10ⁿ,π) + a KaTeX-free pretty live preview (`5^2`→`5²`, `cbrt(27)`→`∛(27)`, `*`→`×`). Self-skips the 13 rich pages (`window.mathToLatex`/`MATH_DEFAULTS`). Injector dry-run default, `--apply` → 140/140. Verified via DOM sim (chips render, tap inserts at caret inside `()`, preview prettifies).
- **Cubes & Cube Roots = 2nd rich v3 chapter (`rishi-animate.js?v=4`, `explain/class8/arithmetic/cubes-and-cube-roots.html`):** owner approved the reusable-scene-library path; cubes is the cube twin of squares. Added a **CUBE FAMILY** to the engine: `cubeArrange` showcase = items **stack into a 3-D isometric cube layer by layer** (`drawBox`/`cubeLayer`/`cubeModel`, painter-sorted, per-skin top marks: dice pips, brick lines, gift ribbon…) with `CUBE_SKINS` (12 cubic items) + layer counter + `∛N=side` reveal. Other 9 concepts (`cubeConcept`,`cubeCheck`,`cubeNeg`,`cubeAdjust` mul/div,`cubeFrac` frac/dec,`hardyRamanujan` 1729 two-cubes-two-ways,`cubeDiff` 3n²+3n+1,`cubeParity`,`cubeScale`) = 3 slow narrated beats. `pickSkin` is pool-aware (CUBE_SKINS for cube concepts, SKINS for square). Page wired identically to squares (buildScene/playScene/finishAnim, concept/m per Q, cubeArrange pinned first, no Play/Step buttons) + a `_playGen` guard so Replay can't double-fire. Validated: engine `node --check`, all 15 cube scenes render (no undefined, cube skins, 3-D boxes), squares unaffected, page 0 parse errors, audit REAL.
- **NOTE:** squares bumped `?v=3`→`?v=4` (same engine file). `rishi-explain-slow.js` auto-skips both rich pages (they define `buildScene`).

Cascade slow narration to all explain pages (12 Jun 2026, `cascade_explain_slow.py` + `rishi-explain-slow.js`):
- **Goal:** owner asked to cascade the squares improvements to all chapters/boards. **Honest scope:** two parts — (1) the **"I Don't Understand on every question"** fix already shipped site-wide via shared `explain-helper.js` (no per-page work); (2) the **bespoke story+motion scenes** (marching chairs etc.) are **per-topic, NOT scriptable** — squares is the only one. What IS scriptable + cascaded here = the **slow / paced narration** (the universal "too fast" fix).
- **Root cause of "too fast" everywhere:** all 138 standard-template pages share one global `nextStep()` that advances ONLY on the `say()` voice-end callback with **no minimum time**. With ElevenLabs down, the browser fallback fires "ended" instantly → steps race. (Confirmed: CBSE6 fractions and ICSE9 expansions are **byte-identical** in the flow region — one template.)
- **Fix (shared-override, low risk):** `public/rishi-explain-slow.js` (no-cache) loads AFTER each page's script and **replaces the global `nextStep`** with a paced version — advance only when BOTH narration ended AND a min dwell elapsed (`minMs=max(3800,len*55)`), hard cap `max(minMs+1600,len*115)`. Re-creates the EXACT DOM the page builds (`.step`/`#stepsWrap`/"I Understand!" button) so the confirm flow + `explain-helper.js` "I Don't Understand" are untouched. Self-guards (only standard pages; skips the v3 squares page via `typeof window.buildScene`).
- **Cascade = ONE include line.** `cascade_explain_slow.py` (repo ROOT; dry-run default, `--apply`) injects `<script src="/rishi-explain-slow.js?v=1"></script>` before `</body>` on the 139 standard pages (skips squares; 0 non-standard). ALL behaviour lives in the one shared file → no risky per-page JS rewriting.
- **Validated:** `node --check` shared file OK; virtual-clock DOM simulation through the REAL file with TTS DOWN → step cards at **0, 3800, 7600 ms** (every gap ≥3800ms, never racing) + "I Understand!" button created; injector idempotent; sample pages still parse 0 errors after inject.
- **NOT done (per-topic, later):** the rich square-style animated scenes for the other 139 pages — those are authored in `rishi-animate.js` chapter by chapter. This cascade only makes the existing narration slow & followable everywhere.

Animations v3 — slow NARRATED story, merged (11 Jun 2026, `rishi-animate.js?v=3`):
- **Owner rejected v1/v2:** too fast, abstract, boring, and the animation then REPEATED itself as text steps. Owner chose (via AskUserQuestion): **story + characters + motion**, **slow ~20-25s**, **merge into one narrated animation** (no separate text steps).
- **New engine model:** `RishiAnim.scene(concept,m,skin)` → `{base, phases:[{say,frag,cap,ms,pause}]}`. The base SVG holds `<g id="rzStage">`; the page plays phases ONE AT A TIME — appends `phase.frag` into `#rzStage` (its CSS entrance animation plays on insert) while `say(phase.say)` narrates, then a pause, then the next beat. The animation IS the teaching; after the last phase the page shows the **I Understand!** button → confirm question. NO step-by-step cards anymore.
- **`arrange` is the showcase** (the √N family — sq1,2,6,11,13,14): items literally **slide into rows one by one** (`.rsl` march-in), a ROW counter ticks, the square fills the "place" (hall/garden/rooftop…), dimension braces sweep in (`14 across / 14 down`), then a big `√196 = 14` with a sparkle burst. Other 6 concepts (gap/oddlayers/lastdigit/areaSide/adjust/product) play as 3 slow narrated beats reusing the v2 item artwork. 14 skins each → distinct.
- **Pacing safety (prevents the "too fast" recurrence when TTS is DOWN):** each phase advances only when BOTH narration ended AND a **minimum dwell** elapsed (`minMs=max(3800,len*55)`), with a hard cap (`max(minMs+1600,len*115)`). With ElevenLabs down (instant fallback) the showcase still runs **~27s**, each beat ~4-5s, never instant. With TTS up it advances on speech-end within that window.
- **Page wiring (`squares-and-square-roots.html`):** `buildScene(q)` sets `q._skin/q._scene/q.steps`; `showQ` inserts `q._scene.base` + auto-runs `playScene()` (no Play/Step buttons); `finishAnim()` builds `#stepsWrap` + the I Understand button (so `explain-helper.js` still attaches "I Don't Understand"); `replayAnim()` re-picks skin + replays. **PROTOTYPE aid:** `buildSession()` stable-sorts `arrange` questions FIRST so the showcase is seen immediately (remove this sort once the style is approved). Old `getAnimSVG/getAnimPlay/beginSteps/nextStep` left as dead code. Page include bumped `?v=2`→`?v=3`.
- **Status:** pilot ONE-page prototype for owner review (his explicit ask: build one, watch it live, then decide). Other 139 pages + the gap/oddlayers/etc rich treatment come AFTER he approves the √196 showcase.

Daily-life animations v2 + "I Don't Understand" button — site-wide fix (11 Jun 2026):
- **v2 artwork (`rishi-animate.js?v=2`):** owner feedback — v1 scenes all looked like the same square box (the `arrange` questions shared one `bigSquare` visual; skins only changed colour/label, NOT the picture, so back-to-back square-root questions looked identical). v2 gives every skin its OWN drawn item via `drawItem(art,…)`: chair / tile / LED dot / laddoo box / photo / badge / sapling / stadium seat / solar panel / chocolate / mosaic / stamp / parking / coin. Same maths now renders as **14 visually DISTINCT real-life scenes** (verified: 14/14 distinct markup for one arrange question). `bigSquare`→`itemSquare` (block of real item glyphs + place backdrop + dimension braces). Page include bumped `?v=1`→`?v=2`. `steps()`/`caption()` (conversational narration) unchanged from v1.
- **"I Don't Understand" button only appeared on Q1 — ROOT CAUSE in shared `explain-helper.js` (affected ALL 140 explain pages, NOT just squares; pre-existing, not caused by the animation work).** The helper used a global `injected` flag reset only when its MutationObserver *caught* `#qArea` empty. But `goNext()` wipes+refills `#qArea` **synchronously**, so the async observer never observed the empty transient → flag stayed `true` → Q2+ never injected the button. **Fix:** removed the global `injected` flag + the reset-observer; double-injection is now guarded per-question via `parent.querySelector('.btn-dont')` (each question builds a fresh `#stepsWrap`); `methodCount`/`prevSteps` reset inside `handleUnderstandBtn`. **Proven** with a faithful async-MutationObserver DOM simulation run on the real file: OLD code = Q1 PRESENT, Q2/Q3 MISSING (exactly the reported symptom); NEW code = Q1/Q2/Q3 all PRESENT. `explain-helper.js` is no-cache (`_headers`) → fix reaches all pages immediately.
- **Honest correction to the record:** the earlier "140/140 button present" audit (`audit_explain.py`) checks only that the `<script src="/explain-helper.js">` TAG is present — it never clicks through Q2+, so this per-question failure went undetected. Tag-present is NOT proof the button renders on every question.

Voice / TTS facts + emoji fix (09 Jun 2026):
- **VERIFIED direction (do not get this backwards):** EXPLAIN pages call ElevenLabs via `say()`→`fetch('/tts')` (140/140) with a `sayBrowser()` speechSynthesis FALLBACK. PRACTICE pages use `window.speechSynthesis` ONLY (140/140; 0 use /tts/elevenlabs/mp3/Audio). Practice has NEVER used ElevenLabs.
- **Why explain sounded robotic (09 Jun):** live `/tts` returns 502 — ElevenLabs `quota_exceeded` ("0 credits remaining"). The ElevenLabs account ran out of credits, so explain falls back to the system voice. NOT a code regression — fix = top up the ElevenLabs plan (`ELEVENLABS_API_KEY`/`ELEVENLABS_VOICE_ID` in Cloudflare env). When credits return, explain auto-recovers.
- **`/tts` = `functions/tts.js`** → ElevenLabs `eleven_multilingual_v2`, voice from `ELEVENLABS_VOICE_ID`. Returns 502 `{error:"ElevenLabs error",detail:...}` when ElevenLabs rejects (e.g. quota); 500 "TTS not configured" if env vars missing.
- **Emoji-in-speech fix (`fix_emoji_speech.py`, repo ROOT):** system voice read emoji aloud (intro `Hi <name>! &#128522;` → "smiling face"). Injected idempotent `<script>` marker `RISHI-STRIP-EMOJI-SPEECH` before `</body>` on all 280 explain+practice pages — monkey-patches `speechSynthesis.speak()` to strip emoji/symbol/ZWJ/VS16 from the utterance text. ONLY affects the system-voice path; ElevenLabs (`/tts`) still gets full text. Run `python fix_emoji_speech.py --apply`.

Practice voice fix (09 Jun 2026):
- **All 140 practice pages narrate via `window.speechSynthesis` but had NO exit handler** → voice kept talking after leaving the page (Syllabus/Back/Games/tab close), because speechSynthesis is a browser-global that survives navigation. Fixed via `fix_practice_voice.py` (repo ROOT): injects an idempotent `<script>` marked `RISHI-STOP-VOICE-ON-EXIT` before `</body>` that calls `speechSynthesis.cancel()` on `pagehide`/`beforeunload`/`visibilitychange(hidden)`. Run `python fix_practice_voice.py --apply` (dry-run without `--apply`). 140/140 now carry the marker. (Practice pages use speechSynthesis only — NONE use `/tts` audio, unlike explain pages.)

Chapter wiring (09 Jun 2026):
- **CBSE Class 8 Ch18 "The Story of Numbers"** was MISSING from `parent.html` Class-8 chapter list (it stopped at id:17 Chance & Probability) → parents never saw it. Added `{id:18, name:"The Story of Numbers", topic:"Arithmetic"}` + `18:1` to `explainBuilt`. It was already correct everywhere else (syllabus id18, admin id18, explain+practice pages, `data/cbse/class8/ch18/ch18-exam.json`, `questions.js` maps "18"→ch18). Owner decision: KEEP Ch16 "Playing with Numbers" (divisibility/general-form) AND Ch18 "The Story of Numbers" (number-systems history: bones, Gumulgal, Egyptian/Roman/Babylonian, Hindu numerals — matches the printed book chapter "The Story of Numbers"). Name stays "The Story of Numbers", NOT "Number Play". (NOTE: parent.html `explainBuilt` for class 8 still omits 6,7,112 — pre-existing, not touched.)

Bug fixes (09 Jun 2026):
- `confirmShown` missing-declaration crash also fixed in 6 more class8 explain pages: comparing-quantities, direct-inverse-proportions, rational-numbers, chance-probability, frequency-distribution, visualising-solid-shapes
- **Explain "Live Animation" rewritten — powers-exponents.html** (TEMPLATE). OLD system: `getAnimSVG()` returned SVGs containing ONLY `<text>` lines (narration sentences) and `play_peN()` faded them in silently → animation was just text, then step-by-step repeated the same text. NEW system: appended override `getAnimSVG`/`getAnimPlay` (later function decls win) + `_scene()`/`_wrap()`/`_t()`/`_tile()`/`_bar()`/`_line()` builders + `ANIM_CSS` (CSS keyframes pop/fup/grow/drw, self-animating on insert so replay works) + `ANIM_CFG` (per-anim duration+caption). 14 genuine visual scenes. Old `play_pe1..14` + old `getAnimSVG`/`getAnimPlay` left as dead code (overridden).
- **"I Don't Understand" engine = `public/explain-helper.js`** (shared, NOT per-page). Self-injects via MutationObserver: watches `#qArea` for the "I Understand!" button, adds a "🤔 I Don't Understand" button beside it; click → POST `/api/explain-differently` → fresh alternate explanation (cycles Method 2/3…). Also overrides `window.makeChips` (no answer chips) + `window.handleAnswer` (never reveals answer). A page gets the feature ONLY if it includes `<script src="/explain-helper.js"></script>` (placed before `/error-reporter.js`). **3 pages were missing the tag → button absent**: powers-exponents, playing-with-numbers, direct-inverse-proportions (class8/arithmetic) — now added. All 140 explain `.html` pages now include it.
- **`audit_explain.py`** (repo ROOT): scans all 140 explain `.html` (CBSE+ICSE), reports per page (1) animation REAL vs TEXT-ONLY (heuristic: shapes/SMIL/@keyframes/builders present = REAL; only `<text>` = TEXT-ONLY) and (2) whether `explain-helper.js` is included. `--fix` auto-inserts the missing helper tag. Animations are REPORT-ONLY (never auto-rewritten — real animations are hand-built). Ignores `*.html.bak`. Current run: 140/140 REAL animation, 140/140 button present.

## Build Scripts (in public/)
| Script | Class | Workers | Est. time |
|--------|-------|---------|-----------|
| `build_class6.py` | CBSE 6 | — | — |
| `build_icse_class6.py` | ICSE 6 | 5 parallel | ~20 min |
| `build_icse_class7.py` | ICSE 7 | Sequential | ~5 hrs |
| `build_icse_class8.py` | ICSE 8 | 5 parallel | ~18 min |
| `build_icse_class9.py` | ICSE 9 | 5 parallel | ~13 min |

## Exam Page — Architecture (updated 05 Jun 2026)

### Left Panel (redesigned 05 Jun 2026)
- Big question counter: `Q15 / 52` in Orbitron font (replaced old section tabs A/B/C/D/E)
- 52 attempt dots: green=correct, red=wrong, gold border=current question. `id="qdot-N"` per dot.
- Prominent score box: `.score-box-big` with score number, `/100 marks`, correct tally (✓ N), wrong tally (✗ N)
- "💬 Ask Rishika" button calls `rcToggle()` (from rishi-chat.js)
- "☕ Take a Break" button calls `startBreak()` (1-hour limit enforced)
- **rishi-chat.js injection**: looks for `.score-box-big` first (fallback `.score-box`); inserts below it

### Result Modal (updated 05 Jun 2026)
- Stats row: correct / wrong / unanswered counts (tracked via `correctCount`, `wrongCount` variables)
- Topic exam eligibility: score ≥ 60 → green "✓ Eligible for Topic Exam"; <60 → red "✗ Need 60+ marks"
- Badge text fixed: rishi-core.js badges now use actual Unicode chars (⭐🥈🎯✓🔁) not HTML entities

### Break Limit (added 05 Jun 2026)
- `lastBreakTimestamp` variable in exam.html tracks last break time (ms epoch)
- Extra break within 1 hour → `.eb-overlay` shown ("Break Not Allowed"), NOT the break timer
- Extra break logged to D1: `rishiLogBreak('Extra Break Attempt (Blocked)', 0)` + direct push to `rishi_extra_break_flag` key
- Admin bypass (`rishi_admin_bypass=1`) skips the 1-hour check

### Exam JSON Format (critical — do not use old format)
- Working format: `text`, `options: {a,b,c,d}`, `correct: 'a'/'b'/'c'/'d'`, `explanation`
- Section D uses `answer_type` / `correct_answer` / `accepted_forms` (direct text input) — this is intentional, not a bug
- questions.js exam priority: **static file FIRST** (if chapter is in FOLDER_MAP), then KV fallback — never revert
- CBSE ch06, ch07, ch18: fully rewritten to 52-question format (05 Jun 2026)
- CBSE ch07: 5 additional errors fixed (B_003, B_009, C_002, C_003 wrong correct fields, D_004 mismatch)
- ICSE class8/ch07: Section A had 6 stray strings + wrong correct field — fixed (05 Jun 2026)

### questions.js FOLDER_MAP (updated 05 Jun 2026)
- Lookup order: `FOLDER_MAP["${board}_${cls}"]` → `FOLDER_MAP["${cls}"]` → `{}`
- `"cbse_8"` key: CBSE class 8 grouped folders (ch08/12/13 in ch01 folder, ch09/14 in ch02, etc.)
- `"icse_8"` key: ICSE class 8 — 1:1 mapping ch01-ch21 (separate from CBSE class 8 due to folder grouping conflict)
- `"9"` key: CBSE + ICSE class 9, ch01-ch12
- `"7"` key: CBSE ch01-ch08 + ICSE ch01-ch22 (expanded 05 Jun 2026)
- `"6"` key: CBSE ch01-ch10 + ICSE ch01-ch28 (added 05 Jun 2026; CBSE class 6 was missing entirely)

## Games (updated 05 Jun 2026)
- **Confirmation dialog**: before starting any game, shows coins owned / cost / time remaining / coins after — student must confirm
- **Game time D1 sync**: `rishi_game_sessions` key pushed to D1 every 30s during play and on end/time-up
- **Chess**: see Chess section above (Stockfish AI, not puzzles)
- DAILY_MAX = 900 seconds (15 minutes) shared across all games per day
- `todayKey()` = `rishi_game_time_YYYY-MM-DD` in localStorage

## D1 Sync — rishi-sync.js (updated 04 Jun 2026)
**SYNC_EXACT** (full key synced):
`rishi_chapter_progress`, `rishi_explain_sessions`, `rishi_practice_sessions`, `rishi_break_log`, `rishi_error_log`, `rishi_hour_pattern`, `rishi_heatmap`, `rishi_exam_scores`, `rishi_progress`, `rishi_active_chapters`, `rishi_plans`, `rishi_coins`

**SYNC_PREFIX** (key prefix synced):
`rishi_explain_done_`, `rishi_practice_done_`, `rishi_chapexam_done_`, `rishi_exam_score_`, `rishi_exam_attempts_`, `rishi_plans_`

**Sync reliability (04 Jun 2026):**
- All fetch calls use `keepalive: true` — requests survive page navigation/browser close
- Periodic `pushAll()` every 30s — catches any failed individual pushKey calls
- `beforeunload` pushAll — last-chance push on tab/browser close
- `?v=2` added to `src="/rishi-sync.js"` across all 363 HTML pages — forces cache bust on student devices
- `public/_headers` file sets `Cache-Control: no-cache` for rishi-sync.js, rishi-core.js, rishi-presence.js, error-reporter.js

**Auto practice session logging:**
When `rishi_practice_done_{chId}` is first set to "1", the interceptor auto-creates/updates `rishi_practice_sessions[chId] = {count, lastDate}` and pushes to D1.

**NOTE:** `rishi_chapter_progress` is NEVER written by any practice or explain page. `renderPracticeStats()` in parent.html reads `rishi_explain_sessions` (explain session counts) and `rishi_practice_sessions` (practice session counts + lastDate) — NOT `rishi_chapter_progress`.

## Exam Score Storage (rishi-core.js — updated 04 Jun 2026)
- Best score: `rishi_exam_score_{chIdStr}` (number, out of 100)
- Attempt count: `rishi_exam_attempts_{chIdStr}` (number)
- Done flag: `rishi_chapexam_done_{chIdStr}` = "1"
- Break log entry format: `{date, time, type, secs}` — "type" = reason (Water/Washroom/etc), "secs" = duration
- **`_rishiPushExamKeys(chIdStr)`** — called by both `rishiSaveExamScore` and `rishiMarkChapExamDone`; pushes all 3 exam keys directly to D1 with keepalive, independent of rishi-sync.js. This is the PRIMARY push for exam scores.
- `exam.html` now includes `rishi-sync.js?v=2` as first script — was missing entirely before 04 Jun 2026 (exam scores NEVER reached D1 before this fix)

## Admin Panel Structure (updated 06 Jun 2026)
- **Tabs:** Dashboard | Exams | Questions | Student | Logs | Deploy | Users
- **Class bar:** Board toggle (CBSE / ICSE) → then class buttons 6/7/8/9 grouped by board
- `activeAdminClass` + `activeBoard` drive all tabs
- `ALL_CLASS_CH` — chapter data for all classes including ic6/ic7/ic8/ic9
- `QB_CHAPTERS` — question bank chapter lists for all classes including ICSE
- `TOPIC_EXAMS_BY_CLASS` — topic exam entries for CBSE 6/7/8/9 + ICSE ic6/ic7/ic8/ic9
- `SAMPURNA_BY_CLASS` — includes board param: `/sampurna-pariksha.html?class=X&board=Y`
- Admin login: `autocomplete="off"` on password field (prevents Windows password manager prompt)

### Admin Credentials Display — REAL password fix (10 Jun 2026)
- **Bug:** Users-tab CREDS row showed student password `Study@Rishi1` (the hardcoded default `DEF_S`/`STUDENT_PASS`) even when the student had changed their password → admin saw a WRONG password. Same risk for parent (`DEF_P`=`rishi2025`).
- **Root cause:** the real password lives in D1 column `pw_override` (written on first-login/change via `save-pw`), but `list_all` (`d1-sync.js`) returned only the `data` JSON — never `pw_override`. admin.html then read overrides only from the admin browser's LOCAL `rishi_pw_overrides`, falling back to the hardcoded default when (as usual) there was no cached entry.
- **Fix:** `list_all` now selects `username, role, data, pw_override`, builds a username→pw_override map, and attaches `_studentPw` + `_parentPw` (parent override looked up from the parent's own row) to each student registration. admin.html `buildUsers` now does `r._studentPw || pwOv[...] || DEF_S` (and `_parentPw` for parent) so D1's authoritative password wins. After deploy: click **Load from D1** to see true passwords.
- **Board detection in Questions tab:** `String(qbActiveClass).charAt(0)==='i'` → icse, else cbse
- **ICSE class number extraction:** `String(qbActiveClass).slice(2)` → '6','7','8','9'
- **Student tab:** Shows picker of all registered students → click → dynamic progress display with per-chapter ↗ open buttons
- **Users tab row buttons:** Explain/Practice/Chapter Exam "Open" buttons resolve to **first built page** for that student's class (via `ALL_CLASS_CH[classKey]`), NOT syllabus
- **Users sync:** Auto-loads from D1 on login; "☁ Load from D1" button on Dashboard + Users tab
- **Logs tab:** Fetches break + error logs from D1 (`get_logs` action); student filter dropdown
- **Reports tab (Logs):** Shows user-submitted error reports; clicking a row expands detail with `ai_verdict` (AI plain-language check result) in green/red box; `typeColors` includes `Wrong Question/Answer` and `Registration Issue`
- **Error log detail:** "Details" button now auto-calls `/api/fix-error` and shows plain English explanation (not raw stack trace); "Explain Again" button re-triggers the call
- **AI verdict status values:** `confirmed_correct` (green), `confirmed_wrong` (red), null (not yet checked)
- **Auto-refresh pause (06 Jun 2026):** Clicking Details or Copy in System Errors OR User Reports pauses the 10s auto-refresh. Pulse dot in header turns amber. Clicking any `↺ Refresh` button resumes auto-refresh + triggers immediate refresh.
- **User Reports list (06 Jun 2026):** Fixed reports are hidden from the list — only pending shown. Summary counts (Total/Pending/Fixed) still shown at top. "All reports marked fixed!" shown when none pending.
- **Dashboard Registered Students (04 Jun 2026):** Student ID and Parent ID are plain text — NOT clickable links. Open buttons (Explain/Practice/Exam) remain.
- **Quick Actions (04 Jun 2026):** Two primary buttons — "Student Login Page" and "Parent Login Page" (both → /login.html). Secondary: Landing, Register, Sync All to D1.
- **buildDashboard auto-loads from D1** if registrations list is empty on load.

### d1-sync.js Actions
| Action | Purpose |
|--------|---------|
| `set` / `get` | Progress sync per student (`get` returns ALL keys for studentId) |
| `register` | Save student + parent account |
| `find-account` | Login lookup by username |
| `find-by-mobile` | Forgot credentials lookup |
| `save-pw` | Password override |
| `update-profile` | Update student/parent fields |
| `list_all` | Return all student registrations (admin) |
| `get_logs` | Return break + error logs for all students (admin) |
| `store-admin-code` | Save ARISHI-* referral code |
| `store-referral` | Save parent referral code |
| `validate-referral` | Check if code is valid/unused |
| `redeem-referral` | Mark code as used |
| `log-session` | Log a login event to `rishi_sessions` table — called fire-and-forget from login.html on every successful login |

## Login — Student/Parent toggle (login.html — 10 Jun 2026)
- **One shared `login.html`** for both roles, **Username + Password** (the username IS the ID: student `RISHI-…`, parent `PARENT-…`). There is no separate parent login page.
- **Explicit role toggle added** (was: role guessed from `parent-` prefix → the old source of parent-portal confusion). Two buttons `#roleStudent` / `#roleParent` set `window._loginMode`. Default `student`.
- `setLoginMode(m)` highlights the active button (gold-pale bg) + swaps the username placeholder. `handleLogin()`'s `isParentLogin` now = `(_loginMode==='parent') || (id starts 'parent-')` — toggle is authoritative, prefix is a safety net.
- **Mismatch guard:** after the account resolves, if `account.role !== _loginMode` → error "This is a {Student/Parent} account, tap that tab" + auto-switches the toggle + clears password. Stops wrong-portal logins.
- Redirects with `?role=parent|student` preselect the toggle; first-login (set-password) panel hides the toggle.
- Routing unchanged: parent → `/parent.html`, student → `/syllabus.html`. Parent path still builds the account from D1 `find-account` (Rule 27).

## Parent Portal — Architecture (parent.html — updated 06 Jun 2026)
- **Auth:** sessionStorage `rishi_parent_student_id` = student's ID (e.g. RISHI-DABEET-001)
- **Login flow:** ALL parent logins go through `login.html`. `parent.html`'s built-in `#login-screen` is dead code — `checkAuth()` always redirects to `/login.html` when not authenticated.
- **Login fix (04 Jun 2026):** For PARENT-xxx accounts, `handleLogin()` in login.html ALWAYS calls D1 `find-account` to get the correct `studentUsername` from D1 registration data — bypasses `findAccount()` retry which had a hardcoded PARENT-xxx path that returned parent's own username as studentId on clean devices.
- **Bad studentId guard:** `checkAuth()` detects if `rishi_parent_student_id` starts with `'parent-'` → clears session → redirects to `/login.html?err=auth`
- **Plans:** saved via explicit `fetch('/d1-sync', {action:'set', studentId, key, value})` — NOT via rishi-sync.js interception (wrong identity on parent device)
- **Data load (04 Jun 2026):** `initMainPortal()` shows "Loading from cloud…" then calls `loadStudentFromD1` FIRST before rendering — cloud-first, no stale localStorage paint
- **10s poll:** re-fetches D1 on every tick (was just re-rendering from stale localStorage before)
- **Performance tab reads (04 Jun 2026):**
  - Explain done/practice done/exam done: from `rishi_explain_done_`, `rishi_practice_done_`, `rishi_chapexam_done_` ✅
  - Explain sessions: from `rishi_explain_sessions[chId]` ✅
  - Practice sessions + last date: from `rishi_practice_sessions[chId]` ✅
  - Exam score inline: from `rishi_exam_score_` ✅
  - `rishi_chapter_progress` is NOT used — it's never written by student pages
- **Coins display:** Current balance from `rishi_coins`; Total Earned = balance + redeemed (calculated); Redeemed = written only when parent clicks Reset Coins
- **Mobile notifications:** Requests Notification API permission on load; fires browser notifications for student online/offline, break taken, new chapter/page
- **Badge:** shows student first name + ID in two-line format

### Study Plan — Modify Modal (updated 06 Jun 2026)
- **`modifyPlan(planId)`** — opens modal with:
  - One **Plan Start Date** input at top (`#plan-global-start`) — applied to ALL chapters' `startDate` on save
  - Per-chapter rows: checkbox (include/exclude) + **Deadline** date input (`data-date-chid`) — shown only when checked
  - `onPlanChToggle(cb)` — toggles row highlight and shows/hides the deadline input
- **`saveModifiedPlan(planId)`** — reads `#plan-global-start` for `startDate`; reads `data-date-chid` per chapter for `targetDate`; PRESERVES all existing chapter fields: `id`, `name`, `topic`, `color`, `examId`, `mode` — never rebuilds bare object
- **`renderActivePlans()`** — plan header shows `minStart → maxTarget` across all chapters. Chapter name: reads `pch.name` from stored data, falls back to `CHAPTERS.find(x.id==pch.id).name` when stored name is missing/undefined (self-heals corrupted plan data)
- **Plan chapter data structure:** `{id, name, topic, color, examId, mode, startDate, targetDate}` — ALL fields must be preserved on modify; missing name/topic → look up from `CHAPTERS` array
- **CHAPTERS global** (line ~1185): `var CHAPTERS = []` set in `initMainPortal` from `ALL_CLASS_CHAPTERS[classKey]` — always populated before any plan render

### Study Slots — merged into Study Plan tab (06 Jun 2026)
- **No separate "Study Slots" tab** — slots section lives at the bottom of the Study Plan tab, below Active Plans
- `switchTab('plan')` calls `renderSlots()` — slots render whenever plan tab is opened
- `savedTab === 'slots'` in sessionStorage is redirected to `'plan'` automatically (handles old sessions)
- `initMainPortal()` calls `window.scrollTo(0,0)` + sets `history.scrollRestoration='manual'` — prevents browser scroll restoration from landing at bottom of page

## Question Shuffle Behaviour (audited 06 Jun 2026 — PENDING CHANGE)
| Page | Behaviour |
|------|-----------|
| **Explain** | `QB[0]` always first; remaining 9 shuffled randomly from rest of QB each attempt |
| **Practice** | Full QB, same questions, same order every attempt — **no shuffle** |
| **Exam** | Static JSON sections A→E, same 52 questions, same order every attempt — **no shuffle** |

**TODO (next session):** Add shuffle to Practice and/or Exam so repeat attempts feel fresh.

## Bypass System
- Key: `rishi_admin_bypass` — **sessionStorage ONLY** (never localStorage)
- Flow: admin `openPage()` appends `?bypass=1` → `rishi-core.js` IIFE detects → sets sessionStorage
- `syllabus.html` has LOCAL copies of done-check functions — bypass fix must be applied there separately (not just rishi-core.js)
- Admin `openAsStudent()` sets `rishi_current_student` localStorage + `rishi_admin_bypass=1` sessionStorage

## Exam Pages (topic-exam, sampurna)
- Both read `board` exclusively from URL params — never from localStorage
- Admin buttons must include `&board=cbse` or `&board=icse` in the URL

## Practice Pages — Rishika Avatar (all 137 pages, CBSE + ICSE)
- Right panel: `rishika-panel` div with speech bubble + `<img id="rishika-img">` + copy note
- Images in `/images/rishika/sprites/`: Good Morning.png, Observing.png, Naughty.png, Celebrating.png, Angry.png
- **Image mapping:** greeting→Good Morning, neutral→Observing, taunt→Naughty, celebrate→Celebrating, angry→Angry
- **Behaviour:** page load shows Good Morning 4s → Observing; correct→Celebrating 3s; wrong→Naughty 3s; 5-min break timeout→Angry 6s
- `setRishika(expr, txt)`: `angry/break`→`rAngry()`, `celebrate/praise`→`rHappy()`, `thinking/disappointed`→`rThink()`
- TTS: browser `speechSynthesis`, female voice list (`Riya,Heera,Priya...`), pitch 1.15, regex fallback for female voices
- Class 7/9 use external `rishi-core.js` + minified inline TTS; Class 6/8/ICSE use multi-line inline TTS
- **exam.html has NO avatar** (removed 24 May 2026) — 2-column layout only

## ICSE Explain/Practice Page Specifics
- `CHAP_ID = 'ic6_N'` / `'ic7_N'` / `'ic8_N'` / `'ic9_N'` (string, not integer)
- Progress keys: `rishi_explain_done_ic6_N`, `rishi_practice_done_ic8_N`, etc.
- Back button: `location.href='/syllabus.html?board=icse&class=6'` (not plain `/syllabus.html`)
- TTS-chained animation (not fixed timers)
- `rishiCheckPlan()` removed from ICSE pages

## Error & Break Logging (rishi-core.js — updated 04 Jun 2026)
- `rishiLogBreak(type, secs)` — logs to `rishi_break_log`; entry: `{date, time, type, secs}`
- `window.onerror` + `unhandledrejection` → logs to `rishi_error_log` with studentId, page, message, stack
- Both keys sync to D1 via rishi-sync.js
- Admin Logs tab fetches all students' data from D1 via `get_logs` action
- **`openGames()` patch (04 Jun 2026):** rishi-core.js `load` listener now also patches `openGames()` — logs break with type `'Reason (Games)'` BEFORE navigating to `/games/games.html`. Previously `endBreak()` was never called when student chose games from break menu, so no break entry was ever written.

## Error Reporter Widget — error-reporter.js (02 Jun 2026)
Injected on all pages **except** `/admin` and `/landing`. Behaviour varies by page type:

| Page type | Form fields | Category buttons |
|-----------|-------------|-----------------|
| `/register` (+ payment) | Editable name + phone inputs (10-digit limit on phone) | None — just description box |
| `/parent` | Auto-fill from `rishi_current_student` JSON (read-only) | None — just description box |
| Student pages (explain, practice, exam, syllabus) | Auto-fill from `rishi_current_student` JSON (read-only) | Not in Syllabus / Wrong Answer / Wrong Question/Answer / Others |

**Student data source:** `localStorage.getItem('rishi_current_student')` → JSON with `studentName`, `class`, `board`. NOT flat keys.

**Exam page AI verify flow:** When student submits "Wrong Question/Answer" or "Not in Syllabus" on exam.html:
1. Calls `/api/verify-question` with current question data from `window.allQ[currentIdx]` + `window.CH_INFO`
2. If AI says **correct** → shows green bubble "This question is correct — [reason]"; no skip
3. If AI says **wrong** → shows message, auto-skips to next question (`window.nextQuestion()`), pushes replacement question to `window.allQ`; verdict saved in D1

**Practice page flow:** unchanged — fires `rishi-report-submitted` event → queue reorder (flagged question moves to end)

**D1 table:** `rishi_error_reports` — columns: id, name, class, board, phone, page_url, page_name, report_type, description, screenshot, status, submitted_at, `ai_verdict` TEXT, `ai_status` TEXT

## verify-question.js — /api/verify-question (02 Jun 2026)
- POST: `{ reportId, questionText, optionA-D, correctOption, chapter, cls, board, reportType }`
- Calls gpt-4.1-mini to verify question correctness; if wrong → also generates replacement MCQ
- Updates D1 report with `ai_verdict` (plain language) + `ai_status` (`confirmed_correct` | `confirmed_wrong`)
- Returns: `{ isCorrect, plainReason, replacementQ }` — replacementQ has `{ text, a, b, c, d, correct }`

## Landing Page — landing.html (03 Jun 2026)
- **6 slides** (r0–r5): r0=Math particle animation, r1=Rishika intro, r2=RISHI name, r3=features carousel, r4=affordability, r5=founder letter/register
- Navigation: `goNext()` allows `cur<5`; `getHashPage()` accepts 0–5; counter shows `01/06`–`06/06`; 6 dots
- `render()`: cur 0→r0, 1→r1, 2→r2, 3→r3, 4→r4, 5→r5
- "Skip to Register" button = `go(5)` → jumps to slide 5 (r5 with register button)
- `error-reporter.js` is NOT included on landing.html

### Slide 0 — Story Reveal + Math Particle Animation (03 Jun 2026, updated 03 Jun 2026)
- **Background:** pitch dark green-black (`#000a03`); background fade alpha `(pi>=9?.10:.44)` — high alpha keeps rain chars readable as individual glyphs
- **Story reveal before RISHI:** 4 lines assemble sequentially via particle animation, then RISHI forms bigger in center
  - Line 1: "It's a Father's Promise" — black thick stroke + green inner stroke + white fill + green glow
  - Lines 2-4: white fill + dark stroke (6px black + 2px green) + white glow — NOT pale green
  - RISHI: black stroke + bright gold fill + gold shadowBlur=28 glow. NO red stroke.
  - Tagline "Not a Tutor. A Companion." — white fill + gold glow
- **Phase sequence (14 phases, SLOW — ~68s total):** rain_start(2s) → l0in(9s) → l0hold(5s) → l1in(7s) → l1hold(4s) → l2in(7s) → l2hold(4s) → l3in(8s) → l3hold(4s) → rin(8s) → rhold(10s) → rdist(2.2s) → rexpl(0.9s) → rfree(8s) → wraps to rin
- **PD array:** `[2000,9000,5000,7000,4000,7000,4000,8000,4000,8000,10000,2200,900,8000]`
- **Particle system:** NR rain particles (sz 15-22px, vy 0.28-1.13), TP assembly particles (sz 18-26px). Rain alpha base 0.22.
- **Hold phases (pi=2,4,6,8):** TP particles with targets are invisible (return early) — drawLine renders crisp text only, no smudge
- **RISHI assembly:** lerp 0.065 (slower than default 0.085)
- **Pixel sampler:** `samplePts(txt, fs, cx, cy)` — `step = Math.max(3, √(W×H)/110)`
- **Mobile:** smaller font scales; 130 rain particles
- **Animation control:** RAF + token pattern (`rainInterval = myToken`)

### Background Music — landing.html (03 Jun 2026)
- **File:** `/audio/bg-music.mp3` (~2.9MB, ~90-180s)
- **CRITICAL:** `<audio>` element is AFTER `</script>` tag — `getElementById` returns null. Audio element MUST be created via `new Audio()` in the IIFE, not looked up from DOM.
- **Flow:** IIFE creates `new Audio()`, sets `muted=true`, calls `a.play()`. Chrome blocks `<audio>` muted autoplay (muted exception is VIDEO only, not audio). Falls back to `mousemove/touchstart/scroll/click` event listeners.
- **`bgMusicUnmute`** set SYNCHRONOUSLY (not inside `.then()`) — unmutes + plays at pi===1 (first letter)
- **`bgMusicFadeOut`** called at pi===10 (rhold) — fades volume over ~1.4s then pauses; resets `started=false` for next cycle
- **Click required on Chrome** — this is a hard browser limitation, not a code bug. Cannot be fixed without user gesture.
- **Stop-on-navigate (09 Jun 2026):** music IIFE adds `stopAudio()` (pauses + resets `currentTime=0`, also calls `stopFatherVoice()`) on `window.beforeunload`, `window.pagehide`, and `document.visibilitychange`(hidden). FIX detail: `pagehide` is a **window** event — was wrongly attached to `document` first (never fired); must be `window.addEventListener('pagehide',...)`. Prevents bg-music continuing onto the next page.

### Title — landing.html (09 Jun 2026)
- `<title>` = **"RISHI — Smart AI Companion"** (was "Smart AI Tutor"). Brand line everywhere is Companion, not Tutor.

### Favicon — random Ganesha (09 Jun 2026)
- Tab icon = **random one of 8 Ganesha PNGs** (`public/icons/fav-1.png`…`fav-8.png`, 64×64 RGB), chosen fresh per page load. NO "R" mark, NO bolt, nothing added to page body.
- Injector block `RISHI-FAVICON-GANESHA-V2` (inline `<script>` in `<head>` of 303 pages): on `DOMContentLoaded` removes ALL existing icon links, then appends one random `/icons/fav-N.png?v=2` LAST so nothing overrides it.
- **Root-cause of the long-running "globe" bug (fixed 09 Jun):** the 8 PNGs were sitting in `public/rishi-ganesha-favicon/icons/` but the injector references `/icons/fav-N.png` → 404 → globe. Fix = copied the 8 files into `public/icons/`. Injector was always correct; only the file location was wrong.
- No `/favicon.ico` or `/favicon.svg` at deploy root (would re-introduce a default/bolt).
- **Cleanup (09 Jun 2026):** deleted redundant `public/rishi-ganesha-favicon.zip`, `public/rishi-icons.zip`, and source folders `public/rishi-ganesha-favicon/`, `public/rishi-icons/` (old rejected "R" set + 1254px source logos — recoverable from git history). Also purged 103 stray `*.bak` files from disk (they were gitignored) and the generated `audit_explain_report.txt`. The 8 live favicons in `public/icons/` are the only favicon assets kept.

### Responsive Design — landing.html (03 Jun 2026)
- **Mobile ≤640px:** feat carousel collapses to single card (`.fl`, `.fr` hidden), Rishika image stacks above text (`.r1-row` flex-direction:column, `.r1-img-wrap` full width), topbar tagline hidden (`.topbar-sub`), padding tightened, action buttons wrap to 2 rows
- **Tablet 641–900px:** feat carousel side panels narrow 160px→110px, content/card padding reduced
- **Class hooks added to JS-rendered elements:** `r1-row`, `r1-img-wrap`, `r5-inner`, `topbar-sub` — targeted by media queries
- **`#content` padding cleared inline** in `render()` so media queries take effect on slides 1–5

### Responsive Design — register.html (03 Jun 2026)
- Already had `@media(max-width:600px)` — enhanced with:
- Logo shrinks to 28px, header padding tightened, tagline smaller
- Amount display stacks vertically (`flex-direction:column`) on mobile; amount value 26px
- Payment options: 2-column (was 1); card padding 20px 16px; buttons full-width
- OTP button and main `.btn` resize on small screens

### Parent Portal Header + Profile Fixes (03 Jun 2026)
- **Blogs tab added** to tab-bar — links to `/parent-blogs.html`
- **Header title** dynamically shows parent login ID (e.g. `parent-priyanka-002`) when logged in via parent credentials; saved as `rishi_parent_login_user` in sessionStorage during Step 2 login
- **Badge fallback**: if `rishi_parent_student_name` is empty or 'Student', tries `rishi_registrations` by `parentUsername` before falling back to 'Student'
- **showProfilePanel reg lookup**: now tries `studentUsername` first, then `parentUsername` match
- **showProfilePanel D1 refetch**: if `reg.studentName` empty on open, silently calls `find-account` on D1, populates fields, and refreshes localStorage

### Responsive Design — parent.html (03 Jun 2026)
- Already had `@media(max-width:700px)` and `@media(max-width:380px)` — enhanced + bug fixed:
- **Bug fixed:** stray `.hdr-badge{max-width:100px;}` and orphan `}` were outside any media query — removed
- **≤700px additions:** card padding → 16px 12px; login-box padding → 28px 20px
- 3-column grids → 2-column: `.ch-stats-row`, `.ex-mini-grid`, `.break-stat-row`, `#live-stats` (inline style overridden with `!important`), `.cal-months`, `.exam-grid`
- Profile Class+Board row (JS-generated): added `id="prof-grid2"` → collapses to 1-col on mobile
- **≤380px:** `.ch-stats-row`, `.break-stat-row`, `#live-stats` collapse to 1-col; badge narrows to 100px

## Rishika Chat Box (exam.html only, Phase 1 — 01 Jun 2026)
- **Endpoint:** `functions/api/chat.js` → `/api/chat` (POST)
- **Frontend:** `public/rishi-chat.js` — injected into left panel below score box
- **Included in:** exam.html only (practice pages = Phase 2 via patch script)
- **Daily limit:** 20 messages per student per day, tracked in D1 table `rishi_chat_usage`
- **Context passed:** chapter name, topic, class, board, current question text + options (from `window.CH_INFO` + `window.allQ[currentIdx]`)
- **System prompt:** explains concepts, refuses direct answer reveals, max 3 sentences
- **UI:** dark theme (gold accents), collapsible toggle, 180px scrollable messages area

## Chess — public/games/chess/index.html (05 Jun 2026)
- **REPLACED**: Puzzle-based game replaced with full **Stockfish AI chess** (world #1 open-source engine)
- Loads Stockfish 10.0.2 from CDN via blob Web Worker (cross-origin safe): `cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js`
- Uses existing `chess.js` (move validation) + `chessboard.js` (visual board) already in the folder
- 3 difficulty levels: Easy (skill 2, 150ms), Medium (skill 10, 600ms), Hard (skill 20, 1500ms)
- **Game state persistence**: saves `rishi_chess_state` to localStorage on every move. On next load, "Resume your last game?" banner appears. 15-min timer managed by parent `games.html` as before.
- Undo button undoes both player move + engine response
- Flip board switches player colour; engine responds if it's now engine's turn

## Critical Rules
0. **STANDING INSTRUCTION (09 Jun 2026 — owner's explicit order):** NEVER state what a file does, or claim a feature is missing/removed/present, without reading that exact file in the CURRENT session. NEVER generalize one file's behaviour to other files — each explain/practice/exam page is independently built. When asked "who/when changed X," answer from `git log`/`git blame`, NEVER from assumption. If something is not verified, say "I haven't checked" — do not assert. Stating an assumption as fact is the single worst failure mode here.
   - **NEVER ASSUME ANYTHING** — not the feature's name (search the owner's paraphrase AND real button text), not its location (a feature may live in a SHARED js like `explain-helper.js`, not the page HTML), not the model version. Search the WHOLE repo (shared JS/CSS too), not just the obvious folder. Absence of results under one search term is NOT proof the feature doesn't exist — broaden the search before concluding.
   - **BE CONCISE / TO THE POINT.** No unnecessary detail, no padding, no restating. Answer what was asked, in the order asked.
1. NEVER assume file path/content — always Read the actual current file first
2. NEVER deliver partial patches — always complete files or targeted edits
3. `git add .` from `D:\rishi` (NOT `D:\rishi\public`)
4. **Always end session: update this CLAUDE.md → git add → commit → push**
5. Smart apostrophes in JS = syntax crash — use `\'` or `&#39;`
6. `functions/tts.js` at repo ROOT — NOT inside `public\`
7. `data-handling` folder uses hyphen not underscore
8. `rishi_admin_bypass` — sessionStorage ONLY, never localStorage
9. `generate.py` PROTECTED — never delete (`D:\rishi\public\generate.py`)
10. OpenAI only — never Gemini
11. `parent.html` is 2700+ lines — always Read before editing
12. Admin Chapters tab REMOVED 15 May 2026 — never re-add
13. Any bypass fix to `rishi-core.js` must ALSO be applied to `syllabus.html`
14. `sessionStorage` NOT shared across tabs — always pass `?bypass=1` in URL
15. Python build scripts: run from `D:\rishi\public\`, use bash syntax for env vars on Windows (`OPENAI_API_KEY='...' python ...`)
16. ICSE board detection in admin Questions tab: `String(qbActiveClass).charAt(0)==='i'` — never hardcode `=== 'ic7'`
17. `syllabus.html` classKey must include ic6: `(STUDENT_BOARD==='icse'&&STUDENT_CLASS===6)?'ic6':...`
18. Never commit API keys — API key goes in Cloudflare env vars, not in any file
19. Parent portal plans use explicit D1 push (not rishi-sync.js) — rishi-sync.js uses wrong student ID on parent device
20. `error-reporter.js` reads student identity from `rishi_current_student` JSON — NEVER flat keys like `rishi_student_name`
21. `error-reporter.js` excluded from `/landing` entirely — never add it back there
22. `fix-error.js` prompt is plain English for non-technical admin — do not revert to tech/developer language
23. `verify-question.js` defaults to `isCorrect: true` on AI failure — prevents wrongly skipping valid questions
24. `exam.html` MUST have `<script src="/rishi-sync.js?v=2"></script>` as FIRST script — was missing entirely before 04 Jun 2026; exam scores never reached D1 without it
25. When bumping rishi-sync.js version, update `?v=N` across all 363 pages via: `find public -name "*.html" -exec sed -i 's|rishi-sync.js?v=OLD|rishi-sync.js?v=NEW|g' {} \;`
26. `rishi_chapter_progress` is NEVER written by student pages — do NOT use it as a data source in parent performance tab or anywhere else
27. `login.html` `findAccount()` PARENT-xxx path has a hardcoded bug (returns parent username as studentId when no student cached) — for parent logins, ALWAYS build account directly from D1 `find-account` response data, never call `findAccount()` retry for parents
28. `parent-blogs.html` has `error-reporter.js` — keep it there
29. Exam left panel uses `.score-box-big` (not `.score-box`) — rishi-chat.js injection checks `.score-box-big` first
30. `rishi-chat.js` toggle button id = `rc-toggle`; exam.html left panel "Ask Rishika" button calls `rcToggle()` directly
31. Exam JSON format: all sections must use `text`/`options {a,b,c,d}`/`correct`/`explanation` — old format `q`/`opts`/`ans` breaks the exam engine
32. questions.js: for `type=exam`, static file is tried FIRST (if chapter is in FOLDER_MAP), then KV — never change this priority back
33. ch07 exam had 5 wrong questions (05 Jun 2026): always verify `correct` field matches computed answer INDEPENDENTLY after writing JSON content
34. Plan chapter objects MUST preserve all fields: `{id, name, topic, color, examId, mode, startDate, targetDate}` — never rebuild as bare `{id, startDate, targetDate, color, examId}`; missing name/topic must be looked up from `CHAPTERS` array not left as undefined
35. `renderActivePlans` reads `pch.name` from stored plan data — if that name is ever `undefined` or the string `"undefined"`, fall back to `CHAPTERS.find(x.id==pch.id).name`; never trust stored plan name blindly
