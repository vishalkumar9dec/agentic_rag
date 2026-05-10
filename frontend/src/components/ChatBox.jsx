import { useState } from 'react'

export default function ChatBox({ onAsk, loading, answer, error, ragEnabled }) {
  const [question, setQuestion] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!question.trim() || loading) return
    onAsk(question.trim())
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="space-y-5">
      {/* Mode indicator */}
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        ragEnabled
          ? 'bg-emerald-950 border-emerald-800 text-emerald-400'
          : 'bg-gray-900 border-gray-700 text-gray-400'
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${ragEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`} />
        {ragEnabled
          ? 'RAG enabled — answers grounded in your documents'
          : 'No RAG — LLM answering from training memory only'}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question... (Enter to submit)"
          rows={3}
          className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-gray-600 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="px-5 py-2 bg-white text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Thinking...' : 'Ask'}
        </button>
      </form>

      {/* Answer */}
      {answer && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-2">
          <p className="text-xs uppercase tracking-widest text-gray-500">Answer</p>
          <p className="text-sm text-gray-100 leading-relaxed whitespace-pre-wrap">{answer}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-950 border border-red-900 rounded-xl p-4">
          <p className="text-xs text-red-400 font-medium">Error</p>
          <p className="text-xs text-red-300 mt-1">{error}</p>
        </div>
      )}
    </div>
  )
}
