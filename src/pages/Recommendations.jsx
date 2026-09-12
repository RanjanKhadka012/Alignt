import React, { useEffect, useMemo, useState } from 'react'
import { useWorkforce } from '../contexts/WorkforceContext'
import { useStrategy } from '../contexts/StrategyContext'
import { profileKey, useRoleBenchmarks } from '../contexts/RoleBenchmarkContext'
import { isFresh } from '../services/recommendations.mjs'
import EmployeeGapList from '../components/EmployeeGapList'
import EmployeeTrainingPlan from '../components/EmployeeTrainingPlan'
import './Recommendations.css'

const proficiency = level => ({ 1: 'Beginner', 2: 'Developing', 3: 'Intermediate', 4: 'Advanced', 5: 'Expert' }[level] || 'Not rated')
export default function Recommendations() {
  const { employees, skills, departments } = useWorkforce()
  const { strategy } = useStrategy()
  const { reviews, getReview } = useRoleBenchmarks()
  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState('')
  const [retry, setRetry] = useState(0)
  const profiles = useMemo(() => employees.map(employee => ({ ...employee, skills: (employee.skills || []).map(skill => ({ ...skill, name: skills.find(s => s.id === skill.skillId)?.name || skill.skillId })) })), [employees, skills])
  const selected = profiles.find(employee => employee.id === selectedId) || profiles[0]
  const reviewFor = employee => {
    const review = reviews[profileKey(employee, strategy)]
    return review?.status === 'ready' && !isFresh(review.benchmark) ? undefined : review
  }
  const review = selected && reviewFor(selected)
  useEffect(() => {
    if (selected) getReview(selected, strategy).catch(() => {})
  }, [selected, strategy, getReview, retry])
  // Gradually populate real severity badges. Stop on service failures to avoid a request storm.
  useEffect(() => {
    let cancelled = false
    async function checkEmployees() {
      for (const employee of profiles) {
        if (cancelled) return
        try { await getReview(employee, strategy) } catch { return }
      }
    }
    checkEmployees()
    return () => { cancelled = true }
  }, [profiles, strategy, getReview, retry])

  const ready = review?.status === 'ready'
  const benchmark = review?.benchmark
  return <div className="recommendations-page">
    <header className="recommendations-page-header"><span className="recommendations-data recommendations-accent">ROLE READINESS</span><h1>Skills & recommendations</h1><p className="recommendations-muted">Current role expectations. Individual gaps. A concrete path forward.</p></header>
    <div className="recommendations-layout">
      <EmployeeGapList employees={profiles} selectedId={selected?.id} onSelect={setSelectedId} search={search} onSearch={setSearch} reviewFor={reviewFor} />
      <section className="recommendations-detail recommendations-panel" aria-label="Employee recommendations">
        {!selected ? <p className="recommendations-muted">No employees available to review.</p> : <>
          <header><h2>{selected.name}</h2><p className="recommendations-muted">{selected.role} · {departments.find(department => department.id === selected.departmentId)?.name || selected.departmentId}</p>
            {benchmark && isFresh(benchmark) ? <div className="benchmark-live"><i aria-hidden="true"/><span>Benchmarked against current role standards · <span className="recommendations-data">Last checked: {new Date(benchmark.fetchedAt).toLocaleString()}</span></span></div> : <div className="recommendations-muted recommendations-data">{review?.status === 'error' ? 'Live benchmark unavailable' : 'Checking current role standards…'}</div>}
          </header>
          <section className="employee-current-skills"><h3>Current skills & certifications</h3><div className="employee-skill-pills">{selected.skills.map(skill => <span key={skill.skillId}>{skill.name}<span className="recommendations-data">{proficiency(skill.proficiency)} · {skill.proficiency}/5</span></span>)}{(selected.certifications || []).map((certification, index) => <span key={`cert-${index}`}>{typeof certification === 'string' ? certification : certification.name}<span className="recommendations-data">Certification recorded</span></span>)}</div>{!selected.skills.length && !selected.certifications?.length && <p className="recommendations-muted">No skills or certifications recorded.</p>}</section>
          <section aria-busy={!ready && review?.status !== 'error'}><h3>Gaps & recommendations</h3>
            {review?.status === 'error' ? <div className="recommendation-error" role="alert"><strong>Review unavailable</strong><p>{review.error}</p><button onClick={() => setRetry(value => value + 1)}>Try again</button></div> : !ready ? <div role="status"><p className="recommendations-muted">{review?.status === 'comparing' ? 'Comparing recorded skills with the role benchmark…' : 'Searching current role standards and certifications…'}</p><div className="recommendation-skeleton" aria-hidden="true"/><div className="recommendation-skeleton" aria-hidden="true"/></div> : <>
              {!review.gaps.length ? <div className="recommendation-current"><strong>Fully current for this role — no gaps identified</strong><p>Recorded skills meet the expectations identified in this role review.</p></div> : <EmployeeTrainingPlan key={profileKey(selected, strategy) + benchmark.fetchedAt} employeeName={selected.name} gaps={review.gaps} />}
              {!!review.gaps.length && <p className="recommendations-muted recommendations-note">Time and USD course, certification, and exam fees are planning estimates, not live quotes. Confirm prerequisites and pricing with the provider.</p>}
            </>}
          </section>
          {benchmark && <details className="benchmark-evidence"><summary>Role benchmark & live sources</summary><p className="recommendations-muted recommendations-note">Role standards are refreshed every seven days. Source evidence is shared across employees in the same role.</p><ul>{benchmark.skills.map(skill => <li key={skill.name}><strong>{skill.name}</strong><p>{skill.reason}</p><div>{skill.sourceUrls.map(url => <a key={url} href={url} target="_blank" rel="noreferrer">{benchmark.sources.find(source => source.url === url)?.title || 'Source'}</a>)}</div></li>)}</ul></details>}
        </>}
      </section>
    </div>
  </div>
}
