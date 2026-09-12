import { createServer } from 'node:http'
import { loadEnv } from 'vite'
import { createApiHandler } from './app.mjs'

const env = { ...loadEnv(process.env.NODE_ENV || 'development', process.cwd(), ''), ...process.env }
const port = Number(env.PORT || env.MATCHING_PORT || 3001)
createServer(createApiHandler(env)).listen(port, env.HOST || '127.0.0.1', () => {
  console.log(`Alignt API listening on port ${port}`)
})
