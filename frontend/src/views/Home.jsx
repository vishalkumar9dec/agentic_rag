import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import RagToggle from '../components/RagToggle'
import MessageFeed from '../components/MessageFeed'
import InputBar from '../components/InputBar'
import { ask } from '../api/llm'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

function IconPanelLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
    </svg>
  )
}

export default function Home() {
  const [ragEnabled, setRagEnabled] = useState(false)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [documents, setDocuments] = useState([])

  useEffect(() => {
    if (!ragEnabled) { setDocuments([]); return }
    fetch(`${API_URL}/documents`)
      .then(r => r.json())
      .then(d => setDocuments(d.documents || []))
      .catch(() => setDocuments([]))
  }, [ragEnabled])

  const addMessage = (msg) => setMessages(prev => [...prev, msg])

  const handleAsk = async (question) => {
    addMessage({ id: Date.now(), role: 'user', content: question })
    setLoading(true)
    try {
      const data = await ask(question, ragEnabled)
      addMessage({
        id: Date.now() + 1,
        role: 'assistant',
        content: data.answer,
        model: data.model || null,
        sources: data.sources || [],
        confidence: data.confidence ?? null,
        feedback: null,
      })
    } catch (err) {
      addMessage({
        id: Date.now() + 1,
        role: 'assistant',
        content: null,
        error: err.message,
        sources: [],
        confidence: null,
        feedback: null,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFeedback = (id, type) => {
    setMessages(prev =>
      prev.map(m => m.id === id ? { ...m, feedback: m.feedback === type ? null : type } : m)
    )
  }

  const history = messages.filter(m => m.role === 'user').map(m => m.content)

  return (
    <div className="flex h-screen bg-white text-gray-900 overflow-hidden">

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        history={history}
        ragEnabled={ragEnabled}
        documents={documents}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <header className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Toggle sidebar"
            >
              <IconPanelLeft />
            </button>
            <div>
              <h1 className="text-sm font-semibold text-gray-900 leading-none">RAG Explorer</h1>
              <p className="text-xs text-gray-400 mt-0.5">Ask anything. See the difference.</p>
            </div>
          </div>
          <RagToggle enabled={ragEnabled} onChange={setRagEnabled} />
        </header>

        <MessageFeed messages={messages} loading={loading} onFeedback={handleFeedback} />

        <InputBar onAsk={handleAsk} loading={loading} ragEnabled={ragEnabled} />
      </div>
    </div>
  )
}
