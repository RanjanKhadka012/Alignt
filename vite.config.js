import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { createApiHandler } from './server/app.mjs'

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env }
  return {
    plugins: [react(), {
      name: 'alignt-matching-api',
      configureServer(server) { server.middlewares.use(createApiHandler(env)) },
      configurePreviewServer(server) { server.middlewares.use(createApiHandler(env)) },
    }],
  }
})
