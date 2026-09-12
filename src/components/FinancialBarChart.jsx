import React from 'react'
import { formatMoney } from './FinancialComparisonCard'
import './WorkforceCharts.css'
export default function FinancialBarChart({ optionA, recommended }) {
  const maximum = Math.max(optionA, recommended, 1)
  return <figure className="workforce-chart financial-bars"><figcaption>Estimated investment comparison · USD</figcaption><svg viewBox="0 0 900 220" role="img" aria-label={`Option A: ${formatMoney(optionA)}. Blended approach: ${formatMoney(recommended)}. Both bars use the same zero-based dollar scale.`}>
    {[0, .25, .5, .75, 1].map(fraction => <g key={fraction}><line x1={230 + fraction * 470} x2={230 + fraction * 470} y1="20" y2="160" stroke="var(--hairline)"/><text x={230 + fraction * 470} y="189" textAnchor="middle" className="chart-tick">{maximum === 1 ? formatMoney(0) : new Intl.NumberFormat('en-US', { notation: 'compact', style: 'currency', currency: 'USD' }).format(maximum * fraction)}</text></g>)}
    {[['Option A · Recruit', optionA, 'var(--critical)'], ['Blended approach', recommended, 'var(--primary)']].map(([label, cost, color], index) => <g key={label}><text x="10" y={56 + index * 76} className="chart-label">{label}</text><rect x="230" y={30 + index * 76} width={cost / maximum * 470} height="38" fill={color} rx="3"/><text x="722" y={56 + index * 76} className="chart-value">{formatMoney(cost)}</text></g>)}
  </svg><p>Workforce-based estimates with placeholder rates. Option A covers skill-gapped recruiting; blended also funds trainable employees.</p></figure>
}
