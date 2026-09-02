// Mock data — stands in for the generator and RDAP lookups until Phase 3.

export const results = [
  { id: 1, name: 'Loom & Carbon', domain: 'loomandcarbon', tld: '.com', state: 'available' },
  { id: 2, name: 'Foundry Grain', domain: 'foundrygrain', tld: '.com', state: 'available' },
  { id: 3, name: 'Heartwood Co', domain: 'heartwoodco', tld: '.com', state: 'available' },
  { id: 4, name: 'Article Frame', domain: 'articleframe', tld: '.com', state: 'taken' },
  { id: 5, name: 'Reclaimed Form', domain: 'reclaimedform', tld: '.com', state: 'taken' },
]

export const shortlist = [
  { id: 1, name: 'Loom & Carbon', domain: 'loomandcarbon.com' },
  { id: 2, name: 'Foundry Grain', domain: 'foundrygrain.com' },
  { id: 3, name: 'Heartwood Co', domain: 'heartwoodco.com' },
]

export const compareItems = [
  { id: 1, name: 'Loom & Carbon', status: 'Available', tlds: '.com, .co', fit: 'Evokes craft and material honesty.' },
  { id: 2, name: 'Foundry Grain', status: 'Available', tlds: '.com', fit: 'Industrial root, still warm.' },
]

export const QUESTIONS = [
  { q: 'What feeling do you want to evoke in your audience?', a: '' },
  { q: 'What are the main actions you want people to take?', a: '' },
  { q: 'If your company were a rare plant or animal, which would it be?', a: '' },
  { q: 'What analogies fit how your business operates?', a: '' },
  { q: 'How would you explain your project to a five-year-old and keep them interested?', a: '' },
  { q: 'Does this concept exist in other industries, and do they use different words for it?', a: '' },
  { q: 'What are a few good metaphors for what you do?', a: '' },
  { q: "What role in people's lives are you trying to fill?", a: '' },
]

export const brief = {
  name: 'Loom & Carbon',
  description: 'A studio that designs furniture from reclaimed hardwood, built to be repaired, not replaced.',
  competitors: 'Article, Floyd, sustainable, heirloom, modular',
  tld: '.com',
}
