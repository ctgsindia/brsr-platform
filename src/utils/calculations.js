/**
 * @file calculations.js
 * @description Auto-computation helpers for BRSR intensity ratios and GHG estimates.
 *              All functions are pure (no side effects) and return null on missing data.
 */

/** Parse a table JSON answer safely */
function parseTable(v) {
  try { return v ? JSON.parse(v) : null } catch { return null }
}

/** Get total energy from P6.1 table (last row = total) */
export function getTotalEnergy(answers) {
  const data = parseTable(answers['C-P6.1'])
  if (!data) return null
  const row = data['Total Energy Consumption']
  if (!row || !row[0]) return null
  const v = parseFloat(row[0])
  return isNaN(v) ? null : v
}

/** Get total water from P6.3 table */
export function getTotalWater(answers) {
  const data = parseTable(answers['C-P6.3'])
  if (!data) return null
  const row = data['Total Water Withdrawal']
  if (!row || !row[0]) return null
  const v = parseFloat(row[0])
  return isNaN(v) ? null : v
}

/** Get turnover from A.13 */
export function getTurnover(answers) {
  const v = parseFloat(answers['A.13'])
  return isNaN(v) || v <= 0 ? null : v
}

/** Compute energy intensity: GJ / ₹ Cr */
export function computeEnergyIntensity(answers) {
  const energy = getTotalEnergy(answers)
  const turnover = getTurnover(answers)
  if (!energy || !turnover) return null
  return Math.round((energy / turnover) * 100) / 100
}

/** Compute water intensity: KL / ₹ Cr */
export function computeWaterIntensity(answers) {
  const water = getTotalWater(answers)
  const turnover = getTurnover(answers)
  if (!water || !turnover) return null
  return Math.round((water / turnover) * 100) / 100
}

/** Compute GHG intensity: tCO2e / ₹ Cr */
export function computeGHGIntensity(answers) {
  const s1 = parseFloat(answers['C-P6.5'])
  const s2 = parseFloat(answers['C-P6.6'])
  const turnover = getTurnover(answers)
  if (isNaN(s1) || isNaN(s2) || !turnover) return null
  return Math.round(((s1 + s2) / turnover) * 100) / 100
}

/** Get auto-computed value for a question (returns null if not auto-computable) */
export function getAutoCalc(questionId, answers) {
  switch (questionId) {
    case 'C-P6.2': return computeEnergyIntensity(answers)
    case 'C-P6.4': return computeWaterIntensity(answers)
    case 'C-P6.8': return computeGHGIntensity(answers)
    default: return null
  }
}

// ── GHG Quick Calculator ─────────────────────────────────────

/** Indian grid emission factor (CEA 2023) */
export const INDIA_GRID_EF = 0.71 // kgCO2e per kWh

/** Common fuel emission factors (kgCO2e per unit) */
export const FUEL_EMISSION_FACTORS = [
  { fuel: 'Natural Gas', unit: 'GJ', factor: 56.1,  scope: 'Scope 1' },
  { fuel: 'Diesel',      unit: 'KL', factor: 2683,  scope: 'Scope 1' },
  { fuel: 'Petrol',      unit: 'KL', factor: 2289,  scope: 'Scope 1' },
  { fuel: 'LPG',         unit: 'MT', factor: 2983,  scope: 'Scope 1' },
  { fuel: 'Coal',        unit: 'MT', factor: 2420,  scope: 'Scope 1' },
  { fuel: 'Furnace Oil', unit: 'KL', factor: 3063,  scope: 'Scope 1' },
  { fuel: 'PNG / CNG',   unit: 'Nm³',factor: 1.97,  scope: 'Scope 1' },
  { fuel: 'Biomass',     unit: 'MT', factor: 0,     scope: 'Scope 1' },  // carbon-neutral
  { fuel: 'Grid Electricity', unit: 'MWh', factor: 710, scope: 'Scope 2' }, // 0.71 tCO2 × 1000
  { fuel: 'Steam (from grid)', unit: 'GJ', factor: 66, scope: 'Scope 2' },
]

/** Calculate GHG from fuel quantities */
export function calcGHGFromFuels(fuelEntries) {
  // fuelEntries: [{ fuelId: 'Diesel', quantity: 100 }, ...]
  let scope1 = 0, scope2 = 0
  for (const entry of fuelEntries) {
    const fef = FUEL_EMISSION_FACTORS.find(f => f.fuel === entry.fuelId)
    if (!fef || !entry.quantity) continue
    const emissions = (parseFloat(entry.quantity) || 0) * fef.factor / 1000 // convert kg → tCO2e
    if (fef.scope === 'Scope 1') scope1 += emissions
    else scope2 += emissions
  }
  return {
    scope1: Math.round(scope1 * 10) / 10,
    scope2: Math.round(scope2 * 10) / 10,
    total: Math.round((scope1 + scope2) * 10) / 10,
  }
}

// ── ESG Score ────────────────────────────────────────────────

import { SECTIONS, QUESTIONS } from '../data/questions.js'

function sectionPct(sectionId, answers) {
  const qs = QUESTIONS[sectionId] || []
  if (!qs.length) return 0
  const answered = qs.filter(q => {
    const v = answers[q.id]
    return v && v !== '' && v !== 'na'
  }).length
  return answered / qs.length
}

/**
 * Compute a composite ESG Readiness Score (0–100).
 * Weighted by importance:
 *   Section A (General)  10%
 *   Section B (Governance) 15%
 *   C-P6 (Environment)  25%
 *   C-P3 (Employees)    15%
 *   C-P1 (Ethics)       10%
 *   Remaining 6 sections 25% (split equally ~4.2% each)
 */
export function computeESGScore(answers) {
  const weights = {
    'A':    0.10,
    'B':    0.15,
    'C-P6': 0.25,
    'C-P3': 0.15,
    'C-P1': 0.10,
    'C-P2': 0.04,
    'C-P4': 0.04,
    'C-P5': 0.04,
    'C-P7': 0.04,
    'C-P8': 0.05,
    'C-P9': 0.04,
  }
  let score = 0
  for (const [id, weight] of Object.entries(weights)) {
    score += sectionPct(id, answers) * weight * 100
  }
  return Math.round(score)
}

export function getScoreLabel(score) {
  if (score >= 90) return { label: 'Excellent', color: 'text-green-600' }
  if (score >= 70) return { label: 'Good', color: 'text-blue-600' }
  if (score >= 50) return { label: 'Fair', color: 'text-yellow-600' }
  if (score >= 25) return { label: 'Needs Work', color: 'text-orange-500' }
  return { label: 'Incomplete', color: 'text-red-500' }
}
