export const BENCHMARK_TTL = 7 * 24 * 60 * 60 * 1000
export const roleKey = (role, industry = 'food manufacturing') => JSON.stringify([role.trim().toLowerCase(), industry.trim().toLowerCase()])
export const isFresh = (benchmark, now = Date.now()) => !!benchmark && Number.isFinite(benchmark.fetchedAt) && now >= benchmark.fetchedAt && now - benchmark.fetchedAt < BENCHMARK_TTL

// Shared by context callers: simultaneous employees in a role trigger one request.
export function createRoleCache(fetchBenchmark, onUpdate = () => {}, now = Date.now) {
  const entries = new Map(), pending = new Map()
  return {
    entries,
    get(role, industry = 'food manufacturing') {
      const key = roleKey(role, industry)
      if (isFresh(entries.get(key), now())) return Promise.resolve(entries.get(key))
      if (pending.has(key)) return pending.get(key)
      const promise = Promise.resolve().then(() => fetchBenchmark(role, industry)).then(value => {
        entries.set(key, value); onUpdate(key, value); return value
      }).finally(() => pending.delete(key))
      pending.set(key, promise)
      return promise
    },
  }
}

async function post(path, body) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 125000)
  try {
    const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: controller.signal })
    const data = await response.json().catch(() => null)
    if (!response.ok || !data) throw new Error(data?.error || 'Recommendations are unavailable. Please try again.')
    return data
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('The role review timed out. Please try again.')
    if (error instanceof TypeError) throw new Error('Could not connect to the recommendation service.')
    throw error
  } finally { clearTimeout(timer) }
}
export const benchmarkRole = (roleTitle, industry = 'food manufacturing') => post('/api/recommendations/benchmark', { roleTitle, industry })
// Comparison needs the standards, not the full web-search excerpts again.
export const compareToProfile = (employee, roleBenchmark, companyStrategy) => post('/api/recommendations/compare', {
  employee: { id: employee.id, name: employee.name, role: employee.role },
  roleBenchmark: { skills: roleBenchmark.skills.map(skill => ({ name: skill.name, reason: skill.reason })) },
  companyStrategy: { shortTermGoals: (companyStrategy.shortTermGoals || []).map(goal => ({ text: goal.text })), longTermGoals: (companyStrategy.longTermGoals || []).map(goal => ({ text: goal.text })), initiatives: (companyStrategy.initiatives || []).map(initiative => ({ text: initiative.text })) },
})
