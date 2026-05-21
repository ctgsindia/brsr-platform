/**
 * @file Sidebar.jsx
 * @description Dark navy sidebar with main navigation and per-section completion bars.
 *              Hidden on mobile (md:flex). Section nav only visible on Data Input screen.
 */
import { SECTIONS, QUESTIONS } from '../data/questions.js'

const NAV = [
  { id: 'dashboard', label: 'Dashboard',        icon: '◈' },
  { id: 'setup',     label: 'Company Setup',     icon: '⊙' },
  { id: 'input',     label: 'Data Input',        icon: '✎' },
  { id: 'tracker',   label: 'Evidence Tracker',  icon: '📋' },
  { id: 'report',    label: 'Report & Export',   icon: '⎙' },
]

function completionForSection(sectionId, answers) {
  const qs = QUESTIONS[sectionId] || []
  if (!qs.length) return 0
  const answered = qs.filter(q => { const v = answers[q.id]; return v && v !== '' && v !== 'na' }).length
  return Math.round((answered / qs.length) * 100)
}

export default function Sidebar({ screen, setScreen, answers, activeSection, setActiveSection }) {
  return (
    <aside id="sidebar" className="hidden md:flex w-64 h-full bg-navy-800 flex-col shrink-0 print:hidden overflow-hidden">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">TC</div>
          <div>
            <div className="text-white font-semibold text-sm">TrueCarbon</div>
            <div className="text-white/40 text-xs">BRSR Platform</div>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="px-3 pt-4 space-y-0.5 shrink-0">
        {NAV.map(item => (
          <button key={item.id} onClick={() => setScreen(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-100 cursor-pointer ${
              screen === item.id ? 'bg-green-600 text-white' : 'text-white/60 hover:text-white hover:bg-white/8'
            }`}>
            <span className="text-base opacity-80">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Section nav (input screen only) */}
      {screen === 'input' && (
        <div className="mt-4 px-3 pb-4 flex-1 overflow-y-auto">
          <div className="text-white/30 text-xs font-semibold px-3 mb-2 uppercase tracking-wider">Sections</div>
          {SECTIONS.map(sec => {
            const pct  = completionForSection(sec.id, answers)
            const done = pct === 100
            return (
              <button key={sec.id}
                onClick={() => { setActiveSection(sec.id); setScreen('input') }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-100 cursor-pointer text-left mb-0.5 ${
                  activeSection === sec.id ? 'bg-white/12 text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/6'
                }`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-xs ${
                  done ? 'bg-green-500 text-white' : 'border border-white/30 text-white/30'
                }`}>
                  {done ? '✓' : ''}
                </span>
                <span className="truncate">{sec.label}: {sec.title}</span>
                <span className="ml-auto text-white/30 shrink-0">{pct}%</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Version / demo badge */}
      <div className="mt-auto px-4 py-4 border-t border-white/10 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-white/30 text-xs">v1.0 · SEBI BRSR 2024</span>
          <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-full font-medium">DEMO</span>
        </div>
      </div>
    </aside>
  )
}
