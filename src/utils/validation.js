/**
 * @file validation.js
 * @description Input validation for BRSR answers.
 *              Returns { error, warning } per answer — never throws.
 *              Used by DataInput to show inline feedback.
 */
import { QUESTION_META } from '../data/questionMeta.js'

/** Strip all HTML tags from a string to prevent XSS */
export function sanitizeText(str) {
  if (typeof str !== 'string') return str
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
}

/** Validate a single answer, returns { error: string|null, warning: string|null } */
export function validateAnswer(question, value) {
  if (!value || value === '' || value === 'na') return { error: null, warning: null }

  const meta = QUESTION_META[question.id] || {}
  const v = meta.validation || {}

  // ── Number-type checks ────────────────────────────────────
  if (question.type === 'number') {
    const num = parseFloat(value)
    if (isNaN(num)) return { error: 'Must be a number', warning: null }

    if (v.isPercent) {
      if (num < 0)   return { error: 'Percentage cannot be negative', warning: null }
      if (num > 100) return { error: 'Percentage cannot exceed 100%', warning: null }
      if (num > 0 && num < 1) return { error: null, warning: 'Is this a % (e.g. 68) or a decimal (0.68)?' }
    }

    if (v.positiveOnly && num < 0) return { error: 'Value must be positive or zero', warning: null }
    if (v.min !== undefined && num < v.min) return { error: `Minimum value is ${v.min}`, warning: null }
    if (v.max !== undefined && num > v.max) return { error: `Maximum value is ${v.max}`, warning: null }
    if (v.isYear && (num < 2020 || num > 2100)) return { error: 'Enter a valid future year (2020–2100)', warning: null }

    // Emission sanity checks
    if (question.id === 'C-P6.5' && num > 10000000) return { error: null, warning: 'Value seems very high — confirm units are tCO₂e, not kg' }
    if (question.id === 'C-P6.6' && num > 5000000)  return { error: null, warning: 'Scope 2 value seems very high — confirm units are tCO₂e' }
    if (question.id === 'C-P6.10' && num > 100)     return { error: 'Recovery rate cannot exceed 100%', warning: null }
    if (question.id === 'A.10' && num > 1000)        return { error: null, warning: 'CSR spend seems very high — confirm units are ₹ Crores' }

    // Intensity sanity
    if (question.id === 'C-P6.2' && num > 10000) return { error: null, warning: 'Energy intensity seems very high — check GJ and ₹ Cr units' }
    if (question.id === 'C-P6.4' && num > 50000) return { error: null, warning: 'Water intensity seems very high — check KL and ₹ Cr units' }
  }

  // ── Text / textarea checks ────────────────────────────────
  if (question.type === 'text' || question.type === 'textarea') {
    if (value.length > 5000) return { error: 'Response too long (max 5000 characters)', warning: null }
    if (/<script/i.test(value)) return { error: 'Invalid characters detected', warning: null }
  }

  // ── CIN format check ─────────────────────────────────────
  if (question.id === 'A.16') {
    const cinPattern = /^[UuLl]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/
    if (!cinPattern.test(value.trim())) return { error: null, warning: 'CIN format should be: L28920MH2003PLC142756' }
  }

  // ── Website URL check ─────────────────────────────────────
  if (question.id === 'A.18') {
    if (!value.includes('.')) return { error: null, warning: 'Enter a valid website URL (e.g. www.company.in)' }
  }

  return { error: null, warning: null }
}

/** Validate all answers and return a summary map { questionId: { error, warning } } */
export function validateAll(questions, answers) {
  const results = {}
  for (const q of questions) {
    const result = validateAnswer(q, answers[q.id])
    if (result.error || result.warning) results[q.id] = result
  }
  return results
}

/** Count errors and warnings across a section */
export function sectionValidationSummary(questions, answers) {
  let errors = 0, warnings = 0
  for (const q of questions) {
    const { error, warning } = validateAnswer(q, answers[q.id])
    if (error) errors++
    if (warning) warnings++
  }
  return { errors, warnings }
}

/** Check if an answer is complete (non-empty, non-NA) */
export function isAnswered(value) {
  return value && value !== '' && value !== 'na'
}

/** Sanitize entire answers object before saving */
export function sanitizeAnswers(answers) {
  const clean = {}
  for (const [key, val] of Object.entries(answers)) {
    if (typeof val === 'string') {
      clean[key] = sanitizeText(val)
    } else {
      clean[key] = val
    }
  }
  return clean
}

/** Validate imported data schema */
export function validateImport(data) {
  if (!data || typeof data !== 'object') return { valid: false, reason: 'Not a valid JSON object' }
  if (!data.answers || typeof data.answers !== 'object') return { valid: false, reason: 'Missing answers object' }
  if (!data.company || typeof data.company !== 'object') return { valid: false, reason: 'Missing company object' }
  if (!data.company.companyName) return { valid: false, reason: 'Company name is required' }
  if (data.version && data.version !== '1.0') return { valid: false, reason: 'Incompatible file version' }
  return { valid: true }
}
