# AI-Mov — Project Notes
> Reference for jumping back into this project.
> Last updated: July 8, 2026 (hydration fix, watchlist, share picks)

---

## What It Is
An AI chat app that recommends movies and TV shows. Describe your mood, a film you love, or pick suggestion chips — it responds like a film-obsessed friend, with picks rendered as sleek streaming cards with real TMDB poster images.

## Live URL
🌐 **https://ai-mov.c2tbuilds.com**

## GitHub
📁 **https://github.com/teel23/ai-mov**

## Local Path
`/COMPUTER/AI/Projects/movai/`

## Platform
🚀 **Vercel** — auto-deploys on push to `main`

---

## Tech Stack
Next.js · TypeScript · Tailwind CSS · Claude API (streaming) · TMDB API · Vercel

## Environment Variables (set in Vercel dashboard)
- `ANTHROPIC_API_KEY` — Claude API
- `TMDB_API_KEY` — movie posters
- ⚠️ Never commit `.env.local` — excluded by .gitignore

---

## Current Features
- Multi-select suggestion chips: Mood, Vibe, Era, Streaming On, Quick Picks
- Quick Picks: 25 US-centric chips, auto-send on tap, amber styling, collapsed to 6 by default
- All other chip sections always fully expanded, no emojis
- Chips shuffle order every page refresh (except Streaming On & Quick Picks)
- Session history (Recent button shows last 8 searches)
- Real TMDB movie poster images with gradient fallback
- Color-coded genre pills on movie cards
- Thumbs up / thumbs down on AI responses
- Streaming service filter

## Status
✅ Live | 🔶 Beta

---

## Deploy
```bash
cd "/COMPUTER/AI/Projects/movai"
git add <specific files>   # never git add . — risk of committing .env.local
git commit -m "describe change"
git push origin main
```

---

## Portfolio Card
- Buttons: Launch App (blue) only — no Install (API-dependent, not offline-capable)
- Screenshot: `aimov-card.png`

---

## Recent Changes
| Date | What Changed |
|---|---|
| Feb 2026 | Initial launch, chips, streaming filter, session history |
| Feb 2026 | TMDB poster images, thumbs ratings, US-centric prompts |
| Feb 2026 | Migrated Netlify → Vercel |
| Mar 2026 | Real TMDB images with gradient fallback |
| Mar 2026 | Quick Picks overhaul: 25 chips, auto-send, amber styling |
| Mar 2026 | Removed emojis, all sections always expanded, fixed hero scroll |
| Jun 2026 | TMDB poster caching + per-IP rate limit on chat API |
| Jul 8, 2026 | Fixed prod React hydration errors (chip shuffle now post-mount); watchlist; share picks |

---

## Open Items
- [x] "Share these picks" — copies formatted pick list + link (Jul 8, 2026)
- [x] Watchlist — bookmark on each card, header panel, localStorage `aimov-watchlist` (Jul 8, 2026)
- [x] Persist thumbs ratings to localStorage (`aimov-thumbs`)
