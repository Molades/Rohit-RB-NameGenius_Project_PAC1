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
  businessType: '',
  name: '',
  description: '',
  competitors: '',
  mood: '',
  tld: '',
}

// Worked examples for the Brief form's "Fill an example" button. Each one is
// a complete, well-written brief; `weak` is the vague version of the
// description it replaces (shown struck through in the tip).
export const BRIEF_EXAMPLES = [
  {
    businessType: 'Furniture studio',
    weak: 'a furniture company',
    name: 'Loom & Carbon',
    description: 'A studio that designs furniture from reclaimed hardwood, built to be repaired, not replaced.',
    competitors: 'Article, Floyd, sustainable, heirloom, modular',
    mood: 'Warm, tactile, understated — quietly premium, not flashy',
    tld: '.com',
    tldWhy: ['.com reads as the most trustworthy', ' for a studio selling physical pieces.'],
  },
  {
    businessType: 'Neighbourhood café',
    weak: 'a coffee shop',
    name: 'Slow Pour',
    description:
      'A neighbourhood roaster and café selling small-batch beans and brew classes to people who work from home.',
    competitors: 'Blue Bottle, Onyx, specialty, single-origin, slow',
    mood: 'Cosy, unhurried, a little playful — never hipster-cold',
    tld: '.com',
    tldWhy: ['.com is what locals will type.', ' Keep it unless you’re building a tech product.'],
  },
  {
    businessType: 'Invoicing app',
    weak: 'an invoicing app',
    name: 'Paperlight',
    description:
      'An invoicing tool for freelance designers that turns a finished project into a paid invoice in one click.',
    competitors: 'FreshBooks, Wave, invoicing, freelance, simple',
    mood: 'Calm, precise, trustworthy — friendly, not corporate',
    tld: '.io',
    tldWhy: ['.io signals software', ' — a good fit for a tool aimed at freelancers.'],
  },
]
