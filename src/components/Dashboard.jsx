import { SECTIONS, QUESTIONS } from '../data/questions.js'
import { loadLastSaved, formatLastSaved } from '../utils/storage.js'
import { SAMPLE_COMPANY, SAMPLE_ANSWERS } from '../data/sampleData.js'

function sectionCompletion(sectionId, answers) {
  const qs = QUESTIONS[sectionId] || []
  if (!qs.length) return { answered: 0, total: 0, pct: 0 }
  const answered = qs.filter(q => {
    const v = answers[q.id]
    return v && v !== '' && v !== 'na'
  }).length
  return { answered, total: qs.length, pct: Math.round((answered / qs.length) * 100) }
}

function ProgressRing({ pct, size = 120, stroke = 10 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke="#16a34a" strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        className="progress-ring__circle"
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="22" fontWeight="700" fill="#1e293b">
        {pct}%
      </text>
      <text x="50%" y="65%" dominantBaseline="middle" textAnchor="middle" fontSize="9" fill="#6b7280">
        Complete
      </text>
    </svg>
  )
}

export default function Dashboard({ answers, company, setScreen, setActiveSection, onLoadSample }) {
  const totalQ = SECTIONS.reduce((s, sec) => s + sec.count, 0)
  const completedQ = SECTIONS.reduce((s, sec) => s + sectionCompletion(sec.id, answers).answered, 0)
  const pendingQ = totalQ - completedQ
  const sectionsDone = SECTIONS.filter(sec => sectionCompletion(sec.id, answers).pct === 100).length
  const overallPct = Math.round((completedQ / totalQ) * 100)
  const lastSaved = loadLastSaved()

  const companyName = company?.companyName || 'Your Company'

  return (
    <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">BRSR Compliance Platform</h1>
          <p className="text-gray-500 mt-1">
            {companyName} · SEBI-mandated Business Responsibility & Sustainability Report
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">Last saved: {formatLastSaved(lastSaved)}</span>
          <button
            onClick={onLoadSample}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <span>⚡</span> Load Sample Data
          </button>
          <button
            onClick={() => setScreen('report')}
            className="btn-primary text-sm flex items-center gap-2"
          >
            <span>⎙</span> Generate Report
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
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

      {/* Main content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Progress ring */}
        <div className="card p-6 flex flex-col items-center justify-center">
          <ProgressRing pct={overallPct} />
          <p className="text-sm text-gray-500 mt-3 text-center">Overall BRSR Completion</p>
          <p className="text-xs text-gray-400 mt-1">{completedQ} of {totalQ} questions answered</p>
          {!company && (
            <button
              onClick={() => setScreen('setup')}
              className="mt-4 btn-primary text-xs w-full"
            >
              Setup Company →
            </button>
          )}
        </div>

        {/* Section bars */}
        <div className="col-span-2 card p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Section-wise Progress</h2>
          <div className="space-y-3">
            {SECTIONS.map(sec => {
              const { answered, total, pct } = sectionCompletion(sec.id, answers)
              return (
                <div key={sec.id} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <button
                      onClick={() => { setActiveSection(sec.id); setScreen('input') }}
                      className="text-xs font-medium text-gray-700 hover:text-green-600 transition-colors text-left"
                    >
                      <span className="inline-block w-12 text-gray-400">{sec.label}</span>
                      {sec.title}
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

      {/* Company card (if set up) */}
      {company && (
        <div className="mt-6 card p-5">
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
            <div><span className="text-gray-400 block text-xs">Turnover</span>{company.turnover || '—'}</div>
            <div><span className="text-gray-400 block text-xs">Contact</span>{company.contactName || '—'}</div>
          </div>
        </div>
      )}

      {/* CTA row */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <button onClick={() => setScreen('input')} className="card p-4 text-left hover:border-green-300 transition-colors cursor-pointer group">
          <div className="text-2xl mb-2">✎</div>
          <div className="font-semibold text-gray-900 text-sm group-hover:text-green-600">Enter Data</div>
          <div className="text-xs text-gray-400 mt-1">Fill BRSR questionnaire section by section</div>
        </button>
        <button onClick={() => setScreen('report')} className="card p-4 text-left hover:border-green-300 transition-colors cursor-pointer group">
          <div className="text-2xl mb-2">⎙</div>
          <div className="font-semibold text-gray-900 text-sm group-hover:text-green-600">Preview Report</div>
          <div className="text-xs text-gray-400 mt-1">View formatted BRSR report ready for download</div>
        </button>
        <button onClick={onLoadSample} className="card p-4 text-left hover:border-amber-300 transition-colors cursor-pointer group">
          <div className="text-2xl mb-2">⚡</div>
          <div className="font-semibold text-gray-900 text-sm group-hover:text-amber-600">Load Demo Data</div>
          <div className="text-xs text-gray-400 mt-1">Pre-fill with Sunrise Manufacturing sample data</div>
        </button>
      </div>
    </div>
  )
}
