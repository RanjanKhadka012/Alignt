import React from 'react'
import { useDerivedData } from '../contexts/DerivedDataContext'
import { useStrategy } from '../contexts/StrategyContext'
import { useNavigate } from 'react-router-dom'

function colorForRisk(risk){
  if(risk==='critical') return 'var(--critical)'
  if(risk==='watch') return 'var(--warning)'
  return 'var(--primary)'
}

export default function TopCapabilityRisks({maxItems=6}){
  const { skillsWithRisk, departmentsWithRisk } = useDerivedData()
  const { strategy } = useStrategy()
  const navigate = useNavigate()

  const deptNameById = {}
  ;(departmentsWithRisk||[]).forEach(d=> deptNameById[d.id]=d.name)

  // compute strategic weight: presence in strategy text increases weight
  function strategicWeightFor(skillName){
    if(!strategy) return 1
    const textPool = [
      ...(strategy.shortTermGoals||[]).map(g=>g.text),
      ...(strategy.longTermGoals||[]).map(g=>g.text),
      ...(strategy.initiatives||[]).map(i=>i.text)
    ].join(' ').toLowerCase()
    if(!skillName) return 1
    const s = skillName.toLowerCase()
    if(textPool.includes(s)) return 2.0
    return 1.0
  }

  const scored = (skillsWithRisk||[]).map(s=>{
      const name = s.skill.name
      const holders = s.holders || []
      const holderCount = s.holderCount || holders.length
      const retirementCount = s.retirementCount || holders.filter(h=>h.retirementEligible).length
      const weight = strategicWeightFor(name)
      // concentration: inverse of holder count
      const concentration = 1 / Math.max(1, holderCount)
      // combined score: strategic weight * concentration * (1 + retirement factor)
      const combined = weight * concentration * (1 + (retirementCount>0? retirementCount:0))
      // primary department: if all holders share dept -> that name, else 'Multiple'
      const deptIds = Array.from(new Set(holders.map(h=>h.departmentId).filter(Boolean)))
      const department = deptIds.length===1 ? (deptNameById[deptIds[0]] || 'Unknown') : (deptIds.length===0? 'Unassigned' : 'Multiple')
      const reason = holderCount === 0 ? 'No holders' : (holderCount===1 ? `${holders[0].retirementEligible? '1 holder, retirement-eligible' : '1 holder'}` : `${holderCount} holders${retirementCount? `, ${retirementCount} retirement-eligible`:''}`)
      return { id: s.skill.id, name, holders, holderCount, retirementCount, department, reason, risk: s.risk, combined }
    }).sort((a,b)=> b.combined - a.combined)

  const top = scored.slice(0, maxItems)

  if(!top.length) return (
    <div className="card" style={{padding:16,marginTop:12}}>
      <h3 style={{marginTop:0}}>Top Capability Risks</h3>
      <div style={{color:'var(--muted)'}}>No capability risks identified.</div>
    </div>
  )

  return (
    <div className="card" style={{padding:12,marginTop:12}}>
      <h3 style={{marginTop:0}}>Top Capability Risks</h3>
      <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:8}}>
        {top.map((it,idx)=>{
          const isTop = idx===0
          const bg = isTop ? 'linear-gradient(90deg, rgba(255,0,0,0.04), rgba(255,255,255,0.01))' : 'transparent'
          const border = isTop ? `1px solid rgba(255,0,0,0.08)` : '1px solid var(--hairline)'
          const badgeColor = it.risk==='critical' ? 'var(--critical)' : (it.risk==='watch' ? 'var(--warning)' : 'var(--primary)')
          return (
            <div key={it.id} onClick={()=>navigate(`/risk-map?item=skill:${encodeURIComponent(it.id)}`)} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding: isTop?12:10,borderRadius:8,background:bg,border:border,cursor:'pointer'}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:10,height:10,background:badgeColor,borderRadius:10,boxShadow:isTop?`0 0 12px ${badgeColor}`:'none'}} />
                <div>
                  <div style={{fontSize: isTop?16:14,fontWeight: isTop?800:700}}>{it.name}</div>
                  <div style={{fontSize:12,color:'var(--muted)'}}>{it.department} • {it.holderCount} {it.holderCount===1? 'holder':'holders'}</div>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:12,color:'var(--muted)'}}>{it.reason}</div>
                <div style={{marginTop:6,fontWeight:700,color: badgeColor, fontSize: isTop?15:13}}>{(it.combined).toFixed(2)}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
