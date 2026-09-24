const GEMINI_MODEL = 'gemini-flash-latest'
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

// Ask for more names than the UI shows: duplicates and unusable names get
// dropped, and we still want a full batch left over.
export const NAMES_REQUESTED = 14

function buildPrompt(brief, excludeNames) {
  const lines = [
    `Suggest ${NAMES_REQUESTED} short, ordinary business name ideas for a brand.`,
    brief.businessType ? `Type of business: ${brief.businessType}` : null,
    brief.name ? `Working name so far: ${brief.name}` : null,
    brief.description ? `Description: ${brief.description}` : null,
    brief.competitors ? `Competitors/keywords: ${brief.competitors}` : null,
    brief.mood ? `Nature and mood: ${brief.mood}` : null,
    brief.answers?.length
      ? `Brand discovery answers:\n${brief.answers.map(([q, a]) => `- ${q} ${a}`).join('\n')}`
      : null,
    excludeNames.length ? `Do not repeat any of these: ${excludeNames.join(', ')}` : null,
    `Respond with ONLY a JSON array of ${NAMES_REQUESTED} short strings, no other text.`,
  ].filter(Boolean)
  return lines.join('\n')
}

const REQUEST_TIMEOUT_MS = 12000

export async function generateNames(brief, excludeNames = []) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  let res
  try {
    res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(brief, excludeNames) }] }],
        // Disable extended thinking — we only need a short JSON array back,
        // and thinking adds latency plus multi-part responses we'd have to
        // pick apart for no benefit here.
        generationConfig: { thinkingConfig: { thinkingBudget: 0 } },
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      throw new Error('Gemini took too long to respond. Try again.')
    }
    throw new Error('Could not reach Gemini. Check your connection and try again.')
  }

  if (!res.ok) {
    let body = null
    try {
      body = await res.json()
    } catch {
      // non-JSON error body — fall through to the generic error below
    }
    if (res.status === 429 && body?.error?.status === 'RESOURCE_EXHAUSTED') {
      const err = new Error('Gemini daily quota exhausted')
      err.code = 'QUOTA_EXCEEDED'
      throw err
    }
    throw new Error(body?.error?.message || `Gemini API error (${res.status})`)
  }

  const data = await res.json()
  if (data?.promptFeedback?.blockReason) {
    throw new Error("Couldn't parse name ideas from Gemini's response.")
  }
  // Newer models may return multiple parts (reasoning/"thought" parts plus the
  // final answer) — join every non-thought part rather than assuming parts[0]
  // holds the whole answer.
  const parts = data?.candidates?.[0]?.content?.parts || []
  const text = parts
    .filter((p) => !p.thought)
    .map((p) => p.text || '')
    .join('')
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) throw new Error("Couldn't parse name ideas from Gemini's response.")

  let names
  try {
    names = JSON.parse(match[0])
  } catch {
    throw new Error("Couldn't parse name ideas from Gemini's response.")
  }
  if (!Array.isArray(names) || names.length === 0) {
    throw new Error('Gemini returned no name ideas.')
  }

  return names.slice(0, NAMES_REQUESTED).map((n) => String(n).trim()).filter(Boolean)
}
