import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDerivedData } from '../contexts/DerivedDataContext'
import '../pages/Overview.css'
export default function InitiativeDetail() {
  const { initiativeId } = useParams()
  const { initiativeResults, namedEmployees } = useDerivedData()
  const initiative = initiativeResults.find(item => item.id === initiativeId)
  if (!initiative) return <div><Link to="/overview">← Overview</Link><h1>Objective not found</h1></div>
  const relevant = namedEmployees.filter(employee => initiative.relevantRoles.includes(employee.role))
  return <div className="readiness-page"><Link to="/overview">← Strategy readiness</Link><header className="readiness-heading"><h1>{initiative.label}</h1><p>Qualification means at least one recorded skill matches this objective.</p><span className="readiness-data">{initiative.qualified} / {initiative.relevantWorkforce} qualified · Target {initiative.targetDate}</span></header><section className="readiness-panel"><h2>Relevant workforce</h2>{!relevant.length && <p>No employees in the relevant roles are recorded.</p>}{relevant.map(employee => { const matches = employee.skills.filter(skill => initiative.qualifyingSkills.includes(skill.skill)); return <div className="readiness-documentation" key={employee.id}><div><Link to={`/employees/${employee.id}`}>{employee.name}</Link><p>{employee.role}</p><small>{matches.map(skill => skill.skill).join(' · ') || 'No qualifying skill recorded'}</small></div><span className="readiness-data">{matches.length ? 'QUALIFIED' : 'GAP'}</span></div> })}</section></div>
}
