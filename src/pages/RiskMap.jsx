import { retirementStatus } from '../utils/retirement.mjs'
import RetirementRiskPanel from '../components/RetirementRiskPanel'
import React from 'react'
import SkillHolderNetwork from '../components/SkillHolderNetwork'
import { useWorkforce } from '../contexts/WorkforceContext'
import { useDerivedData } from '../contexts/DerivedDataContext'
import { Link } from 'react-router-dom'
import { proficiencyLabel } from '../utils/goalRisk'
import './Overview.css'
import './RiskMap.css'

export default function RiskMap(){
  const { employees } = useWorkforce()
  const derived = useDerivedData()
  const { skillsWithRisk } = derived
  const risks = skillsWithRisk.filter(item => item.holderCount > 0 && item.holderCount <= 2).sort((a, b) => a.holderCount - b.holderCount || a.skill.name.localeCompare(b.skill.name))
  const excluded = new Set(['Food safety recertification (HACCP)', 'Legacy line-equipment troubleshooting'])
  const displayedRisks = risks.filter(r => !excluded.has(r.skill.name))
  return (
    <div className="readiness-page">
      <RetirementRiskPanel/><header className="readiness-heading">
        <h1>Skills → Employees relationships</h1>
        <p>Skills with two or fewer recorded holders company-wide. Beginner holders count as recorded coverage, but may still need development before they can replace an expert.</p>
      </header>
      <SkillHolderNetwork skillsWithRisk={skillsWithRisk} employees={employees}/>
      <div className="readiness-analytics" style={{marginTop:12}}>
        <h3>Actionable analysis</h3>
        <p style={{color:'var(--muted)',marginTop:4}}>Summary of the highest-priority capability risks and concrete recommendations for owners to act on this week.</p>

        {/* Top critical skills */}
        {(() => {
          const sorted = [...skillsWithRisk].sort((a,b) => Number(b.risk === 'critical') - Number(a.risk === 'critical') || b.retiringSoonCount - a.retiringSoonCount || a.holderCount - b.holderCount || b.retirementCount - a.retirementCount)
          const top = sorted.filter(s=>s.holderCount>0).slice(0,6)
          return (
            <div style={{marginTop:8}}>
              <div style={{fontWeight:700,marginBottom:6}}>Top vulnerable skills</div><p style={{fontSize:12,color:'var(--muted)'}}>Flags include planned retirements and eligibility with unconfirmed timing. Demo assignments are labeled. High priority means no Intermediate+ backup without a retirement flag is recorded.</p>
              <table style={{width:'100%',marginTop:8,borderCollapse:'collapse'}} className="analysis-table">
                <thead>
                  <tr style={{textAlign:'left'}}>
                    <th style={{padding:'6px 8px'}}>Skill</th>
                    <th style={{padding:'6px 8px'}}>Holders</th>
                    <th style={{padding:'6px 8px'}}>Retirement flags</th>
                    <th style={{padding:'6px 8px'}}>Risk</th>
                    <th style={{padding:'6px 8px'}}>Priority</th>
                    <th style={{padding:'6px 8px',width:260}}>Recommended action</th>
                  </tr>
                </thead>
                <tbody>
                  {top.map((s, idx) => {
                    const action = s.retirementCount > 0 ? (s.backupCount === 0 ? 'Prioritize knowledge transfer and develop an Intermediate+ backup; confirm retirement timing.' : 'Confirm retirement timing and schedule handover with recorded backup holders.') : s.holderCount <= 1 ? 'Capture knowledge and develop a backup holder.' : 'Monitor and schedule mentoring'
                    const risk = s.risk
                    const riskColor = risk === 'critical' ? 'var(--critical)' : risk === 'watch' ? 'var(--warning)' : 'var(--primary)'
                    const priority = risk === 'critical' || s.holderCount <= 1 ? 'High' : risk === 'watch' ? 'Medium' : 'Low'
                    const rowBg = idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.02)'
                    return (
                      <tr key={s.skill.id} style={{borderTop:'1px solid var(--hairline)',background:rowBg}}>
                        <td style={{padding:'8px'}}>{s.skill.name}</td>
                        <td style={{padding:'8px'}}><strong>{s.holderCount}</strong></td>
                        <td style={{padding:'8px'}}><strong>{s.retirementCount}</strong>{s.retirementHolders.map(holder => <div key={holder.id} style={{fontSize:11,marginTop:6}}><Link to={`/employees/${holder.id}`}>{holder.name}</Link><div>{retirementStatus(holder).label}{holder.retirementDate && ` · ${holder.retirementDate}`}</div></div>)}</td>
                        <td style={{padding:'8px',textTransform:'capitalize'}}><span style={{display:'inline-block',padding:'4px 10px',borderRadius:14,background:riskColor,color:'#0b0b0b',fontWeight:600}}>{s.risk}</span></td>
                        <td style={{padding:'8px'}}><span style={{display:'inline-flex',alignItems:'center',gap:8}}><span style={{width:10,height:10,borderRadius:10,background: priority==='High' ? '#ff6b6b' : priority==='Medium' ? '#ffbf69' : '#7bd389'}}></span><strong>{priority}</strong></span></td>
                        <td style={{padding:'8px',fontSize:13,color:'var(--muted)'}}>{action}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        })()}

        {/* Department impact */}
        <div style={{marginTop:12}}>
          <div style={{fontWeight:700}}>Departments most impacted</div>
          <ul style={{marginTop:8,display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,listStyle:'none',padding:0}}>
            {derived?.departmentsWithRisk?.slice().sort((a,b)=> (b.riskLevel==='critical'?2: b.riskLevel==='watch'?1:0) - (a.riskLevel==='critical'?2: a.riskLevel==='watch'?1:0)).slice(0,6).map(d => {
              const r = (d.riskLevel||'').toLowerCase()
              const color = r === 'critical' ? '#ff6b6b' : r === 'watch' ? '#ffbf69' : '#7bd389'
              return (
                <li key={d.id} style={{background:'var(--panel)',padding:8,borderRadius:6,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div><strong>{d.name}</strong><div style={{fontSize:12,color:'var(--muted)'}}>{d.headcount} headcount</div></div>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end'}}><span style={{background:color,padding:'4px 10px',borderRadius:12,fontWeight:700}}>{d.riskLevel}</span></div>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Coverage summary */}
        <div style={{marginTop:12}}>
          <div style={{fontWeight:700}}>Coverage summary</div>
          <div style={{marginTop:8}}>
            <div>Total skills tracked: <strong>{skillsWithRisk.length}</strong></div>
            <div>Skills with no holders: <strong>{skillsWithRisk.filter(s=>s.holderCount===0).length}</strong></div>
            <div>Skills with &lt;3 holders (vulnerable): <strong>{skillsWithRisk.filter(s=>s.holderCount>0 && s.holderCount<3).length}</strong></div>
          </div>
        </div>

        {/* Next steps */}
        <div style={{marginTop:12}}>
          <div style={{fontWeight:700}}>Recommended next steps</div>
          <ol style={{marginTop:8}}>
            <li>Run a skill verification survey for the top vulnerable skills listed above.</li>
            <li>Assign mentors for single-holder skills and add documentation tasks to the team's backlog.</li>
            <li>Coordinate targeted hiring or internal rotation for skills with persistent gaps.</li>
            <li>Schedule quarterly audits and track changes (holders, retirements) in this dashboard.</li>
          </ol>
        </div>
      </div>
      {displayedRisks.map(item => <section className="readiness-panel readiness-talent" key={item.skill.id}><h2>{item.skill.name}</h2><span className="readiness-data">{item.holderCount} HOLDERS COMPANY-WIDE</span><ul>{item.holders.map(holder => <li key={holder.id}><Link to={`/employees/${holder.id}`}>{holder.name}</Link><span className="readiness-data">{proficiencyLabel(holder.proficiency)}</span></li>)}</ul></section>)}
      {!displayedRisks.length && <p>No skills with one or two recorded holders.</p>}
    </div>
  )
}
