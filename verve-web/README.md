# verve-web

Next.js 15 + TypeScript + Tailwind frontend for Verve. Step 1 of the build order: proves the frontend can reach the FastAPI backend.

## What's here right now

- Tailwind config with the full Verve design system (background/surface/card/elevated/border, gold + burgundy scales, text hierarchy) mapped as semantic color tokens — no raw hex codes in component code.
- Root layout wired to Cormorant Garamond (headings) + Inter (body) via `next/font/google`.
- `lib/api/client.ts` — the typed fetch wrapper every future API call will go through.
- A placeholder home page that calls the backend's `/health` endpoint server-side and shows whether the connection succeeded. **This is not the real landing page** — the full hero/training-modes/rankings/etc. landing page is Build Order Step 4, ported from the existing static HTML prototype.

## Local setup

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL if verve-api isn't on localhost:8000
npm run dev
```

Visit `http://localhost:3000` — with `verve-api` running locally, you should see "Connected" under Backend connection.

## Note on fonts in sandboxed/offline environments

`next/font/google` fetches font files at build time. If you build this in an environment with no internet access, the build will fail on the font fetch — this is expected and not a bug. Vercel (and any normal dev machine) has full internet access, so this resolves itself in real deployment.

## Next steps (Build Order steps 3+)

- shadcn/ui setup + Framer Motion for the curtain sequence
- Port the existing static prototype's landing page into real components (`ModeCard`, `PromptCard`, radar chart, rankings table) — de-duplicating the two copies that existed in the static version
- Auth pages (login/signup/forgot-password) wired to `verve-api`
- Zustand session store + React Query for server state

See `verve-architecture.md` for the full frontend architecture, state management plan, and build order this is following.
