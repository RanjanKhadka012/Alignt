import React from 'react'

export default function GapRecommendationCard({ gap, selected, onSelect }) {
  return <article className={`gap-recommendation-card ${gap.priority}`}>
    <div className="gap-card-heading"><h3>{onSelect ? <label className="training-skill-select"><input type="checkbox" checked={selected} onChange={event => onSelect(event.target.checked)} />{gap.skill}</label> : gap.skill}</h3><span className={`gap-badge recommendations-data ${gap.priority}`}>{gap.priority}</span></div>
    <p className="recommendations-muted">{gap.reason}</p>
    <dl className="gap-cost-time"><div><dt>TIME TO ACQUIRE</dt><dd>{gap.timeToAcquire}</dd></div><div><dt>ESTIMATED FEES</dt><dd>{gap.estimatedCost}</dd></div></dl>
    <div className="gap-path"><span className="recommendations-data">RECOMMENDED PATH</span><p>{gap.recommendedPath}</p></div>
  </article>
}
