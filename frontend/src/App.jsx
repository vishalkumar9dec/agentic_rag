import { useState } from 'react'
import ChatBox from './components/ChatBox'
import RagToggle from './components/RagToggle'
import Sources from './components/Sources'

const NON_RAG_URL = import.meta.env.VITE_NON_RAG_API_URL || 'http://localhost:8001'
const RAG_URL = import.meta.env.VITE_RAG_API_URL || 'http://localhost:8002'

export default function App() {
  const [ragEnabled, setRagEnabled] = useState(false)
  const [answer, setAnswer] = useState('')
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleToggle = (value) => {
    setRagEnabled(value)
    setAnswer('')
    setSources([])
    setError('')
  }

  const handleAsk = async (question) => {
    setLoading(true)
    setError('')
    setAnswer('')
    setSources([])

    const url = ragEnabled ? RAG_URL : NON_RAG_URL

    try {
      const res = await fetch(`${url}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}))
        throw new Error(detail.detail || `API error ${res.status}`)
      }
      const data = await res.json()
      setAnswer(data.answer)
      setSources(data.sources || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">RAG Explorer</h1>
          <p className="text-xs text-gray-500 mt-0.5">Ask anything. See the difference.</p>
        </div>
        <RagToggle enabled={ragEnabled} onChange={handleToggle} />
      </header>

      {/* Main */}
      <main className="max-w-2xl mx-auto px-6 py-10">
        <ChatBox
          onAsk={handleAsk}
          loading={loading}
          answer={answer}
          error={error}
          ragEnabled={ragEnabled}
        />
        <Sources sources={sources} />
      </main>
    </div>
  )
}
