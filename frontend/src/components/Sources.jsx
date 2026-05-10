export default function Sources({ sources }) {
  if (!sources.length) return null

  return (
    <div className="mt-6 space-y-3">
      <p className="text-xs uppercase tracking-widest text-gray-500">Sources</p>
      {sources.map((source, i) => (
        <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-1">
          <p className="text-xs font-medium text-emerald-400">
            {source.source || `Document ${i + 1}`}
          </p>
          <p className="text-xs text-gray-400 leading-relaxed">{source.content}</p>
        </div>
      ))}
    </div>
  )
}
