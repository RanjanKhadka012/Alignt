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
      <header className="readiness-heading">
        <h1>Skills → Employees relationships</h1>
        <p>Skills with two or fewer recorded holders company-wide. Beginner holders count as recorded coverage, but may still need development before they can replace an expert.</p>
      </header>
      <SkillHolderNetwork skillsWithRisk={skillsWithRisk} employees={employees}/>
      <div className="readiness-analytics" style={{marginTop:12}}>
        <h3>Actionable analysis</h3>
        <p style={{color:'var(--muted)'}}>This section highlights the highest-priority capability risks and recommends concrete next steps for business owners.</p>

        {/* Top critical skills */}
        {(() => {
          const sorted = [...skillsWithRisk].sort((a,b) => a.holderCount - b.holderCount || b.retirementCount - a.retirementCount)
          const top = sorted.filter(s=>s.holderCount>0).slice(0,6)
          return (
            <div style={{marginTop:8}}>
              <div style={{fontWeight:700}}>Top vulnerable skills</div>
              <table style={{width:'100%',marginTop:8,borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{textAlign:'left'}}><th>Skill</th><th>Holders</th><th>Retirements</th><th>Risk</th><th style={{width:200}}>Recommended action</th></tr>
                </thead>
                <tbody>
                  {top.map(s => {
                    const action = s.holderCount <= 1 ? 'Immediate: capture knowledge, assign backup, consider hire' : (s.retirementCount > 0 ? 'Cross-train + document' : 'Monitor & schedule mentoring')
                    return (
                      <tr key={s.skill.id} style={{borderTop:'1px solid var(--hairline)'}}>
                        <td>{s.skill.name}</td>
                        <td>{s.holderCount}</td>
                        <td>{s.retirementCount}</td>
                        <td style={{textTransform:'capitalize'}}>{s.risk}</td>
                        <td style={{fontSize:13,color:'var(--muted)'}}>{action}</td>
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
          <ul style={{marginTop:8}}>
            {derived?.departmentsWithRisk?.slice().sort((a,b)=> (b.riskLevel==='critical'?2: b.riskLevel==='watch'?1:0) - (a.riskLevel==='critical'?2: a.riskLevel==='watch'?1:0)).slice(0,6).map(d => <li key={d.id}><strong>{d.name}</strong> — {d.headcount} headcount — risk: {d.riskLevel}</li>)}
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
