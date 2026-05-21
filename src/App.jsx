/**
 * @file App.jsx
 * @description Root component. Manages global state (company, answers, actions),
 *              screen routing, localStorage persistence, import/export, and sample data.
 */
import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './components/Dashboard.jsx'
import CompanySetup from './components/CompanySetup.jsx'
import DataInput from './components/DataInput.jsx'
import ActionTracker from './components/ActionTracker.jsx'
import ReportPreview from './components/ReportPreview.jsx'
import {
  saveCompany, loadCompany,
  saveAnswers, loadAnswers,
  saveActions, loadActions,
} from './utils/storage.js'
import { importData } from './utils/storage.js'
import { validateImport, sanitizeAnswers } from './utils/validation.js'
import { SAMPLE_COMPANY, SAMPLE_ANSWERS } from './data/sampleData.js'
import { SECTIONS } from './data/questions.js'

export default function App() {
  const [screen,        setScreen]        = useState('dashboard')
  const [company,       setCompany]       = useState(null)
  const [answers,       setAnswers]       = useState({})
  const [actions,       setActions]       = useState([])
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id)
  const [toast,         setToast]         = useState(null)

  // ── Persistence ─────────────────────────────────────────
  useEffect(() => {
    const c = loadCompany()
    const a = loadAnswers()
    const t = loadActions()
    if (c) setCompany(c)
    if (a && Object.keys(a).length > 0) setAnswers(a)
    if (t && t.length > 0) setActions(t)
  }, [])

  // ── Toast helper ─────────────────────────────────────────
  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Company ──────────────────────────────────────────────
  function handleSaveCompany(data) {
    setCompany(data)
    saveCompany(data)
    setScreen('dashboard')
    showToast('Company details saved')
  }

  // ── Answers (auto-save on change, sanitized) ─────────────
  const handleAnswerChange = useCallback((questionId, value) => {
    setAnswers(prev => {
      const next = { ...prev, [questionId]: value }
      saveAnswers(next)
      return next
    })
  }, [])

  // ── Actions ──────────────────────────────────────────────
  function handleActionsChange(updated) {
    setActions(updated)
    saveActions(updated)
  }

  // ── Sample data ──────────────────────────────────────────
  function handleLoadSample() {
    const clean = sanitizeAnswers(SAMPLE_ANSWERS)
    setCompany(SAMPLE_COMPANY)
    saveCompany(SAMPLE_COMPANY)
    setAnswers(clean)
    saveAnswers(clean)
    showToast('⚡ Sample data loaded — Sunrise Manufacturing Ltd')
  }

  // ── Export JSON ──────────────────────────────────────────
  // (triggered from Dashboard via exportData util directly)

  // ── Import JSON ──────────────────────────────────────────
  function handleImport() {
    importData(
      (data) => {
        const { valid, reason } = validateImport(data)
        if (!valid) { showToast(`Import failed: ${reason}`, 'error'); return }
        const clean = sanitizeAnswers(data.answers || {})
        setCompany(data.company)
        saveCompany(data.company)
        setAnswers(clean)
        saveAnswers(clean)
        if (data.actions?.length) {
          setActions(data.actions)
          saveActions(data.actions)
        }
        showToast(`Imported: ${data.company.companyName}`)
      },
      (err) => showToast(`Import failed: ${err}`, 'error')
    )
  }

  // ── Screen map ───────────────────────────────────────────
  const screens = {
    dashboard: (
      <Dashboard answers={answers} company={company}
        setScreen={setScreen} setActiveSection={setActiveSection}
        onLoadSample={handleLoadSample} onImport={handleImport} />
    ),
    setup: (
      <CompanySetup company={company} onSave={handleSaveCompany} />
    ),
    input: (
      <DataInput answers={answers} onAnswerChange={handleAnswerChange}
        activeSection={activeSection} setActiveSection={setActiveSection} />
    ),
    tracker: (
      <ActionTracker actions={actions} onActionsChange={handleActionsChange} />
    ),
    report: (
      <ReportPreview answers={answers} company={company} />
    ),
  }

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'setup',     label: 'Setup'     },
    { id: 'input',     label: 'Data Entry'},
    { id: 'tracker',   label: 'Tracker'   },
    { id: 'report',    label: 'Report'    },
  ]

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">

      {/* Global toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-medium transition-all ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Demo badge */}
      <div id="print-hide" className="fixed top-3 right-4 z-50">
        <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-300 shadow-sm">
          DEMO MODE
        </span>
      </div>

      <Sidebar screen={screen} setScreen={setScreen}
        answers={answers} activeSection={activeSection}
        setActiveSection={setActiveSection} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top nav */}
        <header id="topbar" className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0 print:hidden">
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <button key={item.id} onClick={() => setScreen(item.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  screen === item.id ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>SEBI BRSR · {company?.financialYear || 'FY 2024-25'}</span>
            {company && (
              <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                {company.companyName}
              </span>
            )}
          </div>
        </header>

        {screens[screen] || screens.dashboard}
      </main>
    </div>
  )
}
