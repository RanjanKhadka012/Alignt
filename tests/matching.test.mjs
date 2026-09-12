import test from 'node:test'
import assert from 'node:assert/strict'
import { parseMatchResult, matchTeamToGoal } from '../src/services/matching.mjs'
import { matchingHandler } from '../server/matching.mjs'
import { Readable } from 'node:stream'
const workforce = { employees: [{ id: 'e1', role: 'Operator', skills: [{ skillId: 'plc', proficiency: 5 }] }], skills: [{ id: 'plc', name: 'PLC Programming' }] }
const aiResult = { requiredSkills: ['PLC Programming', 'Carbon accounting'], relevantRoles: ['Operator'] }
const result = aiResult
test('validates AI capabilities and exact relevant roles', () => {
  assert.deepEqual(parseMatchResult('```json\n' + JSON.stringify(aiResult) + '\n```', workforce), result)
  assert.throws(() => parseMatchResult(JSON.stringify({ ...aiResult, relevantRoles: ['Invented role'] }), workforce))
  assert.throws(() => parseMatchResult(JSON.stringify({ requiredSkills: [] }), workforce))
  assert.deepEqual(parseMatchResult(JSON.stringify({ ...aiResult, relevantRoles: [] }), workforce).relevantRoles, [])
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
  const env = { OPENAI_API_KEY: 'test-secret', OPENAI_MODEL: 'test-model' }
  try {
    globalThis.fetch = async (url, options) => {
      assert.equal(url, 'https://api.openai.com/v1/responses')
      assert.equal(options.headers.Authorization, 'Bearer test-secret')
      assert.equal(JSON.parse(options.body).model, 'test-model')
      assert.equal(JSON.parse(options.body).store, false)
      assert.deepEqual(JSON.parse(options.body).input.map(m => m.role), ['system', 'user'])
      return { ok: true, json: async () => ({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(aiResult) }] }] }) }
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
