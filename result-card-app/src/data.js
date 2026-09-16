// Mock candidate pool — stands in for the generator and RDAP lookups until Phase 3.
// Deliberately mixes TLDs and name lengths so the filters have something real to do.

export const CANDIDATE_POOL = [
  { name: 'Loom & Carbon', domain: 'loomandcarbon', tld: '.com', state: 'available' },
  { name: 'Foundry Grain', domain: 'foundrygrain', tld: '.com', state: 'available' },
  { name: 'Heartwood Co', domain: 'heartwoodco', tld: '.com', state: 'available' },
  { name: 'Article Frame', domain: 'articleframe', tld: '.com', state: 'taken' },
  { name: 'Reclaimed Form', domain: 'reclaimedform', tld: '.com', state: 'taken' },
  { name: 'Grain & Ore', domain: 'grainandore', tld: '.io', state: 'available' },
  { name: 'Solid Oak Co', domain: 'solidoakco', tld: '.io', state: 'available' },
  { name: 'Patina', domain: 'patina', tld: '.ai', state: 'available' },
  { name: 'Joinery', domain: 'joinery', tld: '.com', state: 'taken' },
  { name: 'Hearth & Frame', domain: 'hearthandframe', tld: '.io', state: 'available' },
  { name: 'Timberline Studio', domain: 'timberlinestudio', tld: '.com', state: 'taken' },
  { name: 'Knot & Beam', domain: 'knotandbeam', tld: '.com', state: 'available' },
  { name: 'Ore', domain: 'ore', tld: '.ai', state: 'available' },
  { name: 'Repair Culture', domain: 'repairculture', tld: '.com', state: 'taken' },
  { name: 'Long Grain', domain: 'longgrain', tld: '.io', state: 'available' },
]

export const QUESTIONS = [
  'What feeling do you want to evoke in your audience?',
  'What are the main actions you want people to take?',
  'If your company were a rare plant or animal, which would it be?',
  'What analogies fit how your business operates?',
  'How would you explain your project to a five-year-old and keep them interested?',
  'Does this concept exist in other industries, and do they use different words for it?',
  'What are a few good metaphors for what you do?',
  "What role in people's lives are you trying to fill?",
]

export const INITIAL_BRIEF = {
  name: 'Loom & Carbon',
  description: 'A studio that designs furniture from reclaimed hardwood, built to be repaired, not replaced.',
  competitors: 'Article, Floyd, sustainable, heirloom, modular',
  tld: '.com',
}

export function pickBatch(pool, excludeDomains = []) {
  const fresh = pool.filter((c) => !excludeDomains.includes(c.domain))
  const source = fresh.length >= 5 ? fresh : pool
  const shuffled = [...source].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 5)
}
