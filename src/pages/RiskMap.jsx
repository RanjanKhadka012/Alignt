import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useWorkforce } from '../contexts/WorkforceContext'
import { proficiencyLabel } from '../utils/goalRisk'
import './Overview.css'
import './RiskMap.css'

export default function RiskMap() {
  const { employees, skills, departments } = useWorkforce()
  const [view, setView] = useState('map')
  const [query, setQuery] = useState('')
  const [department, setDepartment] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const people = employees.filter(employee => department === 'all' || employee.departmentId === department)
  const visibleSkills = skills.filter(skill => skill.name.toLowerCase().includes(query.toLowerCase())).sort((a,b) => a.name.localeCompare(b.name))
  const records = visibleSkills.map(skill => ({ skill, holders: people.filter(employee => employee.skills?.some(record => record.skillId === skill.id)) }))
  const selected = records.find(item => item.skill.id === selectedId)
  return <div className="readiness-page skills-page">
    <header className="readiness-heading"><h1>Skills & risk map</h1><p>Explore recorded skills, find their holders, and compare proficiency across employees. Missing records indicate unknown capability.</p></header>
    <div className="skills-views" aria-label="Skills view">{[['map','Circle map'],['grid','Employee skill grid'],['risk','Talent dependencies']].map(([id,label]) => <button key={id} aria-pressed={view === id} onClick={() => setView(id)}>{label}</button>)}</div>
    <div className="skills-filters"><label>Find a skill<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search skill names" /></label><label>Department<select value={department} onChange={event => setDepartment(event.target.value)}><option value="all">All departments</option>{departments.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div>
    <p role="status">{visibleSkills.length} skills ? {people.length} employees in scope</p>
    {view === 'map' && <section className="readiness-panel"><h2>Skill circles</h2><p>Select a circle to see its holders. Circle size shows the number of recorded holders. Amber: 0?2 holders; teal: 3 or more. These counts describe coverage, not proficiency or strategic risk.</p><div className="skills-circles">{records.map(item => <button key={item.skill.id} className="skill-node" aria-pressed={selectedId === item.skill.id} onClick={() => setSelectedId(item.skill.id)}><span className={'skill-orb ' + (item.holders.length <= 2 ? 'scarce' : '')} style={{width: 64 + Math.min(48, Math.sqrt(item.holders.length) * 8), height: 64 + Math.min(48, Math.sqrt(item.holders.length) * 8)}}>{item.holders.length}</span><strong>{item.skill.name}</strong><small>recorded holders</small></button>)}</div>{!records.length && <p>No skills match your search.</p>}</section>}
    {view === 'map' && selected && <section className="readiness-panel readiness-talent" aria-live="polite"><h2>{selected.skill.name}</h2><p>{selected.holders.length} recorded holders in scope</p><ul>{selected.holders.map(employee => <li key={employee.id}><Link to={'/employees/' + employee.id}>{employee.name}</Link><span>{proficiencyLabel(employee.skills.find(record => record.skillId === selected.skill.id)?.proficiency)}</span></li>)}</ul>{!selected.holders.length && <p>No holders recorded in this department scope.</p>}</section>}
    {view === 'grid' && <section className="readiness-panel"><h2>Employee skill grid</h2><p>1 Beginner ? 2 Developing ? 3 Intermediate ? 4 Advanced ? 5 Expert ? ? No skill record ? ? Proficiency not recorded</p>{people.length && visibleSkills.length ? <div className="skills-table-scroll" tabIndex={0} role="region" aria-label="Scrollable employee skill grid"><table className="skills-table"><caption>Recorded proficiency by employee and skill</caption><thead><tr><th scope="col">Employee</th>{visibleSkills.map(skill => <th scope="col" key={skill.id}>{skill.name}</th>)}</tr></thead><tbody>{people.map(employee => <tr key={employee.id}><th scope="row"><Link to={'/employees/' + employee.id}>{employee.name}</Link><small>{employee.role}</small></th>{visibleSkills.map(skill => { const record = employee.skills?.find(item => item.skillId === skill.id); const level = record?.proficiency; const known = Number.isInteger(level) && level >= 1 && level <= 5; return <td key={skill.id} className={known ? 'skill-level level-' + level : ''} title={employee.name + ' ? ' + skill.name + ': ' + (record ? proficiencyLabel(level) : 'No skill record')}>{record ? known ? level : '?' : '?'}</td> })}</tr>)}</tbody></table></div> : <p>No employees or skills match these filters.</p>}</section>}
    {view === 'risk' && <section className="readiness-panel readiness-talent"><h2>Talent dependencies</h2><p>Skills with one or two recorded holders in the selected scope. Beginner holders count as records and may need development before replacing an expert.</p>{records.filter(item => item.holders.length > 0 && item.holders.length <= 2).map(item => <div key={item.skill.id}><h3>{item.skill.name}</h3><ul>{item.holders.map(employee => <li key={employee.id}><Link to={'/employees/' + employee.id}>{employee.name}</Link><span>{proficiencyLabel(employee.skills.find(record => record.skillId === item.skill.id)?.proficiency)}</span></li>)}</ul></div>)}{!records.some(item => item.holders.length > 0 && item.holders.length <= 2) && <p>No skills with one or two recorded holders in this scope.</p>}</section>}
  </div>
}
