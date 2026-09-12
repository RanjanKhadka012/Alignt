import React from 'react'
import { Link } from 'react-router-dom'
import { useDerivedData } from '../contexts/DerivedDataContext'
import { proficiencyLabel } from '../utils/goalRisk'
import './Overview.css'
export default function RiskMap() {
  const { skillsWithRisk } = useDerivedData()
  const risks = skillsWithRisk.filter(item => item.holderCount > 0 && item.holderCount <= 2).sort((a, b) => a.holderCount - b.holderCount || a.skill.name.localeCompare(b.skill.name))
  return <div className="readiness-page"><header className="readiness-heading"><h1>Critical talent dependencies</h1><p>Skills with two or fewer recorded holders company-wide. Beginner holders count as recorded coverage, but may still need development before they can replace an expert.</p></header>{risks.map(item => <section className="readiness-panel readiness-talent" key={item.skill.id}><h2>{item.skill.name}</h2><span className="readiness-data">{item.holderCount} HOLDERS COMPANY-WIDE</span><ul>{item.holders.map(holder => <li key={holder.id}><Link to={`/employees/${holder.id}`}>{holder.name}</Link><span className="readiness-data">{proficiencyLabel(holder.proficiency)}</span></li>)}</ul></section>)}{!risks.length && <p>No skills with one or two recorded holders.</p>}</div>
}
