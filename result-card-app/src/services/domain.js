// Each TLD's registry publishes an RDAP service: a 404 means the name is
// unregistered, a 200 means it is taken. .io and .ai are both run by Identity
// Digital (per the IANA RDAP bootstrap). All three allow browser requests.
const IDENTITY_DIGITAL = 'https://rdap.identitydigital.services/rdap/domain/'
const RDAP_BASES = {
  '.com': 'https://rdap.verisign.com/com/v1/domain/',
  '.io': IDENTITY_DIGITAL,
  '.ai': IDENTITY_DIGITAL,
}
const REQUEST_TIMEOUT_MS = 4000
// The single retry is shorter, so a domain that never answers adds at most
// ~4.5s (delay + jitter + retry) to the Generating screen.
const RETRY_TIMEOUT_MS = 3000
const RETRY_DELAY_MS = 400
const RETRY_JITTER_MS = 600

export const TLDS = ['.com', '.io', '.ai']

// .com is item.status; the other TLDs are in item.tlds. All come from live RDAP checks.
export function isTldAvailable(item, ext) {
  return ext === '.com' ? item.status === 'available' : Boolean(item.tlds.find((t) => t.ext === ext)?.available)
}

export function slugify(name) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '')
  return slug ? `${slug}.com` : null
}

// One RDAP lookup. Only a 404 (available) or 200 (registered) is an answer;
// a timeout, network error, rate limit (429) or server error is 'unknown'.
async function lookup(domain, timeoutMs) {
  const base = RDAP_BASES[domain.slice(domain.lastIndexOf('.'))]
  if (!base) return 'unknown'
  try {
    const res = await fetch(base + encodeURIComponent(domain), {
      headers: { Accept: 'application/rdap+json' },
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (res.status === 404) return 'available'
    if (res.status === 200) return 'taken'
    return 'unknown'
  } catch {
    return 'unknown'
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function checkDomain(domain) {
  const first = await lookup(domain, REQUEST_TIMEOUT_MS)
  if (first !== 'unknown') return first

  // A batch fires every lookup at once, so a failure is usually a blip or a
  // rate limit rather than a real answer. Retry once, after a short random
  // pause so the retries don't all land together.
  await sleep(RETRY_DELAY_MS + Math.random() * RETRY_JITTER_MS)
  const second = await lookup(domain, RETRY_TIMEOUT_MS)

  // Still no answer: fail closed rather than risk offering a taken domain.
  return second === 'unknown' ? 'taken' : second
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
