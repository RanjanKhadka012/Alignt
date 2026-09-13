import test from 'node:test'
import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import { createRoleCache, BENCHMARK_TTL } from '../src/services/recommendations.mjs'
import { recommendationsHandler, validateBenchmark, validateComparison } from '../server/recommendations.mjs'
import { geminiResponse, geminiSearchSources } from '../server/gemini.mjs'
import { loadAiWorkforce } from '../server/aiWorkforceData.mjs'
const sources = [{ title: 'Standards body', url: 'https://example.org/standards', content: 'Current standards evidence' }]
const skills = Array.from({ length: 5 }, (_, i) => ({ name: `Skill ${i}`, reason: 'Required for the role', sourceUrls: [sources[0].url] }))
const benchmark = { skills, sources, fetchedAt: Date.now() }
const gap = { skill: 'Skill 0', reason: 'Supports the safety initiative', priority: 'critical', timeToAcquire: '2 months', estimatedCost: 'USD 500–1000 in exam fees', recommendedPath: 'Complete supervised training and exam', trainingEstimate: { feesUsd: { min: 500, max: 1000 }, trainingHours: { min: 16, max: 24 }, durationWeeks: { min: 2, max: 4 } } }

test('role cache deduplicates concurrent requests and refreshes after seven days', async () => {
  let now = 1000, calls = 0
  const cache = createRoleCache(async () => { calls++; return { ...benchmark, fetchedAt: now } }, () => {}, () => now)
  const [a, b] = await Promise.all([cache.get('Operator'), cache.get(' operator ')])
  assert.equal(a, b); assert.equal(calls, 1)
  now += BENCHMARK_TTL - 1
  await cache.get('Operator'); assert.equal(calls, 1)
  now++
  await cache.get('Operator'); assert.equal(calls, 2)
  await cache.get('Operator', 'pharmaceutical'); assert.equal(calls, 3)
})
test('failed role searches are not cached and can be retried', async () => {
  let calls = 0
  const cache = createRoleCache(async () => { if (++calls === 1) throw new Error('offline'); return benchmark })
  await assert.rejects(cache.get('Operator'), /offline/)
  assert.equal(await cache.get('Operator'), benchmark)
})
test('validation rejects invented sources, duplicate gaps and non-benchmark skills', () => {
  assert.equal(validateBenchmark({ skills }, sources).skills.length, 5)
  assert.throws(() => validateBenchmark({ skills: [{ ...skills[0], sourceUrls: ['https://invented.org'] }, ...skills.slice(1)] }, sources))
  assert.deepEqual(validateComparison({ gaps: [] }, benchmark), { gaps: [] })
  assert.throws(() => validateComparison({ gaps: [gap, gap] }, benchmark))
  assert.throws(() => validateComparison({ gaps: [{ ...gap, skill: 'Invented' }] }, benchmark))
})
async function invoke(path, body) {
  const req = Readable.from([JSON.stringify(body)])
  req.url = '/api/recommendations/' + path; req.method = 'POST'
  let status, payload
  const res = { writeHead(code) { status = code; return this }, end(body) { payload = JSON.parse(body) } }
  await recommendationsHandler({ OPENAI_API_KEY: 'secret-test', OPENAI_MODEL: 'test-model' })(req, res)
  return { status, payload }
}
test('benchmark must search before reasoning; comparison calls only reasoning', async () => {
  const original = globalThis.fetch
  const calls = []
  try {
    globalThis.fetch = async (url, options) => {
      calls.push(JSON.parse(options.body).tools ? 'search' : 'reason'); assert.equal(url, 'https://api.openai.com/v1/responses')
      assert.equal(options.headers.Authorization, 'Bearer secret-test')
      const body = JSON.parse(options.body)
      if (body.tools) { assert.equal(body.tool_choice, 'required'); return { ok: true, json: async () => ({ status: 'completed', output: [{ type: 'web_search_call', status: 'completed' }, { type: 'message', content: [{ type: 'output_text', text: sources[0].content, annotations: [{ type: 'url_citation', title: sources[0].title, url: sources[0].url }] }] }] }) } }
      const input = JSON.parse(body.input)
      if (input.sources) assert.deepEqual(input.sources, sources)
      return { ok: true, json: async () => ({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(input.sources ? { skills } : { gaps: [gap] }) }] }] }) }
    }
    const result = await invoke('benchmark', { roleTitle: 'Operator' })
    assert.equal(result.status, 200)
    assert.deepEqual(calls, ['search', 'reason'])
    calls.length = 0
    const aiEmployee = loadAiWorkforce().employees[0]
    assert.equal((await invoke('compare', { employee: { id: aiEmployee.id, name: aiEmployee.name, role: aiEmployee.role }, roleBenchmark: benchmark, companyStrategy: {} })).status, 200)
    assert.deepEqual(calls, ['reason'])
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: 'No results' }] }] }) })
    const empty = await invoke('benchmark', { roleTitle: 'Operator' })
    assert.equal(empty.status, 502)
    assert.match(empty.payload.error, /No benchmark was generated/)
  } finally { globalThis.fetch = original }
})

test('Gemini uses native generateContent requests and returns grounded sources', async () => {
  const original = globalThis.fetch
  try {
    globalThis.fetch = async (url, options) => {
      assert.match(url, /generativelanguage\.googleapis\.com\/v1beta\/models\/gemini-3\.6-flash:generateContent\?key=test-key/)
      const body = JSON.parse(options.body)
      if (body.tools) assert.deepEqual(body.tools, [{ google_search: {} }])
      else assert.equal(body.generationConfig.responseMimeType, 'application/json')
      assert.match(body.systemInstruction.parts[0].text, body.generationConfig.responseMimeType ? /^Use sources\.$/ : /Search for current role requirements/)
      return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: '{"skills":[]}' }] }, groundingMetadata: { groundingChunks: [{ web: { uri: 'https://example.org/standards', title: 'Standards body' } }] } }] }) }
    }
    const result = await geminiResponse({ GEMINI_API_KEY: 'test-key', GEMINI_MODEL: 'gemini-3.6-flash' }, { instructions: 'Use sources.', input: 'Operator', text: { format: { type: 'json_object' } }, tools: [{ type: 'web_search' }] })
    assert.equal(result.text, '{"skills":[]}')
    const sourcesResult = await geminiSearchSources({ GEMINI_API_KEY: 'test-key', GEMINI_MODEL: 'gemini-3.6-flash' }, 'Operator requirements')
    assert.deepEqual(sourcesResult, [{ title: 'Standards body', url: 'https://example.org/standards', content: '{"skills":[]}' }])
  } finally { globalThis.fetch = original }
})
