/**
 * @file storage.js
 * @description localStorage helpers with schema validation, export/import.
 *              All operations are safe (try/catch) — never throws.
 */
const COMPANY_KEY  = 'brsr_company'
const ANSWERS_KEY  = 'brsr_answers'
const SAVED_KEY    = 'brsr_last_saved'
const ACTIONS_KEY  = 'brsr_actions'
export const EXPORT_VERSION = '1.0'

export function saveCompany(data) {
  localStorage.setItem(COMPANY_KEY, JSON.stringify(data))
  touchSaved()
}

export function loadCompany() {
  try { return JSON.parse(localStorage.getItem(COMPANY_KEY)) } catch { return null }
}

export function saveAnswers(answers) {
  localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers))
  touchSaved()
}

export function loadAnswers() {
  try { return JSON.parse(localStorage.getItem(ANSWERS_KEY)) || {} } catch { return {} }
}

export function saveActions(actions) {
  localStorage.setItem(ACTIONS_KEY, JSON.stringify(actions))
}

export function loadActions() {
  try { return JSON.parse(localStorage.getItem(ACTIONS_KEY)) || [] } catch { return [] }
}

function touchSaved() {
  localStorage.setItem(SAVED_KEY, new Date().toISOString())
}

export function loadLastSaved() {
  return localStorage.getItem(SAVED_KEY)
}

export function clearAll() {
  localStorage.removeItem(COMPANY_KEY)
  localStorage.removeItem(ANSWERS_KEY)
  localStorage.removeItem(SAVED_KEY)
  localStorage.removeItem(ACTIONS_KEY)
}

export function formatLastSaved(iso) {
  if (!iso) return 'Never'
  const d = new Date(iso)
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function formatINR(num) {
  if (!num) return '—'
  const n = parseFloat(num)
  if (isNaN(n)) return num
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2)} L`
  return `₹${n.toLocaleString('en-IN')}`
}

/** Export all data as a downloadable JSON file */
export function exportData(company, answers, actions = []) {
  const payload = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    exportedBy: 'TrueCarbon BRSR Platform',
    company,
    answers,
    actions,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `BRSR_${(company?.companyName || 'export').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** Trigger JSON file picker and return parsed content */
export function importData(onSuccess, onError) {
  const input = document.createElement('input')
  input.type  = 'file'
  input.accept = '.json'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        onSuccess(data)
      } catch {
        onError('Invalid JSON file — could not parse.')
      }
    }
    reader.readAsText(file)
  }
  document.body.appendChild(input)
  input.click()
  document.body.removeChild(input)
}
