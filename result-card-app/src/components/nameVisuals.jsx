// The gradient + glyph identity of a name. Each result is given a `visual`
// number when it is created, so it looks the same on every screen.
const GRADIENTS = [
  'radial-gradient(ellipse at 50% 32%, #7b6bff, #3b2bcf 38%, #0a0a0a 75%)',
  'radial-gradient(ellipse at 50% 32%, #ff9457, #ff3d6b 38%, #0a0a0a 75%)',
  'radial-gradient(ellipse at 50% 32%, #2dd4bf, #14707a 38%, #0a0a0a 75%)',
  'radial-gradient(ellipse at 50% 32%, #ec4899, #7c3aed 38%, #0a0a0a 75%)',
  'radial-gradient(ellipse at 50% 32%, #f5a623, #b23d1f 38%, #0a0a0a 75%)',
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

// The muted-until-hover treatment used on every gradient visual.
export const VISUAL_FILTER =
  '[filter:saturate(0.35)_brightness(0.78)] transition-[filter] duration-[400ms] group-hover:[filter:none] group-focus-within:[filter:none] [@media(hover:none)]:[filter:none]'
