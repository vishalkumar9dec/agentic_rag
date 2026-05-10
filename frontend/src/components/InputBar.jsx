import { useState, useRef, useEffect } from 'react'

function IconSend() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  )
}

export default function InputBar({ onAsk, loading, ragEnabled }) {
  const [question, setQuestion] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [question])

  const submit = () => {
    if (!question.trim() || loading) return
    onAsk(question.trim())
    setQuestion('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="shrink-0 px-4 pb-5 pt-3 border-t border-gray-200 bg-white">
      <div className="max-w-2xl mx-auto space-y-2">
        <div className="flex items-end gap-3 bg-white border border-gray-300 rounded-2xl px-4 py-3 focus-within:border-gray-400 focus-within:ring-1 focus-within:ring-gray-200 transition-all">
          <textarea
            ref={textareaRef}
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              ragEnabled
                ? 'Ask anything — answers grounded in your documents…'
                : 'Ask anything…'
            }
            rows={1}
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none leading-relaxed"
          />
          <button
            onClick={submit}
            disabled={loading || !question.trim()}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
          >
            <IconSend />
          </button>
        </div>
        <p className="text-center text-xs text-gray-400">
          {ragEnabled
            ? 'RAG ON — answers grounded in your documents'
            : 'RAG OFF — LLM answering from training data · Shift+Enter for new line'}
        </p>
      </div>
    </div>
  )
}
