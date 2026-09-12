export function validTrainingEstimate(estimate) {
  return !!estimate && ['feesUsd', 'trainingHours', 'durationWeeks'].every(key => {
    const range = estimate[key]
    return range && Number.isFinite(range.min) && Number.isFinite(range.max) && range.min >= 0 && range.max >= range.min
  })
}

export function calculateTrainingPlan(gaps, selectedSkills, hourlyCost = 0) {
  if (!Number.isFinite(hourlyCost) || hourlyCost < 0) throw new Error('Enter a valid nonnegative hourly cost.')
  const selected = gaps.filter(gap => selectedSkills.includes(gap.skill))
  const total = { count: selected.length, feesUsd: { min: 0, max: 0 }, trainingHours: { min: 0, max: 0 }, durationWeeks: { min: 0, max: 0 } }
  for (const gap of selected) {
    if (!validTrainingEstimate(gap.trainingEstimate)) throw new Error('Refresh the review to get numeric training estimates.')
    for (const key of ['feesUsd', 'trainingHours', 'durationWeeks']) {
      total[key].min += gap.trainingEstimate[key].min
      total[key].max += gap.trainingEstimate[key].max
    }
  }
  total.paidTimeUsd = { min: total.trainingHours.min * hourlyCost, max: total.trainingHours.max * hourlyCost }
  total.companyCostUsd = { min: total.feesUsd.min + total.paidTimeUsd.min, max: total.feesUsd.max + total.paidTimeUsd.max }
  return total
}
