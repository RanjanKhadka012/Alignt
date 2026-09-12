import React from 'react'
import './WorkforceCharts.css'
export default function WorkforceFlow({ analysis }) {
  const total = analysis.pool.length
  const groups = [ ['Fully qualified', analysis.fullyQualified.length, 'var(--primary)'], ['Trainable', analysis.trainable.length, 'var(--warning)'], ['Skill-gapped', analysis.gapped.length, 'var(--critical)'] ]
  let offset = 0
  return <section className="workforce-chart"><h2>Where your workforce stands</h2>{!total ? <p>No relevant employees to display.</p> : <svg viewBox="0 0 900 480" role="img" aria-label={`Workforce flow: ${total} employees split into ${groups.map(([label, count]) => `${count} ${label}`).join(', ')}. Ribbon widths represent employee counts.`}>
    <text x="20" y="34" className="chart-label">WORKFORCE POOL</text><text x="20" y="72" className="chart-number">{total} people</text>
    <rect x="190" y="105" width="14" height="210" fill="var(--muted)" rx="3"/>
    {groups.map(([label, count, color], i) => { const height = count / total * 210; const sourceY = 105 + offset; const targetY = 28 + offset + i * 65; offset += height; return <g key={label}>
      {count > 0 && <path d={`M204 ${sourceY} C380 ${sourceY} 430 ${targetY} 610 ${targetY} L610 ${targetY + height} C430 ${targetY + height} 380 ${sourceY + height} 204 ${sourceY + height} Z`} fill={color} opacity=".38"><title>{label}: {count} people ({Math.round(count / total * 100)}%)</title></path>}
      <rect x="610" y={targetY} width="12" height={height} fill={color}/>
      <text x="644" y={targetY + height / 2 + 4} className="chart-label">{label}</text><text x="644" y={targetY + height / 2 + 33} fill={color} className="chart-number">{count} · {Math.round(count / total * 100)}%</text>
    </g> })}
  </svg>}</section>
}
