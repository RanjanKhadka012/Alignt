import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDerivedData } from '../contexts/DerivedDataContext'
import { proficiencyLabel } from '../utils/goalRisk'
import '../pages/Overview.css'
export default function InitiativeDetail() {
  const { initiativeId } = useParams()
  const { initiativeResults, namedEmployees } = useDerivedData()
  const initiative = initiativeResults.find(item => item.id === initiativeId)
  if (!initiative) return <div><Link to="/overview">← Overview</Link><h1>Objective not found</h1></div>
  const relevant = namedEmployees.filter(employee => initiative.relevantRoles.includes(employee.role))
  return <div className="readiness-page">
    <Link to="/overview">← Strategy readiness</Link>
    <header className="readiness-heading"><h1>{initiative.label}</h1><p>Highlighted skills explain why each employee qualifies. This readiness measure counts at least one matching skill at any recorded proficiency; it does not mean every required skill is covered.</p><span className="readiness-data">{initiative.qualified} / {initiative.relevantWorkforce} qualified · Target {initiative.targetDate || 'Not set'}</span></header>
    <section className="readiness-panel"><h2>Qualifying skills for this goal</h2><div className="objective-skill-tags">{initiative.qualifyingSkills.map(skill => <span key={skill}>{skill}</span>)}</div></section>
    <section className="readiness-panel"><h2>Relevant workforce</h2>{!relevant.length && <p>No employees in the relevant roles are recorded.</p>}
      {relevant.map(employee => {
        const matches = employee.skills.filter(skill => initiative.qualifyingSkills.includes(skill.skill))
        const otherSkills = employee.skills.filter(skill => !initiative.qualifyingSkills.includes(skill.skill))
        return <article className="objective-employee" key={employee.id}>
          <header><div><Link to={`/employees/${employee.id}`}>{employee.name}</Link><p>{employee.role}</p></div><span className={`readiness-data objective-status ${matches.length ? 'qualified' : 'gap'}`}>{matches.length ? 'QUALIFIED' : 'GAP'}</span></header>
          {matches.length ? <div><div className="objective-skill-label">Qualifies through</div><div className="objective-skill-tags matched">{matches.map(skill => <span key={skill.skillId || skill.skill}><strong>✓ {skill.skill}</strong><span className="readiness-data">{proficiencyLabel(skill.proficiency)}</span></span>)}</div></div> : <p className="objective-no-match">No qualifying skill recorded for this goal. Review the employee’s experience before assigning training.</p>}
          {!!otherSkills.length && <details className="objective-other-skills"><summary>Other recorded skills ({otherSkills.length})</summary><div className="objective-skill-tags">{otherSkills.map(skill => <span key={skill.skillId || skill.skill}>{skill.skill}<span className="readiness-data">{proficiencyLabel(skill.proficiency)}</span></span>)}</div></details>}
        </article>
      })}
    </section>
  </div>
}
