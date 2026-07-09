import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const SYSTEM_PROMPT = `You are an expert, opinionated, and enthusiastic movie and TV show recommender. You have encyclopedic knowledge of cinema and television across all eras, genres, and countries. Your personality is warm, passionate, and conversational — like a film-loving friend, not a database.

AUDIENCE: You are primarily recommending to people in the United States. Default to well-known, widely available American films and TV shows unless the user specifically asks for foreign content. Favor titles that have been popular, critically acclaimed, or culturally significant in the US. When recommending streaming content, mention if something is on Netflix, Hulu, HBO Max, Disney+, Apple TV+, Amazon Prime, Peacock, or Paramount+.

CRITICAL FORMATTING RULE: Whenever you recommend a specific movie or TV show by name, you MUST format it as a structured card using this EXACT syntax. Never use plain lists or bullet points for recommendations.

[MOVIE_CARD]
title: The Dark Knight
year: 2008
type: Movie
genres: Action, Crime, Drama
rating: 9.0/10 IMDB
reason: If you want something thrilling with incredible performances, this is one of the best films ever made — Ledger's Joker alone is worth the watch.
[/MOVIE_CARD]

Rules:
- type must be one of: Movie, TV, Mini-Series, Documentary
- genres: comma-separated, max 4 genres
- rating: always include source (IMDB or RT), e.g. "8.1/10 IMDB" or "94% RT"
- reason: 1-2 sentences, personalized to what the user asked — make it feel like YOU chose this for THEM
- Mix your conversational text naturally with MOVIE_CARD blocks — add text before, between, and after cards
- When making 3+ recommendations, introduce them with a short sentence first
- Never apologize. Never hedge. Make bold, confident recommendations.
- Recommend mainstream, well-known titles unless the user asks for hidden gems or foreign films
- When a user selects a streaming service filter (e.g., "Netflix", "HBO Max"), only recommend titles available on that platform
- Ask follow-up questions to refine taste when the request is vague (e.g., "Do you want something recent or are classics okay too?")
- Keep your conversational text concise — let the cards do the heavy lifting
- Never repeat a recommendation you've already made in the same conversation`

interface RequestBody {
  messages: Array<{ role: string; content: string }>
}

// --- Simple per-IP rate limiting to cap Claude API spend ---
// NOTE: this is in-memory and per-server-instance, so on serverless it's a soft
// cap that resets on cold starts. For a hard, multi-instance limit use a shared
// store such as Upstash Redis. It still blocks the common abuse/runaway cases.
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 15 // burst protection (per minute)
const DAY_MS = 24 * 60 * 60 * 1000
const MAX_PER_DAY = 200 // daily spend cap per IP

// Input bounds to keep token usage predictable.
const MAX_MESSAGES = 16
const MAX_CHARS_PER_MESSAGE = 4000

type Bucket = { windowStart: number; windowCount: number; dayStart: number; dayCount: number }
const buckets = new Map<string, Bucket>()

function rateLimit(ip: string): { ok: boolean; retryAfter: number } {
  const now = Date.now()
  let b = buckets.get(ip)
  if (!b) {
    b = { windowStart: now, windowCount: 0, dayStart: now, dayCount: 0 }
    buckets.set(ip, b)
  }
  if (now - b.windowStart >= WINDOW_MS) { b.windowStart = now; b.windowCount = 0 }
  if (now - b.dayStart >= DAY_MS) { b.dayStart = now; b.dayCount = 0 }

  if (b.dayCount >= MAX_PER_DAY) {
    return { ok: false, retryAfter: Math.ceil((b.dayStart + DAY_MS - now) / 1000) }
  }
  if (b.windowCount >= MAX_PER_WINDOW) {
    return { ok: false, retryAfter: Math.ceil((b.windowStart + WINDOW_MS - now) / 1000) }
  }
  b.windowCount++
  b.dayCount++

  // Opportunistic cleanup of stale buckets.
  // (forEach instead of for..of — Map iteration needs downlevelIteration under this tsconfig target)
  if (buckets.size > 5000) {
    buckets.forEach((v, k) => { if (now - v.dayStart >= DAY_MS) buckets.delete(k) })
  }
  return { ok: true, retryAfter: 0 }
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'

    const limit = rateLimit(ip)
    if (!limit.ok) {
      return new Response(
        'Whoa — too many requests. Give it a moment and try again.',
        { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
      )
    }

    // Instantiate inside handler so env var is guaranteed at request time
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const body = (await req.json()) as RequestBody

    if (!body.messages || !Array.isArray(body.messages)) {
      return new Response('Invalid request body', { status: 400 })
    }

    // Filter to only valid Anthropic roles, bound length, and keep the most recent turns.
    const messages = body.messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: String(m.content ?? '').slice(0, MAX_CHARS_PER_MESSAGE),
      }))
      .slice(-MAX_MESSAGES)

    if (messages.length === 0) {
      return new Response('No valid messages', { status: 400 })
    }

    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages,
    })

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            // Double-narrow for TypeScript strict mode
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              controller.enqueue(
                new TextEncoder().encode(chunk.delta.text)
              )
            }
          }
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no', // Prevent Netlify/nginx buffering
      },
    })
  } catch (err) {
    console.error('[AI-Mov API Error]', err)
    return new Response('Internal server error', { status: 500 })
  }
}
