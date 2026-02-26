'use client'

import { motion } from 'framer-motion'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import MovieCard from './MovieCard'
import { parseResponse } from '@/lib/parseRecommendations'
import type { Message, MovieCard as MovieCardType } from '@/lib/types'

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-2">
      <span className="typing-dot w-2 h-2 rounded-full bg-violet-400 inline-block" />
      <span className="typing-dot w-2 h-2 rounded-full bg-violet-400 inline-block" />
      <span className="typing-dot w-2 h-2 rounded-full bg-violet-400 inline-block" />
    </div>
  )
}

interface AssistantContentProps {
  content: string
  isStreaming: boolean
}

function AssistantContent({ content, isStreaming }: AssistantContentProps) {
  if (isStreaming && !content) {
    return <TypingIndicator />
  }

  if (isStreaming) {
    return (
      <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
        {content}
        <span className="inline-block w-0.5 h-4 bg-violet-400 ml-0.5 animate-pulse align-middle" />
      </div>
    )
  }

  // Stream complete — parse and render
  const segments = parseResponse(content)
  let cardIndex = 0

  return (
    <div className="space-y-1">
      {segments.map((segment, i) => {
        if (segment.type === 'text') {
          const text = segment.content as string
          if (!text.trim()) return null
          return (
            <p key={i} className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
              {text}
            </p>
          )
        } else {
          const delay = cardIndex++ * 0.08
          return (
            <MovieCard
              key={i}
              card={segment.content as MovieCardType}
              delay={delay}
            />
          )
        }
      })}
    </div>
  )
}

interface MessageBubbleProps {
  message: Message
  thumbs: 'up' | 'down' | null
  onThumbsRating: (messageId: string, rating: 'up' | 'down') => void
}

export default function MessageBubble({ message, thumbs, onThumbsRating }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isDone = !message.isStreaming && message.role === 'assistant'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-5`}
    >
      {isUser ? (
        <div className="
          max-w-[75%] bg-violet-600 text-white
          rounded-2xl rounded-br-sm px-4 py-3
          text-sm leading-relaxed shadow-[0_2px_12px_rgba(139,92,246,0.25)]
        ">
          {message.content}
        </div>
      ) : (
        <div className="max-w-[90%] md:max-w-[85%]">
          <AssistantContent
            content={message.content}
            isStreaming={message.isStreaming ?? false}
          />

          {/* Thumbs up / down — only shown when stream is complete */}
          {isDone && message.content && (
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => onThumbsRating(message.id, 'up')}
                aria-label="Good recommendations"
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs border transition-all duration-200
                  ${thumbs === 'up'
                    ? 'bg-green-500/20 border-green-500/50 text-green-400'
                    : 'bg-transparent border-white/10 text-gray-600 hover:border-white/20 hover:text-gray-400'
                  }`}
              >
                <ThumbsUp size={12} />
                {thumbs === 'up' && <span>Nice picks</span>}
              </button>
              <button
                onClick={() => onThumbsRating(message.id, 'down')}
                aria-label="Not helpful"
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs border transition-all duration-200
                  ${thumbs === 'down'
                    ? 'bg-red-500/20 border-red-500/50 text-red-400'
                    : 'bg-transparent border-white/10 text-gray-600 hover:border-white/20 hover:text-gray-400'
                  }`}
              >
                <ThumbsDown size={12} />
                {thumbs === 'down' && <span>Not for me</span>}
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
