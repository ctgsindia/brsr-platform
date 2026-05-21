import { QUESTIONS } from '../data/questions.js'

const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })

function val(answers, id, fallback = 'Data not provided') {
  const v = answers[id]
  if (!v || v === '' || v === 'na') return fallback
  return v
}

function parseTable(v) {
  try { return v ? JSON.parse(v) : null } catch { return null }
}

function TableView({ data, columns, rows }) {
  if (!data) return <span className="text-gray-400 italic">Data not provided</span>
  return (
    <table className="w-full text-xs border-collapse">
      <thead>
        <tr className="bg-gray-50">
          {columns.map(c => (
            <th key={c} className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700">{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={row} className="hover:bg-gray-50">
            <td className="border border-gray-300 px-3 py-2 font-medium text-gray-700 bg-gray-50">{row}</td>
            {columns.slice(1).map((_, ci) => (
              <td key={ci} className="border border-gray-300 px-3 py-2 text-gray-800">
                {(data[row] || [])[ci] || <span className="text-gray-400">—</span>}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Row({ label, value }) {
  const isEmpty = !value || value === 'Data not provided'
  return (
    <tr className="hover:bg-gray-50">
      <td className="border border-gray-200 px-4 py-3 font-medium text-gray-700 text-sm w-2/5 align-top">{label}</td>
      <td className={`border border-gray-200 px-4 py-3 text-sm ${isEmpty ? 'text-gray-400 italic' : 'text-gray-900'}`}>
        {value}
      </td>
    </tr>
  )
}

function SectionHeader({ number, title, description }) {
  return (
    <div className="print-page-break mt-10 mb-6">
      <div className="bg-navy-800 text-white px-6 py-4 rounded-lg">
        <div className="text-xs text-white/60 uppercase tracking-wider mb-1">{number}</div>
        <h2 className="text-lg font-bold">{title}</h2>
        {description && <p className="text-sm text-white/70 mt-1">{description}</p>}
      </div>
    </div>
  )
}

function PrincipleBlock({ code, title, description, children }) {
  return (
    <div className="mb-8">
      <div className="bg-green-50 border-l-4 border-green-600 px-5 py-3 mb-4">
        <div className="text-xs font-bold text-green-700 uppercase tracking-wider">{code}</div>
        <h3 className="font-bold text-gray-900 text-base mt-0.5">{title}</h3>
        <p className="text-xs text-gray-600 mt-1">{description}</p>
      </div>
      {children}
    </div>
  )
}

/* ── Key Metrics Summary ─────────────────────────────────────────────── */
function KeyMetrics({ answers }) {
  const scope1 = parseFloat(val(answers, 'C-P6.5', '0')) || 0
  const scope2 = parseFloat(val(answers, 'C-P6.6', '0')) || 0
  const totalEmissions = scope1 + scope2

  const metrics = [
    { label: 'Total GHG Emissions (Scope 1+2)', value: totalEmissions ? `${totalEmissions.toLocaleString('en-IN')} tCO₂e` : 'Not provided', color: 'bg-red-50 border-red-200 text-red-700' },
    { label: 'Energy Intensity', value: val(answers, 'C-P6.2', '—'), suffix: 'GJ / ₹ Cr', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
    { label: 'Water Intensity', value: val(answers, 'C-P6.4', '—'), suffix: 'KL / ₹ Cr', color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { label: 'Waste Recovery Rate', value: val(answers, 'C-P6.10', '—'), suffix: '%', color: 'bg-green-50 border-green-200 text-green-700' },
    { label: 'CSR Spend', value: val(answers, 'A.10', '—'), suffix: '₹ Cr', color: 'bg-purple-50 border-purple-200 text-purple-700' },
    { label: 'Renewable Energy Mix', value: val(answers, 'C-P6.16', '—'), suffix: '%', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  ]

  return (
    <div className="mb-8 card p-6">
      <h3 className="font-bold text-gray-900 text-base mb-4">Key ESG Metrics Summary</h3>
      <div className="grid grid-cols-3 gap-4">
        {metrics.map(m => (
          <div key={m.label} className={`border rounded-lg p-4 ${m.color}`}>
            <div className="text-xs font-medium opacity-70 mb-1">{m.label}</div>
            <div className="font-bold text-lg">
              {m.value}{m.suffix && m.value !== '—' && m.value !== 'Not provided' ? ' ' + m.suffix : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Policy matrix display ──────────────────────────────────────────── */
const PRINCIPLES_LIST = [
  { key: 'P1: Ethics', label: 'Principle 1 – Ethics & Transparency' },
  { key: 'P2: Products', label: 'Principle 2 – Product Sustainability' },
  { key: 'P3: Employees', label: 'Principle 3 – Employee Wellbeing' },
  { key: 'P4: Stakeholders', label: 'Principle 4 – Stakeholder Engagement' },
  { key: 'P5: Human Rights', label: 'Principle 5 – Human Rights' },
  { key: 'P6: Environment', label: 'Principle 6 – Environment' },
  { key: 'P7: Policy', label: 'Principle 7 – Policy Advocacy' },
  { key: 'P8: Growth', label: 'Principle 8 – Inclusive Growth' },
  { key: 'P9: Customer', label: 'Principle 9 – Customer Responsibility' },
]

function PolicyMatrixView({ value }) {
  const data = parseTable(value)
  return (
    <table className="w-full text-xs border-collapse">
      <thead>
        <tr className="bg-gray-50">
          <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700">Principle</th>
          <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-700">Policy Exists</th>
          <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-700">Board Approved</th>
          <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700">Web Link</th>
        </tr>
      </thead>
      <tbody>
        {PRINCIPLES_LIST.map(p => {
          const row = (data || {})[p.key] || {}
          return (
            <tr key={p.key} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-3 py-2 font-medium text-gray-700">{p.label}</td>
              <td className="border border-gray-300 px-3 py-2 text-center">
                {row.policy ? <span className="text-green-600 font-bold">✓</span> : <span className="text-gray-400">—</span>}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-center">
                {row.board ? <span className="text-green-600 font-bold">✓</span> : <span className="text-gray-400">—</span>}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-blue-600">
                {row.link ? <a href={`https://${row.link}`} className="hover:underline">{row.link}</a> : <span className="text-gray-400">—</span>}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

/* ── MAIN REPORT ──────────────────────────────────────────────────────── */
export default function ReportPreview({ answers, company }) {
  const cn = company?.companyName || 'Company Name Not Set'
  const fy = company?.financialYear || 'FY 2024-25'

  function handlePrint() { window.print() }

  const energyData = parseTable(answers['C-P6.1'])
  const waterData = parseTable(answers['C-P6.3'])
  const wasteData = parseTable(answers['C-P6.9'])

  return (
    <div className="flex-1 bg-gray-100 flex flex-col overflow-hidden">
      {/* Top bar (hidden on print) */}
      <div id="print-hide" className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between shrink-0">
        <div>
          <h1 className="font-semibold text-gray-900">Report Preview</h1>
          <p className="text-xs text-gray-400">{cn} · {fy} · BRSR</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">For internal review only · Generated {today}</span>
          <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
            <span>⎙</span> Download PDF
          </button>
        </div>
      </div>

      {/* Report content */}
      <div id="report-content" className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-4xl mx-auto">

          {/* Cover */}
          <div className="card p-12 text-center mb-8">
            <div className="w-20 h-20 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl mx-auto mb-6 flex items-center justify-center text-gray-400 text-xs">
              Logo
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{cn}</h1>
            <p className="text-gray-500 mb-1">{company?.cin || ''}</p>
            {company?.exchange && <p className="text-gray-500 mb-6 text-sm">Listed on: {company.exchange}</p>}
            <div className="inline-block bg-green-600 text-white px-8 py-4 rounded-xl mb-6">
              <div className="text-sm font-medium opacity-80">Business Responsibility &amp; Sustainability Report</div>
              <div className="text-2xl font-bold mt-1">{fy}</div>
            </div>
            <p className="text-xs text-gray-400">
              Prepared in accordance with SEBI Circular SEBI/HO/CFD/CMD-2/P/CIR/2021/562 dated 10 May 2021
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Sector: {company?.sector || '—'} · Employees: {company?.employees ? Number(company.employees).toLocaleString('en-IN') : '—'}
            </p>
          </div>

          {/* Key Metrics */}
          <KeyMetrics answers={answers} />

          {/* SECTION A */}
          <SectionHeader number="Section A" title="General Disclosures" />

          <div className="card overflow-hidden mb-6">
            <table className="w-full">
              <tbody>
                <Row label="Principal Products / Services" value={val(answers, 'A.1')} />
                <Row label="Stock Exchange Listed On" value={val(answers, 'A.15')} />
                <Row label="CIN Number" value={val(answers, 'A.16')} />
                <Row label="Registered Address" value={val(answers, 'A.17')} />
                <Row label="Corporate Website" value={val(answers, 'A.18')} />
                <Row label="Financial Year" value={val(answers, 'A.19')} />
                <Row label="Sector / Industry" value={val(answers, 'A.20')} />
                <Row label="Paid-up Capital (₹ Cr)" value={val(answers, 'A.11')} />
                <Row label="Net Worth (₹ Cr)" value={val(answers, 'A.12')} />
                <Row label="Turnover / Revenue (₹ Cr)" value={val(answers, 'A.13')} />
                <Row label="Profit After Tax (₹ Cr)" value={val(answers, 'A.14')} />
                <Row label="CSR Policy" value={val(answers, 'A.9')} />
                <Row label="CSR Amount Spent (₹ Cr)" value={val(answers, 'A.10')} />
              </tbody>
            </table>
          </div>

          {/* Employee table */}
          <h3 className="font-semibold text-gray-800 text-sm mb-3">Employee Headcount (Permanent)</h3>
          <div className="card overflow-hidden mb-6">
            <TableView
              data={parseTable(answers['A.4'])}
              columns={QUESTIONS.A.find(q => q.id === 'A.4').columns}
              rows={QUESTIONS.A.find(q => q.id === 'A.4').rows}
            />
          </div>

          <h3 className="font-semibold text-gray-800 text-sm mb-3">Women in Leadership</h3>
          <div className="card overflow-hidden mb-6">
            <TableView
              data={parseTable(answers['A.7'])}
              columns={QUESTIONS.A.find(q => q.id === 'A.7').columns}
              rows={QUESTIONS.A.find(q => q.id === 'A.7').rows}
            />
          </div>

          <h3 className="font-semibold text-gray-800 text-sm mb-3">Turnover Rate (Last 3 FYs)</h3>
          <div className="card overflow-hidden mb-8">
            <TableView
              data={parseTable(answers['A.8'])}
              columns={QUESTIONS.A.find(q => q.id === 'A.8').columns}
              rows={QUESTIONS.A.find(q => q.id === 'A.8').rows}
            />
          </div>

          {/* SECTION B */}
          <SectionHeader number="Section B" title="Management & Process Disclosures" />

          <div className="card overflow-hidden mb-6">
            <table className="w-full">
              <tbody>
                <Row label="Highest Authority for ESG" value={val(answers, 'B.1')} />
                <Row label="Sustainability Committee" value={val(answers, 'B.2')} />
                <Row label="ESG Certifications" value={val(answers, 'B.3')} />
                <Row label="Voluntary Frameworks" value={val(answers, 'B.6')} />
                <Row label="Performance Linked to ESG" value={val(answers, 'B.7')} />
                <Row label="Climate Risk Assessed" value={val(answers, 'B.9')} />
                <Row label="Net-Zero Target" value={val(answers, 'B.15')} />
                <Row label="Net-Zero Target Year" value={val(answers, 'B.16')} />
                <Row label="External Assurance" value={val(answers, 'B.12')} />
                <Row label="Assurance Provider" value={val(answers, 'B.13')} />
              </tbody>
            </table>
          </div>

          <h3 className="font-semibold text-gray-800 text-sm mb-3">Policy Coverage — 9 BRSR Principles</h3>
          <div className="card overflow-hidden mb-8">
            <div className="p-4">
              <PolicyMatrixView value={answers['B.4']} />
            </div>
          </div>

          {/* SECTION C */}
          <SectionHeader number="Section C" title="Principle-wise Performance Disclosures" />

          {/* P1 */}
          <PrincipleBlock code="Principle 1" title="Ethics, Transparency & Accountability"
            description="Businesses should conduct and govern themselves with integrity, and in a manner that is Ethical, Transparent and Accountable.">
            <div className="card overflow-hidden mb-4">
              <table className="w-full">
                <tbody>
                  <Row label="Code of Conduct" value={val(answers, 'C-P1.1')} />
                  <Row label="% Directors/Employees trained on CoC" value={val(answers, 'C-P1.2')} />
                  <Row label="Anti-Bribery Policy" value={val(answers, 'C-P1.3')} />
                  <Row label="Directors charged with corruption" value={val(answers, 'C-P1.4')} />
                  <Row label="Employees charged with corruption" value={val(answers, 'C-P1.5')} />
                  <Row label="Whistle-blower complaints" value={val(answers, 'C-P1.6')} />
                  <Row label="Ethics awareness programmes" value={val(answers, 'C-P1.9')} />
                </tbody>
              </table>
            </div>
          </PrincipleBlock>

          {/* P3 */}
          <PrincipleBlock code="Principle 3" title="Employee Wellbeing"
            description="Businesses should respect and promote the well-being of all employees, including those in their value chains.">
            <h4 className="text-xs font-semibold text-gray-600 mb-2">Welfare Measures</h4>
            <div className="card overflow-hidden mb-4">
              <table className="w-full">
                <tbody>
                  <Row label="Health Insurance Coverage (%)" value={val(answers, 'C-P3.3') !== 'Data not provided' ? val(answers, 'C-P3.3') : 'See detailed table'} />
                  <Row label="Maternity Benefits (%)" value={val(answers, 'C-P3.3')} />
                  <Row label="PF Coverage (%)" value={val(answers, 'C-P3.4')} />
                  <Row label="Gratuity Coverage (%)" value={val(answers, 'C-P3.5')} />
                  <Row label="Avg. Training Days/Employee" value={val(answers, 'C-P3.7')} />
                  <Row label="Performance Reviews (%)" value={val(answers, 'C-P3.9')} />
                  <Row label="Min. Wage Compliance (%)" value={val(answers, 'C-P3.15')} />
                </tbody>
              </table>
            </div>

            <h4 className="text-xs font-semibold text-gray-600 mb-2">Safety Metrics</h4>
            <div className="card overflow-hidden mb-4">
              <TableView
                data={parseTable(answers['C-P3.6'])}
                columns={['Metric', 'Employees', 'Workers']}
                rows={['Total recordable injuries', 'Lost time injuries (LTI)', 'Fatalities', 'High-consequence injuries', 'LTIFR (per million man-hours)']}
              />
            </div>

            <h4 className="text-xs font-semibold text-gray-600 mb-2">POSH (Prevention of Sexual Harassment)</h4>
            <div className="card overflow-hidden mb-4">
              <table className="w-full">
                <tbody>
                  <Row label="Complaints Filed" value={val(answers, 'C-P3.10')} />
                  <Row label="Complaints Resolved" value={val(answers, 'C-P3.11')} />
                  <Row label="Complaints Pending (year-end)" value={val(answers, 'C-P3.12')} />
                  <Row label="Child Labour Incidents" value={val(answers, 'C-P3.13')} />
                  <Row label="Forced Labour Incidents" value={val(answers, 'C-P3.14')} />
                </tbody>
              </table>
            </div>
          </PrincipleBlock>

          {/* P6 — Environment (most important) */}
          <PrincipleBlock code="Principle 6" title="Environment"
            description="Businesses should respect and make efforts to protect and restore the environment. Adopt sustainable practices and work towards reducing environmental footprint.">

            <h4 className="text-xs font-semibold text-gray-600 mb-2">Energy Consumption</h4>
            <div className="card overflow-hidden mb-4">
              <TableView
                data={energyData}
                columns={['Category', 'Current FY (GJ)', 'Previous FY (GJ)']}
                rows={['Total fuel consumed (non-renewable)', 'Total fuel consumed (renewable)', 'Electricity purchased (grid)', 'Electricity from renewable sources', 'Total Energy Consumption']}
              />
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <span className="text-xs text-gray-600">
                  <strong>Energy Intensity:</strong> {val(answers, 'C-P6.2')} GJ / ₹ Cr turnover &nbsp;·&nbsp;
                  <strong>Renewable Mix:</strong> {val(answers, 'C-P6.16')}%
                </span>
              </div>
            </div>

            <h4 className="text-xs font-semibold text-gray-600 mb-2">Water Withdrawal</h4>
            <div className="card overflow-hidden mb-4">
              <TableView
                data={waterData}
                columns={['Source', 'Current FY (KL)', 'Previous FY (KL)']}
                rows={['Surface water (rivers, lakes)', 'Groundwater (borewells)', 'Third-party water (tankers, MIDC)', 'Seawater / desalinated', 'Rainwater harvested', 'Total Water Withdrawal']}
              />
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <span className="text-xs text-gray-600">
                  <strong>Water Intensity:</strong> {val(answers, 'C-P6.4')} KL / ₹ Cr turnover
                </span>
              </div>
            </div>

            <h4 className="text-xs font-semibold text-gray-600 mb-2">GHG Emissions</h4>
            <div className="card overflow-hidden mb-4">
              <table className="w-full">
                <tbody>
                  <Row label="Scope 1 Emissions (tCO₂e)" value={val(answers, 'C-P6.5')} />
                  <Row label="Scope 2 Emissions (tCO₂e)" value={val(answers, 'C-P6.6')} />
                  <Row label="Scope 3 Emissions (tCO₂e)" value={val(answers, 'C-P6.7')} />
                  <Row label="GHG Emission Intensity (tCO₂e / ₹ Cr)" value={val(answers, 'C-P6.8')} />
                </tbody>
              </table>
            </div>

            <h4 className="text-xs font-semibold text-gray-600 mb-2">Waste Management</h4>
            <div className="card overflow-hidden mb-4">
              <TableView
                data={wasteData}
                columns={['Waste Category', 'Current FY (MT)', 'Previous FY (MT)']}
                rows={['Plastic waste', 'E-waste', 'Bio-medical waste', 'Hazardous waste (TSDF)', 'Construction & demolition', 'Other non-hazardous waste', 'Total Waste Generated']}
              />
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <span className="text-xs text-gray-600">
                  <strong>Waste Recovery Rate:</strong> {val(answers, 'C-P6.10')}%
                </span>
              </div>
            </div>

            <div className="card overflow-hidden mb-4">
              <table className="w-full">
                <tbody>
                  <Row label="Environmental Incidents / Non-compliances" value={val(answers, 'C-P6.11')} />
                  <Row label="Penalties Paid to Env. Authorities (₹ L)" value={val(answers, 'C-P6.12')} />
                  <Row label="Capex on Env. Improvements (₹ Cr)" value={val(answers, 'C-P6.13')} />
                  <Row label="Opex on Env. Sustainability (₹ Cr)" value={val(answers, 'C-P6.14')} />
                  <Row label="Biodiversity Impact Assessment" value={val(answers, 'C-P6.15')} />
                  <Row label="Air Emissions (NOx/SOx/PM)" value={val(answers, 'C-P6.17')} />
                </tbody>
              </table>
            </div>
          </PrincipleBlock>

          {/* P5 */}
          <PrincipleBlock code="Principle 5" title="Human Rights"
            description="Businesses should respect and promote human rights.">
            <div className="card overflow-hidden mb-4">
              <table className="w-full">
                <tbody>
                  <Row label="Human Rights Policy" value={val(answers, 'C-P5.1')} />
                  <Row label="Human Rights Due Diligence" value={val(answers, 'C-P5.2')} />
                  <Row label="% Employees Trained on HR" value={val(answers, 'C-P5.4')} />
                  <Row label="HR Grievances Received" value={val(answers, 'C-P5.5')} />
                  <Row label="HR Grievances Resolved" value={val(answers, 'C-P5.6')} />
                  <Row label="Supply Chain HR Audits" value={val(answers, 'C-P5.9')} />
                </tbody>
              </table>
            </div>
          </PrincipleBlock>

          {/* P8 */}
          <PrincipleBlock code="Principle 8" title="Inclusive Growth & Equitable Development"
            description="Businesses should promote inclusive growth and equitable development.">
            <div className="card overflow-hidden mb-4">
              <table className="w-full">
                <tbody>
                  <Row label="CSR Projects" value={val(answers, 'C-P8.1')} />
                  <Row label="Beneficiaries" value={val(answers, 'C-P8.2')} />
                  <Row label="MSME / Local Procurement (%)" value={val(answers, 'C-P8.5')} />
                  <Row label="Skill Training Programmes" value={val(answers, 'C-P8.6')} />
                </tbody>
              </table>
            </div>
          </PrincipleBlock>

          {/* P9 */}
          <PrincipleBlock code="Principle 9" title="Customer Responsibility"
            description="Businesses should engage with and provide value to their consumers in a responsible manner.">
            <div className="card overflow-hidden mb-4">
              <TableView
                data={parseTable(answers['C-P9.2'])}
                columns={['Metric', 'Current FY', 'Previous FY']}
                rows={['Total complaints received', 'Complaints resolved', 'Pending at year-end', 'Average resolution time (days)']}
              />
              <table className="w-full">
                <tbody>
                  <Row label="Data Privacy Policy (DPDPA 2023)" value={val(answers, 'C-P9.4')} />
                  <Row label="Personal Data Breaches" value={val(answers, 'C-P9.5')} />
                  <Row label="Product Labelling Compliance" value={val(answers, 'C-P9.7')} />
                </tbody>
              </table>
            </div>
          </PrincipleBlock>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-gray-300 text-center">
            <p className="text-xs text-gray-400">
              Generated by <strong>TrueCarbon BRSR Platform</strong> · {today} · For internal review only
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Powered by ESG Platform · CapriTech Global Services Pvt. Ltd · www.truecarbon.in
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
