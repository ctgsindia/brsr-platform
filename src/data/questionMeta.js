/**
 * @file questionMeta.js
 * @description Per-question metadata: BRSR Core flags, SDG mappings,
 *              validation rules, and evidence requirements.
 *              Kept separate from questions.js to stay clean.
 */

export const SDG_LABELS = {
  'SDG1': '1 No Poverty', 'SDG3': '3 Good Health', 'SDG4': '4 Quality Education',
  'SDG5': '5 Gender Equality', 'SDG6': '6 Clean Water', 'SDG7': '7 Clean Energy',
  'SDG8': '8 Decent Work', 'SDG10': '10 Reduced Inequalities',
  'SDG12': '12 Responsible Consumption', 'SDG13': '13 Climate Action',
  'SDG14': '14 Life Below Water', 'SDG15': '15 Life on Land',
  'SDG16': '16 Peace & Justice', 'SDG17': '17 Partnerships',
}

export const SDG_COLORS = {
  'SDG1': '#e5243b', 'SDG3': '#4c9f38', 'SDG4': '#c5192d', 'SDG5': '#ff3a21',
  'SDG6': '#26bde2', 'SDG7': '#fcc30b', 'SDG8': '#a21942', 'SDG10': '#dd1367',
  'SDG12': '#bf8b2e', 'SDG13': '#3f7e44', 'SDG14': '#0a97d9',
  'SDG15': '#56c02b', 'SDG16': '#00689d', 'SDG17': '#19486a',
}

/**
 * Per-question metadata.
 * brsrCore: true = mandatory for BRSR Core (top 1000 listed companies)
 * sdgs: array of SDG codes this question maps to
 * validation: { min, max, required, isPercent, isYear, positiveOnly }
 * evidence: what document/data source is needed
 * gri: GRI Standards reference
 */
