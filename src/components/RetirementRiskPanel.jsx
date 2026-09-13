import React from 'react'
import { Link } from 'react-router-dom'
import { useWorkforce } from '../contexts/WorkforceContext'
import { retirementStatus } from '../utils/retirement.mjs'
import './Retirement.css'
export default function RetirementRiskPanel() {
  const { employees, skills } = useWorkforce()
  const flagged = employees.map(employee => ({ employee, status: retirementStatus(employee) })).filter(item => item.status.flagged).sort((a, b) => Number(b.status.soon) - Number(a.status.soon))
  const unknown = employees.filter(employee => employee.retirementEligible == null && !employee.retirementDate).length
  return <section className="retirement-panel"><h2>Retirement & succession watch</h2><p>{flagged.filter(item => item.status.soon).length} planned within 12 months or past due for verification · {unknown} employees with no retirement information recorded.</p>
    {!flagged.length ? <p>No retirement flags are recorded. This does not confirm that retirement risk is absent. Update confirmed information on employee profiles.</p> : <ul>{flagged.map(({ employee, status }) => {
      const vulnerable = (employee.skills || []).filter(skill => !employees.some(other => other.id !== employee.id && !retirementStatus(other).flagged && other.skills?.some(holding => holding.skillId === skill.skillId && (typeof holding.proficiency === 'number' ? holding.proficiency >= 3 : ['Intermediate', 'Expert'].includes(holding.proficiency)))))
      return <li key={employee.id}><Link to={`/employees/${employee.id}`}>{employee.name}</Link><span className={status.soon ? 'retirement-urgent' : ''}> · {status.label}</span><p>{vulnerable.length ? `No Intermediate+ backup without a retirement flag recorded for: ${vulnerable.map(skill => skill.skill || skills.find(item => item.id === skill.skillId)?.name || skill.skillId).join(', ')}.` : 'Intermediate+ backup holders without retirement flags are recorded for this employee’s skills; confirm availability.'}</p><Link to="/recommendations">Plan cross-training and knowledge transfer →</Link></li>
    })}</ul>}
  </section>
}
