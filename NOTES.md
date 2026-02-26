# AI-Mov — Project Notes
> Your reference for jumping back into this project anytime.
> **Update the Recent Changes section after every session.**

---

## What It Is
An AI chat app that recommends movies and TV shows. You describe your mood, a film you love, or pick chips from categories — it responds like a film-obsessed friend with picks displayed as sleek streaming-style cards.

## Live URL
🌐 **https://ai-mov.c2tbuilds.com**

## GitHub
📁 **https://github.com/teel23/ai-mov** *(needs to be created — see MASTER.md)*

---

## Current Features
- Multi-select suggestion chips (Mood, Vibe, Quick Picks, Era, Streaming On)
- Each category shows 4 chips + "show more" toggle — no overflow
- Chips shuffle in different order every page refresh
- Pick as many chips as you want before hitting Send
- Session history (Recent button in header shows last 8 searches)
- Movie cards with color-coded genre poster strip
- Thumbs up / thumbs down on AI responses
- Streaming service filter (Netflix, HBO Max, Hulu, Disney+, etc.)

## Status
✅ Live and working | 🔶 Beta

---

## How to Deploy Changes
1. Open terminal in `/AI/AI-Mov/`
2. `git add .`
3. `git commit -m "describe what changed"`
4. `git push`
5. Netlify auto-deploys (takes ~2 min)

> ⚠️ Never commit `.env.local` — your Anthropic API key lives there. It's excluded by `.gitignore`.

---

## Environment Variables
- `ANTHROPIC_API_KEY` — set in Netlify dashboard under Site Settings → Environment Variables
- Never put this in code or GitHub

---

## Recent Changes (keep updated)
| Date | What Changed |
|---|---|
| Feb 2026 | Initial launch |
| Feb 2026 | Multi-select chips, Show More toggle, Streaming filter |
| Feb 2026 | Session history, thumbs ratings, movie poster cards |
| Feb 2026 | US-centric recommendations, updated system prompt |

---

## Next Steps
- [ ] Set up GitHub → Netlify auto-deploy connection
- [ ] Add real movie poster images (TMDB API — free key needed)
- [ ] Add "Share picks" button
- [ ] Watchlist / save feature
- [ ] Persistent thumbs ratings
