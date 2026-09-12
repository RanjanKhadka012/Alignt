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
        <h3>Quick analysis</h3>
        <ul>
          <li><strong>Total skills in network:</strong> {skillsWithRisk.length}</li>
          <li><strong>Skills with ≤2 holders (critical):</strong> {risks.length} (showing {displayedRisks.length})</li>
          <li><strong>Total employees represented:</strong> {employees.length}</li>
          <li><strong>Departments impacted:</strong> {derived?.departmentsWithRisk?.length || 0}</li>
        </ul>
        <p><strong>Suggested actions:</strong> Prioritize cross-training for single-holder skills, capture tribal knowledge (documentation/mentoring), and consider targeted hires for high-impact skills.</p>
      </div>
      {displayedRisks.map(item => <section className="readiness-panel readiness-talent" key={item.skill.id}><h2>{item.skill.name}</h2><span className="readiness-data">{item.holderCount} HOLDERS COMPANY-WIDE</span><ul>{item.holders.map(holder => <li key={holder.id}><Link to={`/employees/${holder.id}`}>{holder.name}</Link><span className="readiness-data">{proficiencyLabel(holder.proficiency)}</span></li>)}</ul></section>)}
      {!displayedRisks.length && <p>No skills with one or two recorded holders.</p>}
    </div>
  )
}
