import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStrategy } from '../contexts/StrategyContext'
import { useWorkforce } from '../contexts/WorkforceContext'
import MatchedTeamNetwork from '../components/MatchedTeamNetwork'
import { matchTeamToGoal } from '../services/matching.mjs'
import './Matching.css'

const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
const costRange = option => `${money(option.costMin)} – ${money(option.costMax)}`

function GapOption({ title, option, employees, training = false }) {
  const employee = employees.find(employee => employee.id === option.employeeId)
  return <div className="matching-gap-option">
    <h3>{title}</h3>
    {training && <div className="matching-data">{employee ? `CANDIDATE · ${employee.name}` : 'CANDIDATE · To be identified'}</div>}
    <p>{option.description}</p>
    <div className="matching-option-cost"><strong>{costRange(option)}</strong><span>{option.duration}</span></div>
    <p className="matching-muted matching-footnote">{option.assumptions}</p>
  </div>
}

export default function Matching() {
  const { employees, skills, roles, departments } = useWorkforce()
  const { strategy } = useStrategy()
  const strategyGoals = [
    ...(strategy.shortTermGoals || []).map(goal => ({ ...goal, horizon: 'This year' })),
    ...(strategy.longTermGoals || []).map(goal => ({ ...goal, horizon: '1–3 years' })),
  ].filter(goal => goal.text?.trim())
  const [goal, setGoal] = useState('')
  const [timeline, setTimeline] = useState('')
  const [result, setResult] = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(null)
  const request = useRef(0)
  const busy = status === 'loading'
  async function submit(nextGoal = goal, nextTimeline = timeline) {
    if (!nextGoal.trim() || !nextTimeline.trim() || !employees.length || busy) return
    const id = ++request.current
    setSubmitted({ goal: nextGoal.trim(), timeline: nextTimeline.trim() })
    setResult(null); setError(''); setStatus('loading')
    try {
      const match = await matchTeamToGoal(nextGoal.trim(), nextTimeline.trim(), { employees, skills, roles, departments })
      if (id === request.current) { setResult(match); setStatus('success') }
    } catch (err) { if (id === request.current) { setError(err.message); setStatus('error') } }
  }
  const team = result ? [...new Set(result.suggestedTeam.map(match => match.employeeId))].map(id => ({
    employee: employees.find(employee => employee.id === id),
    matches: result.suggestedTeam.filter(match => match.employeeId === id),
  })) : []
  return <div className="matching-page">
    <header><div className="matching-data matching-eyebrow">WORKFORCE INTELLIGENCE</div><h1>Goal → Project Matching</h1><p>Describe the goal. Discover the skills and people to deliver it.</p></header>
    <section className="matching-panel matching-input" aria-label="Project goal">
      <form onSubmit={event => { event.preventDefault(); submit() }}>
        <label className="matching-goal">Goal / project description<input required maxLength="2000" value={goal} onChange={event => setGoal(event.target.value)} placeholder="Roll out automation on Line 4" /></label>
        <label>Target timeline<input required maxLength="100" value={timeline} onChange={event => setTimeline(event.target.value)} placeholder="6 months" /></label>
        <button className="matching-submit" disabled={busy || !employees.length || !goal.trim() || !timeline.trim()} type="submit">{busy ? 'Finding team…' : 'Find team'}</button>
      </form>
      <div className="matching-examples matching-strategy-goals">
        <div className="matching-strategy-heading"><span className="matching-data">TRY A GOAL · FROM YOUR STRATEGY</span><Link to="/strategy">Manage goals ↗</Link></div>
        {strategyGoals.length ? strategyGoals.map((strategyGoal, index) => {
          const hasDate = /^\d{4}-\d{2}-\d{2}$/.test(strategyGoal.targetDate || '') && !Number.isNaN(Date.parse(strategyGoal.targetDate))
          const target = hasDate ? `By ${strategyGoal.targetDate}` : 'No target date specified'
          return <button key={`${strategyGoal.horizon}-${index}`} disabled={busy || !employees.length} onClick={() => { setGoal(strategyGoal.text); setTimeline(target); submit(strategyGoal.text, target) }}>
            <span>{strategyGoal.text} ↗</span>
            <span className="matching-data">{strategyGoal.horizon} · {hasDate ? strategyGoal.targetDate : 'No deadline set'}</span>
          </button>
        }) : <p className="matching-muted matching-footnote">Add a goal on the <Link to="/strategy">Strategy page</Link> to try it here, or describe a project above.</p>}
      </div>
    </section>
    {status !== 'idle' && <section aria-label="Matching results" aria-busy={busy}>
      <div className="matching-query"><span>{submitted.goal}</span><span className="matching-data">TARGET · {submitted.timeline}</span></div>
      <div className="matching-results">
        <section className="matching-panel"><div className="matching-panel-heading"><h2>Matched network</h2><span className="matching-data">{team.length} / {employees.length} PEOPLE</span></div>
          <p className="matching-muted" role="status">{busy ? 'Identifying required skills and evaluating internal holders…' : result ? `${team.length} people cover ${result.requiredSkills.length - result.gaps.length} of ${result.requiredSkills.length} required skills.` : 'No team could be assembled. Retry to evaluate this goal.'}</p>
          <MatchedTeamNetwork key={`${request.current}-${status}`} employees={employees} suggestedTeam={result?.suggestedTeam} hasResult={!!result} />
        </section>
        <div className="matching-details">
          {error && <section className="matching-panel matching-risk" role="alert"><h2>Matching unavailable</h2><p>{error}</p><button onClick={() => submit(submitted.goal, submitted.timeline)}>Try again</button></section>}
          {busy && <section className="matching-panel"><h2>Building your team</h2><p className="matching-muted">Checking skills, proficiency, and any recorded commitments against your goal and timeline.</p></section>}
          {result && <>
            <section className="matching-panel"><h2>Required skills</h2><ul className="matching-skills">{result.requiredSkills.map(skill => { const gap = result.gaps.some(g => g.trim().toLowerCase() === skill.trim().toLowerCase()); return <li key={skill} className={gap ? 'matching-missing-skill' : 'matching-covered-skill'}><span>{skill}</span><span className={`matching-tag matching-data ${gap ? 'gap' : ''}`}>{gap ? 'MISSING' : 'COVERED'}</span></li> })}</ul></section>
            <section className="matching-panel"><h2>Suggested team</h2>{!team.length && <p className="matching-muted">No internal holders were found for the required skills.</p>}<ul className="matching-team">{team.map(({ employee, matches }) => <li key={employee.id}><strong>{employee.name}{matches.some(m => m.stretched) && <span className="matching-amber"> *</span>}</strong><div className="matching-muted">{employee.role} · {departments.find(d => d.id === employee.departmentId)?.name || employee.departmentId}</div><div className="matching-coverage">{matches.map(m => m.matchedSkill).join(' · ')}</div></li>)}</ul>{team.some(t => t.matches.some(m => m.stretched)) && <p className="matching-amber">* Stretched: recorded commitments may limit availability. Confirm capacity before staffing.</p>}<p className="matching-muted matching-footnote">Availability is assessed only where commitment data is provided. Confirm capacity with team leads.</p></section>
            {result.gaps.length > 0 && <section className="matching-panel matching-gap-panel">
              <h2>Close the skill gaps</h2>
              <p className="matching-muted">Compare two paths for each missing skill. Costs are AI planning estimates in USD, not quotes, and include the assumptions below.</p>
              {result.gapPlans.map(plan => <article className="matching-gap" key={plan.skill}>
                <h3>{plan.skill} <span className="matching-tag gap matching-data">MISSING</span></h3>
                <GapOption title="Train a current employee" option={plan.training} employees={employees} training />
                <GapOption title="Hire an intern with this skill" option={plan.internship} employees={employees} />
              </article>)}
              <div className="matching-budget"><h3>Estimated company investment</h3>
                {['training', 'internship'].map(path => <div className="matching-budget-row" key={path}><span>{path === 'training' ? 'Training every gap' : 'Intern hiring for every gap'}</span><strong>{costRange({ costMin: result.gapPlans.reduce((sum, plan) => sum + plan[path].costMin, 0), costMax: result.gapPlans.reduce((sum, plan) => sum + plan[path].costMax, 0) })}</strong></div>)}
                <p className="matching-muted matching-footnote">Alternative scenarios, not additive. Each assumes one trainee or intern per gap. Shared training or a person covering multiple gaps may reduce totals. Check each option’s suitability and timeline before budgeting; these costs exclude the existing project team and other project expenses.</p>
              </div>
            </section>}
          </>}
        </div>
      </div>
    </section>}
  </div>
}
