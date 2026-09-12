import { workforce } from './workforceData.mjs'
import { matchingHandler } from './matching.mjs'
import { recommendationsHandler } from './recommendations.mjs'
import { readWorkforce } from './database.mjs'



export function createApiHandler(env = process.env) {
  const matching = matchingHandler(env)
  const recommendations = recommendationsHandler(env)
  return async (req, res, next) => {
    const path = req.url?.split('?')[0]
    if (!path?.startsWith('/api/')) return next ? next() : send(404, { error: 'Not found.' })
    function send(status, body) {
      res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' })
      res.end(JSON.stringify(body))
    }
    try {
      if (path === '/api/health' || path === '/api/workforce') {
        if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return send(405, { error: 'Use GET for this endpoint.' }) }
        const data = env.DATABASE_PATH ? readWorkforce(env.DATABASE_PATH) : workforce
        return send(200, path === '/api/health' ? { status: 'ok', dataSource: env.DATABASE_PATH ? 'sqlite' : workforce.dataSource, aiConfigured: Boolean(env.OLLAMA_API_KEY && env.OLLAMA_MODEL) } : data)
      }
      await recommendations(req, res, () => matching(req, res, () => send(404, { error: 'API endpoint not found.' })))
    } catch (error) {
      console.error('API request failed:', error.name)
      if (!res.headersSent) send(500, { error: 'The request could not be completed.' })
      else if (!res.writableEnded) res.end()
    }
  }
}
