import type { MovieCard, ParsedSegment } from './types'

const CARD_REGEX = /\[MOVIE_CARD\]([\s\S]*?)\[\/MOVIE_CARD\]/g

function parseCardBlock(rawBlock: string): MovieCard {
  const lines = rawBlock.trim().split('\n')
  const fields: Record<string, string> = {}

  for (const line of lines) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).trim().toLowerCase()
    const value = line.slice(colonIdx + 1).trim()
    if (key) fields[key] = value
  }

  return {
    title: fields['title'] ?? 'Unknown Title',
    year: fields['year'] ?? '',
    type: fields['type'] ?? 'Movie',
    genres: (fields['genres'] ?? '')
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean),
    rating: fields['rating'] ?? '',
    reason: fields['reason'] ?? '',
  }
}

export function parseResponse(text: string): ParsedSegment[] {
  const segments: ParsedSegment[] = []
  let lastIndex = 0

  // Reset lastIndex — global regex carries state between calls
  CARD_REGEX.lastIndex = 0

  let match: RegExpExecArray | null

  while ((match = CARD_REGEX.exec(text)) !== null) {
    // Text before this card block
    const before = text.slice(lastIndex, match.index).trim()
    if (before) {
      segments.push({ type: 'text', content: before })
    }

    // Parse the card — guard against undefined capture group
    const cardContent = match[1]
    if (cardContent) {
      segments.push({
        type: 'card',
        content: parseCardBlock(cardContent),
      })
    }

    lastIndex = match.index + match[0].length
  }

  // Remaining text after last card
  const remaining = text.slice(lastIndex).trim()
  if (remaining) {
    segments.push({ type: 'text', content: remaining })
  }

  return segments
}
