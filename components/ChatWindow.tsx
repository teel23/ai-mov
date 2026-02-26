'use client'

import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import type { Message } from '@/lib/types'

interface ChatWindowProps {
  messages: Message[]
  thumbsRatings: Record<string, 'up' | 'down'>
  onThumbsRating: (messageId: string, rating: 'up' | 'down') => void
}

export default function ChatWindow({ messages, thumbsRatings, onThumbsRating }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto chat-scroll px-4 py-6 min-h-0">
      <div className="max-w-2xl mx-auto">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            thumbs={thumbsRatings[message.id] ?? null}
            onThumbsRating={onThumbsRating}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
