import { buildPrompt, parseNames } from './namePrompt.js'

// Backup name generator, used only when Gemini fails (see names.js). Groq's
// endpoint speaks the OpenAI chat format.
//
// Groq retires models without much notice (llama-3.1-8b-instant, which the
// vanilla prototype still uses, is already gone). If the backup starts failing
// with "model does not exist" in the console, set VITE_GROQ_MODEL in .env to
// one from https://api.groq.com/openai/v1/models rather than editing code.
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions'
const DEFAULT_MODEL = 'openai/gpt-oss-20b'
const REQUEST_TIMEOUT_MS = 10000

const envKey = () => (import.meta.env?.VITE_GROQ_API_KEY || '').trim()

// True when a Groq key is configured. With no key, the backup is simply off.
export const hasGroqKey = () => envKey() !== ''

// `options` exists so the service can be exercised without a real key.
export async function generateNamesGroq(brief, excludeNames = [], options = {}) {
  const apiKey = options.apiKey ?? envKey()
  const model = options.model ?? (import.meta.env?.VITE_GROQ_MODEL || DEFAULT_MODEL)
  if (!apiKey) throw new Error('No Groq API key configured.')

  let res
  try {
    res = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        temperature: 0.9,
        messages: [
          { role: 'system', content: 'You are a brand-naming expert. Reply with exactly what is asked and nothing else.' },
          { role: 'user', content: buildPrompt(brief, excludeNames) },
        ],
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      throw new Error('Groq took too long to respond.')
    }
    throw new Error('Could not reach Groq.')
  }

  if (!res.ok) {
    let body = null
    try {
      body = await res.json()
    } catch {
      // non-JSON error body — fall through to the generic error below
    }
    // Groq answers 429 for both per-minute and per-day limits.
    if (res.status === 429) {
      const err = new Error('Groq rate limit reached')
      err.code = 'QUOTA_EXCEEDED'
      throw err
    }
    if (res.status === 401) throw new Error('Groq rejected the API key.')
    throw new Error(body?.error?.message || `Groq API error (${res.status})`)
  }

  const data = await res.json()
  return parseNames(data?.choices?.[0]?.message?.content || '')
}
