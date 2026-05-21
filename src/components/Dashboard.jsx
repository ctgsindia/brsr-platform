/**
 * @file Dashboard.jsx
 * @description Main dashboard with ESG Readiness Score, section progress,
 *              data quality indicators, export/import, and quick-action CTAs.
 */
import { useRef } from 'react'
import { SECTIONS, QUESTIONS } from '../data/questions.js'
import { loadLastSaved, formatLastSaved, exportData, importData } from '../utils/storage.js'
import { validateImport } from '../utils/validation.js'
import { computeESGScore, getScoreLabel } from '../utils/calculations.js'
import { SAMPLE_COMPANY, SAMPLE_ANSWERS } from '../data/sampleData.js'
import { BRSR_CORE_IDS } from '../data/questionMeta.js'

function sectionCompletion(sectionId, answers) {
  const qs = QUESTIONS[sectionId] || []
  if (!qs.length) return { answered: 0, total: 0, pct: 0 }
  const answered = qs.filter(q => { const v = answers[q.id]; return v && v !== '' && v !== 'na' }).length
  return { answered, total: qs.length, pct: Math.round((answered / qs.length) * 100) }
}

function brsrCoreCompletion(answers) {
  const ids = [...BRSR_CORE_IDS]
  const done = ids.filter(id => { const v = answers[id]; return v && v !== '' && v !== 'na' }).length
  return { done, total: ids.length, pct: Math.round((done / ids.length) * 100) }
}

function ProgressRing({ pct, size = 130, stroke = 11, label = 'Complete' }) {
  const r    = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  const color = pct >= 80 ? '#16a34a' : pct >= 50 ? '#2563eb' : pct >= 25 ? '#f59e0b' : '#ef4444'
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" className="progress-ring__circle" />
      <text x="50%" y="46%" dominantBaseline="middle" textAnchor="middle" fontSize="22" fontWeight="700" fill="#1e293b">{pct}%</text>
      <text x="50%" y="64%" dominantBaseline="middle" textAnchor="middle" fontSize="9" fill="#6b7280">{label}</text>
    </svg>
  )
}

