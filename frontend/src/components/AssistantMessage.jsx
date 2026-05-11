import { useState } from 'react'

function IconCopy() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function IconThumbUp() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  )
}

function IconThumbDown() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
      <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
    </svg>
  )
}

function IconDoc() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}

function IconSparkle() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function IconChevron({ open }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function ActionButton({ onClick, active, activeClass, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        active ? activeClass : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  )
}

export default function AssistantMessage({ message, onFeedback }) {
  const [copied, setCopied] = useState(false)
  const [sourcesOpen, setSourcesOpen] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content ?? message.error ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (message.error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
        <p className="text-xs font-medium text-red-600 mb-0.5">Error</p>
        <p className="text-sm text-red-700">{message.error}</p>
      </div>
    )
  }

  const hasDocSources = message.sources.length > 0

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
        {message.content}
      </p>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Action row */}
      <div className="flex items-center justify-between gap-2">

        {/* Left: feedback + copy */}
        <div className="flex items-center gap-0.5 -ml-2">
          <ActionButton onClick={handleCopy} active={copied} activeClass="text-gray-700 bg-gray-100">
            <IconCopy />
          </ActionButton>
          <ActionButton
            onClick={() => onFeedback(message.id, 'up')}
            active={message.feedback === 'up'}
            activeClass="text-emerald-600 bg-emerald-50"
          >
            <IconThumbUp />
          </ActionButton>
          <ActionButton
            onClick={() => onFeedback(message.id, 'down')}
            active={message.feedback === 'down'}
            activeClass="text-red-600 bg-red-50"
          >
            <IconThumbDown />
          </ActionButton>
        </div>

        {/* Right: confidence + sources */}
        <div className="flex items-center gap-2">
          {message.confidence !== null && message.confidence !== undefined && (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border ${
              message.confidence >= 0.7
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : message.confidence >= 0.4
                ? 'border-amber-200 bg-amber-50 text-amber-700'
                : 'border-red-200 bg-red-50 text-red-600'
            }`}>
              {Math.round(message.confidence * 100)}% confidence
            </span>
          )}
          {hasDocSources ? (
            <button
              onClick={() => setSourcesOpen(v => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
            >
              <IconDoc />
              <span>{message.sources.length} {message.sources.length === 1 ? 'source' : 'sources'}</span>
              <IconChevron open={sourcesOpen} />
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border border-gray-200 bg-gray-50 text-gray-400">
              <IconSparkle />
              {message.model ? `${message.model} · LLM` : 'LLM training data'}
            </span>
          )}
        </div>
      </div>

      {/* Document sources panel */}
      {sourcesOpen && hasDocSources && (
        <div className="space-y-2">
          {message.sources.map((src, i) => (
            <div key={i} className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 space-y-1">
              <p className="text-xs font-medium text-emerald-700">
                {src.source || `Document ${i + 1}`}
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">{src.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
