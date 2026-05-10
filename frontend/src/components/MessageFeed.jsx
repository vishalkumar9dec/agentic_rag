import { useEffect, useRef } from 'react'
import AssistantMessage from './AssistantMessage'

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-2 pb-20 select-none">
      <p className="text-xl font-semibold text-gray-900">What do you want to know?</p>
      <p className="text-sm text-gray-400">Ask anything. Toggle RAG to see the difference.</p>
    </div>
  )
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-2">
      {[0, 150, 300].map(delay => (
        <span
          key={delay}
          className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  )
}

export default function MessageFeed({ messages, loading, onFeedback }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  if (messages.length === 0 && !loading) return <EmptyState />

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {messages.map(msg => {
          if (msg.role === 'user') {
            return (
              <h2 key={msg.id} className="text-xl font-semibold text-gray-900 leading-snug pt-2">
                {msg.content}
              </h2>
            )
          }
          return (
            <AssistantMessage key={msg.id} message={msg} onFeedback={onFeedback} />
          )
        })}
        {loading && <ThinkingIndicator />}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
