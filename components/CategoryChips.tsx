'use client'

import { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const INITIAL_VISIBLE = 4

interface Chip {
  text: string
}

interface ChipGroup {
  label: string
  chips: Chip[]
}

const RAW_CHIP_GROUPS: ChipGroup[] = [
  {
    label: 'Mood',
    chips: [
      { text: '😂 Funny' },
      { text: '😭 Emotional' },
      { text: '😱 Scary' },
      { text: '🔥 Thrilling' },
      { text: '☁️ Cozy' },
      { text: '💥 Action-Packed' },
      { text: '❤️ Romantic' },
      { text: '😤 Intense' },
      { text: '🌙 Dark' },
      { text: '😄 Feel-Good' },
      { text: '🤔 Thought-Provoking' },
      { text: '😎 Cool & Stylish' },
      { text: '🎉 Light & Fun' },
      { text: '😮 Suspenseful' },
    ],
  },
  {
    label: 'Vibe',
    chips: [
      { text: '🎨 Visually Stunning' },
      { text: '🧠 Mind-Bending' },
      { text: '💬 Character-Driven' },
      { text: '🌍 True Story' },
      { text: '💀 Dark & Gritty' },
      { text: '🎭 Oscar-Worthy' },
      { text: '🌟 Cult Classic' },
      { text: '🎬 Indie Film' },
      { text: '🔫 Fast-Paced' },
      { text: '🏠 Family-Friendly' },
      { text: '🔍 Mystery & Twists' },
      { text: '💪 Inspiring' },
      { text: '😂 Binge-Worthy' },
      { text: '🌈 Lighthearted' },
    ],
  },
  {
    label: 'Quick Picks',
    chips: [
      { text: 'Perfect Friday night movie' },
      { text: 'Best movies of 2024' },
      { text: 'Weekend binge-worthy series' },
      { text: 'Movies like Interstellar' },
      { text: 'Something like Breaking Bad' },
      { text: 'Best superhero movies' },
      { text: 'Scary but not too gory' },
      { text: 'Great comedy series to binge' },
      { text: 'Movies that won Best Picture' },
      { text: 'True crime documentaries' },
      { text: 'Underrated hidden gems' },
      { text: 'Movies for date night' },
      { text: 'Best sci-fi of the last decade' },
      { text: 'Feel-good movies for a bad day' },
      { text: 'Short films under 90 minutes' },
      { text: 'Best sports movies' },
      { text: 'Classic American comedies' },
      { text: 'Best animated movies for adults' },
    ],
  },
  {
    label: 'Era',
    chips: [
      { text: '🕹️ Classic 80s' },
      { text: '💿 90s Gold' },
      { text: '📀 2000s Nostalgia' },
      { text: '📱 2010s' },
      { text: '🆕 2020s' },
      { text: '🎞️ Classic Hollywood' },
      { text: '📽️ 70s Cinema' },
    ],
  },
  {
    label: 'Streaming On',
    chips: [
      { text: '🔴 Netflix' },
      { text: '🔵 HBO Max' },
      { text: '🟢 Hulu' },
      { text: '🔷 Disney+' },
      { text: '⭐ Apple TV+' },
      { text: '📦 Amazon Prime' },
      { text: '🍿 Peacock' },
      { text: '💜 Paramount+' },
    ],
  },
]

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

interface CategoryChipsProps {
  selectedChips: string[]
  onChipToggle: (chipText: string) => void
  compact?: boolean
}

export default function CategoryChips({
  selectedChips,
  onChipToggle,
  compact = false,
}: CategoryChipsProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  // Shuffle the non-Streaming chips once on mount so order varies each refresh
  const CHIP_GROUPS = useMemo(() => {
    return RAW_CHIP_GROUPS.map((group) => ({
      ...group,
      chips:
        group.label === 'Streaming On'
          ? group.chips
          : shuffleArray(group.chips),
    }))
  }, [])

  function toggleExpand(label: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      next.has(label) ? next.delete(label) : next.add(label)
      return next
    })
  }

  if (compact) {
    const allChips = CHIP_GROUPS.flatMap((g) => g.chips)

    return (
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none px-4">
        {allChips.map((chip) => {
          const isSelected = selectedChips.includes(chip.text)
          return (
            <button
              key={chip.text}
              onClick={() => onChipToggle(chip.text)}
              className={`
                whitespace-nowrap shrink-0 rounded-full px-3 py-1.5 text-xs border
                transition-all duration-200
                ${
                  isSelected
                    ? 'bg-violet-500/20 border-violet-500 text-violet-300 ring-1 ring-violet-500/50'
                    : 'bg-[#1a1a1a] border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300'
                }
              `}
            >
              {chip.text}
            </button>
          )
        })}
      </div>
    )
  }

  // Full grouped layout for hero / empty state
  return (
    <div className="space-y-5 w-full max-w-xl mx-auto text-left">
      {CHIP_GROUPS.map((group) => {
        const isExpanded = expandedGroups.has(group.label)
        const visibleChips = isExpanded
          ? group.chips
          : group.chips.slice(0, INITIAL_VISIBLE)
        const hiddenCount = group.chips.length - INITIAL_VISIBLE

        return (
          <div key={group.label}>
            <p className="text-gray-600 text-[10px] font-mono uppercase tracking-widest mb-2 pl-0.5">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {visibleChips.map((chip) => {
                const isSelected = selectedChips.includes(chip.text)
                return (
                  <button
                    key={chip.text}
                    onClick={() => onChipToggle(chip.text)}
                    className={`
                      rounded-full px-3.5 py-1.5 text-sm border
                      transition-all duration-200 cursor-pointer
                      ${
                        isSelected
                          ? 'bg-violet-500/20 border-violet-500 text-violet-300 ring-2 ring-violet-500/40'
                          : 'bg-[#1a1a1a] border-white/10 text-gray-400 hover:border-white/25 hover:text-gray-200 hover:bg-white/5'
                      }
                    `}
                  >
                    {chip.text}
                  </button>
                )
              })}

              {hiddenCount > 0 && (
                <button
                  onClick={() => toggleExpand(group.label)}
                  className="
                    flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs border
                    border-dashed border-white/15 text-gray-600
                    hover:text-gray-400 hover:border-white/25
                    bg-[#1a1a1a] transition-all duration-200 cursor-pointer
                  "
                >
                  {isExpanded ? (
                    <>
                      Show less <ChevronUp size={11} />
                    </>
                  ) : (
                    <>
                      +{hiddenCount} more <ChevronDown size={11} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
