import { FINANCIAL_ASSUMPTIONS } from '../config/financialAssumptions.js'
// The app normalizes Beginner/Intermediate/Expert to 1/3/5. Numeric 2 is Developing.
export const isIntermediate = proficiency => typeof proficiency === 'number' ? proficiency >= 3 : ['Intermediate', 'Advanced', 'Expert'].includes(proficiency)
export const proficiencyLabel = value => ({ 1: 'Beginner', 2: 'Developing', 3: 'Intermediate', 4: 'Advanced', 5: 'Expert' }[value] || value || 'Not recorded')
export function analyzeGoalReadiness(goalText, requiredCapabilities, relevantRoles, employees) {
  const pool = employees.filter(employee => relevantRoles.includes(employee.role))
  const fullyQualified = [], trainable = [], gapped = []
  pool.forEach(employee => {
    const matches = (employee.skills || []).filter(skill => requiredCapabilities.includes(skill.skill))
    const strong = new Set(matches.filter(skill => isIntermediate(skill.proficiency)).map(skill => skill.skill))
    if (strong.size >= 2) fullyQualified.push(employee)
    else if (matches.length) trainable.push(employee)
    else gapped.push(employee)
  })
  const concentration = [...new Set(requiredCapabilities)].map(capability => {
    const holders = employees.filter(employee => (employee.skills || []).some(skill => skill.skill === capability && isIntermediate(skill.proficiency)))
    return { capability, holders, flag: holders.length <= 2 ? 'critical' : holders.length <= 4 ? 'watch' : 'ok' }
  })
  return { goalText, pool, fullyQualified, trainable, gapped, concentration }
}
export function calculateFinancials(trainableCount, gappedCount, assumptions = FINANCIAL_ASSUMPTIONS) {
  const optionA = gappedCount * assumptions.avgSpecialistSalary * (1 + assumptions.recruitingOverheadPct)
  const recruitCount = Math.min(assumptions.safetyMarginRecruits, gappedCount)
  const upskillGappedCount = gappedCount - recruitCount
  const blended = trainableCount * assumptions.trainableCoursePerPerson + upskillGappedCount * assumptions.gappedCoursePerPerson + recruitCount * assumptions.avgSpecialistSalary * (1 + assumptions.recruitingOverheadPct)
  const annualSavings = assumptions.assumedAnnualDowntimeHours * assumptions.targetReductionPct * assumptions.downtimeCostPerHour
  return { optionA: Math.round(optionA), recommended: { total: Math.round(blended), savingsVsOptionA: Math.round(optionA - blended), upskillCount: trainableCount + upskillGappedCount, upskillGappedCount, recruitCount }, projectedValue: { annualSavings: Math.round(annualSavings), roiMultiple: blended > 0 ? Math.round(annualSavings / blended * 10) / 10 : 0 } }
}
