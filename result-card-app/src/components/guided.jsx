import { useId } from 'react'

// Pieces of the Brief form's guided-example feature: the "?" help on each
// label, the "why it works" note under each filled field, the header that
// starts / manages an example, and the brief-strength meter.

const FIELD_LABEL = 'block p-0 font-hero-mono text-[11px] uppercase tracking-[0.08em] text-hero-text/45'
const HEADER_LINK =
  'cursor-pointer whitespace-nowrap rounded-full px-2.5 py-2 font-hero-mono text-[12px] tracking-[0.03em] text-hero-text/60 transition-colors duration-200 hover:bg-white/7 hover:text-white'

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// A 16px "?" that reveals a short hint on hover or focus. Tapping focuses it
// explicitly, because Safari doesn't focus a button on tap.
function Help({ label, children }) {
  const id = useId()
  return (
    <button
      type="button"
      aria-label={`Tip for ${label}`}
      aria-describedby={id}
      onClick={(e) => e.currentTarget.focus()}
      className="group/help inline-grid size-4 cursor-pointer place-items-center rounded-full border border-white/22 font-hero-mono text-[9px] font-medium text-hero-text/55 transition-colors duration-200 hover:border-white/55 hover:text-white focus-visible:border-white/55 focus-visible:text-white"
    >
      ?
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%+8px)] left-0 z-20 w-[250px] max-w-[calc(100vw-96px)] translate-y-1 rounded-[14px] border border-white/14 bg-[rgba(24,24,24,0.98)] px-3.5 py-3 text-left font-meta text-[12.5px] font-normal normal-case leading-normal tracking-normal text-hero-text/80 opacity-0 shadow-[0_18px_40px_rgba(0,0,0,0.55)] backdrop-blur-[14px] transition duration-300 group-hover/help:translate-y-0 group-hover/help:opacity-100 group-focus/help:translate-y-0 group-focus/help:opacity-100"
      >
        {children}
      </span>
    </button>
  )
}

// Label + optional help. Anchors the help bubble to the row so it never runs
// off the card on narrow screens.
export function LabelRow({ htmlFor, as: Tag = 'label', label, help, aside }) {
  return (
    <div className="relative mb-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">
      <Tag htmlFor={Tag === 'label' ? htmlFor : undefined} className={FIELD_LABEL}>
        {label}
      </Tag>
      {help && <Help label={label}>{help}</Help>}
      {aside && <div className="ml-auto">{aside}</div>}
    </div>
  )
}

// The "why it works" note. Collapses to nothing when closed, and is inert so
// screen readers and Tab skip it.
export function Tip({ open, n, children }) {
  return (
    <div
      inert={!open}
      aria-hidden={!open}
      className={`grid transition-[grid-template-rows,opacity] duration-[550ms] ${
        open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      }`}
    >
      <div className="overflow-hidden">
        <div
          role="note"
          className="flex gap-2.5 px-1.5 pt-[11px] font-meta text-[12.5px] leading-[1.55] text-hero-text/50 [&_b]:font-semibold [&_b]:text-hero-text/90 [&_s]:text-hero-text/40 [&_s]:decoration-status-bad/75"
        >
          <span className="mt-px size-[18px] flex-none rounded-full bg-white/10 text-center font-hero-mono text-[10px] leading-[18px] text-hero-text/80">
            {n}
          </span>
          <div>{children}</div>
        </div>
      </div>
    </div>
  )
}

// What each note says. `ex` is the example currently on screen.
export const TIPS = {
  businessType: () => (
    <>
      <b>Name the kind of business in a few words.</b> It anchors everything the names are built on.
    </>
  ),
  name: () => (
    <>
      <b>A working name is enough.</b> It sets the tone — leave it blank if you have none yet.
    </>
  ),
  description: (ex) => (
    <>
      <b>Say what you make, who it’s for, and what’s different</b> — not just “<s>{ex.weak}</s>”.
      <span className="mt-2 flex flex-wrap gap-1.5">
        {['what you make', 'who it’s for', 'what’s different'].map((t) => (
          <span key={t} className="rounded-full border border-white/14 px-[9px] py-[3px] font-hero-mono text-[10.5px] text-hero-text/65">
            {t}
          </span>
        ))}
      </span>
    </>
  ),
  competitors: () => (
    <>
      <b>Brands you compete with or admire, then words you want echoed.</b> Comma-separated.
    </>
  ),
  mood: () => (
    <>
      <b>Three or four feelings — and one it should not have.</b> The “not” keeps the names away from clichés.
    </>
  ),
  tld: (ex) => (
    <>
      <b>{ex.tldWhy[0]}</b>
      {ex.tldWhy[1]}
    </>
  ),
}

export const HELP = {
  businessType: 'The kind of business in a few words — e.g. furniture studio, café, invoicing app.',
  name: 'A working name is enough — it sets the tone. Leave it blank if you have none yet.',
  description: 'One or two sentences: what you make, who it’s for, and what makes it different.',
  competitors: 'Brands you compete with or admire, then words you’d like echoed. Comma-separated.',
  mood: 'Three or four feelings — plus one it should not have. The “not” keeps names away from clichés.',
  tld: '.com reads as the most trustworthy. Pick .io or .ai for a software product.',
}

