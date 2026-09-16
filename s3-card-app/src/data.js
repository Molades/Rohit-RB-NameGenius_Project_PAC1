// Mock results — Phase 1 has no generation or RDAP calls yet.
export const mockResults = [
  {
    name: 'Fieldnote',
    domain: 'fieldnote.com',
    status: 'available',
    tlds: [
      { ext: '.io', available: true },
      { ext: '.ai', available: true },
      { ext: '.co', available: false },
    ],
  },
  {
    name: 'Nimbusly',
    domain: 'nimbusly.com',
    status: 'taken',
    tlds: [
      { ext: '.io', available: true },
      { ext: '.ai', available: true },
      { ext: '.co', available: false },
    ],
  },
  {
    name: 'Vertexly',
    domain: 'vertexly.com',
    status: 'loading',
    tlds: [{ ext: '.io' }, { ext: '.ai' }, { ext: '.co' }],
  },
]
