import React from 'react'
import { Link } from 'react-router-dom'
import { useWorkforce } from '../contexts/WorkforceContext'
import { retirementStatus } from '../utils/retirement.mjs'
import { proficiencyLabel } from '../utils/goalRisk'
import './Overview.css'
export default function Employees() {
  const { employees, skills, departments } = useWorkforce()
  return <div className="readiness-page"><header className="readiness-heading"><h1>Employees & skills</h1><p>Review recorded skills and retirement flags to plan development and knowledge transfer.</p></header>
    <section className="readiness-panel">{employees.map(employee => { const status = retirementStatus(employee); return <article className="objective-employee" key={employee.id}>
      <header><div><Link to={`/employees/${employee.id}`}>{employee.name}</Link><p>{employee.role} · {departments.find(department => department.id === employee.departmentId)?.name || employee.team || 'Department not recorded'}</p></div>{status.flagged && <span className="readiness-data objective-status gap">{status.label}{employee.retirementDate && ` · ${employee.retirementDate}`}</span>}</header>
      <div className="objective-skill-tags">{employee.skills.map(skill => <span key={skill.skillId || skill.skill}>{skill.skill || skills.find(item => item.id === skill.skillId)?.name}<span className="readiness-data">{proficiencyLabel(skill.proficiency)}</span></span>)}</div>{!employee.skills.length && <p>No skills recorded.</p>}
      {status.flagged && <p style={{color:'var(--warning)',fontSize:12}}>Review these skills for a backup holder and a knowledge-transfer plan.</p>}
    </article> })}</section>
  </div>
}
