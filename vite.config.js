import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { matchingHandler } from './server/matching.mjs'

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env }
  return {
    plugins: [react(), {
      name: 'alignt-matching-api',
      configureServer(server) { server.middlewares.use(matchingHandler(env)) },
      configurePreviewServer(server) { server.middlewares.use(matchingHandler(env)) },
    }],
  }
})
