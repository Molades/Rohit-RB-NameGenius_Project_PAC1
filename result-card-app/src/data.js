// Mock candidate pool — stands in for the generator and RDAP lookups until Phase 3.
// Deliberately mixes TLDs and name lengths so the filters have something real to do.
// Shape matches ResultCard's props: name, domain (primary TLD included), status
// ('available' | 'taken'), and tlds (the "ALSO FREE" alternates, each { ext, available }).

export const CANDIDATE_POOL = [
  { name: 'Loom & Carbon', domain: 'loomandcarbon.com', status: 'available', tlds: [{ ext: '.io', available: true }, { ext: '.ai', available: false }, { ext: '.co', available: true }] },
  { name: 'Foundry Grain', domain: 'foundrygrain.com', status: 'available', tlds: [{ ext: '.io', available: true }, { ext: '.ai', available: true }, { ext: '.co', available: false }] },
  { name: 'Heartwood Co', domain: 'heartwoodco.com', status: 'available', tlds: [{ ext: '.io', available: false }, { ext: '.ai', available: true }, { ext: '.co', available: true }] },
  { name: 'Article Frame', domain: 'articleframe.com', status: 'taken', tlds: [{ ext: '.io', available: false }, { ext: '.ai', available: true }, { ext: '.co', available: false }] },
  { name: 'Reclaimed Form', domain: 'reclaimedform.com', status: 'taken', tlds: [{ ext: '.io', available: true }, { ext: '.ai', available: false }, { ext: '.co', available: false }] },
  { name: 'Grain & Ore', domain: 'grainandore.io', status: 'available', tlds: [{ ext: '.com', available: true }, { ext: '.ai', available: true }, { ext: '.co', available: false }] },
  { name: 'Solid Oak Co', domain: 'solidoakco.io', status: 'available', tlds: [{ ext: '.com', available: false }, { ext: '.ai', available: true }, { ext: '.co', available: true }] },
  { name: 'Patina', domain: 'patina.ai', status: 'available', tlds: [{ ext: '.com', available: false }, { ext: '.io', available: true }, { ext: '.co', available: true }] },
  { name: 'Joinery', domain: 'joinery.com', status: 'taken', tlds: [{ ext: '.io', available: true }, { ext: '.ai', available: false }, { ext: '.co', available: true }] },
  { name: 'Hearth & Frame', domain: 'hearthandframe.io', status: 'available', tlds: [{ ext: '.com', available: false }, { ext: '.ai', available: true }, { ext: '.co', available: false }] },
  { name: 'Timberline Studio', domain: 'timberlinestudio.com', status: 'taken', tlds: [{ ext: '.io', available: true }, { ext: '.ai', available: true }, { ext: '.co', available: false }] },
  { name: 'Knot & Beam', domain: 'knotandbeam.com', status: 'available', tlds: [{ ext: '.io', available: true }, { ext: '.ai', available: false }, { ext: '.co', available: true }] },
  { name: 'Ore', domain: 'ore.ai', status: 'available', tlds: [{ ext: '.com', available: false }, { ext: '.io', available: false }, { ext: '.co', available: true }] },
  { name: 'Repair Culture', domain: 'repairculture.com', status: 'taken', tlds: [{ ext: '.io', available: true }, { ext: '.ai', available: true }, { ext: '.co', available: true }] },
  { name: 'Long Grain', domain: 'longgrain.io', status: 'available', tlds: [{ ext: '.com', available: false }, { ext: '.ai', available: true }, { ext: '.co', available: true }] },
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
