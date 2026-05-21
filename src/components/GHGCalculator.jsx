/**
 * @file GHGCalculator.jsx
 * @description Modal GHG emission calculator using IPCC/CEA emission factors.
 *              Users enter fuel/electricity quantities; calculator produces
 *              Scope 1 & Scope 2 estimates to fill into C-P6.5 and C-P6.6.
 */
import { useState } from 'react'
import { FUEL_EMISSION_FACTORS, calcGHGFromFuels } from '../utils/calculations.js'

export default function GHGCalculator({ onApply, onClose }) {
  const [entries, setEntries] = useState(
    FUEL_EMISSION_FACTORS.map(f => ({ fuelId: f.fuel, quantity: '', unit: f.unit, scope: f.scope }))
  )

  function setQty(fuelId, value) {
    setEntries(e => e.map(x => x.fuelId === fuelId ? { ...x, quantity: value } : x))
  }

  const filledEntries = entries.filter(e => e.quantity && parseFloat(e.quantity) > 0)
  const result = filledEntries.length ? calcGHGFromFuels(filledEntries) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">GHG Emission Calculator</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Enter fuel & electricity consumption → auto-computes Scope 1 &amp; 2 (tCO₂e)
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none mt-0.5">✕</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Scope 1 */}
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Scope 1 — Direct (Own Fuel)</h3>
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600">Fuel Type</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600">Quantity</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600">Unit</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-gray-600">EF (kgCO₂e/unit)</th>
              </tr>
            </thead>
            <tbody>
              {entries.filter(e => e.scope === 'Scope 1').map(e => {
                const fef = FUEL_EMISSION_FACTORS.find(f => f.fuel === e.fuelId)
                const emission = e.quantity ? Math.round(parseFloat(e.quantity) * (fef?.factor || 0) / 100) / 10 : null
                return (
                  <tr key={e.fuelId} className="border-b border-gray-100">
                    <td className="px-3 py-2 font-medium text-gray-700">{e.fuelId}</td>
                    <td className="px-2 py-1.5">
                      <input type="number" min="0" value={e.quantity}
                        onChange={ev => setQty(e.fuelId, ev.target.value)}
                        className="w-28 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                        placeholder="0" />
                    </td>
                    <td className="px-3 py-2 text-gray-500">{e.unit}</td>
                    <td className="px-3 py-2 text-right text-gray-500">
                      {fef?.factor?.toLocaleString('en-IN')}
                      {emission !== null && <span className="ml-2 text-green-600 font-medium">→ {emission} t</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Scope 2 */}
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Scope 2 — Indirect (Purchased Energy)</h3>
          <div className="bg-blue-50 rounded-lg p-3 mb-3 text-xs text-blue-700">
            India Grid Emission Factor: <strong>0.71 kgCO₂e/kWh</strong> (CEA 2023). Enter electricity in MWh (1 MWh = 1000 kWh).
          </div>
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600">Energy Type</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600">Quantity</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600">Unit</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-gray-600">EF (kgCO₂e/unit)</th>
              </tr>
            </thead>
            <tbody>
              {entries.filter(e => e.scope === 'Scope 2').map(e => {
                const fef = FUEL_EMISSION_FACTORS.find(f => f.fuel === e.fuelId)
                const emission = e.quantity ? Math.round(parseFloat(e.quantity) * (fef?.factor || 0) / 100) / 10 : null
                return (
                  <tr key={e.fuelId} className="border-b border-gray-100">
                    <td className="px-3 py-2 font-medium text-gray-700">{e.fuelId}</td>
                    <td className="px-2 py-1.5">
                      <input type="number" min="0" value={e.quantity}
                        onChange={ev => setQty(e.fuelId, ev.target.value)}
                        className="w-28 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                        placeholder="0" />
                    </td>
                    <td className="px-3 py-2 text-gray-500">{e.unit}</td>
                    <td className="px-3 py-2 text-right text-gray-500">
                      {fef?.factor?.toLocaleString('en-IN')}
                      {emission !== null && <span className="ml-2 text-blue-600 font-medium">→ {emission} t</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Disclaimer */}
          <div className="text-xs text-gray-400 bg-gray-50 rounded p-3">
            Emission factors sourced from IPCC 2006 GL, MoEF GHG inventory, and CEA 2023.
            This calculator provides estimates only. For assured reporting, engage a qualified GHG verifier.
          </div>
        </div>

        {/* Result footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
          {result ? (
            <div className="flex items-center justify-between">
              <div className="flex gap-6">
                <div>
                  <div className="text-xs text-gray-500">Scope 1 (Direct)</div>
                  <div className="text-lg font-bold text-gray-900">{result.scope1.toLocaleString('en-IN')} <span className="text-sm font-normal text-gray-500">tCO₂e</span></div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Scope 2 (Indirect)</div>
                  <div className="text-lg font-bold text-gray-900">{result.scope2.toLocaleString('en-IN')} <span className="text-sm font-normal text-gray-500">tCO₂e</span></div>
                </div>
                <div className="pl-6 border-l border-gray-300">
                  <div className="text-xs text-gray-500">Scope 1+2 Total</div>
                  <div className="text-xl font-bold text-green-700">{result.total.toLocaleString('en-IN')} <span className="text-sm font-normal">tCO₂e</span></div>
                </div>
              </div>
              <button onClick={() => onApply(result)} className="btn-primary px-6 py-2.5">
                Apply to Report →
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Enter quantities above to calculate emissions</span>
              <button onClick={onClose} className="btn-secondary px-6">Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
