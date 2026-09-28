// The browser-safe entry point for name ideas — this is what App.jsx imports.
// The real work (the Gemini/Groq calls, which need API keys) runs server-side
// in names.js; this just POSTs to it over /api/generate-names, which
// api/generate-names.js serves in production and a dev-server middleware in
// vite.config.js serves for local `npm run dev`. Same signature and error
// shape as the old direct import, so nothing else in the app needed to change.
export async function generateNames(brief, excludeNames = []) {
  let res
  try {
    res = await fetch('/api/generate-names', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ brief, excludeNames }),
    })
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.')
  }

  let body = null
  try {
    body = await res.json()
  } catch {
    // non-JSON body — fall through to the generic error below
  }

  if (!res.ok) {
    const err = new Error(body?.message || `Name generation failed (${res.status})`)
    if (body?.code) err.code = body.code
    throw err
  }

  return body?.names || []
}
