import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { recommendationsHandler } from './server/recommendations.mjs'
import { matchingHandler } from './server/matching.mjs'

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env }
  return {
    plugins: [react(), {
      name: 'alignt-matching-api',
      configureServer(server) { server.middlewares.use(recommendationsHandler(env)); server.middlewares.use(matchingHandler(env)) },
      configurePreviewServer(server) { server.middlewares.use(recommendationsHandler(env)); server.middlewares.use(matchingHandler(env)) },
    }],
  }
})
