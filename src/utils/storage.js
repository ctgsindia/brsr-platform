const COMPANY_KEY = 'brsr_company'
const ANSWERS_KEY = 'brsr_answers'
const SAVED_KEY = 'brsr_last_saved'

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
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`
  return `₹${n.toLocaleString('en-IN')}`
}
