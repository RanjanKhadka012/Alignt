// Reference percentages use ties-to-even: 62.5 -> 62 (not Math.round's 63).
export function roundReadiness(value) {
  const floor = Math.floor(value)
  return Math.abs(value - floor - 0.5) < 1e-10 ? (floor % 2 === 0 ? floor : floor + 1) : Math.round(value)
}
export function calculateReadiness(initiative, employees) {
  const relevant = employees.filter(employee => initiative.relevantRoles.includes(employee.role))
  const qualified = relevant.filter(employee => employee.skills.some(skill => initiative.qualifyingSkills.includes(skill.skill)))
  const readinessPct = relevant.length ? roundReadiness(100 * qualified.length / relevant.length) : 0
  return { ...initiative, relevantWorkforce: relevant.length, qualified: qualified.length, gap: relevant.length - qualified.length, readinessPct, riskLevel: readinessPct < 55 ? 'critical' : readinessPct < 75 ? 'watch' : 'healthy' }
}
export function calculateOverallReadiness(results) {
  const weight = results.reduce((sum, result) => sum + result.relevantWorkforce, 0)
  return weight ? Math.round(results.reduce((sum, result) => sum + result.readinessPct * result.relevantWorkforce, 0) / weight) : 0
}
export function talentConcentration(employees) {
  const skills = new Map()
  for (const employee of employees) {
    const seen = new Set()
    for (const skill of employee.skills) {
      if (!skill.skill || seen.has(skill.skill)) continue
      seen.add(skill.skill)
      if (!skills.has(skill.skill)) skills.set(skill.skill, [])
      skills.get(skill.skill).push({ ...employee, proficiency: skill.proficiency })
    }
  }
  return [...skills].map(([name, holders]) => ({ name, holders })).sort((a, b) => a.holders.length - b.holders.length || a.name.localeCompare(b.name))[0] || null
}

// A recorded skill gap is not a vacant position. Review development first;
// external support is considered only for capabilities without strong internal coverage.
export function planDevelopment(initiative, employees) {
  const relevant = employees.filter(employee => initiative.relevantRoles.includes(employee.role))
  const candidates = relevant.filter(employee => !(employee.skills || []).some(skill => initiative.qualifyingSkills.includes(skill.skill)))
  const strong = value => typeof value === 'number' ? value >= 3 : ['Intermediate', 'Advanced', 'Expert'].includes(value)
  const capabilities = initiative.qualifyingSkills.map(capability => {
    const holders = employees.filter(employee => (employee.skills || []).some(skill => skill.skill === capability && strong(skill.proficiency)))
    return { capability, holders }
  })
  return {
    candidateIds: candidates.map(employee => employee.id),
    undocumentedCount: candidates.filter(employee => !employee.skills?.length).length,
    missingExpertise: capabilities.filter(item => !item.holders.length).map(item => item.capability),
    concentrated: capabilities.filter(item => item.holders.length > 0 && item.holders.length <= 2).map(item => item.capability),
  }
}
