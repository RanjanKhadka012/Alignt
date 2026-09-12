import React from 'react'
export default function ReadinessRing({ value }) {
  return <svg className="readiness-ring" viewBox="0 0 180 180" role="img" aria-label={`${value}% overall strategy readiness`}>
    <circle cx="90" cy="90" r="74" fill="none" stroke="var(--hairline)" strokeWidth="9" />
    <circle className="readiness-ring-fill" cx="90" cy="90" r="74" fill="none" stroke="var(--primary)" strokeWidth="9" pathLength="100" strokeDasharray={`${value} 100`} transform="rotate(-90 90 90)" />
    <text x="90" y="92" textAnchor="middle" fill="var(--text)" fontSize="36">{value}%</text><text x="90" y="115" textAnchor="middle" fill="var(--muted)" fontSize="9">STRATEGY READINESS</text>
  </svg>
}
