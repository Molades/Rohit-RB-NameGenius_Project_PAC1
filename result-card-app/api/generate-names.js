// Vercel serverless function — the production home of /api/generate-names.
// Holds no secrets itself; it calls into src/services/names.js, which reads
// GEMINI_API_KEY / GROQ_API_KEY from process.env (set in the Vercel project's
// environment variables, never shipped to the browser). See names.client.js
// for the browser side of this, and vite.config.js for the local-dev
// equivalent of this same route.
import { generateNames } from '../src/services/names.js'
import { handleGenerateNames } from './_lib/handleGenerateNames.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('allow', 'POST')
    return res.status(405).json({ message: 'Method not allowed.' })
  }
  const { status, json } = await handleGenerateNames(req.body, generateNames)
  return res.status(status).json(json)
}
