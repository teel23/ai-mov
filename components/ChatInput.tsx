'use client'

import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { Send, Loader2, X } from 'lucide-react'

const PLACEHOLDERS = [
  'A movie like Interstellar but more emotional...',
  'Best Friday night comedies',
  'Something cozy for a rainy Sunday',
  'A show I can binge this weekend',
  'Movies that will actually scare me',
  'Something for the whole family',
  'Feel-good movies to cheer me up',
  'Best thrillers of the last 5 years',
]

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  loading: boolean
  selectedChips: string[]
  onChipRemove: (chip: string) => void
  hasContent: boolean
}

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  loading,
  selectedChips,
  onChipRemove,
  hasContent,
}: ChatInputProps) {
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 150)}px`
  }, [value])

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (hasContent && !loading) onSubmit()
    }
  }

  return (
    <div className="border-t border-white/5 bg-[#0f0f0f] px-4 py-3 shrink-0">
      <div className="max-w-2xl mx-auto">

        {/* Selected chip pills */}
        {selectedChips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {selectedChips.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs bg-violet-500/15 border border-violet-500/40 text-violet-300"
              >
                {chip}
                <button
                  onClick={() => onChipRemove(chip)}
                  className="text-violet-400 hover:text-violet-200 transition-colors"
                  aria-label={`Remove ${chip}`}
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedChips.length > 0
                ? 'Add more details or just press Send...'
                : PLACEHOLDERS[placeholderIdx]
            }
            rows={1}
            disabled={loading}
            className="
              flex-1 bg-[#1a1a1a] border border-white/10
              rounded-2xl pl-5 pr-4 py-3.5
              text-white placeholder-gray-600
              text-sm resize-none leading-relaxed
              focus:outline-none
              focus:ring-2 focus:ring-violet-500/50
              focus:shadow-[0_0_20px_rgba(139,92,246,0.15)]
              focus:border-violet-500/30
              transition-all duration-200
              disabled:opacity-60 disabled:cursor-not-allowed
              max-h-[150px] overflow-y-auto
            "
          />

          <button
            onClick={onSubmit}
            disabled={!hasContent || loading}
            aria-label="Send message"
            className="
              shrink-0 w-11 h-11 rounded-xl
              bg-gradient-to-br from-violet-500 to-blue-500
              hover:from-violet-400 hover:to-blue-400
              disabled:opacity-40 disabled:cursor-not-allowed
              flex items-center justify-center
              transition-all duration-200
              hover:shadow-[0_0_16px_rgba(139,92,246,0.4)]
              active:scale-95
            "
          >
            {loading ? (
              <Loader2 size={18} className="text-white animate-spin" />
            ) : (
              <Send size={18} className="text-white" />
            )}
          </button>
        </div>

        <p className="text-center text-gray-700 text-[10px] mt-2">
          {selectedChips.length > 0
            ? `${selectedChips.length} filter${selectedChips.length > 1 ? 's' : ''} selected · Enter to send`
            : 'Enter to send · Shift+Enter for new line'}
        </p>
      </div>
    </div>
  )
}
