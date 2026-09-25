// The name-generation prompt and reply parsing, shared by every model provider
// (Gemini first, Groq as the backup) so they all ask the same question and read
// the answer the same way.

// Ask for more names than the UI shows: duplicates and unusable names get
// dropped, and we still want a full batch left over.
export const NAMES_REQUESTED = 14

export function buildPrompt(brief, excludeNames) {
  const lines = [
    `Suggest ${NAMES_REQUESTED} short, ordinary business name ideas for a brand.`,
    brief.businessType ? `Type of business: ${brief.businessType}` : null,
    brief.name ? `Working name so far: ${brief.name}` : null,
    brief.description ? `Description: ${brief.description}` : null,
    brief.competitors ? `Competitors/keywords: ${brief.competitors}` : null,
    brief.mood ? `Nature and mood: ${brief.mood}` : null,
    brief.answers?.length
      ? `The founder answered these brand-discovery questions. Let the answers steer the names' tone, imagery and word choice, so the names clearly reflect them (draw on the ideas, do not quote the answers):\n${brief.answers.map(([q, a]) => `- ${q} Answer: ${a}`).join('\n')}`
      : null,
    excludeNames.length ? `Do not repeat any of these: ${excludeNames.join(', ')}` : null,
    `Respond with ONLY a JSON array of ${NAMES_REQUESTED} short strings, no other text.`,
  ].filter(Boolean)
  return lines.join('\n')
}

// Pull the JSON array out of a model's text reply. Models sometimes wrap it in
// a code fence or add a sentence around it, so take the outermost [...] span.
export function parseNames(text) {
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) throw new Error("Couldn't parse name ideas from the response.")

  let names
  try {
    names = JSON.parse(match[0])
  } catch {
    throw new Error("Couldn't parse name ideas from the response.")
  }
  if (!Array.isArray(names) || names.length === 0) {
    throw new Error('The model returned no name ideas.')
  }

  return names.slice(0, NAMES_REQUESTED).map((n) => String(n).trim()).filter(Boolean)
}
