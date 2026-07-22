Short answer: no, don't turn payments on yet. Get the product proven and sticky first, then monetize from a position of "people already love this," not "pay before you know if it works." Here's the reasoning and a concrete plan.

Why not launch with billing on
You have zero billing infrastructure right now — building it properly (Stripe + webhooks + plan gating) is real engineering time you'd rather spend on the product blockers we just talked about.
You don't yet know your real numbers: activation rate, session-to-session retention, how much people actually use it. Pricing decided before that data is a guess.
Early users who get in free and later get "founding member" pricing become your best word-of-mouth. Users who hit a paywall on day one just leave.
The free tier should be usage-capped, not feature-gated

Don't lock modes (Impromptu/Debate/Interview/Storytelling) or hide the good feedback behind paywall — that stops people from ever feeling the "aha, this is actually useful" moment, which is the whole thing you're trying to create. Instead, gate on volume, because volume maps directly to your real cost (Whisper transcription + LLM feedback per session).

Rough cost per session, at the prep/speak times your setup screen already offers (up to 5 min speaking): Whisper transcription is on the order of a few cents, GPT-4o-mini feedback generation is a fraction of a cent. Call it ~$0.05–0.15 per session all-in — check current OpenAI pricing since it does shift, but that's the right order of magnitude. That means a generous free tier costs you pennies per user per month, which is cheap user acquisition.

Suggested structure:

Free

5 sessions/week (not month — weekly resets keep people coming back more often, and it aligns with the streak mechanic you already built)
All 4 modes, full feedback, full radar chart, leaderboard, achievements — everything, just capped in volume
Feedback history kept, but maybe only last 30 days visible

Pro (once you turn billing on — something like $10–15/month is a reasonable anchor for this category)

Higher/unlimited sessions
Full history & long-term trend charts (this is a good paid feature since it's genuinely more valuable to committed users, not something new users need to feel the core value)
Priority processing (skip the queue if you ever get concurrent load)
Maybe: downloadable/exportable feedback reports

This keeps the paywall aligned with "you've built a habit and want more," which is the healthiest place to ask for money.

What to actually do at launch
Ship free, no payment collection at all. Frame it as early access / beta if you want cover to change pricing later without backlash.
Still build the usage cap and the "upgrade" UI now, just point the upgrade button at a waitlist or "coming soon" — this means when you do turn on billing, it's a config flip, not a rebuild, and you're not scrambling once you already have paying-intent users.
Instrument everything: sessions per user per week, week-2/week-4 retention, cost per active user. This tells you whether 5/week is too generous or too stingy before you commit to it publicly.
When you do flip on billing (I'd wait for signs of organic retention — people coming back on their own, hitting the free cap and complaining/asking for more), grandfather your existing free users into either permanent free-tier-as-is or a discounted "founding member" price. That goodwill is worth more than the few dollars you'd get from immediately converting them.
