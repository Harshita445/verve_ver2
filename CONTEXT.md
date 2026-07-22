
# Verve — Canonical Repository Status

Last verified: direct inspection of every backend and frontend source file in
this repository (not inferred, not carried over from prior notes). Anything
not listed here as "Implemented" does not exist in the codebase.

## 1. Backend — Implemented

### Carried over from previous sessions
- Auth API: signup, login, refresh, logout, forgot-password, reset-password
- `GET /api/v1/users/me`
- Practice sessions: create, get-by-id
- Refresh-token rotation with reuse detection
- UserProfile model + endpoints (GET/PUT /profile)
- Onboarding fields on User model (`onboarding_completed`, `onboarding_step`)

### Done this session — prompt bank + impromptu→freestyle rename + model fields
- **`app/data/prompts.py`** (new) — `PROMPT_BANK` with freestyle (one_word, full, creative subtypes),
  debate, interview, storytelling prompts; each entry has `text` and `format`.
- **`app/models/practice_session.py`** — renamed `SessionMode.impromptu` → `SessionMode.freestyle`;
  added `prompt_format`, `debate_side`, `hints_enabled` columns.
- **`app/schemas/practice_session.py`** — `PracticeSessionCreate` accepts `prompt_style` and `hints_enabled`;
  `PracticeSessionRead` exposes `prompt_format`, `debate_side`, `hints_enabled`.
- **`app/schemas/challenges.py`** — added `prompt_format` to `DailyChallengeRead`.
- **`app/api/v1/challenges.py`** — now sources prompts from `PROMPT_BANK`; includes `prompt_format` in response.
- **`app/services/practice_session_service.py`** — `create_session` auto-assigns `debate_side` ("for"/"against")
  for debate mode, resolves `prompt_format` from `PROMPT_BANK`.
- **`alembic/versions/i1j2k3l4m5n6_rename_impromptu_to_freestyle_and_add_columns.py`** (new) — migration.

## 2. Frontend — Implemented

### Carried over from previous sessions
- Landing page (hero with stage SVG, training modes, how it works)
- Auth pages (login/signup with design system styling)
- AuthForm, AuthProvider, apiFetch, middleware
- Onboarding flow (4-step wizard)
- Dashboard (rating, sessions, streak, quick-start)
- Nav with auth-aware links

### Done this session — training mode selection
- **`app/training/page.tsx`** (new) — 4 premium mode cards (Impromptu, Debate,
  Interview, Storytelling) with descriptions, benefit tags, hover lift, and
  auto-navigation to setup page.

### Done this session — setup screen
- **`app/training/setup/page.tsx`** (new) — configurable prep time (15/30/60/90/120s)
  and speaking time (60/90/120/180/300s) via segmented button groups. Summary display.
  Creates session via API and redirects to curtain page.

### Done this session — curtain transition animation
- **`components/curtain/CurtainOverlay.tsx`** — rewritten with `translateX` slide-open
  (natural draw motion, not squish). Textured burgundy fabric with 7-stop gradient,
  vertical fold shadows, gold accent stripes, draped top contours, gold trim bar.
- **`components/curtain/StageReveal.tsx`** — warm spotlight, podium + speaker silhouette,
  15-bar animated waveform (pulsing in sequence), microphone SVG icon, pulsing green
  recording indicator.
- **`app/training/curtain/[sessionId]/page.tsx`** — full sequence: prep countdown
  (animated numbers) → curtains open in 1.2s → session status set to "recording" →
  stage + waveform + mic animate in over 3s → redirects to recording page.

### Done this session — recording experience
- **`hooks/useAudioRecorder.ts`** (new) — custom hook wrapping MediaRecorder + Web Audio
  API AnalyserNode. Provides: microphone permission flow, real frequency data (64 bins),
  recording state machine (idle → requesting → denied → ready → recording → paused →
  stopped → error), elapsed time tracking, audio blob capture, pause/resume/stop.
- **`components/recording/Waveform.tsx`** (new) — canvas-rendered live waveform from
  real microphone input. 64 rounded gold bars with gradient fill, glow on active bars,
  shrinks when silent, high-DPI support.
- **`components/recording/RecordingControls.tsx`** (new) — bottom bar with recording
  status indicator, remaining/elapsed timers (tabular-nums), pause/resume/stop buttons
  with SVG icons.
- **`components/recording/PromptCard.tsx`** (new) — centered card showing mode badge,
  difficulty level, quote-styled prompt text, prep/speak time metadata.