export default function Dashboard({ answers, company, setScreen, setActiveSection, onLoadSample, onImport }) {
  const totalQ     = SECTIONS.reduce((s, sec) => s + sec.count, 0)
  const completedQ = SECTIONS.reduce((s, sec) => s + sectionCompletion(sec.id, answers).answered, 0)
  const pendingQ   = totalQ - completedQ
  const sectionsDone = SECTIONS.filter(sec => sectionCompletion(sec.id, answers).pct === 100).length
  const overallPct = Math.round((completedQ / totalQ) * 100)
  const lastSaved  = loadLastSaved()
  const esgScore   = computeESGScore(answers)
  const scoreInfo  = getScoreLabel(esgScore)
  const core       = brsrCoreCompletion(answers)
  const companyName = company?.companyName || 'Your Company'

  function handleExport() {
    exportData(company || {}, answers)
  }

  return (
    <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">BRSR Compliance Platform</h1>
          <p className="text-gray-500 mt-0.5">{companyName} · SEBI-mandated Business Responsibility &amp; Sustainability Report</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 mr-1">Saved: {formatLastSaved(lastSaved)}</span>
          <button onClick={onImport} className="btn-ghost text-xs flex items-center gap-1.5 border border-gray-200">
            ↑ Import
          </button>
          <button onClick={handleExport} className="btn-ghost text-xs flex items-center gap-1.5 border border-gray-200">
            ↓ Export JSON
          </button>
          <button onClick={onLoadSample} className="btn-secondary text-sm flex items-center gap-1.5">
            ⚡ Sample Data
          </button>
          <button onClick={() => setScreen('report')} className="btn-primary text-sm flex items-center gap-1.5">
            ⎙ Generate Report
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Questions', value: totalQ, color: 'text-gray-900', bg: 'bg-white', border: 'border-gray-200' },
          { label: 'Completed', value: completedQ, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
          { label: 'Pending', value: pendingQ, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
          { label: 'Sections Done', value: `${sectionsDone} / ${SECTIONS.length}`, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
        ].map(card => (
          <div key={card.label} className={`${card.bg} border ${card.border} rounded-xl p-5 shadow-sm`}>
            <div className={`text-3xl font-bold ${card.color}`}>{card.value}</div>
            <div className="text-sm text-gray-500 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Progress ring */}
        <div className="card p-6 flex flex-col items-center justify-center">
          <ProgressRing pct={overallPct} />
          <p className="text-sm text-gray-500 mt-3 text-center">Overall BRSR Completion</p>
          <p className="text-xs text-gray-400 mt-1">{completedQ} of {totalQ} questions answered</p>
          {!company && (
            <button onClick={() => setScreen('setup')} className="mt-4 btn-primary text-xs w-full">
              Setup Company →
            </button>
          )}
        </div>

        {/* ESG Score + BRSR Core */}
        <div className="card p-6 flex flex-col">
          {/* ESG Score */}
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center shrink-0">
              <span className="text-white text-xl font-bold">{esgScore}</span>
            </div>
            <div>
              <div className={`text-lg font-bold ${scoreInfo.color}`}>{scoreInfo.label}</div>
              <div className="text-xs text-gray-500">ESG Readiness Score / 100</div>
              <div className="mt-1.5 w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gray-700 transition-all" style={{ width: `${esgScore}%` }} />
              </div>
            </div>
          </div>

          {/* Score breakdown */}
          <div className="space-y-1.5 text-xs">
            {[
              { label: 'Environment (P6)', pct: sectionCompletion('C-P6', answers).pct, weight: '25%', color: '#16a34a' },
              { label: 'Governance (Sec B)', pct: sectionCompletion('B', answers).pct, weight: '15%', color: '#8b5cf6' },
              { label: 'Employee (P3)', pct: sectionCompletion('C-P3', answers).pct, weight: '15%', color: '#3b82f6' },
              { label: 'General (Sec A)', pct: sectionCompletion('A', answers).pct, weight: '10%', color: '#f59e0b' },
              { label: 'Ethics (P1)', pct: sectionCompletion('C-P1', answers).pct, weight: '10%', color: '#ec4899' },
            ].map(row => (
              <div key={row.label} className="flex items-center gap-2">
                <span className="w-28 text-gray-500 truncate">{row.label}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${row.pct}%`, backgroundColor: row.color }} />
                </div>
                <span className="w-8 text-right text-gray-400">{row.pct}%</span>
                <span className="w-8 text-right text-gray-300">{row.weight}</span>
              </div>
            ))}
          </div>

          {/* BRSR Core indicator */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-purple-700">★ BRSR Core Mandatory</span>
              <span className="text-xs text-gray-500">{core.done}/{core.total}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-purple-500 transition-all" style={{ width: `${core.pct}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1">Required for top 1000 listed companies</p>
          </div>
        </div>

        {/* Section bars */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Section-wise Progress</h2>
          <div className="space-y-2.5">
            {SECTIONS.map(sec => {
              const { answered, total, pct } = sectionCompletion(sec.id, answers)
              return (
                <div key={sec.id}>
                  <div className="flex items-center justify-between mb-0.5">
                    <button onClick={() => { setActiveSection(sec.id); setScreen('input') }}
                      className="text-xs font-medium text-gray-700 hover:text-green-600 transition-colors text-left flex items-center gap-1.5">
                      {pct === 100
                        ? <span className="text-green-500 text-xs">✓</span>
                        : <span className="text-gray-300 text-xs">○</span>}
                      <span className="text-gray-400 w-8">{sec.label}</span>
                      <span className="truncate">{sec.title}</span>
                    </button>
                    <span className="text-xs text-gray-400 shrink-0 ml-2">{answered}/{total}</span>
                  </div>
                  <div className="section-bar">
                    <div className="section-bar-fill" style={{ width: `${pct}%`, backgroundColor: sec.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Company card */}
      {company && (
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Company Details</h2>
            <button onClick={() => setScreen('setup')} className="text-xs text-green-600 hover:underline">Edit</button>
          </div>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div><span className="text-gray-400 block text-xs">Company</span>{company.companyName}</div>
            <div><span className="text-gray-400 block text-xs">CIN</span>{company.cin || '—'}</div>
            <div><span className="text-gray-400 block text-xs">Sector</span>{company.sector || '—'}</div>
            <div><span className="text-gray-400 block text-xs">Exchange</span>{company.exchange || '—'}</div>
            <div><span className="text-gray-400 block text-xs">FY</span>{company.financialYear || '—'}</div>
            <div><span className="text-gray-400 block text-xs">Employees</span>{company.employees ? Number(company.employees).toLocaleString('en-IN') : '—'}</div>
            <div><span className="text-gray-400 block text-xs">Turnover Range</span>{company.turnover || '—'}</div>
            <div><span className="text-gray-400 block text-xs">Contact</span>{company.contactName || '—'}</div>
          </div>
        </div>
      )}

      {/* CTA cards */}
      <div className="grid grid-cols-4 gap-4">
        <button onClick={() => setScreen('input')} className="card p-4 text-left hover:border-green-300 transition-colors cursor-pointer group">
          <div className="text-xl mb-2">✎</div>
          <div className="font-semibold text-gray-900 text-sm group-hover:text-green-600">Enter Data</div>
          <div className="text-xs text-gray-400 mt-1">Fill BRSR questions section by section</div>
        </button>
        <button onClick={() => setScreen('tracker')} className="card p-4 text-left hover:border-blue-300 transition-colors cursor-pointer group">
          <div className="text-xl mb-2">📋</div>
          <div className="font-semibold text-gray-900 text-sm group-hover:text-blue-600">Evidence Tracker</div>
          <div className="text-xs text-gray-400 mt-1">Assign data tasks and track evidence</div>
        </button>
        <button onClick={() => setScreen('report')} className="card p-4 text-left hover:border-green-300 transition-colors cursor-pointer group">
          <div className="text-xl mb-2">⎙</div>
          <div className="font-semibold text-gray-900 text-sm group-hover:text-green-600">Preview Report</div>
          <div className="text-xs text-gray-400 mt-1">View formatted report ready for PDF</div>
        </button>
        <button onClick={onLoadSample} className="card p-4 text-left hover:border-amber-300 transition-colors cursor-pointer group">
          <div className="text-xl mb-2">⚡</div>
          <div className="font-semibold text-gray-900 text-sm group-hover:text-amber-600">Load Demo Data</div>
          <div className="text-xs text-gray-400 mt-1">Sunrise Manufacturing sample data</div>
        </button>
      </div>
    </div>
  )
}
