# AI_CONTEXT — AI-Mov
> For AI assistant use. Read this at the start of every session to get up to speed instantly.
> **Update this file after every meaningful change.**

---

## Project Identity
- **Name:** AI-Mov
- **Type:** AI-powered chat app (Next.js 14, App Router)
- **Live URL:** https://ai-mov.c2tbuilds.com (custom domain via Namecheap)
- **Vercel URL:** https://ai-mov-psi.vercel.app
- **GitHub:** https://github.com/teel23/ai-mov
- **Deployment:** Vercel (auto-deploys on push to main)
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
| Deployment | Vercel |
| Animation | Framer Motion |
| Icons | Lucide React |
| Poster Images | TMDB API |

---

## Environment Variables
```
ANTHROPIC_API_KEY=sk-ant-...   ← stored in .env.local (NEVER commit this)
TMDB_API_KEY=...               ← stored in .env.local (NEVER commit this)
```
On Vercel: set via Project → Settings → Environment Variables

---

## Key File Map
```
app/
  page.tsx                  ← Root page, renders <ChatInterface>
  layout.tsx                ← Global layout + metadata
  globals.css               ← Custom animations (float, typing dots)
  api/chat/route.ts         ← Claude API streaming endpoint
  api/poster/route.ts       ← TMDB poster image proxy (keeps API key server-side)

components/
  ChatInterface.tsx         ← MAIN component — manages all state:
                               messages, selectedChips, history, thumbs
                               handleQuickPick() sends message instantly
  CategoryChips.tsx         ← Chip groups: Mood, Vibe, Era, Streaming On, Quick Picks
                               Quick Picks: isQuickPick=true, auto-send on tap, amber styled
                               Quick Picks collapsed to 6 default, +X more toggle
                               All other groups always fully expanded, no emojis
  ChatInput.tsx             ← Textarea + selected chip pills display
  ChatWindow.tsx            ← Scrollable message list
  MessageBubble.tsx         ← Renders user/assistant messages + thumbs
  MovieCard.tsx             ← Card with real TMDB poster image, falls back to gradient

lib/
  types.ts                  ← Message, MovieCard, ParsedSegment interfaces
  parseRecommendations.ts   ← Parses [MOVIE_CARD]...[/MOVIE_CARD] blocks
```

---

## Architecture Notes
- All state lives in `ChatInterface.tsx` — chips, input, messages, history, thumbs
- Regular chips are multi-select: clicking toggles, pills show above input, Send to query
- Quick Picks auto-send instantly via `handleQuickPick()` → `sendMessage()` — no Send needed
- Session history stored in `sessionStorage` (clears on tab close)
- Thumbs ratings are local state only (not persisted yet)
- Movie cards parsed via regex from AI response text
- AI response streams chunk by chunk via ReadableStream reader loop
- System prompt in `app/api/chat/route.ts` enforces US-centric recommendations
- Poster images fetched client-side in MovieCard via `/api/poster?title=&year=`
- next.config.mjs whitelists image.tmdb.org for Next.js <Image>

---

## Chip Categories (CategoryChips.tsx)
1. **Mood** — 14 chips (Funny, Scary, Cozy, etc.) — always expanded
2. **Vibe** — 14 chips (Mind-Bending, True Story, Oscar-Worthy, etc.) — always expanded
3. **Era** — 7 chips (80s, 90s, 2000s, etc.) — always expanded
4. **Streaming On** — 8 chips (Netflix, HBO Max, Hulu, etc.) — always expanded, not shuffled
5. **Quick Picks** — 25 US-centric chips — auto-send, amber styled, 6 shown by default
- Mood/Vibe/Era shuffle on each page refresh
- In compact strip (while chatting): Quick Picks appear first

---

## Deployment Flow
1. Make changes locally in `/AI/AI-Mov/`
2. `git add <specific files>`
3. `git commit -m "message"`
4. `git push` → Vercel auto-builds and deploys (~1-2 min)
5. Update this file with what changed

---

## Recent Changes (update after each session)
| Date | Change |
|---|---|
| Feb 2026 | Initial launch — chip multi-select, Show More toggle, streaming service filter |
| Feb 2026 | Added session history, thumbs up/down, movie poster gradient cards |
| Feb 2026 | Updated system prompt to US-centric recommendations |
| Feb 2026 | Fixed .gitignore, initialized git repo |
| Feb 2026 | Migrated from Netlify to Vercel |
| Mar 2026 | Added TMDB API poster images via /api/poster proxy route |
| Mar 2026 | Quick Picks overhaul: 25 US-centric auto-send chips, amber styling, 6 default visible |
| Mar 2026 | Removed emojis from all chip groups, always-expanded layout |
| Mar 2026 | Fixed hero scroll (justify-start), Quick Picks at bottom above input |

---

## Next Steps
- [ ] Persist thumbs ratings (localStorage)
- [ ] Add "Share these picks" copy-link feature
- [ ] Watchlist / save feature
- [ ] Add more Quick Picks over time based on usage
