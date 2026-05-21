# TrueCarbon BRSR Platform — Claude Code Guide

## What is This Project
A professional **BRSR (Business Responsibility and Sustainability Reporting)** SaaS demo for Indian listed companies and ESG consultants. Enables data collection and generation of SEBI-compliant BRSR reports.

Built by **CapriTech Global Services Pvt. Ltd.** | www.truecarbon.in | presales@ctgs.in

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite 5 |
| Styling | Tailwind CSS v3 |
| Icons | lucide-react |
| Persistence | localStorage (no backend) |
| PDF Export | window.print() with print CSS |
| Hosting | Netlify / Vercel / cPanel (static build) |

**No backend, no API keys, no environment variables required.**

---

## Project Structure

```
ESG-Project/
├── src/
│   ├── App.jsx                 # Root layout, state management, screen router
│   ├── main.jsx                # React entry point
│   ├── index.css               # Tailwind + print CSS + component classes
│   ├── data/
│   │   ├── questions.js        # All 140 BRSR questions (11 sections)
│   │   └── sampleData.js       # Sunrise Manufacturing Ltd demo data
│   ├── components/
│   │   ├── Sidebar.jsx         # Dark sidebar with section nav + completion %
│   │   ├── Dashboard.jsx       # Progress ring, stat cards, section bars
│   │   ├── CompanySetup.jsx    # Company info form
│   │   ├── DataInput.jsx       # Question renderer (table/yesno/number/textarea)
│   │   └── ReportPreview.jsx   # Full BRSR report with PDF export
│   └── utils/
│       └── storage.js          # localStorage helpers + INR formatting
├── CLAUDE.md                   # This file
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── .claude/launch.json         # Dev server config for preview panel
```

---

## Key Architecture Decisions

### State Management
- All state lives in `App.jsx`: `company`, `answers`, `screen`, `activeSection`
- `answers` is a flat `{ [questionId]: value }` map — e.g. `{ 'C-P6.5': '12450' }`
- Auto-saved to localStorage on every keystroke via `handleAnswerChange` useCallback
- Loaded from localStorage on mount via `useEffect`

### Question System (`src/data/questions.js`)
Each question has:
```js
{
  id: 'C-P6.5',      // unique key matching answers map
  num: 'P6.5',       // display label
  label: 'Total Scope 1 GHG emissions',
  type: 'number',    // text | number | textarea | yesno | select | table | policy-matrix
  helper: '...',     // guidance text shown below label
  // For type='table':
  columns: ['Category', 'Current FY', 'Previous FY'],
  rows: ['Row 1', 'Row 2'],
  // For type='select':
  options: ['Option A', 'Option B'],
}
```

Table answers are stored as JSON strings: `JSON.stringify({ 'Row 1': ['val1', 'val2'] })`

### Section IDs
```
A, B, C-P1, C-P2, C-P3, C-P4, C-P5, C-P6, C-P7, C-P8, C-P9
```
These are the keys in `QUESTIONS` object and used throughout for section routing.

---

## Running the App

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # outputs to dist/
npm run preview      # preview production build
```

## Deploying

```bash
# Netlify
netlify deploy --prod --dir=dist

# Vercel
vercel --prod

# cPanel
# Upload contents of dist/ to public_html/
```

---

## Adding / Editing Questions

Open `src/data/questions.js` — questions are grouped by section key. Add a new entry to the relevant array and it automatically appears in DataInput, gets counted in progress, and renders in ReportPreview.

To add a new question to the report output, add a `<Row>` or `<TableView>` to the relevant `<PrincipleBlock>` in `ReportPreview.jsx`.

---

## Sample Data

`src/data/sampleData.js` contains `SAMPLE_COMPANY` and `SAMPLE_ANSWERS` for **Sunrise Manufacturing Ltd** — a realistic mid-size listed manufacturer. Loaded via the "Load Sample Data" button on Dashboard.

Key demo metrics:
- Employees: 2,847 (1,923 male / 924 female)
- Scope 1: 12,450 tCO₂e | Scope 2: 8,230 tCO₂e
- Water: 45,000 KL/yr | Energy: 89,500 GJ/yr
- CSR Spend: ₹2.3 Cr | Turnover: ₹487 Cr
- Waste: 1,240 MT | Recovery: 68%

---

## Design System

| Token | Value |
|-------|-------|
| Primary green | `#16a34a` (Tailwind `green-600`) |
| Dark navy | `#1e293b` (Tailwind `slate-800`) |
| Font | Inter (Google Fonts) |
| Card | `bg-white border border-gray-200 rounded-xl shadow-sm` |

Component classes defined in `src/index.css`:
- `.card` — white card with border + shadow
- `.btn-primary` — green button
- `.btn-secondary` — white/grey button
- `.input-base` — standard text input with green focus ring

---

## Print / PDF CSS

Located in `src/index.css` under `@media print`:
- Hides `#sidebar`, `#topbar`, `#print-hide`, `.no-print`
- `#report-content` goes full width
- `.print-page-break` triggers `page-break-before: always`
- A4 page size with 2cm margins

---

## BRSR Compliance Notes

- Follows **SEBI Circular SEBI/HO/CFD/CMD-2/P/CIR/2021/562** dated 10 May 2021
- Covers all 9 NVG (National Voluntary Guidelines) principles
- Sections A, B, C structure as mandated
- BRSR Core (top 150 listed cos) will require Scope 3 + assured data — field `C-P6.7` is ready

---

## Phase 2 Ideas (for Ashish to decide)
- Backend API (Node.js + Fastify) for multi-user, multi-company SaaS
- AI-assisted answer suggestions using company financials
- Automated GHG calculation from activity data
- XBRL export for SEBI filing
- Comparison dashboard (year-on-year trends)
- Email/WhatsApp report sharing

---

*Last updated: May 2025 — CapriTech Global Services*
