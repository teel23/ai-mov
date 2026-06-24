import { NextRequest, NextResponse } from 'next/server'

const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w342'

// In-memory poster cache (per server instance). Posters are effectively immutable,
// so caching avoids repeatedly hitting TMDB for the same titles and caps API spend.
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days
const MAX_CACHE = 1000
const posterCache = new Map<string, { url: string | null; t: number }>()

function cacheGet(key: string): string | null | undefined {
  const hit = posterCache.get(key)
  if (!hit) return undefined
  if (Date.now() - hit.t > CACHE_TTL_MS) {
    posterCache.delete(key)
    return undefined
  }
  return hit.url
}

function cacheSet(key: string, url: string | null) {
  // Simple LRU-ish bound: drop the oldest entry when full.
  if (posterCache.size >= MAX_CACHE) {
    const oldest = posterCache.keys().next().value
    if (oldest !== undefined) posterCache.delete(oldest)
  }
  posterCache.set(key, { url, t: Date.now() })
}

// Responses are safe to cache at the CDN/browser — posters don't change.
const json = (body: unknown, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=86400' },
  })

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title')
  const year = searchParams.get('year')

  if (!title) {
    return NextResponse.json({ posterUrl: null }, { status: 400 })
  }

  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) {
    return NextResponse.json({ posterUrl: null }, { status: 500 })
  }

  const key = `${title.toLowerCase()}|${year || ''}`
  const cached = cacheGet(key)
  if (cached !== undefined) {
    return json({ posterUrl: cached, cached: true })
  }

  try {
    const params = new URLSearchParams({
      api_key: apiKey,
      query: title,
      include_adult: 'false',
      ...(year ? { year } : {}),
    })

    const res = await fetch(`${TMDB_BASE}/search/multi?${params}`, {
      // Let Next's data cache hold TMDB results too.
      next: { revalidate: 604800 },
    })
    const data = await res.json()

    const posterPath = data.results?.[0]?.poster_path
    const url = posterPath ? `${TMDB_IMAGE_BASE}${posterPath}` : null

    cacheSet(key, url)
    return json({ posterUrl: url })
  } catch {
    // Graceful degradation — the client renders a gradient fallback when posterUrl is null.
    return json({ posterUrl: null })
  }
}
