import React from 'react'
import { useDerivedData } from '../contexts/DerivedDataContext'
import { useNavigate } from 'react-router-dom'

function colorForRisk(risk){
  if(risk==='critical') return 'var(--critical)'
  if(risk==='watch') return 'var(--warning)'
  return 'var(--primary)'
}

export default function DepartmentConstellation(){
  const { departmentsWithRisk } = useDerivedData()
  const navigate = useNavigate()

  const width = 1100, height = 420, cx = width/2, cy = height/2
  const radius = 160

  return (
    <div className="card" style={{padding:16}}>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
        {departmentsWithRisk.map((d,i)=>{
          const angle = (i / departmentsWithRisk.length) * Math.PI * 2
          const x = cx + Math.cos(angle) * radius
          const y = cy + Math.sin(angle) * radius
          const size = 20 + (d.headcount||0) * 3
          return (
            <g key={d.id}>
              <circle cx={x} cy={y} r={size} fill={colorForRisk(d.riskLevel)} opacity={0.12} stroke={colorForRisk(d.riskLevel)} strokeWidth={2} className={d.riskLevel==='critical'? 'pulse':''} style={{cursor:'pointer'}} onClick={()=>navigate(`/departments/${d.id}`)} onMouseEnter={(e)=>{/* could show tooltip */}} />
              <text x={x} y={y+size+12} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="12" fill="var(--muted)">{d.name} ({d.headcount||0})</text>
            </g>
          )
        })}
        {/* illustrative lines between departments */}
        {departmentsWithRisk.map((d,i)=>{
          const a1 = (i / departmentsWithRisk.length) * Math.PI * 2
          const a2 = ((i+1) / departmentsWithRisk.length) * Math.PI * 2
          const x1 = cx + Math.cos(a1) * radius
          const y1 = cy + Math.sin(a1) * radius
          const x2 = cx + Math.cos(a2) * radius
          const y2 = cy + Math.sin(a2) * radius
          return <line key={`l-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--hairline)" strokeWidth={1} opacity={0.6} />
        })}
      </svg>
    </div>
  )
}
