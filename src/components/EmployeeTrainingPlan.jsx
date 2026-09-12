import React, { useState } from 'react'
import GapRecommendationCard from './GapRecommendationCard'
import { calculateTrainingPlan } from '../services/trainingPlan.mjs'

const usd = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
const range = (value, format = number => Number(number.toFixed(1)).toLocaleString()) => value.min === value.max ? format(value.min) : `${format(value.min)} – ${format(value.max)}`

export default function EmployeeTrainingPlan({ employeeName, gaps }) {
  const [selectedSkills, setSelectedSkills] = useState([])
  const [hourlyCost, setHourlyCost] = useState('')
  const invalidRate = hourlyCost !== '' && (!Number.isFinite(Number(hourlyCost)) || Number(hourlyCost) < 0)
  let totals, error
  try { if (!invalidRate) totals = calculateTrainingPlan(gaps, selectedSkills, hourlyCost === '' ? 0 : Number(hourlyCost)) } catch (err) { error = err.message }
  const allSelected = selectedSkills.length === gaps.length
  return <>
    <div className="training-selection-bar"><label><input type="checkbox" checked={allSelected} ref={element => { if (element) element.indeterminate = selectedSkills.length > 0 && !allSelected }} onChange={event => setSelectedSkills(event.target.checked ? gaps.map(gap => gap.skill) : [])} />Select all skills</label><span className="recommendations-data">{selectedSkills.length} / {gaps.length} selected</span></div>
    {gaps.map(gap => <GapRecommendationCard key={gap.skill} gap={gap} selected={selectedSkills.includes(gap.skill)} onSelect={checked => setSelectedSkills(previous => checked ? [...previous, gap.skill] : previous.filter(skill => skill !== gap.skill))} />)}
    <section className="training-plan-total" aria-label="Selected training plan">
      <h3>Training plan · {employeeName}</h3>
      <label className="training-hourly-cost">Company cost per employee hour (USD)<input type="number" min="0" step="0.01" value={hourlyCost} onChange={event => setHourlyCost(event.target.value)} placeholder="Enter hourly cost" aria-invalid={invalidRate} /></label>
      <p className="recommendations-muted recommendations-note">Use wages plus employer overhead to include paid learning time. Leave blank to estimate fees only.</p>
      <div aria-live="polite" aria-atomic="true">
        {invalidRate ? <p role="alert">Enter a valid nonnegative hourly cost.</p> : error ? <p role="alert">{error}</p> : !totals.count ? <p className="recommendations-muted">Select skills above to calculate this employee’s training cost and time.</p> : <>
          <dl className="gap-cost-time">
            <div><dt>SELECTED SKILLS</dt><dd>{totals.count}</dd></div>
            <div><dt>COURSE / CERTIFICATION / EXAM FEES</dt><dd>{range(totals.feesUsd, usd)}</dd></div>
            {hourlyCost !== '' && <div><dt>PAID LEARNING TIME COST</dt><dd>{range(totals.paidTimeUsd, usd)}</dd></div>}
            <div><dt>{hourlyCost === '' ? 'TOTAL FEES · EXCLUDES PAID TIME' : 'TOTAL COMPANY TRAINING COST'}</dt><dd className="training-total-value">{range(totals.companyCostUsd, usd)}</dd></div>
            <div><dt>ACTIVE TRAINING TIME</dt><dd>{range(totals.trainingHours)} hours</dd></div>
            <div><dt>ELAPSED TIME · SEQUENTIAL COURSES</dt><dd>{range(totals.durationWeeks)} weeks</dd></div>
          </dl>
          <p className="recommendations-muted recommendations-note">Assumes one course after another. Overlapping courses or shared prerequisites can reduce elapsed time and fees. Totals exclude travel, backfill, and lost output. Estimates are for planning; confirm course schedules and fees.</p>
        </>}
      </div>
    </section>
  </>
}
