const RDAP_BASE = 'https://rdap.verisign.com/com/v1/domain/'
const ALT_TLDS = ['.io', '.ai', '.co']
const REQUEST_TIMEOUT_MS = 4000

export const TLDS = ['.com', '.io', '.ai']

// .com comes from the live RDAP check; every other TLD is a placeholder.
export function isTldAvailable(item, ext) {
  return ext === '.com' ? item.status === 'available' : Boolean(item.tlds.find((t) => t.ext === ext)?.available)
}

export function slugify(name) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '')
  return slug ? `${slug}.com` : null
}

export async function checkDomain(domain) {
  try {
    const res = await fetch(RDAP_BASE + encodeURIComponent(domain), {
      headers: { Accept: 'application/rdap+json' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
    if (res.status === 404) return 'available'
    return 'taken'
  } catch {
    // Timeout, network error, or any non-200/404 status — fail closed rather
    // than risk showing a taken domain as available.
    return 'taken'
  }
}

export async function checkDomainsBatch(domains, onProgress) {
  let done = 0
  const statuses = await Promise.all(
    domains.map(async (d) => {
      const status = await checkDomain(d)
      onProgress?.(++done, domains.length)
      return status
    })
  )
  return domains.map((domain, i) => ({ domain, status: statuses[i] }))
}

// Illustrative yearly price for the card footer — name-seeded so it's stable
// across re-renders. There is no registrar pricing source behind it.
export function placeholderPrice(name) {
  let seed = 7
  for (let i = 0; i < name.length; i++) seed = (seed * 31 + name.charCodeAt(i)) >>> 0
  return `$${9 + (seed % 21)}.99/yr`
}

// Deterministic, name-seeded placeholders for the non-.com rows —
// stable across re-renders, but not a real availability check.
export function placeholderAlternates(name) {
  let seed = 0
  for (let i = 0; i < name.length; i++) seed = (seed * 31 + name.charCodeAt(i)) >>> 0
  return ALT_TLDS.map((ext, i) => {
    seed = (seed * 1103515245 + 12345 + i) >>> 0
    return { ext, available: seed % 2 === 0 }
  })
}
