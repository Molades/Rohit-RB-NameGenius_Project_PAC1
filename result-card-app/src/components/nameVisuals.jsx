// The colour + glyph identity of a name. Each result is given a `visual`
// number when it is created, so it looks the same on every screen.

// Soft light that pours down from the top edge and fades to nothing, so it
// melts into whatever surface it sits on (no gradient "box", no dark band).
const light = (bright, deep) =>
  `radial-gradient(ellipse 80% 105% at 50% 22%, ${bright} 0%, ${deep} 48%, transparent 82%)`

const GRADIENTS = [
  light('rgba(123,107,255,0.7)', 'rgba(59,43,207,0.3)'),
  light('rgba(255,148,87,0.62)', 'rgba(255,61,107,0.28)'),
  light('rgba(45,212,191,0.58)', 'rgba(20,112,122,0.3)'),
  light('rgba(236,72,153,0.58)', 'rgba(124,58,237,0.3)'),
  light('rgba(245,166,35,0.58)', 'rgba(178,61,31,0.28)'),
]

const GLYPHS = [
  <>
    <path d="M24 4L42 15V33L24 44L6 33V15L24 4Z" stroke="currentColor" strokeWidth="1.4" />
    <path d="M24 14L34 20V32L24 38L14 32V20L24 14Z" stroke="currentColor" strokeWidth="1.4" />
  </>,
  <path d="M24 4V44M4 24H44M10 10L38 38M38 10L10 38" stroke="currentColor" strokeWidth="1.2" />,
  <>
    <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="24" cy="24" r="11" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="24" cy="24" r="4" stroke="currentColor" strokeWidth="1.3" />
  </>,
  <path d="M8 40L24 6L40 40Z" stroke="currentColor" strokeWidth="1.3" />,
  <rect x="10" y="10" width="28" height="28" stroke="currentColor" strokeWidth="1.3" transform="rotate(45 24 24)" />,
]

export const gradientFor = (visual) => GRADIENTS[visual % GRADIENTS.length]

export function Glyph({ visual, size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      {GLYPHS[visual % GLYPHS.length]}
    </svg>
  )
}

const FADE_OUT = 'linear-gradient(to bottom, #000 50%, transparent 100%)'

// The coloured light behind a name's visual. Put it first inside a `relative`
// container that sits in a `group`: it rests at a gentle strength and warms up
// (never jumps to full saturation) when the card is hovered or focused.
export function Glow({ visual }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-80 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100"
      style={{ background: gradientFor(visual), WebkitMaskImage: FADE_OUT, maskImage: FADE_OUT }}
    />
  )
}
