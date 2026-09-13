import { Link, useSearchParams } from 'react-router-dom'
import { useDerivedData } from '../contexts/DerivedDataContext'
import { planDevelopment } from '../utils/readiness'
import React, { useMemo, useState } from 'react'
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
  const [params, setParams] = useSearchParams()
  const { initiativeResults, namedEmployees } = useDerivedData()
  const goalScope = initiativeResults.find(item => item.id === params.get('goal'))
  const candidateIds = goalScope ? planDevelopment(goalScope, namedEmployees).candidateIds : null
  const { reviews, getReview } = useRoleBenchmarks()
  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState('')
  const profiles = useMemo(() => employees.map(employee => ({ ...employee, skills: (employee.skills || []).map(skill => ({ ...skill, name: skills.find(s => s.id === skill.skillId)?.name || skill.skillId })) })), [employees, skills])
  const visibleProfiles = candidateIds ? profiles.filter(employee => candidateIds.includes(employee.id)) : profiles
  const selected = visibleProfiles.find(employee => employee.id === selectedId) || visibleProfiles[0]
  const reviewFor = employee => {
    const review = reviews[profileKey(employee, strategy)]
    return review?.status === 'ready' && !isFresh(review.benchmark) ? undefined : review
  }
  const review = selected && reviewFor(selected)
  const runReview = () => { if (selected) getReview(selected, strategy).catch(() => {}) }
  const busy = review?.status === 'benchmarking' || review?.status === 'comparing'

  const ready = review?.status === 'ready'
  const benchmark = review?.benchmark
  return <div className="recommendations-page">
    <header className="recommendations-page-header"><span className="recommendations-data recommendations-accent">ROLE READINESS</span><h1>Skills & recommendations</h1><p className="recommendations-muted">Current role expectations. Individual gaps. A concrete path forward.</p></header>
    {goalScope && <section className="recommendations-panel" style={{marginBottom:20}}><h2>Development review · {goalScope.label}</h2><p className="recommendations-muted">{visibleProfiles.length} employees in relevant roles have no qualifying skill recorded for this goal. Validate their profiles, then generate individual development plans when needed. These are review candidates, not confirmed training assignments.</p><button onClick={() => setParams({})}>Show all employees</button> <Link to={`/matching?goal=${encodeURIComponent(goalScope.id)}`}>Next: analyze readiness and scenarios →</Link></section>}
    <div className="recommendations-layout">
      <EmployeeGapList employees={visibleProfiles} selectedId={selected?.id} onSelect={setSelectedId} search={search} onSearch={setSearch} reviewFor={reviewFor} />
      <section className="recommendations-detail recommendations-panel" aria-label="Employee recommendations">
        {!selected ? <p className="recommendations-muted">No employees in this view need a recorded-skill gap review. Use Show all employees to review proficiency and development opportunities.</p> : <>
          <header><h2>{selected.name}</h2><p className="recommendations-muted">{selected.role} · {departments.find(department => department.id === selected.departmentId)?.name || selected.departmentId}</p>
            {benchmark && isFresh(benchmark) ? <div className="benchmark-live"><i aria-hidden="true"/><span>Benchmarked against current role standards · <span className="recommendations-data">Last checked: {new Date(benchmark.fetchedAt).toLocaleString()}</span></span></div> : <div className="recommendations-muted recommendations-data">{review?.status === 'error' ? 'Live benchmark unavailable' : busy ? 'Checking current role standards…' : null}</div>}
          </header>
          <section className="employee-current-skills"><h3>Current skills & certifications</h3><div className="employee-skill-pills">{selected.skills.map(skill => <span key={skill.skillId}>{skill.name}<span className="recommendations-data">{proficiency(skill.proficiency)} · {skill.proficiency}/5</span></span>)}{(selected.certifications || []).map((certification, index) => <span key={`cert-${index}`}>{typeof certification === 'string' ? certification : certification.name}<span className="recommendations-data">Certification recorded</span></span>)}</div>{!selected.skills.length && !selected.certifications?.length && <p className="recommendations-muted">No skills or certifications recorded.</p>}</section>
          <section aria-busy={busy}><h3>Gaps & recommendations</h3>
            {!review ? <div className="recommendation-on-demand"><h3>Review this employee when you’re ready</h3><p className="recommendations-muted">Browse profiles freely. Generate recommendations only for the person you want to develop. We reuse the role benchmark for seven days and reuse completed reviews while the profile and strategy stay unchanged.</p><button onClick={runReview}>Generate recommendations</button></div> : review?.status === 'error' ? <div className="recommendation-error" role="alert"><strong>Review unavailable</strong><p>{review.error}</p><button onClick={runReview}>Try again</button></div> : !ready ? <div role="status"><p className="recommendations-muted">{review?.status === 'comparing' ? 'Comparing recorded skills with the role benchmark…' : 'Searching current role standards and certifications…'}</p><div className="recommendation-skeleton" aria-hidden="true"/><div className="recommendation-skeleton" aria-hidden="true"/></div> : <>
              {!review.gaps.length ? <div className="recommendation-current"><strong>Fully current for this role — no gaps identified</strong><p>Recorded skills meet the expectations identified in this role review.</p></div> : <EmployeeTrainingPlan key={profileKey(selected, strategy) + benchmark.fetchedAt} employeeName={selected.name} gaps={review.gaps} />}
              {!!review.gaps.length && <p className="recommendations-muted recommendations-note">Time and USD course, certification, and exam fees are planning estimates, not live quotes. Confirm prerequisites and pricing with the provider.</p>}
            </>}
          </section>
          {benchmark && <details className="benchmark-evidence"><summary>Role benchmark & live sources</summary><p className="recommendations-muted recommendations-note">Role standards are refreshed on request when more than seven days old. Source evidence is shared across employees in the same role.</p><ul>{benchmark.skills.map(skill => <li key={skill.name}><strong>{skill.name}</strong><p>{skill.reason}</p><div>{skill.sourceUrls.map(url => <a key={url} href={url} target="_blank" rel="noreferrer">{benchmark.sources.find(source => source.url === url)?.title || 'Source'}</a>)}</div></li>)}</ul></details>}
        </>}
      </section>
    </div>
  </div>
}
