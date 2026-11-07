import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const backendDir = fileURLToPath(new URL('../backend/', import.meta.url))
const frontendDir = fileURLToPath(new URL('./', import.meta.url))

export default defineConfig(({ mode }) => {
  const { PORT } = loadEnv(mode, backendDir, 'PORT')
  const { IRONCLAD_API_TARGET } = loadEnv(mode, frontendDir, 'IRONCLAD_API_TARGET')
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': IRONCLAD_API_TARGET || `http://localhost:${PORT || 3000}`,
      },
    },
  }
})
