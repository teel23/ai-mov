'use client'

import { motion } from 'framer-motion'
import { Star, Tv, Film, BookOpen, Bookmark } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import type { MovieCard as MovieCardType } from '@/lib/types'
import { isSaved, toggleWatchlist } from '@/lib/watchlist'

const GENRE_COLORS: Record<string, string> = {
  Action: 'bg-red-500/20 text-red-300 border-red-500/30',
  Horror: 'bg-red-900/40 text-red-400 border-red-900/50',
  Comedy: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  Drama: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Sci-Fi': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'Science Fiction': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  Thriller: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  Romance: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  Documentary: 'bg-green-500/20 text-green-300 border-green-500/30',
  Adventure: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Animation: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Crime: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  Fantasy: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  Mystery: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  Historical: 'bg-stone-500/20 text-stone-300 border-stone-500/30',
  Sport: 'bg-lime-500/20 text-lime-300 border-lime-500/30',
  Sports: 'bg-lime-500/20 text-lime-300 border-lime-500/30',
  Family: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
}

// Poster gradient per primary genre
const POSTER_GRADIENTS: Record<string, string> = {
  Action: 'from-red-900 via-red-800 to-orange-900',
  Horror: 'from-red-950 via-gray-900 to-red-900',
  Comedy: 'from-yellow-900 via-amber-800 to-orange-800',
  Drama: 'from-blue-900 via-blue-800 to-indigo-900',
  'Sci-Fi': 'from-cyan-900 via-blue-900 to-violet-900',
  'Science Fiction': 'from-cyan-900 via-blue-900 to-violet-900',
  Thriller: 'from-gray-900 via-orange-900 to-gray-900',
  Romance: 'from-pink-900 via-rose-800 to-red-900',
  Documentary: 'from-green-900 via-teal-900 to-emerald-900',
  Adventure: 'from-amber-900 via-yellow-900 to-orange-900',
  Animation: 'from-purple-900 via-violet-800 to-pink-900',
  Crime: 'from-slate-900 via-gray-800 to-zinc-900',
  Fantasy: 'from-violet-900 via-purple-800 to-blue-900',
  Mystery: 'from-indigo-900 via-slate-900 to-indigo-800',
  Sport: 'from-lime-900 via-green-900 to-emerald-900',
  Sports: 'from-lime-900 via-green-900 to-emerald-900',
  Family: 'from-teal-900 via-cyan-900 to-blue-900',
}

const DEFAULT_GRADIENT = 'from-violet-900 via-gray-900 to-blue-900'
const DEFAULT_COLOR = 'bg-white/10 text-gray-300 border-white/20'

function getGenreColor(genre: string): string {
  return GENRE_COLORS[genre] ?? DEFAULT_COLOR
}

function getPosterGradient(genres: string[]): string {
  for (const g of genres) {
    if (POSTER_GRADIENTS[g]) return POSTER_GRADIENTS[g]
  }
  return DEFAULT_GRADIENT
}

function TypeIcon({ type }: { type: string }) {
  if (type === 'TV' || type === 'Mini-Series') return <Tv size={11} />
  if (type === 'Documentary') return <BookOpen size={11} />
  return <Film size={11} />
}

// Generate initials for the poster from the title
function posterInitials(title: string): string {
  return title
    .split(' ')
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
    || title.slice(0, 2).toUpperCase()
}

interface MovieCardProps {
  card: MovieCardType
  delay?: number
}

export default function MovieCard({ card, delay = 0 }: MovieCardProps) {
  const gradient = getPosterGradient(card.genres)
  const initials = posterInitials(card.title)
  const [posterUrl, setPosterUrl] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(isSaved(card.title, card.year))
    const sync = () => setSaved(isSaved(card.title, card.year))
    window.addEventListener('aimov-watchlist-change', sync)
    return () => window.removeEventListener('aimov-watchlist-change', sync)
  }, [card.title, card.year])

  useEffect(() => {
    const params = new URLSearchParams({ title: card.title })
    if (card.year) params.set('year', card.year)
    fetch(`/api/poster?${params}`)
      .then((r) => r.json())
      .then((data) => { if (data.posterUrl) setPosterUrl(data.posterUrl) })
      .catch(() => {})
  }, [card.title, card.year])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.35,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="
        bg-[#111] border border-white/10 rounded-xl overflow-hidden my-2
        hover:border-violet-500/30 hover:-translate-y-0.5
        hover:shadow-[0_4px_24px_rgba(139,92,246,0.12)]
        transition-all duration-200 cursor-default
        max-w-sm w-full flex gap-0
      "
    >
      {/* Poster area */}
      <div
        className={`
          relative shrink-0 w-[72px] bg-gradient-to-b ${gradient}
          flex flex-col items-center justify-center
          overflow-hidden
        `}
      >
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={card.title}
            fill
            sizes="72px"
            className="object-cover"
          />
        ) : (
          <>
            {/* Noise texture overlay */}
            <div className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
              }}
            />
            {/* Type icon at top */}
            <div className="absolute top-2 left-0 right-0 flex justify-center">
              <span className="text-white/30">
                <TypeIcon type={card.type} />
              </span>
            </div>
            {/* Big initials */}
            <span className="text-white/20 font-black text-2xl tracking-tight leading-none select-none">
              {initials}
            </span>
            {/* Year at bottom */}
            {card.year && (
              <span className="absolute bottom-2 text-white/30 text-[9px] font-mono">
                {card.year}
              </span>
            )}
          </>
        )}
      </div>

      {/* Card content */}
      <div className="flex-1 p-3.5 min-w-0">
        {/* Genre pills */}
        <div className="flex flex-wrap gap-1 mb-2">
          {card.genres.slice(0, 3).map((genre) => (
            <span
              key={genre}
              className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full border ${getGenreColor(genre)}`}
            >
              {genre}
            </span>
          ))}
        </div>

        {/* Title + rating row */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-white font-bold text-sm leading-tight flex-1 min-w-0">
            {card.title}
          </h3>
          <button
            onClick={() => setSaved(toggleWatchlist({ title: card.title, year: card.year, type: card.type }))}
            aria-label={saved ? 'Remove from watchlist' : 'Save to watchlist'}
            title={saved ? 'Remove from watchlist' : 'Save to watchlist'}
            className={`shrink-0 rounded-md p-1 border transition-all duration-200
              ${saved
                ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                : 'bg-transparent border-white/10 text-gray-600 hover:text-gray-300 hover:border-white/25'
              }`}
          >
            <Bookmark size={12} className={saved ? 'fill-violet-300' : ''} />
          </button>
          {card.rating && (
            <div className="flex items-center gap-1 shrink-0 bg-yellow-500/10 border border-yellow-500/20 rounded-md px-1.5 py-0.5">
              <Star size={9} className="text-yellow-400 fill-yellow-400" />
              <span className="text-yellow-300 text-[10px] font-medium whitespace-nowrap">
                {card.rating.split(' ')[0]}
              </span>
            </div>
          )}
        </div>

        {/* Type badge */}
        {card.type && (
          <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 mb-2">
            <TypeIcon type={card.type} />
            {card.type}
          </span>
        )}

        {/* Reason */}
        {card.reason && (
          <p className="text-gray-500 text-[11px] italic leading-relaxed border-t border-white/5 pt-2 mt-1">
            {card.reason}
          </p>
        )}
      </div>
    </motion.div>
  )
}
