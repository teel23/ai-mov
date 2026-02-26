# AI_CONTEXT — AI-Mov
> For AI assistant use. Read this at the start of every session to get up to speed instantly.
> **Update this file after every meaningful change.**

---

## Project Identity
- **Name:** AI-Mov
- **Type:** AI-powered chat app (Next.js 14, App Router)
- **Live URL:** https://ai-mov.c2tbuilds.com
- **GitHub:** https://github.com/teel23/ai-mov *(create this repo — see MASTER.md)*
- **Netlify:** Connect GitHub repo to auto-deploy on push
- **Status:** Live / Beta

---

## Tech Stack
| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| AI Backend | Anthropic Claude API (claude-sonnet-4-5) |
| Streaming | Native ReadableStream |
| Deployment | Netlify + @netlify/plugin-nextjs |
| Animation | Framer Motion |
| Icons | Lucide React |

---

## Environment Variables
```
ANTHROPIC_API_KEY=sk-ant-...   ← stored in .env.local (NEVER commit this)
```
On Netlify: set via Site Settings → Environment Variables

---

## Key File Map
```
app/
  page.tsx                  ← Root page, renders <ChatInterface>
  layout.tsx                ← Global layout + metadata
  globals.css               ← Custom animations (float, typing dots)
  api/chat/route.ts         ← Claude API streaming endpoint

components/
  ChatInterface.tsx         ← MAIN component — manages all state:
                               messages, selectedChips, history, thumbs
  CategoryChips.tsx         ← Suggestion chips with Show More toggle,
                               multi-select, randomized order on mount
  ChatInput.tsx             ← Textarea + selected chip pills display
  ChatWindow.tsx            ← Scrollable message list
  MessageBubble.tsx         ← Renders user/assistant messages + thumbs
  MovieCard.tsx             ← Streaming-style card with genre gradient poster

lib/
  types.ts                  ← Message, MovieCard, ParsedSegment interfaces
  parseRecommendations.ts   ← Parses [MOVIE_CARD]...[/MOVIE_CARD] blocks
```

---

## Architecture Notes
- All state lives in `ChatInterface.tsx` — chips, input, messages, history, thumbs
- Chips are multi-select: clicking toggles selection, pills show above input
- Chip text + manual input are combined into one query on Send (no auto-send)
- Session history stored in `sessionStorage` (clears on tab close)
- Thumbs ratings are local state only (not persisted)
- Movie cards parsed via regex from AI response text
- AI response streams chunk by chunk via ReadableStream reader loop
- System prompt in `app/api/chat/route.ts` enforces US-centric recommendations

---

## Chip Categories (CategoryChips.tsx)
1. **Mood** — 14 chips (Funny, Scary, Cozy, etc.)
2. **Vibe** — 14 chips (Mind-Bending, True Story, Oscar-Worthy, etc.)
3. **Quick Picks** — 18 chips (Friday night movie, Best of 2024, etc.)
4. **Era** — 7 chips (80s, 90s, 2000s, etc.)
5. **Streaming On** — 8 chips (Netflix, HBO Max, Hulu, etc.)
- Shows 4 per category by default, "+ X more" toggle expands inline
- Chips shuffle on each page refresh (except Streaming On)

---

## Deployment Flow
1. Make changes locally
2. `git add . && git commit -m "message"` in `/AI/AI-Mov/`
3. `git push` → Netlify auto-builds and deploys
4. Update this file with what changed

---

## Recent Changes (update after each session)
| Date | Change |
|---|---|
| Feb 2026 | Initial launch — chip multi-select, Show More toggle, streaming service filter |
| Feb 2026 | Added session history, thumbs up/down, movie poster gradient cards |
| Feb 2026 | Updated system prompt to US-centric recommendations |
| Feb 2026 | Fixed .gitignore to exclude .env.local, initialized git repo |

---

## Next Steps
- [ ] Connect GitHub repo to Netlify for auto-deploy (see MASTER.md)
- [ ] Add real movie poster images via TMDB API (needs free API key at themoviedb.org)
- [ ] Persist thumbs ratings (localStorage or backend)
- [ ] Add "Share these picks" copy-link feature
- [ ] Consider adding a watchlist / save feature
- [ ] Add more Quick Picks suggestions over time based on user feedback