const STAR = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className="size-[15px] drop-shadow-[0_0_6px_rgba(247,245,239,0.55)] transition-transform duration-700 group-hover:rotate-90 group-hover:scale-110"
  >
    <path d="M12 2 L14.3 9.7 L22 12 L14.3 14.3 L12 22 L9.7 14.3 L2 12 L9.7 9.7 Z" fill="currentColor" />
  </svg>
)

// The example controls, shown on the right of the Business Type label row so
// that row is never empty: idle offers an example, filling shows progress,
// filled lets you swap, clear or go back to your own text. Every state is 30px
// tall so the field never jumps as it changes.
export function ExampleControls({ mode, hasMine, onFill, onAnother, onClear, onRestore }) {
  return (
    <div data-example-controls className="flex h-[30px] items-center justify-end">
      {mode === 'idle' && (
        <button
          type="button"
          onClick={onFill}
          className="fade-swap group relative inline-flex h-[30px] flex-none cursor-pointer items-center gap-2 overflow-hidden whitespace-nowrap rounded-full border border-white/22 bg-[linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.03)_65%)] pl-[11px] pr-3.5 text-[12.5px] font-semibold normal-case tracking-normal text-hero-text shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_6px_20px_rgba(0,0,0,0.35)] transition duration-300 after:pointer-events-none after:absolute after:inset-0 after:animate-[magic-sheen_1.4s_cubic-bezier(0.22,1,0.36,1)_1.2s_1_both] after:bg-[linear-gradient(100deg,transparent_30%,rgba(255,255,255,0.35)_50%,transparent_70%)] hover:-translate-y-px hover:border-white/50 active:scale-[0.97]"
        >
          {STAR}
          Fill an example
        </button>
      )}

      {mode === 'filling' && (
        <p role="status" className="fade-swap flex items-center gap-2 font-meta text-[13px] text-hero-text/55">
          <span className="size-1.5 flex-none animate-pulse rounded-full bg-hero-fill shadow-[0_0_10px_rgba(242,241,237,0.6)]" />
          Writing an example…
          <span className="hidden text-hero-text/35 sm:inline">· tap a field to skip</span>
        </p>
      )}

      {mode === 'filled' && (
        <div className="fade-swap flex items-center gap-1">
          {hasMine && (
            <>
              <button type="button" onClick={onRestore} className={HEADER_LINK}>
                Restore mine
              </button>
              <span aria-hidden="true" className="h-3.5 w-px bg-white/14" />
            </>
          )}
          <button type="button" onClick={onAnother} className={HEADER_LINK}>
            Try another
          </button>
          <span aria-hidden="true" className="h-3.5 w-px bg-white/14" />
          <button type="button" onClick={onClear} className={HEADER_LINK}>
            Clear
          </button>
        </div>
      )}
    </div>
  )
}

const STRENGTH = ['Empty', 'Getting started', 'Getting started', 'Good', 'Good', 'Strong']

// Five checks — business type, name, a real description, competitors, mood —
// each lights a segment, with one nudge at a time about what to add next.
export function StrengthMeter({ checks, hasDescription }) {
  const [hasType, hasName, descriptionOk, hasCompetitors, hasMood] = checks
  const count = checks.filter(Boolean).length
  let hint
  if (count === checks.length) hint = 'That’s a strong brief. Ready when you are.'
  else if (!descriptionOk)
    hint = hasDescription
      ? 'Make it a full sentence: what you make, who it’s for, what’s different.'
      : 'Start with a description — it matters most.'
  else if (!hasType) hint = 'Add a business type — a few words is enough.'
  else if (!hasMood) hint = 'Add a mood to sharpen the results.'
  else if (!hasCompetitors) hint = 'Add a few competitors or keywords.'
  else if (!hasName) hint = 'Add a working name — even a rough one sets the tone.'

  return (
    <div className="reveal flex flex-col gap-2.5 pt-0.5" style={{ '--i': 6.5 }}>
      <div className="flex justify-between font-hero-mono text-[11px] uppercase tracking-[0.08em] text-hero-text/45">
        <span>Brief strength</span>
        <span className="text-hero-text/90">{STRENGTH[count]}</span>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {checks.map((on, i) => (
          <i
            key={i}
            className={`relative block h-1 overflow-hidden rounded-full bg-white/8 after:absolute after:inset-0 after:origin-left after:bg-linear-to-r after:from-hero-fill/50 after:to-hero-fill after:transition-transform after:duration-[800ms] ${
              on ? 'after:scale-x-100' : 'after:scale-x-0'
            }`}
          />
        ))}
      </div>
      <p aria-live="polite" className="min-h-[19px] text-[12.5px] leading-normal text-hero-text/45">
        {hint}
      </p>
    </div>
  )
}
