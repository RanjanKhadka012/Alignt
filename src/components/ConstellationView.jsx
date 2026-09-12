import React, { useState } from 'react'
import { useDerivedData } from '../contexts/DerivedDataContext'

function colorForRisk(risk){
  if(risk==='critical') return 'var(--critical)'
  if(risk==='watch') return 'var(--warning)'
  return 'var(--primary)'
}

export default function ConstellationView(){
  const { skillsWithRisk } = useDerivedData()
  const [hover, setHover] = useState(null)

  const width = 1000, height = 680, cx = width/2, cy = height/2
  const radius = 220

  return (
    <div className="constellation card">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`}> 
        {/* place skills on a ring */}
        {skillsWithRisk.map((s, i)=>{
          const angle = (i / skillsWithRisk.length) * Math.PI * 2
          const sx = cx + Math.cos(angle) * radius
          const sy = cy + Math.sin(angle) * radius
          const size = 18 + s.skill.strategicWeight * 36
          return (
            <g key={s.skill.id}>
              {/* skill circle */}
              <circle cx={sx} cy={sy} r={size} fill="none" stroke={colorForRisk(s.risk)} strokeWidth={2} className={s.risk==='critical'? 'pulse':''} onMouseEnter={(e)=>setHover({type:'skill', s, x:e.clientX, y:e.clientY})} onMouseLeave={()=>setHover(null)} />
              <text x={sx} y={sy+size+12} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="var(--muted)">{s.skill.name}</text>

              {/* lines to holders and small employee nodes */}
              {s.holders.map((h,idx)=>{
                const ex = sx + (Math.random()*40-20)
                const ey = sy + (Math.random()*40-20)
                return <g key={h.id}>
                    <line x1={sx} y1={sy} x2={ex} y2={ey} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
                    <circle cx={ex} cy={ey} r={6} fill="var(--surface)" stroke="rgba(255,255,255,0.08)" onMouseEnter={(e)=>setHover({type:'emp', h, x:e.clientX, y:e.clientY})} onMouseLeave={()=>setHover(null)} />
                  </g>
              })}
            </g>
          )
        })}
      </svg>

      {hover && hover.type==='skill' && (
        <div className="tooltip" style={{position:'absolute',left:hover.x+10,top:hover.y+10}}>
          <div style={{fontWeight:600}}>{hover.s.skill.name}</div>
          <div style={{fontSize:12,color:'var(--muted)'}}>{hover.s.holderCount} holders • {hover.s.retirementCount} retirement-eligible</div>
        </div>
      )}

      {hover && hover.type==='emp' && (
        <div className="tooltip" style={{position:'absolute',left:hover.x+10,top:hover.y+10}}>
          <div style={{fontWeight:600}}>{hover.h.name}</div>
          <div style={{fontSize:12,color:'var(--muted)'}}>Tenure: {hover.h.tenure} yrs • Retire: {hover.h.retirementEligible? 'yes':'no'}</div>
        </div>
      )}

    </div>
  )
}
