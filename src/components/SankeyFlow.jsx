import React from 'react'

export default function SankeyFlow({ pools = { qualified: 40, trainable: 30, gapped: 20 }, width = 760, height = 180 }){
  const total = Math.max(1, pools.qualified + pools.trainable + pools.gapped)
  const left = 140
  const right = width - 140
  const y = 40
  const laneHeight = 28
  const gap = 12

  const blocks = [
    { key: 'qualified', label: 'Qualified', value: pools.qualified, color: 'var(--primary)' },
    { key: 'trainable', label: 'Trainable', value: pools.trainable, color: 'var(--warning)' },
    { key: 'gapped', label: 'Gapped', value: pools.gapped, color: 'var(--critical)' },
  ]

  return (
    <figure className="workforce-chart sankey-flow" style={{marginTop:8}}>
      <figcaption>Goal → Risk pipeline (mock)</figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Sankey style flow showing distribution of people from goals into qualified, trainable, and gapped buckets">
        {/* source block */}
        <rect x="8" y="20" width="110" height={blocks.length * (laneHeight + gap) - gap} rx="6" fill="rgba(255,255,255,0.02)" stroke="var(--hairline)" />
        <text x="64" y="28" textAnchor="middle" fontSize="12" fill="var(--muted)">This year goals</text>

        {blocks.map((b, i)=>{
          const h = (b.value/total) * (height - 40)
          const by = 30 + i * (laneHeight + gap)
          const flowW = Math.max(24, (b.value/total) * (right - left - 40))
          return (
            <g key={b.key}>
              <rect x={right - flowW} y={by} width={flowW} height={laneHeight} rx={6} fill={b.color} opacity={0.16} stroke={b.color} />
              <text x={right - flowW - 8} y={by + laneHeight/2 + 4} textAnchor="end" fontSize="12" fill="var(--text)">{b.label}</text>
              {/* curved flow path */}
              <path d={`M118 ${by+laneHeight/2} C ${ (left+118)/2 } ${by+laneHeight/2} ${(left+118)/2} ${by+laneHeight/2} ${right-flowW} ${by+laneHeight/2}`} fill="none" stroke={b.color} strokeWidth={Math.max(8, flowW/6)} strokeOpacity={0.18} strokeLinecap="round" />
              <text x={right - 18} y={by + laneHeight/2 + 4} textAnchor="end" fontSize="12" fill={b.color}>{b.value}</text>
            </g>
          )
        })}
      </svg>
    </figure>
  )
}