- **`components/recording/MicPermission.tsx`** (new) — permission request card with
  microphone icon, explanation text, allow/cancel buttons, Framer Motion entry.
- **`app/training/record/[sessionId]/page.tsx`** (new) — full-screen recording layout:
  top section (prompt card), center (waveform canvas, 60% width), bottom (controls bar).
  Subtle radial gold spotlight background. Loads session data, auto-starts recording
  after permission, on stop: updates session status to "processing" with duration,
  redirects to feedback page.

### Done this session — progress page
- **`components/dashboard/RadarChart.tsx`** (new) — SVG radar/spider chart with 5-level
  grid, 6 skill axes (Structure, Relevance, Evidence, Persuasion, Confidence, Examples),
  gold data polygon and points, axis labels.
- **`components/dashboard/StatCard.tsx`** (new) — animated stat card with label,
  value, subtitle, optional gold accent, staggered Framer Motion entry.
- **`app/progress/page.tsx`** (new) — progress dashboard: 4 stat cards (rating,
  sessions, streak, best mode), radar chart, recent sessions list with rating changes.

### Done this session — leaderboard
- **`components/rankings/LeaderboardTable.tsx`** (new) — ranked table with columns:
  rank (medal styling for top 3), participant (avatar initials, name, primary strength),
  rating, streak (lightning icon). Current user highlighted with gold accent.
- **`app/rankings/page.tsx`** (new) — rankings page with title, table, footer metadata
  (daily update, minimum sessions).

### Done this session — nav + middleware updates
- **`components/shared/Nav.tsx`** — updated with links to Dashboard, Practice, Progress,
  Rankings; active route highlighting with gold color.
- **`middleware.ts`** — now protects `/progress` and `/rankings` in addition to
  `/dashboard`, `/onboarding`, `/training`.
- **`lib/api/client.ts`** — added session types (`SessionMode`, `SessionStatus`,
  `PracticeSession`, `SessionListResponse`, `SessionCreatePayload`,
  `SessionUpdatePayload`) and API methods (`createSession`, `getSessions`,
  `getSession`, `updateSession`).

## 3. Accurate Summary Table

| Area | Status |
|---|---|
| Signup / Login / Logout / Refresh / Forgot / Reset (backend) | Implemented |
| Refresh token rotation + reuse detection | Implemented |
| GET /users/me | Implemented |
| User onboarding fields on User model | Implemented |
| UserProfile model + endpoints (GET/PUT /profile) | Implemented |
| Onboarding UI (4-step wizard) | Implemented |
| Dashboard UI (rating, session count, streak, quick-start) | Implemented |
| Practice session create + get-by-id | Implemented |
| Practice session list + update (state transitions) | Implemented |
| Prompt bank (freestyle subtypes, debate, interview, storytelling) | Implemented |
| SessionMode impromptu → freestyle rename | Implemented |
| prompt_format / debate_side / hints_enabled on sessions | Implemented |
| Landing page hero with stage SVG | Implemented |
| Training modes section | Implemented |
| Training mode selection page | Implemented |
| Session setup screen (prep/speak config) | Implemented |
| Curtain transition animation | Implemented |
| Recording screen (live waveform, controls) | Implemented |
| Progress page + radar chart | Implemented |
| Leaderboard / rankings page | Implemented |
| Auth pages with design system styling | Implemented |
| Recording / audio upload / AI evaluation | Not started (audio capture done, upload pending) |
| Feedback page | Not started |
| Automated tests | None exist |
| Email delivery for password reset | Not implemented (dev-mode console log only) |

## 4. Recommended Build Order (next work, in dependency order)

1. Feedback page — rating reveal, skill breakdown, annotated transcript review.
2. Storage integration — signed upload URL endpoint, direct-to-bucket upload from client.
3. Background worker — Celery/arq skeleton with stubbed job that flips status to complete.
4. Whisper transcription — wired inside worker, transcript stored and rendered.
5. Feedback engine — OpenAI + Pydantic-scored JSON; feedback_reports table.
6. Rating service — ELO math wired to session completion; ratings history.
7. Prompt library + daily challenges — seeded prompts, challenge card on dashboard.
8. Leaderboard materialization — scheduled rebuild, live rankings from real data.
9. Goals + achievements — CRUD and UI.
10. Email delivery — SMTP integration for password reset.
11. Full error/loading/empty state pass across every screen.
12. Accessibility + mobile recording QA pass.

## Source of Truth Rule
This repository is the only repository that should be modified going
forward. All future milestones must extend existing code and update this
document — and any claim in it must be checked against the actual files,
not carried over from a prior draft.
