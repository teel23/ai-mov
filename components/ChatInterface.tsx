'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Film, Trash2, Clock, X, Bookmark } from 'lucide-react'
import ChatWindow from './ChatWindow'
import ChatInput from './ChatInput'
import CategoryChips from './CategoryChips'
import type { Message } from '@/lib/types'
import { getWatchlist, removeFromWatchlist, type WatchlistItem } from '@/lib/watchlist'

const HISTORY_KEY = 'ai-mov-history'
const MAX_HISTORY = 8

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function loadHistory(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(sessionStorage.getItem(HISTORY_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveToHistory(query: string, existing: string[]): string[] {
  const cleaned = existing.filter((q) => q !== query)
  const updated = [query, ...cleaned].slice(0, MAX_HISTORY)
  sessionStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
  return updated
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [selectedChips, setSelectedChips] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [thumbsRatings, setThumbsRatings] = useState<Record<string, 'up' | 'down'>>(() => {
    try { return JSON.parse(localStorage.getItem('aimov-thumbs') || '{}') } catch { return {} }
  })
  const [history, setHistory] = useState<string[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [showWatchlist, setShowWatchlist] = useState(false)

  const hasMessages = messages.length > 0

  useEffect(() => {
    setHistory(loadHistory())
    setWatchlist(getWatchlist())
    const sync = () => setWatchlist(getWatchlist())
    window.addEventListener('aimov-watchlist-change', sync)
    return () => window.removeEventListener('aimov-watchlist-change', sync)
  }, [])

  useEffect(() => {
    try { localStorage.setItem('aimov-thumbs', JSON.stringify(thumbsRatings)) } catch {}
  }, [thumbsRatings])

  // Build the full query from selected chips + manual input
  function buildQuery(): string {
    // Strip leading emoji (non-ASCII) + space from chip labels
    const chipPart = selectedChips
      .map((c) => c.replace(/^[^\u0000-\u007E]+\s*/, '').trim())
      .join(', ')
    const inputPart = input.trim()
    if (chipPart && inputPart) return `${inputPart} — ${chipPart}`
    return chipPart || inputPart
  }

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return

      const userMessage: Message = {
        id: genId(),
        role: 'user',
        content: text,
      }

      const assistantId = genId()
      const assistantPlaceholder: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        isStreaming: true,
      }

      const historyForApi = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: text },
      ]

      setMessages((prev) => [...prev, userMessage, assistantPlaceholder])
      setInput('')
      setSelectedChips([])
      setShowHistory(false)
      setLoading(true)

      // Save to history
      setHistory((prev) => saveToHistory(text, prev))

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: historyForApi }),
        })

        if (!res.ok || !res.body) {
          throw new Error(`API error: ${res.status}`)
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let accumulated = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          accumulated += chunk

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: accumulated, isStreaming: true }
                : m
            )
          )
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, isStreaming: false } : m
          )
        )
      } catch (err) {
        console.error('[ChatInterface] Error:', err)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: "Hmm, something went wrong on my end. Try again in a moment!",
                  isStreaming: false,
                }
              : m
          )
        )
      } finally {
        setLoading(false)
      }
    },
    [loading, messages]
  )

  function handleSubmit() {
    const query = buildQuery()
    if (query) sendMessage(query)
  }

  function handleChipToggle(chipText: string) {
    setSelectedChips((prev) =>
      prev.includes(chipText)
        ? prev.filter((c) => c !== chipText)
        : [...prev, chipText]
    )
  }

  function handleQuickPick(chipText: string) {
    sendMessage(chipText)
  }

  function handleThumbsRating(messageId: string, rating: 'up' | 'down') {
    setThumbsRatings((prev) => ({
      ...prev,
      [messageId]: prev[messageId] === rating ? undefined as unknown as 'up' | 'down' : rating,
    }))
  }

  function clearChat() {
    setMessages([])
    setInput('')
    setSelectedChips([])
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-sm shrink-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-[0_0_12px_rgba(139,92,246,0.4)]">
            <Film size={15} className="text-white" />
          </div>
          <span className="text-white font-semibold tracking-tight">AI-Mov</span>
          <span className="text-gray-700 text-[10px] font-mono bg-white/5 px-1.5 py-0.5 rounded">beta</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Watchlist button */}
          {watchlist.length > 0 && (
            <button
              onClick={() => { setShowWatchlist((s) => !s); setShowHistory(false) }}
              className={`flex items-center gap-1.5 text-xs transition-colors duration-200 px-2 py-1 rounded-lg
                ${showWatchlist
                  ? 'text-violet-300 bg-violet-500/10 hover:bg-violet-500/20'
                  : 'text-gray-600 hover:text-gray-300 hover:bg-white/5'
                }`}
            >
              <Bookmark size={13} />
              Watchlist ({watchlist.length})
            </button>
          )}

          {/* History button */}
          {history.length > 0 && (
            <button
              onClick={() => setShowHistory((s) => !s)}
              className={`flex items-center gap-1.5 text-xs transition-colors duration-200 px-2 py-1 rounded-lg
                ${showHistory
                  ? 'text-violet-300 bg-violet-500/10 hover:bg-violet-500/20'
                  : 'text-gray-600 hover:text-gray-300 hover:bg-white/5'
                }`}
            >
              <Clock size={13} />
              Recent
            </button>
          )}

          {hasMessages && (
            <button
              onClick={clearChat}
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-300 text-xs transition-colors duration-200 px-2 py-1 rounded-lg hover:bg-white/5"
            >
              <Trash2 size={13} />
              Clear
            </button>
          )}
        </div>
      </header>

      {/* Recent history dropdown */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="shrink-0 bg-[#0f0f0f] border-b border-white/5 px-4 py-3 z-20"
          >
            <div className="max-w-2xl mx-auto">
              <p className="text-gray-600 text-[10px] font-mono uppercase tracking-widest mb-2">
                Recent Searches
              </p>
              <div className="flex flex-col gap-1">
                {history.map((q, i) => (
                  <div key={i} className="flex items-center gap-2 group">
                    <button
                      onClick={() => {
                        setInput(q)
                        setShowHistory(false)
                      }}
                      className="flex-1 text-left text-sm text-gray-400 hover:text-gray-200 py-1 px-2 rounded-lg hover:bg-white/5 transition-colors duration-150 truncate"
                    >
                      {q}
                    </button>
                    <button
                      onClick={() => {
                        const updated = history.filter((_, idx) => idx !== i)
                        setHistory(updated)
                        sessionStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
                      }}
                      className="opacity-0 group-hover:opacity-100 text-gray-700 hover:text-gray-400 transition-all duration-150 p-1"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Watchlist dropdown */}
      <AnimatePresence>
        {showWatchlist && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="shrink-0 bg-[#0f0f0f] border-b border-white/5 px-4 py-3 z-20"
          >
            <div className="max-w-2xl mx-auto">
              <p className="text-gray-600 text-[10px] font-mono uppercase tracking-widest mb-2">
                Watchlist
              </p>
              {watchlist.length === 0 ? (
                <p className="text-gray-600 text-sm py-1">Nothing saved yet — tap the bookmark on any pick.</p>
              ) : (
                <div className="flex flex-col gap-1 max-h-56 overflow-y-auto">
                  {watchlist.map((item) => (
                    <div key={`${item.title}-${item.year}`} className="flex items-center gap-2 group">
                      <span className="flex-1 text-left text-sm text-gray-300 py-1 px-2 truncate">
                        {item.title}
                        <span className="text-gray-600 ml-2 text-xs">
                          {item.year}{item.type ? ` · ${item.type}` : ''}
                        </span>
                      </span>
                      <button
                        onClick={() => removeFromWatchlist(item.title, item.year)}
                        aria-label={`Remove ${item.title}`}
                        className="text-gray-700 hover:text-gray-400 transition-all duration-150 p-1"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        <AnimatePresence mode="wait">
          {!hasMessages ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col items-center justify-start px-6 pt-10 pb-8 overflow-y-auto"
            >
              {/* Ambient floating shapes */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/5 w-72 h-72 rounded-full bg-violet-600/5 blur-3xl animate-float" />
                <div className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full bg-blue-600/5 blur-3xl animate-float-slow" />
                <div className="absolute top-1/2 right-1/3 w-40 h-40 rounded-full border border-violet-500/5 animate-float-slower" />
                <div className="absolute top-2/3 left-1/3 w-32 h-32 rounded-full bg-indigo-600/4 blur-2xl animate-float" style={{ animationDelay: '3s' }} />
              </div>

              <div className="relative z-10 max-w-xl w-full text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05, duration: 0.5 }}
                >
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight tracking-tight">
                    What do you feel like{' '}
                    <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                      watching tonight?
                    </span>
                  </h1>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  className="text-gray-500 text-base mb-10 leading-relaxed"
                >
                  Tell me your mood, a movie you loved, or just vibe —{' '}
                  <br className="hidden sm:block" />
                  I&apos;ll find something perfect.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                >
                  <CategoryChips
                    selectedChips={selectedChips}
                    onChipToggle={handleChipToggle}
                    onQuickPick={handleQuickPick}
                    compact={false}
                  />
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <ChatWindow
                messages={messages}
                thumbsRatings={thumbsRatings}
                onThumbsRating={handleThumbsRating}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Compact chip strip — only when chatting */}
      {hasMessages && (
        <div className="border-t border-white/5 py-2 shrink-0">
          <CategoryChips
            selectedChips={selectedChips}
            onChipToggle={handleChipToggle}
            onQuickPick={handleQuickPick}
            compact={true}
          />
        </div>
      )}

      {/* Chat input — always at bottom */}
      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        loading={loading}
        selectedChips={selectedChips}
        onChipRemove={(chip) => handleChipToggle(chip)}
        hasContent={buildQuery().length > 0}
      />
    </div>
  )
}
