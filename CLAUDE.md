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
- Parent: Priyanka — ID: `PARENT-PRIYANKA-002`, password: `rishi2025`
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
| `functions/tts.js` | TTS at repo ROOT, not in public\ |
| `public/rishi-core.js` | Shared logic, IIFE detects `?bypass=1`; captures JS errors to `rishi_error_log`; logs breaks with studentId |
| `public/rishi-sync.js` | Syncs rishi_* keys to D1 |
| `public/rishi-presence.js` | Session resume for explain + practice |
| `functions/api/fix-error.js` | AI error diagnosis endpoint — calls gpt-4.1-mini with error context |

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
- Squares exam A7: "from 170" (not 190); A10: fixed all-same options
- Ch18 Story of Numbers: full practice QB + exam JSON rewritten from NCERT

## Build Scripts (in public/)
| Script | Class | Workers | Est. time |
|--------|-------|---------|-----------|
| `build_class6.py` | CBSE 6 | — | — |
| `build_icse_class6.py` | ICSE 6 | 5 parallel | ~20 min |
| `build_icse_class7.py` | ICSE 7 | Sequential | ~5 hrs |
| `build_icse_class8.py` | ICSE 8 | 5 parallel | ~18 min |
| `build_icse_class9.py` | ICSE 9 | 5 parallel | ~13 min |

## D1 Sync — rishi-sync.js
**SYNC_EXACT** (full key synced):
`rishi_chapter_progress`, `rishi_explain_sessions`, `rishi_practice_sessions`, `rishi_break_log`, `rishi_error_log`, `rishi_hour_pattern`, `rishi_heatmap`, `rishi_exam_scores`, `rishi_progress`, `rishi_active_chapters`, `rishi_plans`, `rishi_coins`

**SYNC_PREFIX** (key prefix synced):
`rishi_explain_done_`, `rishi_practice_done_`, `rishi_chapexam_done_`, `rishi_exam_score_`, `rishi_exam_attempts_`, `rishi_plans_`

## Exam Score Storage (rishi-core.js)
- Best score: `rishi_exam_score_{chIdStr}` (number, out of 100)
- Attempt count: `rishi_exam_attempts_{chIdStr}` (number)
- Done flag: `rishi_chapexam_done_{chIdStr}` = "1"
- Break log entry format: `{date, time, type, secs}` — "type" = reason (Water/Washroom/etc), "secs" = duration

## Admin Panel Structure (as of 23 May 2026)
- **Tabs:** Dashboard | Exams | Questions | Student | Logs | Deploy | Users
- **Class bar:** Board toggle (CBSE / ICSE) → then class buttons 6/7/8/9 grouped by board
- `activeAdminClass` + `activeBoard` drive all tabs
- `ALL_CLASS_CH` — chapter data for all classes including ic6/ic7/ic8/ic9
- `QB_CHAPTERS` — question bank chapter lists for all classes including ICSE
- `TOPIC_EXAMS_BY_CLASS` — topic exam entries for CBSE 6/7/8/9 + ICSE ic6/ic7/ic8/ic9
- `SAMPURNA_BY_CLASS` — includes board param: `/sampurna-pariksha.html?class=X&board=Y`
- Admin login: `autocomplete="off"` on password field (prevents Windows password manager prompt)

### Admin Panel Key Behaviours
- **Board detection in Questions tab:** `String(qbActiveClass).charAt(0)==='i'` → icse, else cbse
- **ICSE class number extraction:** `String(qbActiveClass).slice(2)` → '6','7','8','9'
- **Student tab:** Shows picker of all registered students → click → dynamic progress display with per-chapter ↗ open buttons
- **Users tab row buttons:** Explain/Practice/Chapter Exam "Open" buttons resolve to **first built page** for that student's class (via `ALL_CLASS_CH[classKey]`), NOT syllabus
- **Users sync:** Auto-loads from D1 on login; "☁ Load from D1" button on Dashboard + Users tab
- **Logs tab:** Fetches break + error logs from D1 (`get_logs` action); student filter dropdown

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

## Parent Portal — Architecture (parent.html)
- **Auth:** sessionStorage `rishi_parent_student_id` = student's ID (e.g. RISHI-DABEET-001)
- **Plans:** saved via explicit `fetch('/d1-sync', {action:'set', studentId, key, value})` — NOT via rishi-sync.js interception (wrong identity on parent device)
- **Data load:** `loadStudentFromD1(callback)` — fetches ALL keys for student from D1 on every login and tab switch; uses `Storage.prototype.setItem` to write to localStorage without triggering sync back
- **Performance tab:** auto-loads from D1 on tab switch; manual "☁ Load from Cloud" button also available
- **Exam scores display:** reads `rishi_chapexam_done_` + `rishi_exam_score_` + `rishi_exam_attempts_` per chapter (NOT `rishi_exam_scores` array — that key is never written)
- **Badge:** shows student first name + ID in two-line format

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

## Error & Break Logging (rishi-core.js)
- `rishiLogBreak(type, secs)` — logs to `rishi_break_log`; entry: `{date, time, type, secs}`
- `window.onerror` + `unhandledrejection` → logs to `rishi_error_log` with studentId, page, message, stack
- Both keys sync to D1 via rishi-sync.js
- Admin Logs tab fetches all students' data from D1 via `get_logs` action

## Critical Rules
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
