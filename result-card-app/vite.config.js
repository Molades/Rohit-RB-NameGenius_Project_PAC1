import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { handleGenerateNames } from './api/_lib/handleGenerateNames.js'

const envDir = fileURLToPath(new URL('..', import.meta.url))

// GEMINI_API_KEY / GROQ_API_KEY are read server-side only (see
// src/services/gemini.js and groq.js) via process.env, which Node does not
// populate from .env on its own — loadEnv with an empty prefix reads every
// var from the root .env (envDir, matching envDir below) without exposing any
// of them to the client bundle; only VITE_-prefixed vars are ever injected
// into import.meta.env for browser code. Exported as a plain object (not a
// function) below so testing/vite.mock.config.js can mergeConfig() it — Vite
// only calls that mode/command callback form for its own CLI, not for a
// config another file imports — so env is loaded eagerly here.
Object.assign(process.env, loadEnv('development', envDir, ''))

// Serves /api/generate-names for `npm run dev`, mirroring the Vercel function
// at api/generate-names.js (that one is what production actually runs — this
// is dev-only, so the app works the same locally without needing `vercel dev`).
//
// generateNames is loaded via server.ssrLoadModule rather than a plain import,
// so it goes through Vite's own module graph — which is what lets
// testing/vite.mock.config.js keep redirecting it to the mock Gemini module,
// exactly as it did when the browser imported gemini.js directly.
function apiDevServer() {
  return {
    name: 'api-generate-names',
    configureServer(server) {
      server.middlewares.use('/api/generate-names', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('allow', 'POST')
          res.end()
          return
        }
        let raw = ''
        req.on('data', (chunk) => (raw += chunk))
        req.on('end', async () => {
          try {
            let body
            try {
              body = raw ? JSON.parse(raw) : null
            } catch {
              res.statusCode = 400
              res.setHeader('content-type', 'application/json')
              res.end(JSON.stringify({ message: 'Invalid JSON body.' }))
              return
            }
            const { generateNames } = await server.ssrLoadModule('/src/services/names.js')
            const { status, json } = await handleGenerateNames(body, generateNames)
            res.statusCode = status
            res.setHeader('content-type', 'application/json')
            res.end(JSON.stringify(json))
          } catch (err) {
            res.statusCode = 500
            res.setHeader('content-type', 'application/json')
            res.end(JSON.stringify({ message: err.message || 'Name generation failed.' }))
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), apiDevServer()],
  server: { port: 5178 },
  envDir,
})
