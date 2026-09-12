import React from 'react'
import { Link } from 'react-router-dom'
export default function InitiativeRow({ initiative }) {
  return <Link className={`readiness-objective ${initiative.riskLevel}`} to={`/initiatives/${initiative.id}`}>
    <div><h3>{initiative.label}</h3><span className="readiness-data">TARGET · {initiative.targetDate}</span></div>
    <div><div className="readiness-bar"><span style={{ width: `${initiative.readinessPct}%` }} /></div><p className="readiness-data">{initiative.qualified}/{initiative.relevantWorkforce} qualified · gap of {initiative.gap}{!initiative.relevantWorkforce && ' · No matching roles recorded'}</p></div>
    <strong className="readiness-percent">{initiative.readinessPct}% <span>↗</span></strong>
  </Link>
}
