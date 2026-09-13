import React from 'react'
import { Link } from 'react-router-dom'
import { useDerivedData } from '../contexts/DerivedDataContext'
import { planDevelopment } from '../utils/readiness'
export default function ConsequenceCallout({ initiative }) {
  const { namedEmployees } = useDerivedData()
  if (!initiative) return <section className="readiness-panel"><h2>Objectives are above the readiness threshold</h2><p>Keep developing coverage to protect execution as your workforce changes.</p></section>
  const plan = planDevelopment(initiative, namedEmployees)
  const query = `?goal=${encodeURIComponent(initiative.id)}`
  return <section className={`readiness-callout ${initiative.riskLevel}`}><h2>⚠ {initiative.label} Risk — {initiative.riskLevel === 'critical' ? 'HIGH' : 'MEDIUM'}</h2>
    <p>Target: <span className="readiness-data">{initiative.targetDate || 'Not set'}</span>. Of <span className="readiness-data">{initiative.relevantWorkforce}</span> employees in relevant roles, <span className="readiness-data">{initiative.qualified}</span> have at least one qualifying skill recorded. <span className="readiness-data">{initiative.gap}</span> need a capability review—not necessarily a new hire.</p>
    <h3>Develop existing people first</h3>
    <p>{plan.candidateIds.length ? `Review ${plan.candidateIds.length} existing employees for targeted development. ${plan.undocumentedCount ? `${plan.undocumentedCount} have no skills recorded; validate their experience before assigning training.` : 'Check their adjacent skills and prerequisites before choosing training paths.'}` : 'Review proficiency and backup coverage for the existing workforce.'} Compare learning time with the target date and confirm employees have time available to train.</p>
    {plan.missingExpertise.length ? <p><strong>External expertise may be needed for:</strong> {plan.missingExpertise.join(', ')}. No Intermediate+ holders are recorded company-wide. Assess external training or temporary specialist support first; consider recruiting only if internal development cannot meet the required capability and deadline. A hiring count cannot be determined from skill records alone.</p> : <p>Every required capability has at least one Intermediate+ holder somewhere in the company. Explore internal deployment, mentoring, and cross-training before recruiting; confirm those holders’ availability.</p>}
    {!!plan.concentrated.length && <p><strong>Protect knowledge continuity:</strong> {plan.concentrated.join(', ')} have only one or two Intermediate+ holders. Add backup coverage and document procedures.</p>}
    <div className="readiness-actions"><Link to={`/recommendations${query}`}>1. Review {plan.candidateIds.length || 'employee'} development needs ↗</Link><Link to={`/matching${query}`}>2. Analyze goal readiness & compare scenarios ↗</Link></div>
    <small>Then use training time, cost, and capacity to decide whether any external support remains necessary. No automatic recruitment quota.</small>
  </section>
}
