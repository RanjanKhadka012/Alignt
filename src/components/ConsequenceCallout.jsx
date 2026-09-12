import React from 'react'
import { Link } from 'react-router-dom'
export default function ConsequenceCallout({ initiative }) {
  if (!initiative) return <section className="readiness-panel"><h2>Objectives are above the readiness threshold</h2><p>Keep developing coverage to protect execution as your workforce changes.</p></section>
  const upskill = Math.round(initiative.gap * .6)
  return <section className={`readiness-callout ${initiative.riskLevel}`}><h2>⚠ {initiative.label} Risk — {initiative.riskLevel === 'critical' ? 'HIGH' : 'MEDIUM'}</h2>
    {initiative.relevantWorkforce ? <p>Your <span className="readiness-data">{initiative.targetDate}</span> objective requires approximately <span className="readiness-data">{initiative.relevantWorkforce}</span> employees with skills in {initiative.qualifyingSkills.join(', ')}. Current qualified workforce: <span className="readiness-data">{initiative.qualified}</span>. Gap: <span className="readiness-data">{initiative.gap}</span> employees.</p> : <p>No employees in the relevant roles are recorded for this objective. Verify workforce coverage before estimating a staffing or training gap.</p>}
    {!!initiative.gap && <><div className="readiness-actions"><Link to="/recommendations">Upskill {upskill} existing employees ↗</Link><Link to="/matching">Recruit {initiative.gap - upskill} specialists ↗</Link></div><small>Planning split only: approximately 60% training / 40% recruiting. Validate needs before staffing.</small></>}
  </section>
}
