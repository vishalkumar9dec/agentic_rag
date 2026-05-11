import { useState } from 'react'

function IconPanelLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
    </svg>
  )
}

function IconChevron({ open }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className={`transition-transform duration-150 ${open ? '' : '-rotate-90'}`}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function IconUser() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconDoc() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

function IconHistory() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function Section({ icon, label, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between w-full px-4 py-2.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span className="text-gray-400">{icon}</span>
          {label}
        </span>
        <IconChevron open={open} />
      </button>
      {open && <div className="pb-2">{children}</div>}
    </div>
  )
}

export default function Sidebar({ open, onClose, history, ragEnabled, documents }) {
  return (
    <div
      className={`shrink-0 flex flex-col border-r border-gray-200 bg-white overflow-hidden transition-all duration-200 ease-in-out ${
        open ? 'w-64' : 'w-0'
      }`}
    >
      <div className="w-64 flex flex-col flex-1 overflow-hidden">

        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-200 shrink-0">
          <span className="text-sm font-semibold text-gray-900">RAG Explorer</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close sidebar"
          >
            <IconPanelLeft />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">

          <Section icon={<IconUser />} label="Profile">
            <div className="px-4 py-2 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-semibold shrink-0 select-none">
                VK
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Vishal Kumar</p>
                <p className="text-xs text-gray-400">Free plan</p>
              </div>
            </div>
          </Section>

          <Section icon={<IconDoc />} label="Documents">
            {ragEnabled ? (
              documents.length > 0 ? (
                <div className="px-4 space-y-1">
                  {documents.map((doc, i) => (
                    <div key={i} className="flex items-center gap-2 py-1.5 text-xs text-gray-600 truncate" title={doc}>
                      <IconDoc />
                      <span className="truncate">{doc}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4">
                  <p className="text-xs text-gray-400">No documents indexed yet.</p>
                </div>
              )
            ) : (
              <div className="px-4">
                <p className="text-xs text-gray-400 leading-relaxed">
                  Enable RAG to ground answers in your documents.
                </p>
              </div>
            )}
          </Section>

          <Section icon={<IconHistory />} label="History">
            {history.length === 0 ? (
              <div className="px-4">
                <p className="text-xs text-gray-400">No conversations yet.</p>
              </div>
            ) : (
              <div>
                {[...history].reverse().map((q, i) => (
                  <div
                    key={i}
                    className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-50 truncate cursor-default transition-colors"
                    title={q}
                  >
                    {q}
                  </div>
                ))}
              </div>
            )}
          </Section>

        </div>
      </div>
    </div>
  )
}
