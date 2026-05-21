import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './components/Dashboard.jsx'
import CompanySetup from './components/CompanySetup.jsx'
import DataInput from './components/DataInput.jsx'
import ReportPreview from './components/ReportPreview.jsx'
import { saveCompany, loadCompany, saveAnswers, loadAnswers } from './utils/storage.js'
import { SAMPLE_COMPANY, SAMPLE_ANSWERS } from './data/sampleData.js'
import { SECTIONS } from './data/questions.js'

export default function App() {
  const [screen, setScreen] = useState('dashboard')
  const [company, setCompany] = useState(null)
  const [answers, setAnswers] = useState({})
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id)
  const [sampleLoaded, setSampleLoaded] = useState(false)

  // Load persisted data on mount
  useEffect(() => {
    const c = loadCompany()
    const a = loadAnswers()
    if (c) setCompany(c)
    if (a && Object.keys(a).length > 0) setAnswers(a)
  }, [])

  function handleSaveCompany(data) {
    setCompany(data)
    saveCompany(data)
    setScreen('dashboard')
  }

  const handleAnswerChange = useCallback((questionId, value) => {
    setAnswers(prev => {
      const next = { ...prev, [questionId]: value }
      saveAnswers(next)
      return next
    })
  }, [])

  function handleLoadSample() {
    setCompany(SAMPLE_COMPANY)
    saveCompany(SAMPLE_COMPANY)
    setAnswers(SAMPLE_ANSWERS)
    saveAnswers(SAMPLE_ANSWERS)
    setSampleLoaded(true)
    setTimeout(() => setSampleLoaded(false), 3000)
  }

  function handleSetScreen(s) {
    setScreen(s)
    // Auto-redirect to setup if no company
    if (s === 'dashboard' && !company) return
  }

  const screens = {
    dashboard: (
      <Dashboard
        answers={answers}
        company={company}
        setScreen={setScreen}
        setActiveSection={setActiveSection}
        onLoadSample={handleLoadSample}
      />
    ),
    setup: (
      <CompanySetup
        company={company}
        onSave={handleSaveCompany}
      />
    ),
    input: (
      <DataInput
        answers={answers}
        onAnswerChange={handleAnswerChange}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
    ),
    report: (
      <ReportPreview
        answers={answers}
        company={company}
      />
    ),
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Demo badge (global) */}
      <div id="print-hide" className="fixed top-3 right-4 z-50 flex items-center gap-2">
        {sampleLoaded && (
          <span className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-full shadow animate-pulse">
            ✓ Sample data loaded
          </span>
        )}
        <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-300 shadow-sm">
          DEMO MODE
        </span>
      </div>

      <Sidebar
        screen={screen}
        setScreen={handleSetScreen}
        answers={answers}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top nav bar */}
        <header id="topbar" className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0 print:hidden">
          <nav className="flex items-center gap-1">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'setup', label: 'Setup' },
              { id: 'input', label: 'Data Entry' },
              { id: 'report', label: 'Report' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setScreen(item.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  screen === item.id
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>SEBI BRSR · FY {company?.financialYear || '2024-25'}</span>
            {company && (
              <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                {company.companyName}
              </span>
            )}
          </div>
        </header>

        {/* Screen content */}
        {screens[screen] || screens.dashboard}
      </main>
    </div>
  )
}
