import { TLD_ORDER } from './data'

// Improved, deterministic name generator.
// Derives brandable candidates from the user's keyword, description,
// competitors and any brand-discovery answers, then returns a varied set
// that reshuffles on each `generation` and reflects newly given answers.

const STOP = new Set([
  'the', 'and', 'for', 'with', 'your', 'you', 'our', 'from', 'into', 'that',
  'this', 'are', 'app', 'name', 'names', 'like', 'want', 'need', 'make',
])
const PREFIXES = ['get', 'try', 'use', 'go', 'join', 'hey']
const SUFFIXES = [
  'ly', 'labs', 'hq', 'base', 'kit', 'hub', 'flow', 'wave', 'forge', 'craft',
  'loop', 'works', 'peak', 'stack', 'sync', 'yard', 'pilot', 'scout', 'space', 'link',
]
const ABSTRACT = [
  'nova', 'lumen', 'atlas', 'ferra', 'quill', 'orbit', 'nimbus', 'cadence',
  'harbor', 'verve', 'onyx', 'sable', 'mira', 'vela', 'luma', 'riva', 'fable',
  'juno', 'halo', 'wren',
]
const VOWELS = 'aeiou'

function hashStr(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(a) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle(arr, rnd) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

function tokens(str) {
  return (str || '')
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => w.length >= 3 && !STOP.has(w))
}

// Deterministic per-TLD availability with realistic scarcity (.com rare).
function tldAvailability(slug) {
  const thresh = { '.com': 22, '.io': 55, '.co': 62 }
  const map = {}
  for (const t of TLD_ORDER) map[t] = hashStr(slug + t) % 100 < thresh[t]
  return map
}

function tagsFor(slug, roots) {
  const tags = []
  if (slug.length <= 6) tags.push('short')
  const last = slug[slug.length - 1]
  if (slug.length <= 8 && (VOWELS.includes(last) || /(.)\1/.test(slug))) {
    tags.push('catchy')
  }
  if (roots.some((r) => r.length >= 3 && slug.includes(r))) tags.push('descriptive')
  if (tags.length === 0) tags.push('descriptive')
  return tags
}

function buildCandidates(seed, mods) {
  const set = new Map() // slug -> display name
  const add = (nameParts) => {
    const name = nameParts
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (slug.length >= 3 && slug.length <= 15 && !set.has(slug)) set.set(slug, name)
  }

  if (seed) {
    add(cap(seed))
    for (const suf of SUFFIXES) add(cap(seed) + suf)
    for (const pre of PREFIXES) add(cap(pre) + cap(seed))
  }
  for (const m of mods) {
    add(cap(m))
    for (const suf of SUFFIXES.slice(0, 10)) add(cap(m) + suf)
  }
  if (seed) {
    for (const m of mods) add(cap(seed) + cap(m).slice(0, 4))
  }
  for (const ab of ABSTRACT) {
    add(cap(ab))
    if (seed) add(cap(ab) + cap(seed).slice(0, 4))
  }
  return set
}

export function generateNames(brief, generation = 0, answers = {}) {
  const seedTokens = tokens(brief?.name)
  const seed = seedTokens[0] || 'brand'
  const baseMods = [
    ...seedTokens.slice(1),
    ...tokens(brief?.description),
    ...tokens(brief?.competitors),
  ]
  const answerTokens = Object.values(answers || {}).flatMap((v) => tokens(v))
  const mods = Array.from(new Set([...baseMods, ...answerTokens]))
  const roots = [seed, ...mods]

  const set = buildCandidates(seed, mods)
  let items = Array.from(set, ([slug, name]) => ({
    name,
    slug,
    tlds: tldAvailability(slug),
    tags: tagsFor(slug, roots),
  }))

  const rnd = mulberry32(
    hashStr(`${brief?.name || ''}|${generation}|${answerTokens.length}`)
  )
  items = shuffle(items, rnd)

  // After the user answers a follow-up, surface names shaped by that answer
  // first so the refinement is visible (stable sort keeps shuffle order within).
  if (answerTokens.length) {
    items.sort((a, b) => {
      const aw = answerTokens.some((t) => a.slug.includes(t)) ? 0 : 1
      const bw = answerTokens.some((t) => b.slug.includes(t)) ? 0 : 1
      return aw - bw
    })
  }

  return items.slice(0, 18)
}
