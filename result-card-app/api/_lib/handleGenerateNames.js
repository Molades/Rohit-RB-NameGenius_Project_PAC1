// SERVER ONLY — the /api/generate-names request handler, shared by the
// production Vercel function (api/generate-names.js) and the local dev-server
// middleware (vite.config.js). Framework-agnostic: takes a parsed JSON body,
// returns { status, json } for the caller to send however it likes.
//
// generateNames is passed in rather than imported here, so the dev middleware
// can load it through Vite's module graph (server.ssrLoadModule) — that's
// what lets testing/vite.mock.config.js keep swapping in the mock Gemini
// module for `npm run dev` against the mock build, exactly as it did when the
// browser imported gemini.js directly.
const MAX_EXCLUDE = 500 // generous headroom over what a real session accumulates

export async function handleGenerateNames(body, generateNames) {
  if (!body || typeof body !== 'object' || typeof body.brief !== 'object' || body.brief === null) {
    return { status: 400, json: { message: 'Missing brief.' } }
  }
  const excludeNames = Array.isArray(body.excludeNames) ? body.excludeNames : []
  if (excludeNames.length > MAX_EXCLUDE) {
    return { status: 400, json: { message: 'Too many names to exclude.' } }
  }

  try {
    const names = await generateNames(body.brief, excludeNames)
    return { status: 200, json: { names } }
  } catch (err) {
    const status = err.code === 'QUOTA_EXCEEDED' ? 429 : 500
    return { status, json: { message: err.message || 'Name generation failed.', code: err.code } }
  }
}
