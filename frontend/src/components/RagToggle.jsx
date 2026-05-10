export default function RagToggle({ enabled, onChange }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={`text-xs font-medium transition-colors ${enabled ? 'text-emerald-600' : 'text-gray-400'}`}>
        RAG {enabled ? 'ON' : 'OFF'}
      </span>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 ${
          enabled ? 'bg-emerald-500' : 'bg-gray-200'
        }`}
        aria-label="Toggle RAG"
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
            enabled ? 'translate-x-[18px]' : 'translate-x-[3px]'
          }`}
        />
      </button>
    </div>
  )
}
