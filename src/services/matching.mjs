/** @typedef {{requiredSkills: string[], relevantRoles: string[]}} MatchResult */
export function parseMatchResult(text, workforceData) {
  const data = JSON.parse(text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''))
  const strings = values => Array.isArray(values) && values.every(value => typeof value === 'string' && value.trim())
  if (!strings(data?.requiredSkills) || !data.requiredSkills.length || !strings(data.relevantRoles)) throw new Error('The AI returned incomplete capabilities or roles. Please try again.')
  const knownRoles = new Set([...workforceData.employees.map(employee => employee.role), ...(workforceData.roles || []).map(role => role.title || role.role || role.name)])
  if (!data.relevantRoles.every(role => knownRoles.has(role.trim()))) throw new Error('The AI returned roles not found in the workforce. Please try again.')
  const requiredSkills = [...new Set(data.requiredSkills.map(name => {
    const existing = workforceData.skills.find(skill => skill.name.toLowerCase() === name.trim().toLowerCase())
    return existing?.name || name.trim()
  }))]
  return { requiredSkills, relevantRoles: [...new Set(data.relevantRoles.map(role => role.trim()))] }
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
