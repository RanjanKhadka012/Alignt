import React from 'react'
export const formatMoney = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
export default function FinancialComparisonCard({ title, total, recommended = false, children }) {
  return <article className={`financial-comparison ${recommended ? 'recommended' : ''}`}><span className="matching-data">{recommended ? 'SCENARIO · DEVELOPMENT FIRST' : 'OPTION A · EXTERNAL RECRUITING'}</span><h3>{title}</h3><strong className="financial-total">{formatMoney(total)}</strong>{children}</article>
}
