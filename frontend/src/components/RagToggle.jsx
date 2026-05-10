export default function RagToggle({ enabled, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`text-sm font-medium transition-colors ${enabled ? 'text-emerald-400' : 'text-gray-500'}`}>
        RAG {enabled ? 'ON' : 'OFF'}
      </span>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
          enabled ? 'bg-emerald-500' : 'bg-gray-700'
        }`}
        aria-label="Toggle RAG"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}
