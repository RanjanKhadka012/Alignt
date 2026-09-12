import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateTrainingPlan } from '../src/services/trainingPlan.mjs'
const gaps = [
  { skill: 'A', trainingEstimate: { feesUsd: { min: 100, max: 200 }, trainingHours: { min: 10, max: 20 }, durationWeeks: { min: 1, max: 2 } } },
  { skill: 'B', trainingEstimate: { feesUsd: { min: 300, max: 500 }, trainingHours: { min: 5, max: 10 }, durationWeeks: { min: 2, max: 4 } } },
]
test('totals selected fees, paid learning hours and sequential durations', () => {
  const total = calculateTrainingPlan(gaps, ['A', 'B'], 40)
  assert.deepEqual(total.companyCostUsd, { min: 1000, max: 1900 })
  assert.deepEqual(total.trainingHours, { min: 15, max: 30 })
  assert.deepEqual(total.durationWeeks, { min: 3, max: 6 })
  assert.deepEqual(calculateTrainingPlan(gaps, ['B']).companyCostUsd, { min: 300, max: 500 })
  assert.equal(calculateTrainingPlan(gaps, []).companyCostUsd.max, 0)
})
test('does not count duplicate or obsolete selections or accept invalid estimates', () => {
  assert.equal(calculateTrainingPlan(gaps, ['A', 'A', 'unknown']).count, 1)
  assert.throws(() => calculateTrainingPlan([{ skill: 'A' }], ['A']))
  assert.throws(() => calculateTrainingPlan(gaps, ['A'], -10))
})
