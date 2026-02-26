export interface MovieCard {
  title: string
  year: string
  type: string
  genres: string[]
  rating: string
  reason: string
  posterUrl?: string
}

export interface ParsedSegment {
  type: 'text' | 'card'
  content: string | MovieCard
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
  thumbs?: 'up' | 'down' | null
}
