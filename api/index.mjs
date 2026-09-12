import { createApiHandler } from '../server/app.mjs'

const handler = createApiHandler()
export default function api(req, res) {
  const url = new URL(req.url, 'http://localhost')
  const route = url.searchParams.get('route')
  if (url.pathname === '/api' && route) req.url = `/api/${route}`
  // Vercel may parse JSON before invoking a Node function; restore the stream
  // contract used by the same handlers in development and standalone Node.
  if (req.body !== undefined) {
    const body = typeof req.body === 'string' || Buffer.isBuffer(req.body) ? req.body : JSON.stringify(req.body)
    req[Symbol.asyncIterator] = async function* () { yield body }
  }
  return handler(req, res)
}
