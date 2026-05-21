/**
 * @file ActionTracker.jsx
 * @description Evidence & Action Tracker for BRSR data collection.
 *              Tracks outstanding data requests, responsible persons,
 *              deadlines, and evidence documents required per section.
 */
import { useState } from 'react'
import { QUESTION_META } from '../data/questionMeta.js'
import { SECTIONS, QUESTIONS } from '../data/questions.js'

const PRIORITIES = ['High', 'Medium', 'Low']
const STATUSES   = ['Pending', 'In Progress', 'Done', 'Not Applicable']

const STATUS_COLORS = {
  'Pending':        'bg-red-50 text-red-700 border-red-200',
  'In Progress':    'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Done':           'bg-green-50 text-green-700 border-green-200',
  'Not Applicable': 'bg-gray-50 text-gray-500 border-gray-200',
}

const PRIORITY_COLORS = {
  'High':   'text-red-600',
  'Medium': 'text-yellow-600',
  'Low':    'text-gray-400',
}

function defaultActions() {
  // Generate default actions from question metadata (evidence requirements)
  const actions = []
  for (const [qid, meta] of Object.entries(QUESTION_META)) {
    if (!meta.evidence) continue
    // Find which section this question belongs to
    const section = SECTIONS.find(s => QUESTIONS[s.id]?.some(q => q.id === qid))
    if (!section) continue
    const question = QUESTIONS[section.id]?.find(q => q.id === qid)
    if (!question) continue
    actions.push({
      id:          qid + '_action',
      questionId:  qid,
      questionNum: question.num,
      questionLabel: question.label,
      sectionId:   section.id,
      sectionLabel:section.title,
      evidence:    meta.evidence,
      brsrCore:    meta.brsrCore || false,
      gri:         meta.gri || '',
      status:      'Pending',
      priority:    meta.brsrCore ? 'High' : 'Medium',
      assignedTo:  '',
      dueDate:     '',
      notes:       '',
    })
  }
  return actions
}

export default function ActionTracker({ actions, onActionsChange }) {
  const [filter, setFilter] = useState('All')
  const [sectionFilter, setSectionFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [editId, setEditId] = useState(null)

  // Initialize with default actions if empty
  const allActions = actions.length > 0 ? actions : defaultActions()

  function update(id, field, value) {
    const updated = allActions.map(a => a.id === id ? { ...a, [field]: value } : a)
    onActionsChange(updated)
  }

  const statuses = ['All', ...STATUSES]
  const sectionIds = ['All', ...SECTIONS.map(s => s.id)]

  const filtered = allActions.filter(a => {
    if (filter !== 'All' && a.status !== filter) return false
    if (sectionFilter !== 'All' && a.sectionId !== sectionFilter) return false
    if (search && !a.questionLabel.toLowerCase().includes(search.toLowerCase()) &&
        !a.evidence.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const counts = {
    'All': allActions.length,
    'Pending': allActions.filter(a => a.status === 'Pending').length,
    'In Progress': allActions.filter(a => a.status === 'In Progress').length,
    'Done': allActions.filter(a => a.status === 'Done').length,
  }
  const donePct = Math.round((counts['Done'] / allActions.length) * 100)

  return (
    <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Evidence & Action Tracker</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track data collection, assign owners, and manage evidence documents for each BRSR question.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{donePct}%</div>
              <div className="text-xs text-gray-400">Evidence ready</div>
            </div>
            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${donePct}%` }} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-4">
          {['All', 'Pending', 'In Progress', 'Done'].map(s => (
            <button key={s}
              onClick={() => setFilter(s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                filter === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              <span>{counts[s]}</span>
              <span className="font-normal opacity-80">{s}</span>
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search…" className="input-base w-48 text-sm py-1.5" />
            <select value={sectionFilter} onChange={e => setSectionFilter(e.target.value)}
              className="input-base w-40 text-sm py-1.5 bg-white">
              {sectionIds.map(id => (
                <option key={id} value={id}>{id === 'All' ? 'All Sections' : SECTIONS.find(s=>s.id===id)?.title || id}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="space-y-2">
          {filtered.map(action => (
            <div key={action.id} className="card p-4">
              <div className="flex items-start gap-4">
                {/* Status pill */}
                <select
                  value={action.status}
                  onChange={e => update(action.id, 'status', e.target.value)}
                  className={`shrink-0 border rounded-lg text-xs font-medium px-2 py-1 cursor-pointer focus:outline-none ${STATUS_COLORS[action.status]}`}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{action.questionNum}</span>
                    {action.brsrCore && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium border border-purple-200">BRSR CORE</span>
                    )}
                    <span className={`text-xs font-semibold ${PRIORITY_COLORS[action.priority]}`}>
                      {action.priority === 'High' ? '⚑' : action.priority === 'Medium' ? '◉' : '○'} {action.priority}
                    </span>
                    {action.gri && <span className="text-xs text-gray-400">{action.gri}</span>}
                  </div>
                  <div className="font-medium text-gray-900 text-sm">{action.questionLabel}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    <span className="font-medium text-gray-600">Evidence needed:</span> {action.evidence}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{action.sectionLabel}</div>
                </div>

                {/* Assign + due */}
                <div className="flex items-center gap-2 shrink-0">
                  <input type="text" value={action.assignedTo}
                    onChange={e => update(action.id, 'assignedTo', e.target.value)}
                    placeholder="Assign to…"
                    className="w-32 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-green-500" />
                  <input type="date" value={action.dueDate}
                    onChange={e => update(action.id, 'dueDate', e.target.value)}
                    className="w-36 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-green-500" />
                  <button onClick={() => setEditId(editId === action.id ? null : action.id)}
                    className="text-gray-400 hover:text-gray-600 text-sm px-1.5 cursor-pointer">
                    {editId === action.id ? '▲' : '▼'}
                  </button>
                </div>
              </div>

              {/* Notes (expanded) */}
              {editId === action.id && (
                <div className="mt-3 pl-16">
                  <textarea value={action.notes}
                    onChange={e => update(action.id, 'notes', e.target.value)}
                    rows={2} placeholder="Add notes, document location, or link…"
                    className="input-base text-xs resize-none w-full" />
                  <div className="flex items-center gap-2 mt-2">
                    <select value={action.priority} onChange={e => update(action.id, 'priority', e.target.value)}
                      className="input-base text-xs py-1 w-32 bg-white">
                      {PRIORITIES.map(p => <option key={p} value={p}>{p} Priority</option>)}
                    </select>
                    <span className="text-xs text-gray-400">Tip: attach file path or SharePoint link in notes</span>
                  </div>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">✓</div>
              <div className="font-medium">No actions match your filter</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
