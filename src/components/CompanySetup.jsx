import { useState, useEffect } from 'react'

const SECTORS = ['Manufacturing', 'IT & Technology', 'Banking & Finance', 'FMCG', 'Pharma & Healthcare', 'Energy & Utilities', 'Infrastructure', 'Textiles', 'Chemicals', 'Automobile', 'Other']
const FYS = ['FY 2024-25', 'FY 2025-26']
const TURNOVERS = ['<100 Cr', '100–500 Cr', '500–1000 Cr', '1000–5000 Cr', '>5000 Cr']
const EXCHANGES = ['BSE', 'NSE', 'BSE & NSE', 'Not listed']

export default function CompanySetup({ company, onSave }) {
  const [form, setForm] = useState({
    companyName: '', cin: '', exchange: '', sector: '', address: '',
    website: '', financialYear: 'FY 2024-25', employees: '',
    turnover: '', contactName: '', contactEmail: '',
    ...company
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (company) setForm(f => ({ ...f, ...company }))
  }, [company])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setSaved(false)
  }

  function handleSave(e) {
    e.preventDefault()
    onSave(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const Field = ({ label, field, type = 'text', placeholder = '', hint = '' }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
      {type === 'textarea' ? (
        <textarea
          value={form[field] || ''}
          onChange={e => set(field, e.target.value)}
          rows={3}
          placeholder={placeholder}
          className="input-base resize-none"
        />
      ) : (
        <input
          type={type}
          value={form[field] || ''}
          onChange={e => set(field, e.target.value)}
          placeholder={placeholder}
          className="input-base"
        />
      )}
    </div>
  )

  const Select = ({ label, field, options, hint = '' }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
      <select
        value={form[field] || ''}
        onChange={e => set(field, e.target.value)}
        className="input-base bg-white"
      >
        <option value="">Select…</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )

  return (
    <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Company Setup</h1>
          <p className="text-gray-500 mt-1">Basic company information for your BRSR report header and cover page.</p>
        </div>

        <form onSubmit={handleSave} className="card p-8 space-y-6">
          {/* Identity */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Company Identity</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Field label="Company Name *" field="companyName" placeholder="e.g., Sunrise Manufacturing Ltd" />
              </div>
              <Field label="CIN Number" field="cin" placeholder="L28920MH2003PLC142756" hint="21-digit Corporate Identification Number" />
              <Select label="Listed On" field="exchange" options={EXCHANGES} />
              <Select label="Sector / Industry *" field="sector" options={SECTORS} />
              <Select label="Financial Year *" field="financialYear" options={FYS} />
            </div>
          </div>

          {/* Address */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Registered Details</h2>
            <div className="space-y-4">
              <Field label="Registered Address" field="address" type="textarea" placeholder="Registered office address as per MCA" />
              <Field label="Website" field="website" placeholder="www.company.in" type="url" />
            </div>
          </div>

          {/* Metrics */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Company Size</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Total Employees" field="employees" type="number" placeholder="2847" hint="Permanent headcount as of 31 March" />
              <Select label="Annual Turnover Range" field="turnover" options={TURNOVERS} />
            </div>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">ESG Contact Person</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Contact Name" field="contactName" placeholder="Name of BRSR/ESG responsible person" />
              <Field label="Contact Email" field="contactEmail" placeholder="esg@company.in" type="email" />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button type="submit" className="btn-primary px-8 py-2.5">
              {saved ? '✓ Saved!' : 'Save & Continue →'}
            </button>
            {saved && <span className="text-green-600 text-sm">Company details saved successfully.</span>}
          </div>
        </form>
      </div>
    </div>
  )
}
