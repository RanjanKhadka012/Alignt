import React from 'react'
import { useDerivedData } from '../contexts/DerivedDataContext'
import { useNavigate } from 'react-router-dom'

function colorForRisk(risk){
  if(risk==='critical') return 'var(--critical)'
  if(risk==='watch') return 'var(--warning)'
  return 'var(--primary)'
}

export default function DepartmentConstellation(){
  const { departmentsWithRisk, skillsWithRisk } = useDerivedData()
  const navigate = useNavigate()

  const width = 1100, height = 420, cx = width/2, cy = height/2

  // compute sizes
  const sizes = departmentsWithRisk.map(d => 18 + Math.min(140, (d.headcount||0) * 3))
  const maxSize = sizes.length ? Math.max(...sizes) : 40

  // build relationship links: connect dept pairs that share a skill holder for any skill
  const deptIndex = {}
  departmentsWithRisk.forEach((d,i)=> deptIndex[d.id] = i)
  const linksSet = new Set()
  ;(skillsWithRisk||[]).forEach(s=>{
    const depts = new Set(s.holders.map(h=>h.departmentId))
    const arr = Array.from(depts)
    for(let i=0;i<arr.length;i++){
      for(let j=i+1;j<arr.length;j++){
        const a = deptIndex[arr[i]]
        const b = deptIndex[arr[j]]
        if(a!=null && b!=null){
          const key = a<b? `${a}-${b}`:`${b}-${a}`
          linksSet.add(key)
        }
      }
    }
  })
  const links = Array.from(linksSet).map(k=>k.split('-').map(x=>parseInt(x,10)))

  // compute safe radius to avoid overlap
  const gap = 8
  const n = departmentsWithRisk.length
  let requiredRadius = 120
  for(let i=0;i<n;i++){
    for(let j=i+1;j<n;j++){
      const angleDiff = Math.min(Math.abs(j-i), n - Math.abs(j-i)) * (Math.PI*2/n)
      const sinHalf = Math.sin(angleDiff/2) || 0.001
      const rA = sizes[i], rB = sizes[j]
      const separation = (rA + rB + gap)
      const radNeeded = separation / (2 * sinHalf)
      if(radNeeded > requiredRadius) requiredRadius = radNeeded
    }
  }
  const maxAllowed = Math.min(cx, cy) - (maxSize + 20)
  const radius = Math.max(100, Math.min(requiredRadius, maxAllowed))

  return (
    <div className="card" style={{padding:16}}>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
        {/* draw links only for related departments */}
        {links.map(([a,b], i) => {
          const a1 = (a / n) * Math.PI * 2
          const a2 = (b / n) * Math.PI * 2
          const x1 = cx + Math.cos(a1) * radius
          const y1 = cy + Math.sin(a1) * radius
          const x2 = cx + Math.cos(a2) * radius
          const y2 = cy + Math.sin(a2) * radius
          return <line key={`link-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--hairline)" strokeWidth={1} opacity={0.6} />
        })}

        {departmentsWithRisk.map((d,i)=>{
          const angle = (i / departmentsWithRisk.length) * Math.PI * 2
          const x = cx + Math.cos(angle) * radius
          const y = cy + Math.sin(angle) * radius
          const size = sizes[i]
          const fill = colorForRisk(d.riskLevel)
          const stroke = d.riskLevel==='critical' ? 'var(--critical)' : 'var(--hairline)'
          return (
            <g key={d.id}>
              <circle cx={x} cy={y} r={size} fill={fill} opacity={0.14} stroke={stroke} strokeWidth={d.riskLevel==='critical'?2:1} className={d.riskLevel==='critical'? 'pulse':''} style={{cursor:'pointer'}} onClick={()=>navigate(`/departments/${d.id}`)} />
              <text x={x} y={y} textAnchor="middle" fontFamily="Space Grotesk" fontSize="14" fill="var(--text)" dy="6">{d.name}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
