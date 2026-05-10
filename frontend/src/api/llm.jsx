const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

export async function ask(question, ragEnabled) {
  const res = await fetch(`${API_URL}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, rag_enabled: ragEnabled }),
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(detail.detail || `API error ${res.status}`)
  }
  return res.json()
}
