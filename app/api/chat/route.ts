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

export async function POST(req: NextRequest) {
  try {
    // Instantiate inside handler so env var is guaranteed at request time
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const body = (await req.json()) as RequestBody

    if (!body.messages || !Array.isArray(body.messages)) {
      return new Response('Invalid request body', { status: 400 })
    }

    // Filter to only valid Anthropic roles
    const messages = body.messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))

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