export const QUESTION_META = {
  // ─── Section A ───────────────────────────────────────────
  'A.1':  { brsrCore: false, sdgs: ['SDG8'], evidence: 'Annual Report / Company Overview', gri: 'GRI 2-1', validation: { required: true } },
  'A.4':  { brsrCore: true,  sdgs: ['SDG5','SDG8'], evidence: 'HR MIS / Payroll report as on 31 March', gri: 'GRI 2-7', validation: { required: true } },
  'A.5':  { brsrCore: true,  sdgs: ['SDG8'], evidence: 'Contract workforce register', gri: 'GRI 2-8', validation: {} },
  'A.6':  { brsrCore: true,  sdgs: ['SDG10'], evidence: 'HR diversity report', gri: 'GRI 405-1', validation: {} },
  'A.7':  { brsrCore: true,  sdgs: ['SDG5'], evidence: 'Board/KMP composition from Annual Report', gri: 'GRI 405-1', validation: {} },
  'A.8':  { brsrCore: true,  sdgs: ['SDG8'], evidence: 'HR attrition data FY22-25', gri: 'GRI 401-1', validation: {} },
  'A.9':  { brsrCore: false, sdgs: ['SDG17'], evidence: 'CSR Policy document', gri: 'GRI 2-22', validation: {} },
  'A.10': { brsrCore: false, sdgs: ['SDG17'], evidence: 'Board CSR report / Schedule VII disclosures', gri: 'GRI 201-1', validation: { positiveOnly: true } },
  'A.13': { brsrCore: true,  sdgs: ['SDG8'], evidence: 'Audited financial statements', gri: 'GRI 201-1', validation: { positiveOnly: true } },

  // ─── Section B ───────────────────────────────────────────
  'B.4':  { brsrCore: true,  sdgs: ['SDG16'], evidence: 'Policy documents / company website', gri: 'GRI 2-23', validation: {} },
  'B.9':  { brsrCore: false, sdgs: ['SDG13'], evidence: 'TCFD/Climate risk assessment report', gri: 'GRI 201-2', validation: {} },
  'B.12': { brsrCore: false, sdgs: ['SDG16'], evidence: 'Assurance statement / limited assurance report', gri: 'GRI 2-5', validation: {} },

  // ─── C-P1 ────────────────────────────────────────────────
  'C-P1.1': { brsrCore: false, sdgs: ['SDG16'], evidence: 'Code of Conduct document (website link)', gri: 'GRI 2-23', validation: {} },
  'C-P1.2': { brsrCore: false, sdgs: ['SDG16'], evidence: 'Training MIS / LMS records', gri: 'GRI 205-2', validation: { isPercent: true } },

  // ─── C-P3 ────────────────────────────────────────────────
  'C-P3.1': { brsrCore: false, sdgs: ['SDG3','SDG8'], evidence: 'Group health insurance policy / ESIC records', gri: 'GRI 401-2', validation: {} },
  'C-P3.3': { brsrCore: false, sdgs: ['SDG5','SDG8'], evidence: 'HR compliance register / maternity policy', gri: 'GRI 401-3', validation: { isPercent: true } },
  'C-P3.4': { brsrCore: true,  sdgs: ['SDG8'], evidence: 'EPFO records / PF compliance certificate', gri: 'GRI 401-2', validation: { isPercent: true } },
  'C-P3.6': { brsrCore: true,  sdgs: ['SDG3','SDG8'], evidence: 'EHS incident register / Form 27 / factory records', gri: 'GRI 403-9', validation: {} },
  'C-P3.7': { brsrCore: false, sdgs: ['SDG4','SDG8'], evidence: 'Training MIS — total hours / headcount', gri: 'GRI 404-1', validation: { positiveOnly: true } },
  'C-P3.10':{ brsrCore: true,  sdgs: ['SDG5'], evidence: 'ICC / IC Committee annual report', gri: 'GRI 406-1', validation: { positiveOnly: true, min: 0 } },
  'C-P3.15':{ brsrCore: true,  sdgs: ['SDG8'], evidence: 'Wage register / minimum wage compliance report', gri: 'GRI 202-1', validation: { isPercent: true } },

  // ─── C-P4 ────────────────────────────────────────────────
  'C-P4.4': { brsrCore: false, sdgs: ['SDG17'], evidence: 'Materiality assessment report', gri: 'GRI 3-1', validation: {} },

  // ─── C-P5 ────────────────────────────────────────────────
  'C-P5.1': { brsrCore: false, sdgs: ['SDG8','SDG16'], evidence: 'Human Rights policy (website link)', gri: 'GRI 412-1', validation: {} },
  'C-P5.4': { brsrCore: false, sdgs: ['SDG8'], evidence: 'Training records on human rights', gri: 'GRI 412-2', validation: { isPercent: true } },
  'C-P5.9': { brsrCore: false, sdgs: ['SDG8'], evidence: 'Supplier audit reports', gri: 'GRI 414-1', validation: { positiveOnly: true, min: 0 } },

  // ─── C-P6 ────────────────────────────────────────────────
  'C-P6.1': { brsrCore: true,  sdgs: ['SDG7','SDG13'], evidence: 'Energy bills / fuel purchase records / sub-meter data', gri: 'GRI 302-1', validation: { required: true } },
  'C-P6.2': { brsrCore: true,  sdgs: ['SDG7','SDG13'], evidence: 'Computed from P6.1 ÷ turnover', gri: 'GRI 302-3', validation: { positiveOnly: true }, autoCalc: true },
  'C-P6.3': { brsrCore: true,  sdgs: ['SDG6'], evidence: 'Water bills / groundwater extraction permits / water meter logs', gri: 'GRI 303-3', validation: { required: true } },
  'C-P6.4': { brsrCore: true,  sdgs: ['SDG6'], evidence: 'Computed from P6.3 ÷ turnover', gri: 'GRI 303-5', validation: { positiveOnly: true }, autoCalc: true },
  'C-P6.5': { brsrCore: true,  sdgs: ['SDG13'], evidence: 'GHG inventory / fuel logs × IPCC emission factors', gri: 'GRI 305-1', validation: { required: true, positiveOnly: true } },
  'C-P6.6': { brsrCore: true,  sdgs: ['SDG13'], evidence: 'Electricity bills × CEA grid emission factor (0.71 kgCO2/kWh for India)', gri: 'GRI 305-2', validation: { required: true, positiveOnly: true } },
  'C-P6.7': { brsrCore: false, sdgs: ['SDG13'], evidence: 'Scope 3 screening — upstream/downstream value chain', gri: 'GRI 305-3', validation: { positiveOnly: true } },
  'C-P6.8': { brsrCore: true,  sdgs: ['SDG13'], evidence: 'Computed from (Scope 1+2) ÷ turnover', gri: 'GRI 305-4', validation: { positiveOnly: true }, autoCalc: true },
  'C-P6.9': { brsrCore: true,  sdgs: ['SDG12'], evidence: 'Waste manifest records / hazardous waste returns', gri: 'GRI 306-3', validation: { required: true } },
  'C-P6.10':{ brsrCore: true,  sdgs: ['SDG12'], evidence: 'Waste recycling records / 3R report', gri: 'GRI 306-4', validation: { isPercent: true } },
  'C-P6.12':{ brsrCore: false, sdgs: ['SDG16'], evidence: 'Regulatory orders / penalty receipts', gri: 'GRI 307-1', validation: { positiveOnly: true, min: 0 } },
  'C-P6.13':{ brsrCore: false, sdgs: ['SDG13'], evidence: 'Capex schedule (tagged environmental)', gri: 'GRI 305-5', validation: { positiveOnly: true } },
  'C-P6.16':{ brsrCore: true,  sdgs: ['SDG7'], evidence: 'Renewable energy certificates / solar generation logs', gri: 'GRI 302-1', validation: { isPercent: true } },

  // ─── C-P7 ────────────────────────────────────────────────
  'C-P7.4': { brsrCore: false, sdgs: ['SDG16'], evidence: 'Board resolution / political contributions register', gri: 'GRI 415-1', validation: { positiveOnly: true, min: 0 } },

  // ─── C-P8 ────────────────────────────────────────────────
  'C-P8.2': { brsrCore: false, sdgs: ['SDG1','SDG10'], evidence: 'CSR impact assessment / beneficiary records', gri: 'GRI 413-1', validation: { positiveOnly: true } },
  'C-P8.5': { brsrCore: true,  sdgs: ['SDG8','SDG10'], evidence: 'Procurement data classified by vendor type', gri: 'GRI 204-1', validation: { isPercent: true } },

  // ─── C-P9 ────────────────────────────────────────────────
  'C-P9.2': { brsrCore: false, sdgs: ['SDG16'], evidence: 'CRM / complaint management system records', gri: 'GRI 418-1', validation: {} },
  'C-P9.4': { brsrCore: false, sdgs: ['SDG16'], evidence: 'DPDPA 2023 compliance documentation', gri: 'GRI 418-1', validation: {} },
  'C-P9.5': { brsrCore: false, sdgs: ['SDG16'], evidence: 'CERT-In notifications / Data Protection Board filings', gri: 'GRI 418-1', validation: { positiveOnly: true, min: 0 } },
}

/** Questions where the value can be auto-computed from other answers */
export const AUTO_CALC_QUESTIONS = new Set(['C-P6.2', 'C-P6.4', 'C-P6.8'])

/** BRSR Core question IDs (top 1000 mandatory) */
export const BRSR_CORE_IDS = new Set(
  Object.entries(QUESTION_META)
    .filter(([, m]) => m.brsrCore)
    .map(([id]) => id)
)
