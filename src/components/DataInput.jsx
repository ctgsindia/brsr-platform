/**
 * @file DataInput.jsx
 * @description BRSR questionnaire data entry screen.
 *              Features: per-question validation, BRSR Core badges, SDG tags,
 *              auto-computed intensity ratios, GHG calculator trigger, N/A toggle.
 */
import { useState, useCallback } from 'react'
import { SECTIONS, QUESTIONS } from '../data/questions.js'
import { QUESTION_META, SDG_LABELS, SDG_COLORS } from '../data/questionMeta.js'
import { validateAnswer } from '../utils/validation.js'
import { getAutoCalc } from '../utils/calculations.js'
import { sanitizeText } from '../utils/validation.js'
import GHGCalculator from './GHGCalculator.jsx'

/* ── Table input ────────────────────────────────────────── */
function TableInput({ question, value, onChange }) {
  const parsed = (() => { try { return value ? JSON.parse(value) : {} } catch { return {} } })()

  function update(row, col, val) {
    const next = { ...parsed }
    next[row] = [...(parsed[row] || question.columns.slice(1).map(() => ''))]
    const colIdx = question.columns.indexOf(col) - 1
    next[row][colIdx] = sanitizeText(val)
    onChange(JSON.stringify(next))
  }

  function getVal(row, col) {
    const colIdx = question.columns.indexOf(col) - 1
    return (parsed[row] || [])[colIdx] || ''
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50">
            {question.columns.map(col => (
              <th key={col} className="border border-gray-200 px-3 py-2 text-left font-medium text-gray-600 text-xs">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {question.rows.map(row => (
            <tr key={row} className="hover:bg-gray-50">
              <td className="border border-gray-200 px-3 py-2 font-medium text-gray-700 text-xs bg-gray-50 w-1/4">{row}</td>
              {question.columns.slice(1).map(col => (
                <td key={col} className="border border-gray-200 p-1">
                  <input type="text" value={getVal(row, col)} onChange={e => update(row, col, e.target.value)}
                    className="w-full px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 rounded" placeholder="—" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── Policy Matrix ──────────────────────────────────────── */
const PRINCIPLES = ['P1: Ethics', 'P2: Products', 'P3: Employees', 'P4: Stakeholders', 'P5: Human Rights', 'P6: Environment', 'P7: Policy', 'P8: Growth', 'P9: Customer']

function PolicyMatrix({ value, onChange }) {
  const parsed = (() => { try { return value ? JSON.parse(value) : {} } catch { return {} } })()

  function update(p, field, val) {
    onChange(JSON.stringify({ ...parsed, [p]: { ...(parsed[p] || {}), [field]: val } }))
  }
  function get(p, field) { return (parsed[p] || {})[field] || '' }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-600">Principle</th>
            <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-600">Policy Exists</th>
            <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-600">Board Approved</th>
            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-600">Web Link</th>
          </tr>
        </thead>
        <tbody>
          {PRINCIPLES.map(p => (
            <tr key={p} className="hover:bg-gray-50">
              <td className="border border-gray-200 px-3 py-2 font-medium text-gray-700 text-xs bg-gray-50">{p}</td>
              <td className="border border-gray-200 px-3 py-2 text-center">
                <input type="checkbox" checked={!!get(p,'policy')} onChange={e => update(p,'policy',e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
              </td>
              <td className="border border-gray-200 px-3 py-2 text-center">
                <input type="checkbox" checked={!!get(p,'board')} onChange={e => update(p,'board',e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
              </td>
              <td className="border border-gray-200 p-1">
                <input type="text" value={get(p,'link')} onChange={e => update(p,'link',sanitizeText(e.target.value))}
                  placeholder="www.company.in/policy"
                  className="w-full px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 rounded" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── Single question input ──────────────────────────────── */
function QuestionField({ question, value, onChange }) {
  if (value === 'na') return (
    <div className="flex items-center gap-2">
      <span className="text-gray-400 text-sm italic">Marked as Not Applicable</span>
      <button onClick={() => onChange('')} className="text-xs text-blue-500 hover:underline">Undo</button>
    </div>
  )

  const cls = 'input-base'

  switch (question.type) {
    case 'textarea':
      return <textarea value={value||''} onChange={e => onChange(e.target.value)} rows={4}
        className={`${cls} resize-none`} placeholder="Enter details…" maxLength={5000} />
    case 'number':
      return <input type="number" value={value||''} onChange={e => onChange(e.target.value)}
        className={cls} placeholder="0" step="0.01" />
    case 'text':
      return <input type="text" value={value||''} onChange={e => onChange(sanitizeText(e.target.value))}
        className={cls} placeholder="Enter value…" maxLength={500} />
    case 'yesno':
      return (
        <div className="flex gap-4">
          {['yes','no'].map(opt => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name={question.id} value={opt} checked={value===opt}
                onChange={() => onChange(opt)}
                className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500" />
              <span className="text-sm font-medium text-gray-700 capitalize">{opt}</span>
            </label>
          ))}
        </div>
      )
    case 'select':
      return (
        <select value={value||''} onChange={e => onChange(e.target.value)} className={`${cls} bg-white`}>
          <option value="">Select…</option>
          {(question.options||[]).map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )
    case 'table':
      return <TableInput question={question} value={value} onChange={onChange} />
    case 'policy-matrix':
      return <PolicyMatrix value={value} onChange={onChange} />
    default:
      return <input type="text" value={value||''} onChange={e => onChange(sanitizeText(e.target.value))} className={cls} />
  }
}

/* ── SDG Badge ──────────────────────────────────────────── */
function SDGBadge({ code }) {
  const color = SDG_COLORS[code] || '#888'
  const num   = code.replace('SDG','')
  return (
    <span title={SDG_LABELS[code] || code}
      className="inline-flex items-center justify-center w-5 h-5 rounded text-white text-xs font-bold leading-none cursor-help"
      style={{ backgroundColor: color, fontSize: '9px' }}>
      {num}
    </span>
  )
}

/* ── Auto-calc hint ─────────────────────────────────────── */
function AutoCalcHint({ questionId, answers, onApply }) {
  const computed = getAutoCalc(questionId, answers)
  if (computed === null) return null
  const current  = answers[questionId]
  const same     = current && Math.abs(parseFloat(current) - computed) < 0.01
  return (
    <div className="flex items-center gap-2 mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs">
      <span className="text-blue-600">⟳</span>
      <span className="text-blue-700">
        Auto-computed: <strong>{computed}</strong> (from filled values above)
      </span>
      {!same && (
        <button onClick={() => onApply(questionId, String(computed))}
          className="ml-auto bg-blue-600 text-white px-2.5 py-1 rounded text-xs font-medium hover:bg-blue-700 cursor-pointer">
          Apply
        </button>
      )}
      {same && <span className="ml-auto text-blue-500">✓ Matches</span>}
    </div>
  )
}

/* ── Evidence tag ───────────────────────────────────────── */
function EvidenceTag({ questionId }) {
  const meta = QUESTION_META[questionId]
  if (!meta?.evidence) return null
  return (
    <div className="flex items-start gap-1.5 mt-2 text-xs text-gray-400">
      <span>📎</span>
      <span><span className="font-medium text-gray-500">Evidence:</span> {meta.evidence}</span>
    </div>
  )
}

/* ── MAIN DataInput screen ──────────────────────────────── */
export default function DataInput({ answers, onAnswerChange, activeSection, setActiveSection }) {
  const [showGHG, setShowGHG] = useState(false)
  const sectionIdx = SECTIONS.findIndex(s => s.id === activeSection)
  const section    = SECTIONS[sectionIdx]
  const questions  = QUESTIONS[activeSection] || []

  const answered  = questions.filter(q => { const v = answers[q.id]; return v && v !== '' && v !== 'na' }).length
  const pct       = questions.length ? Math.round((answered / questions.length) * 100) : 0

  // Count validation issues in this section
  let errorCount = 0, warnCount = 0
  for (const q of questions) {
    const { error, warning } = validateAnswer(q, answers[q.id])
    if (error)   errorCount++
    if (warning) warnCount++
  }

  function goNext() { if (sectionIdx < SECTIONS.length - 1) setActiveSection(SECTIONS[sectionIdx + 1].id) }
  function goPrev() { if (sectionIdx > 0) setActiveSection(SECTIONS[sectionIdx - 1].id) }

  function handleGHGApply(result) {
    onAnswerChange('C-P6.5', String(result.scope1))
    onAnswerChange('C-P6.6', String(result.scope2))
    setShowGHG(false)
  }

  return (
    <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden">
      {showGHG && <GHGCalculator onApply={handleGHGApply} onClose={() => setShowGHG(false)} />}

      {/* Section header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shrink-0">
        <div>
          <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">
            Section {sectionIdx + 1} of {SECTIONS.length}
          </div>
          <h1 className="text-lg font-bold text-gray-900">{section?.label}: {section?.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          {/* Validation summary */}
          {(errorCount > 0 || warnCount > 0) && (
            <div className="flex items-center gap-2 text-xs">
              {errorCount > 0 && <span className="bg-red-50 text-red-600 border border-red-200 px-2 py-1 rounded-full font-medium">{errorCount} error{errorCount>1?'s':''}</span>}
              {warnCount  > 0 && <span className="bg-yellow-50 text-yellow-600 border border-yellow-200 px-2 py-1 rounded-full font-medium">{warnCount} warning{warnCount>1?'s':''}</span>}
            </div>
          )}
          {/* GHG Calculator shortcut */}
          {activeSection === 'C-P6' && (
            <button onClick={() => setShowGHG(true)}
              className="btn-secondary text-xs flex items-center gap-1.5 py-1.5">
              <span>🧮</span> GHG Calculator
            </button>
          )}
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-700">{pct}% complete</div>
            <div className="text-xs text-gray-400">{answered} / {questions.length} answered</div>
          </div>
          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Questions list */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {questions.map((q, idx) => {
            const val     = answers[q.id] || ''
            const isNA    = val === 'na'
            const isFilled = val && val !== '' && val !== 'na'
            const meta    = QUESTION_META[q.id] || {}
            const { error, warning } = validateAnswer(q, val)
            const autoCalcable = ['C-P6.2','C-P6.4','C-P6.8'].includes(q.id)

            return (
              <div key={q.id} className={`card p-5 transition-all ${
                error   ? 'border-red-300' :
                warning ? 'border-yellow-300' :
                isFilled ? 'border-green-200' : ''
              }`}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Status icon */}
                    <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      error    ? 'bg-red-100 text-red-600' :
                      warning  ? 'bg-yellow-100 text-yellow-600' :
                      isFilled ? 'bg-green-100 text-green-700' :
                      isNA     ? 'bg-gray-100 text-gray-400' :
                                 'bg-gray-100 text-gray-500'
                    }`}>
                      {error ? '!' : warning ? '△' : isFilled ? '✓' : idx + 1}
                    </span>

                    <div className="flex-1">
                      {/* Badges row */}
                      <div className="flex items-center flex-wrap gap-1.5 mb-1">
                        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{q.num}</span>

                        {meta.brsrCore && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium border border-purple-200">
                            CORE ★
                          </span>
                        )}
                        {meta.gri && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{meta.gri}</span>
                        )}
                        {(meta.sdgs || []).map(sdg => <SDGBadge key={sdg} code={sdg} />)}
                      </div>

                      <h3 className="font-semibold text-gray-900 text-sm">{q.label}</h3>
                      {q.helper && <p className="text-xs text-gray-500 mt-0.5">{q.helper}</p>}
                    </div>
                  </div>

                  {/* N/A toggle */}
                  <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer shrink-0">
                    <input type="checkbox" checked={isNA}
                      onChange={e => onAnswerChange(q.id, e.target.checked ? 'na' : '')}
                      className="w-3.5 h-3.5 rounded border-gray-300" />
                    N/A
                  </label>
                </div>

                {/* Input field */}
                <QuestionField question={q} value={val} onChange={v => onAnswerChange(q.id, v)} />

                {/* Validation error */}
                {error && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-red-600">
                    <span>✕</span> {error}
                  </div>
                )}

                {/* Validation warning */}
                {!error && warning && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-yellow-600">
                    <span>△</span> {warning}
                  </div>
                )}

                {/* Auto-calc hint */}
                {autoCalcable && (
                  <AutoCalcHint questionId={q.id} answers={answers} onApply={onAnswerChange} />
                )}

                {/* Evidence requirement */}
                <EvidenceTag questionId={q.id} />
              </div>
            )
          })}
        </div>
      </div>

      {/* Navigation footer */}
      <div className="bg-white border-t border-gray-200 px-8 py-4 flex items-center justify-between shrink-0">
        <button onClick={goPrev} disabled={sectionIdx === 0}
          className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
          ← Previous
        </button>
        <div className="flex gap-1.5">
          {SECTIONS.map((sec, i) => (
            <button key={sec.id} onClick={() => setActiveSection(sec.id)}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                i === sectionIdx ? 'bg-green-600 w-4' : 'bg-gray-300 hover:bg-gray-400'
              }`} />
          ))}
        </div>
        <button onClick={goNext} disabled={sectionIdx === SECTIONS.length - 1}
          className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
          Next →
        </button>
      </div>
    </div>
  )
}
