import { generateNames as generateWithGemini } from './gemini.js'
import { generateNamesGroq, hasGroqKey } from './groq.js'

// The one entry point the app uses for name ideas: Gemini first, and if that
// fails, Groq (when a VITE_GROQ_API_KEY is configured). With no Groq key this
// is exactly the old Gemini-only behaviour.
//
// After Gemini fails it is skipped for a while, so the next Generate goes
// straight to Groq instead of waiting out another slow or doomed Gemini call.
const PAUSE_AFTER_QUOTA_MS = 30 * 60 * 1000
const PAUSE_AFTER_FAILURE_MS = 60 * 1000

let geminiPausedUntil = 0
let geminiPausedForQuota = false

export async function generateNames(brief, excludeNames = []) {
  if (!hasGroqKey()) return generateWithGemini(brief, excludeNames)

  let geminiError = null
  if (Date.now() >= geminiPausedUntil) {
    try {
      return await generateWithGemini(brief, excludeNames)
    } catch (err) {
      geminiError = err
      geminiPausedForQuota = err.code === 'QUOTA_EXCEEDED'
      geminiPausedUntil = Date.now() + (geminiPausedForQuota ? PAUSE_AFTER_QUOTA_MS : PAUSE_AFTER_FAILURE_MS)
      console.warn('[names] Gemini failed, trying Groq:', err.message)
    }
  }

  try {
    return await generateNamesGroq(brief, excludeNames)
  } catch (groqError) {
    console.warn('[names] Groq failed:', groqError.message)
    // Only tell the user "daily limit, try tomorrow" when every provider is out
    // of quota; any other mix of failures is a plain "try again".
    const geminiOut = geminiError ? geminiError.code === 'QUOTA_EXCEEDED' : geminiPausedForQuota
    const error = new Error('Could not generate names.')
    if (groqError.code === 'QUOTA_EXCEEDED' && geminiOut) error.code = 'QUOTA_EXCEEDED'
    throw error
  }
}
