import { NextRequest, NextResponse } from 'next/server'

const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w342'

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

  try {
    const params = new URLSearchParams({
      api_key: apiKey,
      query: title,
      include_adult: 'false',
      ...(year ? { year } : {}),
    })

    const res = await fetch(`${TMDB_BASE}/search/multi?${params}`)
    const data = await res.json()

    const result = data.results?.[0]
    const posterPath = result?.poster_path

    if (!posterPath) {
      return NextResponse.json({ posterUrl: null })
    }

    return NextResponse.json({ posterUrl: `${TMDB_IMAGE_BASE}${posterPath}` })
  } catch {
    return NextResponse.json({ posterUrl: null })
  }
}
