import { useSyncExternalStore } from 'react'
import { TLDS } from './domain.js'

// Typical first-year registration price per TLD, from Porkbun's public pricing
// feed (no key needed, browser-friendly). It is a TLD-level price: premium or
// aftermarket names cost more, and other registrars differ, so the UI shows it
// as approximate and the Register menu says the registrar sets the final price.
const PRICING_URL = 'https://api.porkbun.com/api/json/v3/pricing/get'
// The feed is slow (about 10s per call), so it loads in the background well
// before the Names list, and the small result is remembered for a day.
const TIMEOUT_MS = 30000
const CACHE_KEY = 'ingenio.tldPrices.v1'
const CACHE_MS = 24 * 60 * 60 * 1000

function readCache() {
  try {
    const { at, found } = JSON.parse(localStorage.getItem(CACHE_KEY))
    if (Date.now() - at < CACHE_MS && found?.['.com']) return found
  } catch {
    // no cache, or storage unavailable
  }
  return null
}

// { '.com': 11.08, '.io': 28.12, '.ai': 82.7 } once loaded, null until then
// (or if the feed can't be reached — the UI then shows a generic label).
let prices = readCache()
let loading = false
const listeners = new Set()

export async function preloadPrices() {
  if (prices || loading) return
  loading = true
  try {
    const res = await fetch(PRICING_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    const data = await res.json()
    if (data?.status !== 'SUCCESS') return
    const found = {}
    for (const ext of TLDS) {
      const price = Number(data.pricing?.[ext.slice(1)]?.registration)
      if (Number.isFinite(price) && price > 0) found[ext] = price
    }
    if (Object.keys(found).length) {
      prices = found
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), found }))
      } catch {
        // storage full or blocked — prices still work for this visit
      }
      listeners.forEach((notify) => notify())
    }
  } catch {
    // Offline or blocked: leave prices null; the next Generate tries again.
  } finally {
    loading = false
  }
}

const subscribe = (notify) => {
  listeners.add(notify)
  preloadPrices()
  return () => listeners.delete(notify)
}

export const useTldPrices = () => useSyncExternalStore(subscribe, () => prices)

// "~$11 first year", or null when we have no price for that TLD.
export function formatPrice(all, ext) {
  const price = all?.[ext]
  return price ? `~$${Math.round(price)} first year` : null
}
