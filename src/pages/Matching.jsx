import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStrategy } from '../contexts/StrategyContext'
import { useWorkforce } from '../contexts/WorkforceContext'
import { matchTeamToGoal } from '../services/matching.mjs'
import { analyzeGoalReadiness, calculateFinancials, proficiencyLabel } from '../utils/goalRisk'
import { FINANCIAL_ASSUMPTIONS as assumptions } from '../config/financialAssumptions'
import WorkforceFlow from '../components/WorkforceFlow'
import FinancialBarChart from '../components/FinancialBarChart'
import ConcentrationTable from '../components/ConcentrationTable'
import FinancialComparisonCard, { formatMoney } from '../components/FinancialComparisonCard'
import ProjectedValuePanel from '../components/ProjectedValuePanel'
import './Matching.css'

export default function Matching() {
  const workforce = useWorkforce()
  const { employees, skills, roles, departments } = workforce
  const { strategy } = useStrategy()
  const [goal, setGoal] = useState(''), [timeline, setTimeline] = useState('')
  const [result, setResult] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false)
  const request = useRef(0), lock = useRef(false)
  const strategyGoals = [...(strategy.shortTermGoals || []), ...(strategy.longTermGoals || [])]
  async function submit(nextGoal = goal, nextTimeline = timeline) {
    if (lock.current || !nextGoal.trim() || !nextTimeline.trim()) return
    lock.current = true; setBusy(true); setError(''); setResult(null)
    const id = ++request.current
    try {
      const requirements = await matchTeamToGoal(nextGoal.trim(), nextTimeline.trim(), { employees, skills, roles, departments })
      const named = employees.map(employee => ({ ...employee, skills: (employee.skills || []).map(skill => ({ ...skill, skill: skill.skill || skills.find(entry => entry.id === skill.skillId)?.name })) }))
      const analysis = analyzeGoalReadiness(nextGoal.trim(), requirements.requiredSkills, requirements.relevantRoles, named)
      setResult({ id, goal: nextGoal.trim(), timeline: nextTimeline.trim(), requirements, analysis, finances: calculateFinancials(analysis.trainable.length, analysis.gapped.length) })
    } catch (err) { setError(err.message) } finally { lock.current = false; setBusy(false) }
  }
  const analysis = result?.analysis, finances = result?.finances
  const worst = analysis && [...analysis.concentration].sort((a, b) => a.holders.length - b.holders.length)[0]
  const candidate = worst && analysis.trainable.find(employee => employee.skills.some(skill => skill.skill === worst.capability && !['Intermediate', 'Advanced', 'Expert'].includes(proficiencyLabel(skill.proficiency))))
  const segments = analysis ? [ { label: 'Fully qualified', count: analysis.fullyQualified.length, tone: 'teal' }, { label: 'Trainable', count: analysis.trainable.length, tone: 'amber' }, { label: 'Skill-gapped', count: analysis.gapped.length, tone: 'red' } ] : []
  return <div className="matching-page">
    <header><div className="matching-data matching-eyebrow">GOAL → SKILLS → PEOPLE → RISK</div><h1>Is your workforce ready to execute?</h1><p>Tell us your strategy. We'll show you the capability, risk, and investment needed to deliver it.</p></header>
    <section className="matching-panel matching-input"><form onSubmit={event => { event.preventDefault(); submit() }}><label className="matching-goal">Business goal / objective<input required maxLength={2000} value={goal} onChange={event => setGoal(event.target.value)} placeholder="Roll out automation on Line 4" /></label><label>Target timeline<input required maxLength={100} value={timeline} onChange={event => setTimeline(event.target.value)} placeholder="6 months" /></label><button type="submit" className="matching-submit" disabled={busy || !goal.trim() || !timeline.trim()}> {busy ? 'Analyzing…' : 'Analyze readiness'}</button></form>
      <div className="matching-examples matching-strategy-goals"><div className="matching-strategy-heading"><span className="matching-data">TRY A GOAL · FROM YOUR STRATEGY</span><Link to="/strategy">Manage goals ↗</Link></div>{strategyGoals.map((item, index) => <button key={item.id || index} disabled={busy} onClick={() => { const target = item.targetDate && item.targetDate !== 'TBD' ? `By ${item.targetDate}` : 'No target date specified'; setGoal(item.text); setTimeline(target); submit(item.text, target) }}><span>{item.text} ↗</span><span className="matching-data">{item.targetDate || 'No deadline set'}</span></button>)}{!strategyGoals.length && <p>Add a goal in Strategy, or enter an objective above.</p>}</div>
    </section>
    {busy && <section className="matching-panel" role="status"><h2>Identifying capabilities and relevant roles…</h2><p className="matching-muted">Then we’ll assess employee proficiency, concentration risk, and costs from the workforce records.</p></section>}
    {error && <section className="matching-panel matching-risk" role="alert"><h2>Analysis unavailable</h2><p>{error}</p><button onClick={() => submit()}>Try again</button></section>}
    {result && <div className="goal-risk-results" key={result.id}>
      <div className="matching-query"><strong>{result.goal}</strong><span className="matching-data">TARGET · {result.timeline}</span></div>
      <p className="matching-muted matching-footnote">Relevant roles: {result.requirements.relevantRoles.join(' · ') || 'No relevant roles found in current records'}. Qualification reflects recorded skills, not confirmed availability or certification status.</p>
      <WorkforceFlow analysis={analysis}/>
      <section className="matching-panel"><h2>Workforce readiness breakdown</h2>{!analysis.pool.length ? <p className="matching-muted">No employees in the identified roles. Review role coverage before making a staffing estimate.</p> : <><div className="readiness-segments" role="img" aria-label={segments.map(segment => `${segment.label}: ${segment.count}`).join(', ')}>{segments.map(segment => <span className={segment.tone} key={segment.label} style={{ width: `${100 * segment.count / analysis.pool.length}%` }} />)}</div><div className="segment-legend">{segments.map(segment => <span key={segment.label}><i className={segment.tone}/>{segment.label} <strong className="matching-data">{Math.round(100 * segment.count / analysis.pool.length)}% · {segment.count}</strong></span>)}</div></>}
        <details className="pipeline-people"><summary>Inspect employee classification</summary>{[['Fully qualified', analysis.fullyQualified], ['Trainable', analysis.trainable], ['Skill-gapped', analysis.gapped]].map(([label, people]) => <div key={label}><h3>{label}</h3>{people.length ? people.map(employee => <p key={employee.id}><Link to={`/employees/${employee.id}`}>{employee.name}</Link> · {employee.role}</p>) : <p>None</p>}</div>)}</details>
      </section>
      <section className="matching-panel"><h2>Capability concentration check</h2><p className="matching-muted">Intermediate+ holders across the entire company. Critical: ≤2 · Watch: ≤4 · OK: 5+.</p><ConcentrationTable concentration={analysis.concentration}/></section>
      {worst && <section className={`matching-panel concentration-callout ${worst.flag}`}><span className="matching-data">{worst.flag === 'ok' ? 'LOWEST CAPABILITY COVERAGE' : 'PRIORITY CAPABILITY RISK'}</span><h2>{worst.capability}</h2><p>{worst.holders.length ? worst.holders.map(employee => `${employee.name} (${proficiencyLabel(employee.skills.find(skill => skill.skill === worst.capability)?.proficiency)})`).join(' · ') : 'No Intermediate+ holders recorded company-wide.'}</p><p className="matching-muted">{worst.flag === 'ok' ? 'Coverage is above the concentration-risk threshold. Maintain backup capacity and keep procedures current.' : worst.holders.length ? 'If these employees are unavailable, this capability loses its recorded qualified coverage and may delay delivery.' : 'The project currently has no recorded qualified internal coverage for this capability. Build or recruit expertise before relying on it.'}</p><div className="matching-examples">{candidate && <Link to={`/employees/${candidate.id}`}>Fast-track {candidate.name}'s training ↗</Link>}{analysis.trainable.length > 0 && <Link to="/recommendations">Cross-train {Math.min(analysis.trainable.length, Math.max(1, 5 - worst.holders.length))} additional people ↗</Link>}<span className="matching-action-note">Document procedures before any transition</span></div></section>}
      <section className="matching-panel"><h2>Financial impact</h2><p className="matching-muted">Computed from workforce counts using placeholder costs: {formatMoney(assumptions.avgSpecialistSalary)} annual salary + {assumptions.recruitingOverheadPct * 100}% recruiting overhead per hire. Not actual company compensation.</p>
      {!analysis.pool.length ? <p>No relevant workforce pool; staffing costs cannot be meaningfully estimated.</p> : <><FinancialBarChart optionA={finances.optionA} recommended={finances.recommended.total}/><div className="financial-grid"><FinancialComparisonCard title="Recruit for every skill-gapped position" total={finances.optionA}><p>{analysis.gapped.length} hires × {formatMoney(assumptions.avgSpecialistSalary * (1 + assumptions.recruitingOverheadPct))}</p><small>First-year salary + recruiting overhead. Does not include training the trainable group.</small></FinancialComparisonCard><FinancialComparisonCard recommended title="Develop internally. Recruit selectively." total={finances.recommended.total}><ul><li>{analysis.trainable.length} trainable × {formatMoney(assumptions.trainableCoursePerPerson)} · ~6 weeks</li><li>{finances.recommended.upskillGappedCount} skill-gapped × {formatMoney(assumptions.gappedCoursePerPerson)} · ~10 weeks</li><li>{finances.recommended.recruitCount} safety-margin recruits × {formatMoney(assumptions.avgSpecialistSalary * (1 + assumptions.recruitingOverheadPct))}</li></ul><strong className="financial-savings">{formatMoney(Math.abs(finances.recommended.savingsVsOptionA))} {finances.recommended.savingsVsOptionA >= 0 ? 'savings' : 'additional investment'} vs. Option A</strong></FinancialComparisonCard></div><p className="matching-muted matching-footnote">Scenarios cover different populations: blended includes training the trainable group. Courses are assumptions, not proof of qualification. Safety-margin hires require appropriate skills; these counts do not guarantee every capability gap is closed. Training excludes paid learning time and backfill.</p></>}
      </section>
      <ProjectedValuePanel value={finances.projectedValue} assumptions={assumptions} investment={analysis.pool.length ? finances.recommended.total : 0}/>
    </div>}
  </div>
}
