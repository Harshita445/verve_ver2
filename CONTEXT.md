# Verve — Project Context (read this first)

This file exists so that any LLM (or human) picking up this repo cold — with
no memory of prior conversations — has everything needed to keep building
correctly. If you are an LLM starting a new session on this repo, read this
file completely before touching any code.

---

## 1. What Verve is

**Product name:** Verve
**Tagline:** "Become a Stronger Communicator."

Verve is a **communication training platform**. Users practice four skills
through structured, repeatable exercises:

- **Impromptu Speaking** — think clearly under pressure, organize thoughts on an unexpected prompt in real time
- **Debate** — build arguments, defend a randomly assigned FOR/AGAINST position, respond to opposing ideas
- **Interview Practice** — realistic interview conversations, structure and confidence
- **Storytelling** — turn ideas into memorable, engaging narratives

The product should feel like **"Duolingo for communication + Strava for
progress + Chess.com for rankings."** Users should feel practice, reflection,
improvement, and progress.

### Hard constraints on positioning — do not violate these

Verve must **never feel like**:
- an AI product
- a chatbot
- a productivity tool / SaaS dashboard

Technology stays invisible. Concretely, this means:
- Feedback copy is written in a communication-coach register ("Your opening
  was strong — you stated your position immediately"), never in
  AI/meta-language ("As an AI, I detected...", "Based on the transcript...").
- The UI never surfaces model names, "AI-generated," confidence scores as
  ML artifacts, etc. The rating, feedback, and rankings are presented as
  earned athletic/game stats, not analysis output.
- This constraint applies to every future feature, not just the feedback
  engine. If you're building a new screen, ask "does this read as a coach or
  as a tool?" before shipping it.

---

## 2. Design system (do not deviate without being asked)

| Token | Hex |
|---|---|
| background | `#140A0A` |
| surface | `#1C1010` |
| card | `#261515` |
| elevated card | `#311A1A` |
| border | `#4A2A2A` |
| primary gold | `#D4AF37` |
| secondary gold | `#E6C866` |
| burgundy primary | `#6E1E2A` |
| burgundy light | `#8A2A38` |
| burgundy dark | `#4A131C` |
| text primary | `#FFFFFF` |
| text secondary | `#D1D1D1` |
| text muted | `#A1A1AA` |

Typography: **Cormorant Garamond** for headings, **Inter** for body,
**Inter SemiBold** for buttons.

These are already implemented as semantic Tailwind tokens in
`verve-web/tailwind.config.ts` (`bg-background`, `bg-card`, `text-gold`,
`bg-burgundy`, etc.). **Always use the semantic token, never a raw hex, in
component code.**

An earlier static HTML/CSS/vanilla-JS prototype established this visual
identity (burgundy/gold, dark theme, radar chart skill breakdown, gamified
stat cards, leaderboard). That prototype is not part of this repo's history
but its visual decisions are what the Tailwind config encodes — preserve
that identity as you build real components.

---

## 3. Full target architecture

The complete production architecture — folder structure, database schema
(ERD), API route design, auth flow, speech processing pipeline, feedback
engine design, ELO-style rating math, state management plan, deployment
plan, and the full 20-step build order — lives in
**[`verve-architecture.md`](./verve-architecture.md)** in this repo root.
Read that file for anything below the summary level. It is the source of
truth for design decisions; this file (`CONTEXT.md`) is the source of truth
for **status** — what's done, what's next, what broke and how it was fixed.

Quick summary of the stack:

- **Frontend:** Next.js 15, TypeScript, TailwindCSS, shadcn/ui, Framer
  Motion, React Query, React Hook Form, Zod — deployed on Vercel
- **Backend:** FastAPI, SQLAlchemy, PostgreSQL, Alembic, JWT auth — deployed
  on Railway
- **Database:** Neon (serverless Postgres)
- **Storage:** S3-compatible (Cloudflare R2 or AWS S3), direct-to-bucket
  uploads
- **Speech:** Whisper API for transcription
- **Analysis:** OpenAI API for the feedback engine (structured JSON output,
  Pydantic-validated)

Two repos in production is the architecture doc's recommendation
(`verve-web`, `verve-api`, independent Vercel/Railway lifecycles). **This
repo currently holds both as subfolders in one place** for ease of handoff
and context-sharing — split them before real deployment, or configure
Vercel/Railway to build from the respective subdirectory (`verve-web/`,
`verve-api/`) if you want to keep them together longer.

---

## 4. What has actually been built so far

### Build Order Step 1 — DONE (repo scaffolding, health-check round trip)

Everything below has been written **and verified working**, not just
scaffolded and hoped-for.

#### `verve-web/`
- Next.js 15 + TypeScript + Tailwind, hand-scaffolded (not via
  `create-next-app` — that CLI timed out in the sandbox this was built in;
  the project was assembled file-by-file instead, which is why it's leaner
  than a default `create-next-app` output — no test framework, no extra
  boilerplate pages yet).
- `tailwind.config.ts` — full design token system, see section 2.
- `app/layout.tsx` — root layout, Cormorant Garamond + Inter via
  `next/font/google`.
- `lib/api/client.ts` — typed `apiFetch` wrapper around `fetch`, reads
  `NEXT_PUBLIC_API_URL`. **Every future call to verve-api should go through
  this**, not raw `fetch`. Auth token attachment and refresh-on-401 retry
  logic still need to be added here once refresh tokens exist.
- `app/page.tsx` — placeholder health-check page.
- `app/api/health/route.ts` — frontend's own health endpoint.
- **Verified:** `npm run build` succeeds (fonts fetch fails only in
  network-locked sandboxes, not on Vercel/normal dev machines).

#### `verve-api/`
- FastAPI + SQLAlchemy + Alembic, full folder structure per the
  architecture doc (`core`, `api/v1`, `models`, `schemas`, `services`,
  `auth`, `db`, `workers`, `alembic`).
- `app/models/user.py` — `User` model: `id` (UUID), `email` (unique),
  `password_hash`, `display_name`, `avatar_initials`, `current_rating`
  (default 1200), `created_at`.
- `app/core/security.py` — JWT create/decode (`python-jose`) and password
  hashing. Uses the `bcrypt` package directly, not `passlib` (see Section 6).
- `app/services/auth_service.py` — signup/login business logic.
- `app/auth/deps.py` — `get_current_user` FastAPI dependency.
- Routes: `POST /api/v1/auth/signup`, `POST /api/v1/auth/login`,
  `POST /api/v1/auth/logout` (stub), `GET /api/v1/users/me` (protected),
  `GET /health`.
- Alembic wired and working; one migration: `create users table`.
- **Verified end to end** against a real local Postgres instance.
- `Dockerfile` exists for Railway deployment.

### Build Order Step 2 — DONE (practice_sessions table + session endpoints)

- `app/models/practice_session.py` — `PracticeSession` model: `id` (UUID),
  `user_id` (FK → users.id), `mode` (enum: `impromptu`, `debate`,
  `interview`, `storytelling`), `prompt_text`, `status` (enum: `pending`,
  `recording`, `processing`, `complete`, `failed`; default `pending`),
  `duration_seconds` (nullable, filled on completion), `audio_url`
  (nullable, filled once storage integration exists), `created_at`,
  `completed_at` (nullable).
- `app/schemas/practice_session.py` — `PracticeSessionCreate` (`mode`,
  optional `prompt_text`), `PracticeSessionRead` (full row incl. `id`,
  `status`, timestamps).
- `app/services/practice_session_service.py` — `create_session`,
  `get_session_for_user` (404s via `PracticeSessionError` if missing OR
  owned by a different user — a session's existence is not leaked across
  users).
- `app/api/v1/sessions.py` — `POST /api/v1/sessions` (protected, creates a
  row owned by `current_user`, status `pending`), `GET
  /api/v1/sessions/{id}` (protected, 404 if not found/not owned).
  Registered on the v1 router.
- Alembic migration: `create practice_sessions table` (FK + both enums as
  native Postgres enum types, `ondelete="CASCADE"` on `user_id`).
- **Verified end to end** against local Postgres: `POST /sessions` with a
  valid token returns `201` with a `pending` row; `GET /sessions/{id}`
  returns the same row; `GET /sessions/{id}` with someone else's token
  returns `404`; `GET /sessions/{id}` with no token returns `401`; unknown
  UUID returns `404`.

### Not built at all yet

Everything past step 2 in the build order: frontend protected-route
middleware/dashboard shell, real landing page and other UI screens, curtain
animation, recording screen, storage/upload, background worker, Whisper
integration, OpenAI feedback engine, rating service, rankings, challenges,
goals, achievements, forgot/reset password, CI/CD. None of these have any
code yet — don't assume partial implementations exist anywhere outside
what's listed above.

---

## 5. Exact next steps (pick up here)

This is the build order from `verve-architecture.md` section 15, with steps
1–2 struck through since they're done:

1. ~~Repo scaffolding, health-check round trip~~ — **DONE, see Section 4**
2. ~~`practice_sessions` table + `POST /sessions` + `GET /sessions/{id}`~~ —
   **DONE, see Section 4**
3. **[NEXT]** Protected route middleware + dashboard shell (empty states
   only) on the frontend. Alternative starting point: finish auth properly
   first (refresh token rotation, forgot/reset password) since right now
   only short-lived access tokens exist with no refresh mechanism — pick
   whichever the person you're working with prioritizes.
4. Port the design system into real Tailwind/shadcn components: landing
   page (hero, training modes, how-it-works, sample feedback, progress,
   daily challenge, rankings, final CTA), training mode selection, setup
   screen. Visual parity with the design system in Section 2, no backend
   wiring beyond what already exists.
5. Curtain sequence (Framer Motion) wired to real session creation.
6. Recording screen: `MediaRecorder` + wavesurfer.js live waveform,
   stop/pause/resume controls, local only (no upload yet).
7. Storage integration: signed upload URL endpoint, direct-to-bucket
   upload, `/sessions/{id}/complete`.
8. Background worker skeleton (Celery or `arq` + Redis) with a stubbed job
   that flips status to `complete` after a delay, to prove the polling UX
   before real AI is in the loop.
9. Whisper integration in the worker job; transcript stored and rendered.
10. Feedback engine (OpenAI + Pydantic-validated JSON schema per
    `verve-architecture.md` section 9); `feedback_reports` table populated.
11. Rating service (ELO math per section 10); `ratings` history table;
    progress chart reads real data.
12. `prompt_library` + `daily_challenges` seeded; challenge card goes live.
13. `leaderboards` materialization job + rankings page reading from it.
14. Goals + achievements CRUD and UI.
15. Forgot/reset password flow.
16. Full error/loading/empty state pass across every screen.
17. Accessibility + mobile recording QA pass (mic permissions differ
    meaningfully on iOS Safari — test there specifically).
18. Rate limiting, monitoring, production secrets rotation.
19. Launch.

For each step: **explain what you're changing and why, show the affected
files, generate the code, then explain how to test it** — this repo has
been built that way so far (every route was hit with a real request before
being called "done"), keep doing that. Don't mark a step complete on the
strength of "it should work" — run it.

---

## 6. Known gotchas (hit these once already, don't re-discover them)

- **`passlib` + modern `bcrypt` is broken.** `passlib==1.7.4`'s bcrypt
  backend does a self-test on import that fails against `bcrypt>=4.1` with
  `ValueError: password cannot be longer than 72 bytes...`. Fix already
  applied: `app/core/security.py` uses the `bcrypt` package directly (with
  manual 72-byte truncation, which is bcrypt's real limit) instead of
  routing through `passlib.CryptContext`. Don't reintroduce `passlib`.
- **`pydantic`'s `EmailStr` requires `email-validator` as a separate
  dependency.** It's in `requirements.txt` — if you regenerate that file
  from a fresh `pip freeze` elsewhere, make sure it doesn't get dropped.
- **`email-validator` rejects reserved TLDs** like `.test`, `.example`,
  `.invalid` (RFC 2606) — use a normal-looking domain (e.g. `example.com`)
  in test payloads, or you'll get a 422 that looks like a bug but isn't.
- **`next/font/google` needs real internet access at build time.** If
  you're building in a sandboxed CI environment with restricted egress,
  the build will fail trying to reach `fonts.googleapis.com`. This is
  expected outside of Vercel/a normal dev machine — see the note in
  `verve-web/README.md`.
- **`create-next-app` CLI can time out** in constrained sandboxes (it did
  during this build). If that happens again in a similarly restricted
  environment, hand-scaffold the project file-by-file (package.json →
  tsconfig → next.config → tailwind.config → app/ files) instead of
  fighting the CLI — that's exactly what this repo's `verve-web` is.
- **Native Postgres enum types via SQLAlchemy + Alembic.** When a Python
  `enum.Enum` is used as a SQLAlchemy column type, Alembic's autogenerate
  creates the Postgres `CREATE TYPE ... AS ENUM (...)` on migration
  upgrade but does **not** reliably drop it on downgrade unless you also
  call `sa.Enum(..., name="...").drop(op.get_bind(), checkfirst=True)` in
  `downgrade()`. The `practice_sessions` migration does this explicitly for
  both the `sessionmode` and `sessionstatus` enum types — copy that pattern
  for any future enum columns instead of relying on autogenerate's default
  downgrade body.

---

## 7. Running everything locally

See `verve-web/README.md` and `verve-api/README.md` for the full steps.
Short version:

```bash
# Backend
cd verve-api
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in JWT_SECRET at minimum
# create a local Postgres db/user matching DATABASE_URL in .env
alembic upgrade head
uvicorn app.main:app --reload

# Frontend (separate terminal)
cd verve-web
npm install
cp .env.example .env.local
npm run dev
```

Visit `http://localhost:3000` — it should show "Connected" under Backend
connection if both are running.
