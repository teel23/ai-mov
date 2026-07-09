'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'

const QUICK_PICKS_DEFAULT_VISIBLE = 6

interface Chip {
  text: string
  isQuickPick?: boolean
}

interface ChipGroup {
  label: string
  chips: Chip[]
}

const RAW_CHIP_GROUPS: ChipGroup[] = [
  {
    label: 'Mood',
    chips: [
      { text: 'Funny' },
      { text: 'Emotional' },
      { text: 'Scary' },
      { text: 'Thrilling' },
      { text: 'Cozy' },
      { text: 'Action-Packed' },
      { text: 'Romantic' },
      { text: 'Intense' },
      { text: 'Dark' },
      { text: 'Feel-Good' },
      { text: 'Thought-Provoking' },
      { text: 'Cool & Stylish' },
      { text: 'Light & Fun' },
      { text: 'Suspenseful' },
    ],
  },
  {
    label: 'Vibe',
    chips: [
      { text: 'Visually Stunning' },
      { text: 'Mind-Bending' },
      { text: 'Character-Driven' },
      { text: 'True Story' },
      { text: 'Dark & Gritty' },
      { text: 'Oscar-Worthy' },
      { text: 'Cult Classic' },
      { text: 'Indie Film' },
      { text: 'Fast-Paced' },
      { text: 'Family-Friendly' },
      { text: 'Mystery & Twists' },
      { text: 'Inspiring' },
      { text: 'Binge-Worthy' },
      { text: 'Lighthearted' },
    ],
  },
  {
    label: 'Era',
    chips: [
      { text: 'Classic 80s' },
      { text: '90s Gold' },
      { text: '2000s Nostalgia' },
      { text: '2010s' },
      { text: '2020s' },
      { text: 'Classic Hollywood' },
      { text: '70s Cinema' },
    ],
  },
  {
    label: 'Streaming On',
    chips: [
      { text: 'Netflix' },
      { text: 'HBO Max' },
      { text: 'Hulu' },
      { text: 'Disney+' },
      { text: 'Apple TV+' },
      { text: 'Amazon Prime' },
      { text: 'Peacock' },
      { text: 'Paramount+' },
    ],
  },
  {
    label: 'Quick Picks',
    chips: [
      { text: 'Perfect Friday night movie', isQuickPick: true },
      { text: 'Movies for date night', isQuickPick: true },
      { text: 'True crime documentaries', isQuickPick: true },
      { text: 'Underrated hidden gems', isQuickPick: true },
      { text: 'Feel-good movies for a bad day', isQuickPick: true },
      { text: 'Best superhero movies', isQuickPick: true },
      { text: 'Oscar winners 2025', isQuickPick: true },
      { text: 'Something to binge this weekend', isQuickPick: true },
      { text: 'Scary but not too gory', isQuickPick: true },
      { text: 'Best American comedy series', isQuickPick: true },
      { text: 'Best sci-fi of the last decade', isQuickPick: true },
      { text: 'Classic American comedies', isQuickPick: true },
      { text: 'Best animated movies for adults', isQuickPick: true },
      { text: 'Greatest sports movies ever made', isQuickPick: true },
      { text: 'Best basketball movies & docs', isQuickPick: true },
      { text: 'Best NFL movies & documentaries', isQuickPick: true },
      { text: 'Best American crime dramas', isQuickPick: true },
      { text: 'Comfort TV for a lazy Sunday', isQuickPick: true },
      { text: 'Great American coming-of-age films', isQuickPick: true },
      { text: 'Movies set in New York City', isQuickPick: true },
      { text: 'Best cop & detective shows', isQuickPick: true },
      { text: 'Spring break party classics', isQuickPick: true },
      { text: 'Classic American road trip movies', isQuickPick: true },
      { text: 'Best late-night binge series', isQuickPick: true },
      { text: 'Most talked-about American shows right now', isQuickPick: true },
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
  onQuickPick: (chipText: string) => void
  compact?: boolean
}

export default function CategoryChips({
  selectedChips,
  onChipToggle,
  onQuickPick,
  compact = false,
}: CategoryChipsProps) {
  const [quickPicksExpanded, setQuickPicksExpanded] = useState(false)

  // Shuffle only after mount — shuffling during render caused an SSR/client
  // hydration mismatch (React errors #418/#423/#425 in production).
  const [CHIP_GROUPS, setChipGroups] = useState(RAW_CHIP_GROUPS)
  useEffect(() => {
    setChipGroups(
      RAW_CHIP_GROUPS.map((group) => ({
        ...group,
        chips:
          group.label === 'Streaming On' || group.label === 'Quick Picks'
            ? group.chips
            : shuffleArray(group.chips),
      }))
    )
  }, [])

  if (compact) {
    const quickPicks = CHIP_GROUPS.find((g) => g.label === 'Quick Picks')?.chips ?? []
    const others = CHIP_GROUPS.filter((g) => g.label !== 'Quick Picks').flatMap((g) => g.chips)
    const allChips = [...quickPicks, ...others]

    return (
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none px-4">
        {allChips.map((chip) => {
          if (chip.isQuickPick) {
            return (
              <button
                key={chip.text}
                onClick={() => onQuickPick(chip.text)}
                className="
                  whitespace-nowrap shrink-0 rounded-full px-3 py-1.5 text-xs border
                  flex items-center gap-1.5 transition-all duration-200
                  bg-amber-950/40 border-amber-500/25 text-amber-300/70
                  hover:border-amber-500/50 hover:text-amber-200 hover:bg-amber-900/40
                "
              >
                {chip.text}
                <ArrowRight size={10} className="opacity-50" />
              </button>
            )
          }

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

  // Full grouped layout — always fully expanded except Quick Picks
  return (
    <div className="space-y-5 w-full max-w-xl mx-auto text-left">
      {CHIP_GROUPS.map((group) => {
        const isQuickPickGroup = group.label === 'Quick Picks'
        const visibleChips = isQuickPickGroup && !quickPicksExpanded
          ? group.chips.slice(0, QUICK_PICKS_DEFAULT_VISIBLE)
          : group.chips
        const hiddenCount = group.chips.length - QUICK_PICKS_DEFAULT_VISIBLE

        return (
          <div key={group.label}>
            <p className="text-gray-600 text-[10px] font-mono uppercase tracking-widest mb-2 pl-0.5">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {visibleChips.map((chip) => {
                if (chip.isQuickPick) {
                  return (
                    <button
                      key={chip.text}
                      onClick={() => onQuickPick(chip.text)}
                      className="
                        rounded-full px-3.5 py-1.5 text-sm border
                        flex items-center gap-2 transition-all duration-200 cursor-pointer
                        bg-amber-950/40 border-amber-500/25 text-amber-300/70
                        hover:border-amber-500/50 hover:text-amber-200 hover:bg-amber-900/40
                        hover:-translate-y-0.5
                      "
                    >
                      {chip.text}
                      <span className="flex items-center gap-1 text-[9px] font-mono text-amber-500/40 uppercase tracking-wide">
                        auto
                        <ArrowRight size={9} className="opacity-60" />
                      </span>
                    </button>
                  )
                }

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

              {isQuickPickGroup && hiddenCount > 0 && (
                <button
                  onClick={() => setQuickPicksExpanded((prev) => !prev)}
                  className="
                    flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs border
                    border-dashed border-amber-500/20 text-amber-600/60
                    hover:text-amber-400/70 hover:border-amber-500/35
                    bg-[#1a1a1a] transition-all duration-200 cursor-pointer
                  "
                >
                  {quickPicksExpanded ? (
                    <>Show less <ChevronUp size={11} /></>
                  ) : (
                    <>+{hiddenCount} more <ChevronDown size={11} /></>
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
