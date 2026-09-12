import React, { useState } from 'react'
import { useDerivedData } from '../contexts/DerivedDataContext'
import Tooltip from './Tooltip'
import { useWorkforce } from '../contexts/WorkforceContext'
import { useNavigate } from 'react-router-dom'

function colorForRisk(risk){
  if(risk==='critical') return 'var(--critical)'
  if(risk==='watch') return 'var(--warning)'
  return 'var(--primary)'
}

export default function CategoryConstellation(){
  const { departmentsWithRisk, skillsWithRisk } = useDerivedData()
  const navigate = useNavigate()
  const [hover, setHover] = useState(null)

  const { employees } = useWorkforce()
  const categories = [...new Set(employees.map(employee => employee.category).filter(Boolean))]
  const CATEGORY_MAP = Object.fromEntries(categories.map(category => [category, [...new Set(employees.filter(employee => employee.category === category).map(employee => employee.departmentId))]]))

  // compute headcount and aggregated risk per category
  const catData = categories.map(cat => {
    const deptIds = CATEGORY_MAP[cat]
    let headcount = 0
    let risk = 'healthy'
    deptIds.forEach(did=>{
      const dd = (departmentsWithRisk||[]).find(x=>x.id===did)
      if(dd){
        headcount += dd.headcount||0
        if(dd.riskLevel === 'critical') risk = 'critical'
        else if(dd.riskLevel === 'watch' && risk !== 'critical') risk = 'watch'
      }
    })
    return { id: cat.toLowerCase().replace(/\s+/g,'-'), name: cat, headcount, risk }
  })

  const width = 1000, height = 420, cx = width/2, cy = height/2
  // compute raw sizes (radii) for each category
  const sizes = catData.map(c => 60 + Math.min(180, (c.headcount||0) * 6))
  const maxSize = sizes.length ? Math.max(...sizes) : 80

  // determine pairwise shared employees between categories
  const catDeptSets = categories.map(cat => new Set(CATEGORY_MAP[cat] || []))
  const catTotals = categories.map((cat,i)=> {
    const deptSet = catDeptSets[i]
    return employees.filter(e=>deptSet.has(e.departmentId)).length
  })

  function sharedCount(i,j){
    // count employees whose department is in both category dept sets
    const a = catDeptSets[i], b = catDeptSets[j]
    return employees.filter(e=> a.has(e.departmentId) && b.has(e.departmentId)).length
  }

  // compute required radius so circles do not overlap unless there are shared employees
  const gap = 12
  const n = categories.length
  let requiredRadius = 80
  for(let i=0;i<n;i++){
    for(let j=i+1;j<n;j++){
      const angleDiff = Math.min(Math.abs(j-i), n - Math.abs(j-i)) * (Math.PI*2/n)
      const sinHalf = Math.sin(angleDiff/2) || 0.001
      const rA = sizes[i], rB = sizes[j]
      const shared = sharedCount(i,j)
      // overlapFactor: 0=no shared, >0 means shared employees exist relative to smaller category
      const overlapFactor = shared > 0 ? Math.min(1, shared / Math.min(Math.max(1,catTotals[i]), Math.max(1,catTotals[j]))) : 0
      // if overlapFactor>0 allow some overlap by reducing required separation up to 50%
      const separation = (rA + rB + gap) * (1 - overlapFactor * 0.5)
      const radNeeded = separation / (2 * sinHalf)
      if(radNeeded > requiredRadius) requiredRadius = radNeeded
    }
  }

  // constrain to viewbox with margin
  const desiredRadius = 220
  let maxAllowed = Math.min(cx, cy) - (maxSize + 20)
  if(maxAllowed < 80) maxAllowed = 80
  const radius = Math.max(80, Math.min(requiredRadius, desiredRadius, maxAllowed))

  return (
    <div className="card" style={{padding:12}}>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
        {catData.map((c,i)=>{
          const angle = (i / catData.length) * Math.PI * 2
          const x = cx + Math.cos(angle) * radius
          const y = cy + Math.sin(angle) * radius
          const size = 60 + Math.min(180, c.headcount * 6)
          return (
            <g key={c.id}>
              {
                // neutral fill for non-critical, keep critical highlighted
              }
              {(() => {
                const isCritical = c.risk === 'critical'
                const fill = isCritical ? 'rgba(194,75,75,0.06)' : 'rgba(255,255,255,0.03)'
                const stroke = isCritical ? 'var(--critical)' : 'var(--hairline)'
                return (
                  <circle cx={x} cy={y} r={size} fill={fill} opacity={1} stroke={stroke} strokeWidth={isCritical?2:1} className={`breath ${isCritical? 'pulse':''}`} style={{cursor:'pointer'}} onClick={()=>navigate(`/categories/${c.id}`)} onMouseEnter={(e)=>{
                      const cx = e.clientX, cy = e.clientY
                      // compute risk count for this category (skills with non-healthy risk that have holders in these depts)
                      const deptSet = catDeptSets[i]
                      const riskCount = (skillsWithRisk||[]).filter(s=> s.risk !== 'healthy' && s.holders.some(h=> deptSet.has(h.departmentId))).length
                      setHover({ x: cx, y: cy, text: `${riskCount} risk${riskCount===1?'':'s'}` })
                    }} onMouseMove={(e)=>{ setHover(h=> h ? { ...h, x: e.clientX, y: e.clientY } : null) }} onMouseLeave={()=>setHover(null)} />
                )
              })()}

              {/* place category name centered inside the circle */}
              <text x={x} y={y} textAnchor="middle" fontFamily="Space Grotesk" fontSize="18" fill="var(--text)" dy="6">{c.name}</text>
            </g>
          )
        })}
        {hover ? <foreignObject x={0} y={0} width={0} height={0}><Tooltip x={hover.x} y={hover.y}>{hover.text}</Tooltip></foreignObject> : null}
        {/* connecting lines */}
        {catData.map((c,i)=>{
          const a1 = (i / catData.length) * Math.PI * 2
          const a2 = (((i+1)%catData.length) / catData.length) * Math.PI * 2
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
