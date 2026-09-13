import RetirementRiskPanel from '../components/RetirementRiskPanel'
import React, { useState } from 'react'
import { calculateOverallReadiness } from '../utils/readiness'
import { Link } from 'react-router-dom'
import { useWorkforce } from '../contexts/WorkforceContext'
import { useDerivedData } from '../contexts/DerivedDataContext'
import ReadinessRing from '../components/ReadinessRing'
import InitiativeRow from '../components/InitiativeRow'
import ConsequenceCallout from '../components/ConsequenceCallout'
import './Overview.css'

export default function Overview() {
  const { readinessDataComplete } = useWorkforce()
  const { initiativeResults, criticalTalent, documentationCoverage } = useDerivedData()
  const [selectedGoal, setSelectedGoal] = useState('all')
  const activeGoal = initiativeResults.some(item => item.id === selectedGoal) ? selectedGoal : 'all'
  const analyzed = activeGoal === 'all' ? initiativeResults : initiativeResults.filter(item => item.id === activeGoal)
  const overallReadiness = calculateOverallReadiness(analyzed.filter(item => item.configured))
  const ranked = analyzed.filter(item => item.configured).sort((a, b) => a.readinessPct - b.readinessPct)
  const worst = ranked[0]
  const risk = ranked.find(item => item.riskLevel === 'critical') || ranked.find(item => item.riskLevel === 'watch')
  return <div className="readiness-page">
    <header className="readiness-heading"><span className="readiness-data">STRATEGY INTELLIGENCE</span><h1>Can we execute our strategy?</h1><Link className="readiness-edit-strategy" to="/strategy">＋ Add / edit strategy ↗</Link><p>Connect workforce capability to the outcomes your business is counting on.</p></header>
    {!readinessDataComplete && <p className="readiness-data-notice">Readiness uses employee and skill records from the backend. Workforce coverage and role requirements have not been verified as complete.</p>}
    <div className="readiness-scope"><label htmlFor="readiness-goal">Strategy to analyze<select id="readiness-goal" value={activeGoal} onChange={event => setSelectedGoal(event.target.value)}><option value="all">All strategy goals</option>{initiativeResults.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><p>{activeGoal === 'all' ? 'Readiness across your current strategy goals.' : `Analyzing: ${analyzed[0].label}`} Goals, deadlines, and criteria are managed in <Link to="/strategy">Strategy</Link>.</p></div>
    <section className="readiness-panel readiness-hero"><ReadinessRing value={overallReadiness}/><div><span className="readiness-data">EXECUTION READINESS</span><h2>{ranked.length ? `Your workforce is ${overallReadiness}% ready ${activeGoal === 'all' ? 'across configured strategy goals' : `for ${analyzed[0].label}` }.` : 'Add strategy goals and workforce criteria to measure readiness.'}</h2>{worst && <p>{worst.label} has the lowest readiness at <span className="readiness-data">{worst.readinessPct}%</span>. {worst.relevantWorkforce ? `${worst.gap} of ${worst.relevantWorkforce} relevant employees have no qualifying skill recorded, putting delivery capacity at risk.` : 'No employees in its relevant roles are recorded, so capability cannot yet be confirmed.'}</p>}<small>{analyzed.length - ranked.length} goals awaiting role and skill criteria. Weighted by relevant workforce. A qualifying skill record counts as coverage, regardless of proficiency; employees may contribute to multiple objectives.</small></div></section>
    <section className="readiness-panel readiness-objectives"><header><h2>{activeGoal === 'all' ? 'Readiness by strategy goal' : 'Selected strategy goal'}</h2><span className="readiness-data">{analyzed.length} GOALS</span></header>{analyzed.map(initiative => <InitiativeRow key={initiative.id} initiative={initiative}/>)}{!initiativeResults.length && <p>No strategy goals yet. Add a goal on the Strategy page to get started.</p>}</section>
    {ranked.length > 0 && <ConsequenceCallout initiative={risk}/>}
    <RetirementRiskPanel/>
    <div className="readiness-bottom"><section className="readiness-panel readiness-talent"><h2>🚨 Critical Talent Risk</h2>{criticalTalent ? <><h3>{criticalTalent.name}</h3><p>{criticalTalent.holders.length === 1 ? 'A single recorded holder is a potential point of failure. Build backup coverage to protect continuity.' : `Your least-distributed recorded skill has ${criticalTalent.holders.length} holders. Build backup coverage to reduce dependency.`}</p><ul>{criticalTalent.holders.map(holder => <li key={holder.id}><Link to={`/employees/${holder.id}`}>{holder.name}</Link><span className="readiness-data">{{ 1: 'Beginner', 2: 'Developing', 3: 'Intermediate', 4: 'Advanced', 5: 'Expert' }[holder.proficiency] || holder.proficiency}</span></li>)}</ul></> : <p>No recorded skills are available to assess concentration risk.</p>}</section>
    <section className="readiness-panel"><h2>Documentation Coverage</h2><p>Employees with no recorded skills may have capability we cannot see. Validate their profiles before planning deployment.</p><div>{documentationCoverage.map((role, index) => <div className="readiness-documentation" key={`${role.title}-${index}`}><span>{role.title}</span><span className="readiness-data">{role.missing} / {role.total}</span></div>)}</div><small>Employees with zero recorded skills / total employees in role</small></section></div>
  </div>
}
