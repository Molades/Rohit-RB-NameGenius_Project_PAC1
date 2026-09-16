// Mocked S3 result-card data for the Figma-faithful preview. Names, domains, and
// TLD availability are taken from frame "Results — Default" (node 45:64) so the
// preview reads like a real slice of the screen.
//
// Card shape: { name, slug, domain, status, tlds: [{ ext, available }] }

export const FEATURED_CARD = {
  name: 'Northpeak',
  slug: 'northpeak',
  domain: 'northpeak.com',
  status: 'available',
  tlds: [
    { ext: '.com', available: true },
    { ext: '.io', available: true },
    { ext: '.co', available: true },
  ],
}

export const ROW_CARDS = [
  {
    name: 'BrightMind',
    slug: 'brightmind',
    domain: 'brightmind.io',
    status: 'available',
    tlds: [
      { ext: '.com', available: false },
      { ext: '.io', available: true },
      { ext: '.co', available: true },
    ],
  },
  {
    name: 'Velocity Labs',
    slug: 'velocitylabs',
    domain: 'velocitylabs.com',
    status: 'available',
    tlds: [
      { ext: '.com', available: true },
      { ext: '.io', available: true },
      { ext: '.co', available: false },
    ],
  },
  {
    name: 'Atlas',
    slug: 'atlas',
    domain: 'atlas.co',
    status: 'available',
    tlds: [
      { ext: '.com', available: false },
      { ext: '.io', available: false },
      { ext: '.co', available: true },
    ],
  },
  {
    name: 'Ferra',
    slug: 'ferra',
    domain: 'ferra.io',
    status: 'available',
    tlds: [
      { ext: '.com', available: false },
      { ext: '.io', available: true },
      { ext: '.co', available: false },
    ],
  },
  {
    name: 'UseNorthwind',
    slug: 'usenorthwind',
    domain: 'usenorthwind.com',
    status: 'taken',
    tlds: [
      { ext: '.com', available: false },
      { ext: '.io', available: false },
      { ext: '.co', available: false },
    ],
  },
]
