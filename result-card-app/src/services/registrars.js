// Where the Register menu on a name card sends people to buy the domain. Each
// entry opens that registrar's own search page with the domain pre-filled, so
// the price and availability shown there are the registrar's, not ours.
//
// To earn a commission later, add the affiliate parameters to the relevant
// `url` (or wrap it in the network's tracking link) — this is the only place
// that needs to change.
const enc = encodeURIComponent

export const REGISTRARS = [
  { id: 'namecheap', name: 'Namecheap', url: (domain) => `https://www.namecheap.com/domains/registration/results/?domain=${enc(domain)}` },
  { id: 'godaddy', name: 'GoDaddy', url: (domain) => `https://www.godaddy.com/domainsearch/find?domainToCheck=${enc(domain)}` },
  { id: 'porkbun', name: 'Porkbun', url: (domain) => `https://porkbun.com/checkout/search?q=${enc(domain)}` },
]
