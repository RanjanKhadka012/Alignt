import React from 'react'

export default function Sparkline({ data = [3,5,4,6,8,7,9], width = 120, height = 28, stroke = 'var(--primary)' }){
  const max = Math.max(...data, 1)
  const points = data.map((v,i)=> `${(i/(data.length-1))*width},${height - (v/max)*(height-4)}`).join(' ')
  const last = data[data.length-1]
  return (
    <svg viewBox={`0 0 ${width} ${height}`} aria-hidden="true" className="sparkline">
      <polyline fill="none" stroke={stroke} strokeWidth="2" points={points} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(data.length-1)/(data.length-1)*width} cy={height - (last/max)*(height-4)} r="2.5" fill={stroke} />
    </svg>
  )
}
