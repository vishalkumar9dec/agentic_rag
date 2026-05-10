const NON_RAG_URL = import.meta.env.VITE_NON_RAG_API_URL || 'http://localhost:8001'
const RAG_URL = import.meta.env.VITE_RAG_API_URL || 'http://localhost:8002'

export async function ask(question, ragEnabled) {
  const url = ragEnabled ? RAG_URL : NON_RAG_URL
  const res = await fetch(`${url}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(detail.detail || `API error ${res.status}`)
  }
  return res.json()
}
