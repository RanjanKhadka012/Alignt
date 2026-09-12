import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { createApiHandler } from '../server/app.mjs'
import vercelHandler from '../api/index.mjs'

test('HTTP API serves workforce, health, method errors and JSON 404s', async t => {
  const server = createServer(createApiHandler({}))
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  t.after(() => new Promise(resolve => server.close(resolve)))
  const base = `http://127.0.0.1:${server.address().port}`
  const health = await fetch(base + '/api/health')
  assert.deepEqual(await health.json(), { status: 'ok', dataSource: 'real-seed', aiConfigured: false })
  const workforce = await (await fetch(base + '/api/workforce')).json()
  for (const key of ['employees', 'skills', 'roles', 'departments']) assert.ok(Array.isArray(workforce[key]))
  assert.equal(workforce.employees.length, 150)
  assert.equal(workforce.dataSource, 'real-seed')
  assert.equal(workforce.readinessDataComplete, false)
  const invalid = await fetch(base + '/api/workforce', { method: 'POST' })
  assert.equal(invalid.status, 405)
  assert.equal(invalid.headers.get('allow'), 'GET')
  const missing = await fetch(base + '/api/missing')
  assert.equal(missing.status, 404)
  assert.match((await missing.json()).error, /not found/)
  for (const path of ['matching', 'recommendations/benchmark', 'recommendations/compare']) {
    assert.equal((await fetch(base + '/api/' + path, { method: 'POST', body: '{}' })).status, 503)
  }
})

test('Vercel adapter resolves rewritten URLs and handles parsed request bodies', async () => {
  let status, body
  const res = { writeHead(code) { status = code; return this }, end(value) { body = JSON.parse(value) } }
  const req = { url: '/api?route=health', method: 'GET' }
  await vercelHandler(req, res)
  assert.equal(status, 200)
  assert.equal(body.status, 'ok')
  const parsed = { url: '/api?route=missing', method: 'POST', body: { example: true } }
  await vercelHandler(parsed, res)
  assert.equal(status, 404)
  const chunks = []
  for await (const chunk of parsed) chunks.push(chunk)
  assert.deepEqual(JSON.parse(chunks.join('')), { example: true })
})
