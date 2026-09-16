// Mocked S3 result-card data for the preview gallery. Names and domains are
// taken from the Figma frame "Results — Default" (node 45:64) so the preview
// reads like a slice of the real screen. Phase 3 replaces this with live data.
//
// Card shape: { name, slug, domain, status, tlds }
//   status: 'available' | 'taken'  — availability of the featured `domain`
//   tlds:   [{ ext, available }]    — the .com / .io / .co indicators
//   domain: the first free TLD (or .com when nothing is free / taken)

export const AVAILABLE_CARD = {
  name: 'Northpeak',
  slug: 'northpeak',
  domain: 'northpeak.com',
  status: 'available',
  tlds: [
    { ext: '.com', available: true },
    { ext: '.io', available: true },
    { ext: '.co', available: false },
  ],
}

export const TAKEN_CARD = {
  name: 'UseNorthwind',
  slug: 'usenorthwind',
  domain: 'usenorthwind.com',
  status: 'taken',
  tlds: [
    { ext: '.com', available: false },
    { ext: '.io', available: false },
    { ext: '.co', available: false },
  ],
}
