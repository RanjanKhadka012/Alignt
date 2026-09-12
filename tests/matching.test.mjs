import test from 'node:test'
import assert from 'node:assert/strict'
import { parseMatchResult, matchTeamToGoal } from '../src/services/matching.mjs'
import { matchingHandler } from '../server/matching.mjs'
import { Readable } from 'node:stream'
const workforce = { employees: [{ id: 'e1', skills: [{ skillId: 'plc', proficiency: 5 }] }], skills: [{ id: 'plc', name: 'PLC Programming' }] }
const option = { description: 'Course and supervised practice', duration: '3 months', costMin: 1000, costMax: 3000, assumptions: 'US planning estimate including paid learning time' }
const aiResult = { requiredSkills: ['PLC Programming', 'Carbon accounting'], gapPlans: [{ skill: 'Carbon accounting', training: { ...option, employeeId: 'e1' }, internship: { ...option, costMin: 8000, costMax: 12000 } }] }
const result = { requiredSkills: aiResult.requiredSkills, suggestedTeam: [{ employeeId: 'e1', matchedSkill: 'PLC Programming', stretched: false }], gaps: ['Carbon accounting'], gapPlans: aiResult.gapPlans }
test('parses fenced requirements, matches actual holders and preserves gap costs', () => {
  assert.deepEqual(parseMatchResult('```json\n' + JSON.stringify(aiResult) + '\n```', workforce), result)
})
test('rejects invalid estimates, invented training candidates and missing gap plans', () => {
  const variants = [
    { ...aiResult, gapPlans: [] },
    { ...aiResult, requiredSkills: ['PLC Programming', 'plc programming'] },
    ...[{ costMin: -1 }, { costMax: 100 }, { employeeId: 'unknown' }, { assumptions: '' }].map(change => ({ ...aiResult, gapPlans: [{ ...aiResult.gapPlans[0], training: { ...aiResult.gapPlans[0].training, ...change } }] })),
  ]
  for (const invalid of variants) assert.throws(() => parseMatchResult(JSON.stringify(invalid), workforce))
})
test('team selection uses proficiency and explicit commitment, never AI employee claims', () => {
  const data = { ...workforce, employees: [
    { id: 'busy', allocationPercent: 100, skills: [{ skillId: 'plc', proficiency: 5 }] },
    { id: 'junior', skills: [{ skillId: 'plc', proficiency: 2 }] },
    { id: 'available', skills: [{ skillId: 'plc', proficiency: 4 }] },
  ] }
  const response = { requiredSkills: ['PLC Programming'], suggestedTeam: [{ employeeId: 'invented' }], gapPlans: [] }
  assert.equal(parseMatchResult(JSON.stringify(response), data).suggestedTeam[0].employeeId, 'available')
  const busyOnly = { ...data, employees: [data.employees[0]] }
  assert.equal(parseMatchResult(JSON.stringify(response), busyOnly).suggestedTeam[0].stretched, true)
  assert.deepEqual(parseMatchResult(JSON.stringify(response), data).gaps, [])
})
test('client sends goal, timeline and workforce and surfaces API errors', async () => {
  const original = globalThis.fetch
  try {
    globalThis.fetch = async (url, options) => {
      assert.equal(url, '/api/matching')
      assert.deepEqual(JSON.parse(options.body), { goalText: 'Automate', timeline: '6 months', workforceData: workforce })
      return { ok: true, json: async () => ({ text: JSON.stringify(aiResult) }) }
    }
    assert.deepEqual(await matchTeamToGoal('Automate', '6 months', workforce), result)
    globalThis.fetch = async () => ({ ok: false, status: 503, json: async () => ({ error: 'AI matching is not configured.' }) })
    await assert.rejects(matchTeamToGoal('Automate', '6 months', workforce), /not configured/)
  } finally { globalThis.fetch = original }
})
async function invoke(env, data) {
  const req = Readable.from([JSON.stringify(data)])
  req.url = '/api/matching'; req.method = 'POST'
  let status, payload
  const res = { writeHead(code) { status = code; return this }, end(body) { payload = JSON.parse(body) } }
  await matchingHandler(env)(req, res)
  return { status, payload }
}
test('server keeps credentials upstream and reports configuration and provider failures', async () => {
  const data = { goalText: 'Automate', timeline: '6 months', workforceData: workforce }
  assert.equal((await invoke({}, data)).status, 503)
  const original = globalThis.fetch
  const env = { OLLAMA_API_KEY: 'test-secret', OLLAMA_MODEL: 'test-model' }
  try {
    globalThis.fetch = async (url, options) => {
      assert.equal(url, 'https://ollama.com/api/chat')
      assert.equal(options.headers.Authorization, 'Bearer test-secret')
      assert.equal(JSON.parse(options.body).model, 'test-model')
      assert.equal(JSON.parse(options.body).stream, false)
      assert.deepEqual(JSON.parse(options.body).messages.map(m => m.role), ['system', 'user'])
      return { ok: true, json: async () => ({ done: true, message: { content: JSON.stringify(aiResult) } }) }
    }
    const response = await invoke(env, data)
    assert.equal(response.status, 200)
    assert.ok(!JSON.stringify(response.payload).includes('test-secret'))
    globalThis.fetch = async () => ({ ok: false, status: 429 })
    assert.match((await invoke(env, data)).payload.error, /busy/)
    globalThis.fetch = async () => ({ ok: false, status: 401 })
    assert.match((await invoke(env, data)).payload.error, /authentication/)
    for (const payload of [{ message: { content: '' } }, { done: false }, { done_reason: 'length' }]) {
      globalThis.fetch = async () => ({ ok: true, json: async () => payload })
      assert.equal((await invoke(env, data)).status, 502)
    }
    assert.equal((await invoke(env, { ...data, goalText: '' })).status, 400)
  } finally { globalThis.fetch = original }
})
