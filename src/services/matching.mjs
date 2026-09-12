/** @typedef {{description: string, duration: string, employeeId?: string|null, costMin: number, costMax: number, assumptions: string}} GapOption */
/** @typedef {{requiredSkills: string[], suggestedTeam: {employeeId: string, matchedSkill: string, stretched: boolean}[], gaps: string[], gapPlans: {skill: string, training: GapOption, internship: GapOption}[]}} MatchResult */
const normalize = value => value.trim().toLowerCase()
const isStretched = employee => employee.stretched === true || employee.overCommitted === true || (typeof employee.allocationPercent === 'number' && employee.allocationPercent >= 100)

/** AI determines requirements; coverage and team selection use workforce records only. @returns {MatchResult} */
export function parseMatchResult(text, workforceData) {
  const data = JSON.parse(text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''))
  const fail = () => { throw new Error('The AI returned incomplete skills or cost estimates. Please try again.') }
  if (!data || !Array.isArray(data.requiredSkills) || !data.requiredSkills.length || !data.requiredSkills.every(s => typeof s === 'string' && s.trim())) fail()
  const requiredSkills = data.requiredSkills.map(s => s.trim())
  if (new Set(requiredSkills.map(normalize)).size !== requiredSkills.length) fail()
  const suggestedTeam = [], gaps = [], gapPlans = []
  for (const skill of requiredSkills) {
    const catalogSkill = workforceData.skills.find(s => normalize(s.name) === normalize(skill))
    const candidates = workforceData.employees.map(employee => ({ employee, proficiency: employee.skills?.find(s => s.skillId === catalogSkill?.id)?.proficiency || 0 }))
      .filter(candidate => candidate.proficiency > 0)
      .sort((a, b) => Number(isStretched(a.employee)) - Number(isStretched(b.employee)) || b.proficiency - a.proficiency || String(a.employee.id).localeCompare(String(b.employee.id)))
    if (catalogSkill && candidates.length) {
      suggestedTeam.push({ employeeId: candidates[0].employee.id, matchedSkill: skill, stretched: isStretched(candidates[0].employee) })
      continue
    }
    gaps.push(skill)
    const plans = data.gapPlans?.filter(plan => typeof plan?.skill === 'string' && normalize(plan.skill) === normalize(skill))
    if (!Array.isArray(plans) || plans.length !== 1) fail()
    const plan = plans[0]
    for (const option of [plan.training, plan.internship]) {
      if (!option || !['description', 'duration', 'assumptions'].every(key => typeof option[key] === 'string' && option[key].trim()) || !Number.isFinite(option.costMin) || !Number.isFinite(option.costMax) || option.costMin < 0 || option.costMax < option.costMin) fail()
    }
    if (plan.training.employeeId != null && !workforceData.employees.some(e => e.id === plan.training.employeeId)) fail()
    gapPlans.push({ ...plan, skill })
  }
  return { requiredSkills, suggestedTeam, gaps, gapPlans }
}

/** @returns {Promise<MatchResult>} */
export async function matchTeamToGoal(goalText, timeline, workforceData) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 65000)
  try {
    const response = await fetch('/api/matching', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goalText, timeline, workforceData }), signal: controller.signal,
    })
    const payload = await response.json().catch(() => null)
    if (!response.ok) throw new Error(payload?.error || `Matching is unavailable (${response.status}). Please try again.`)
    if (typeof payload?.text !== 'string') throw new Error('Matching returned an unreadable response. Please try again.')
    return parseMatchResult(payload.text, workforceData)
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('Matching timed out. Please try again.')
    if (error instanceof TypeError) throw new Error('Could not connect to matching. Check your connection and try again.')
    throw error
  } finally { clearTimeout(timeout) }
}
