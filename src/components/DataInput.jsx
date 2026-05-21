import { useState, useCallback } from 'react'
import { SECTIONS, QUESTIONS } from '../data/questions.js'

/* ── Table input component ──────────────────────────────── */
function TableInput({ question, value, onChange }) {
  const parsed = (() => { try { return value ? JSON.parse(value) : {} } catch { return {} } })()

  function update(row, col, val) {
    const next = { ...parsed, [row]: [...(parsed[row] || question.columns.slice(1).map(() => '')) ] }
    const colIdx = question.columns.indexOf(col) - 1
    next[row][colIdx] = val
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
              <th key={col} className="border border-gray-200 px-3 py-2 text-left font-medium text-gray-600 text-xs">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {question.rows.map(row => (
            <tr key={row} className="hover:bg-gray-50">
              <td className="border border-gray-200 px-3 py-2 font-medium text-gray-700 text-xs bg-gray-50 w-1/4">
                {row}
              </td>
              {question.columns.slice(1).map(col => (
                <td key={col} className="border border-gray-200 p-1">
                  <input
                    type="text"
                    value={getVal(row, col)}
                    onChange={e => update(row, col, e.target.value)}
                    className="w-full px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 rounded"
                    placeholder="—"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── Policy Matrix ─────────────────────────────────────── */
const PRINCIPLES = ['P1: Ethics', 'P2: Products', 'P3: Employees', 'P4: Stakeholders', 'P5: Human Rights', 'P6: Environment', 'P7: Policy', 'P8: Growth', 'P9: Customer']

function PolicyMatrix({ value, onChange }) {
  const parsed = (() => { try { return value ? JSON.parse(value) : {} } catch { return {} } })()

  function update(p, field, val) {
    const next = { ...parsed, [p]: { ...(parsed[p] || {}), [field]: val } }
    onChange(JSON.stringify(next))
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
                <input type="checkbox" checked={!!get(p, 'policy')} onChange={e => update(p, 'policy', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
              </td>
              <td className="border border-gray-200 px-3 py-2 text-center">
                <input type="checkbox" checked={!!get(p, 'board')} onChange={e => update(p, 'board', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
              </td>
              <td className="border border-gray-200 p-1">
                <input type="text" value={get(p, 'link')} onChange={e => update(p, 'link', e.target.value)}
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

/* ── Single question renderer ──────────────────────────── */
function QuestionField({ question, value, onChange }) {
  const isNA = value === 'na'

  if (isNA) return (
    <div className="flex items-center gap-2">
      <span className="text-gray-400 text-sm italic">Marked as Not Applicable</span>
      <button onClick={() => onChange('')} className="text-xs text-blue-500 hover:underline">Undo</button>
    </div>
  )

  const inputClass = "input-base"

  switch (question.type) {
    case 'textarea':
      return <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={4}
        className={`${inputClass} resize-none`} placeholder="Enter details…" />

    case 'number':
      return <input type="number" value={value || ''} onChange={e => onChange(e.target.value)}
        className={inputClass} placeholder="0" step="0.01" />

    case 'text':
      return <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
        className={inputClass} placeholder="Enter value…" />

    case 'yesno':
      return (
        <div className="flex gap-4">
          {['yes', 'no'].map(opt => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name={question.id} value={opt} checked={value === opt}
                onChange={() => onChange(opt)}
                className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500" />
              <span className="text-sm font-medium text-gray-700 capitalize">{opt}</span>
            </label>
          ))}
        </div>
      )

    case 'select':
      return (
        <select value={value || ''} onChange={e => onChange(e.target.value)} className={`${inputClass} bg-white`}>
          <option value="">Select…</option>
          {(question.options || []).map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )

    case 'table':
      return <TableInput question={question} value={value} onChange={onChange} />

    case 'policy-matrix':
      return <PolicyMatrix value={value} onChange={onChange} />

    default:
      return <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} className={inputClass} />
  }
}

/* ── Main DataInput screen ─────────────────────────────── */
export default function DataInput({ answers, onAnswerChange, activeSection, setActiveSection }) {
  const sectionIdx = SECTIONS.findIndex(s => s.id === activeSection)
  const section = SECTIONS[sectionIdx]
  const questions = QUESTIONS[activeSection] || []

  const answered = questions.filter(q => answers[q.id] && answers[q.id] !== '' && answers[q.id] !== 'na').length
  const pct = questions.length ? Math.round((answered / questions.length) * 100) : 0

  function goNext() {
    if (sectionIdx < SECTIONS.length - 1) setActiveSection(SECTIONS[sectionIdx + 1].id)
  }
  function goPrev() {
    if (sectionIdx > 0) setActiveSection(SECTIONS[sectionIdx - 1].id)
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen flex flex-col overflow-hidden">
      {/* Section header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shrink-0">
        <div>
          <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">
            Section {sectionIdx + 1} of {SECTIONS.length}
          </div>
          <h1 className="text-lg font-bold text-gray-900">
            {section?.label}: {section?.title}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-700">{pct}% complete</div>
            <div className="text-xs text-gray-400">{answered} / {questions.length} answered</div>
          </div>
          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {questions.map((q, idx) => {
            const val = answers[q.id] || ''
            const isNA = val === 'na'
            const isFilled = val && val !== '' && val !== 'na'
            return (
              <div key={q.id} className={`card p-6 transition-all ${isFilled ? 'border-green-200' : ''}`}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      isFilled ? 'bg-green-100 text-green-700' : isNA ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {isFilled ? '✓' : idx + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{q.num}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm">{q.label}</h3>
                      {q.helper && <p className="text-xs text-gray-500 mt-0.5">{q.helper}</p>}
                    </div>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={isNA}
                      onChange={e => onAnswerChange(q.id, e.target.checked ? 'na' : '')}
                      className="w-3.5 h-3.5 rounded border-gray-300"
                    />
                    N/A
                  </label>
                </div>
                <QuestionField question={q} value={val} onChange={v => onAnswerChange(q.id, v)} />
              </div>
            )
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-t border-gray-200 px-8 py-4 flex items-center justify-between shrink-0">
        <button onClick={goPrev} disabled={sectionIdx === 0}
          className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
          ← Previous Section
        </button>
        <div className="flex gap-1.5">
          {SECTIONS.map((sec, i) => (
            <button key={sec.id} onClick={() => setActiveSection(sec.id)}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                i === sectionIdx ? 'bg-green-600 w-4' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
        <button onClick={goNext} disabled={sectionIdx === SECTIONS.length - 1}
          className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
          Next Section →
        </button>
      </div>
    </div>
  )
}
