// Derivation helpers shared across screens. Name items are produced by
// generator.js and all share the shape { name, slug, tlds, tags }.

export const TLD_ORDER = ['.com', '.io', '.co']

// The five brand-discovery questions, surfaced both on the Questions screen
// and inline as follow-ups after repeated regenerations.
export const QUESTIONS = [
  'Who is your audience?',
  'What problem do you solve?',
  'What feeling should the name evoke?',
  'Which brands do you admire, and why?',
  'What should the name never sound like?',
]

export function availableTlds(item) {
  return TLD_ORDER.filter((t) => item.tlds[t])
}

// Domain to feature given the active TLD filter: the filtered TLD when one is
// chosen, otherwise the first available TLD (falling back to .com).
export function primaryTld(item, tldFilter) {
  if (tldFilter && tldFilter !== 'any TLD') return tldFilter
  return availableTlds(item)[0] || '.com'
}

export function domainFor(item, tldFilter) {
  return `${item.slug}${primaryTld(item, tldFilter)}`
}

export function isAvailable(item, tldFilter) {
  return item.tlds[primaryTld(item, tldFilter)]
}

export function matchesLength(item, lengthFilter) {
  if (lengthFilter === 'short') return item.slug.length <= 6
  if (lengthFilter === 'catchy') return item.tags.includes('catchy')
  return true
}

export function styleLabel(item) {
  if (item.tags.includes('catchy')) return 'Catchy'
  if (item.tags.includes('short')) return 'Short'
  return 'Descriptive'
}
