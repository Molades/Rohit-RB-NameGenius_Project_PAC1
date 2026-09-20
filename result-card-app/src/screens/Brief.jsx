import { useId, useState } from 'react'
import orbUrl from '../assets/brief-orb.png'

const FIELD_LABEL = 'mb-2.5 block p-0 font-hero-mono text-[11px] uppercase tracking-[0.08em] text-hero-text/45'
const FIELD_INPUT =
  'w-full border border-white/10 bg-white/6 px-5 py-3.5 font-meta text-[15px] text-hero-text outline-none transition-colors duration-200 placeholder:text-hero-text/38 focus:border-white/40 focus:bg-white/9'
const ORB_MASK = 'radial-gradient(ellipse 80% 75% at 50% 50%, #000 50%, transparent 100%)'

function TextField({ label, value, onChange, placeholder, multiline, i }) {
  const id = useId()
  const Tag = multiline ? 'textarea' : 'input'
  return (
    <div style={{ '--i': i }} className="reveal">
      <label htmlFor={id} className={FIELD_LABEL}>
        {label}
      </label>
      <Tag
        id={id}
        type={multiline ? undefined : 'text'}
        rows={multiline ? 2 : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={
          multiline
            ? `${FIELD_INPUT} min-h-[68px] resize-y rounded-[34px] leading-normal field-sizing-content`
            : `${FIELD_INPUT} rounded-full`
        }
      />
    </div>
  )
}

export default function Brief({ initial, onFindNames, onOpenQuestions, onBack }) {
  const [name, setName] = useState(initial.name)
  const [description, setDescription] = useState(initial.description)
  const [competitors, setCompetitors] = useState(initial.competitors)
  const [mood, setMood] = useState(initial.mood)
  const [tld, setTld] = useState(initial.tld)

  const canSubmit = name.trim() || description.trim() || competitors.trim()

  const trackGlow = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  const resetGlow = (e) => {
    e.currentTarget.style.removeProperty('--mx')
    e.currentTarget.style.removeProperty('--my')
  }

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-ink font-meta lg:flex-row">
      <button
        type="button"
        onClick={onBack}
        aria-label="Back to start"
        style={{ '--i': 5 }}
        className="fade-in absolute left-6 top-8 z-10 flex cursor-pointer items-center gap-2 text-hero-text opacity-40 transition-opacity duration-200 hover:opacity-100 sm:left-14"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2 L14.3 9.7 L22 12 L14.3 14.3 L12 22 L9.7 14.3 L2 12 L9.7 9.7 Z" fill="currentColor" />
        </svg>
        <span className="font-hero-mono text-[12px] font-medium tracking-[0.1em]">INGENIO</span>
      </button>

      <section className="flex flex-col justify-end border-white/8 px-6 pb-8 pt-24 sm:px-14 lg:w-2/5 lg:border-r lg:p-16">
        <h1 style={{ '--i': 0 }} className="reveal-soft font-hero text-[44px] font-normal italic leading-[1.06] text-hero-text sm:text-[52px] lg:text-[46px] xl:text-[60px]">
          Find a name
          <br />
          you can own.
        </h1>
        <p style={{ '--i': 1 }} className="reveal mt-[18px] max-w-[380px] text-[17px] leading-normal text-hero-text/55">
          Tell us about the business and we&apos;ll generate names that fit — checked for domain availability as you go.
        </p>
        <div style={{ '--i': 4 }} className="fade-in mt-6 hidden w-full max-w-[440px] lg:block xl:h-[448px]">
          <img
            src={orbUrl}
            alt=""
            className="block aspect-[506/387] w-[min(506px,calc(100%+66px))] max-w-none animate-brief-float object-cover mix-blend-screen motion-reduce:animate-none"
            style={{ objectPosition: '10.1722% 50%', WebkitMaskImage: ORB_MASK, maskImage: ORB_MASK }}
          />
        </div>
      </section>

      <section className="flex items-center px-6 pb-16 sm:px-14 lg:w-3/5 lg:p-16">
        <div style={{ '--i': 1 }} className="fade-in flex w-full flex-col gap-[22px] rounded-3xl border border-white/8 bg-white/3 p-6 sm:p-10">
          <TextField label="Name" value={name} onChange={setName} placeholder="e.g. Loom & Carbon" i={2} />
          <TextField
            label="Description"
            value={description}
            onChange={setDescription}
            placeholder="What does the business do, and for whom? A sentence or two is plenty."
            multiline
            i={3}
          />
          <TextField
            label="Competitors & keywords"
            value={competitors}
            onChange={setCompetitors}
            placeholder="e.g. Article, Floyd, sustainable, heirloom"
            i={4}
          />
          <TextField
            label="Nature & mood"
            value={mood}
            onChange={setMood}
            placeholder="How should it feel? e.g. warm, minimal, premium, playful"
            i={5}
          />

          <fieldset style={{ '--i': 6 }} className="reveal">
            <legend className={FIELD_LABEL}>Preferred TLD</legend>
            <div className="flex gap-2.5">
              {['.com', '.io', '.ai'].map((opt) => (
                <label
                  key={opt}
                  className="relative inline-flex cursor-pointer items-center justify-center rounded-full border border-white/14 px-5 py-[9px] font-hero-mono text-[13px] text-hero-text/60 transition-colors duration-200 hover:border-white/28 hover:bg-white/6 hover:text-hero-text has-checked:border-white/50 has-checked:bg-white/15 has-checked:font-semibold has-checked:text-hero-text has-checked:hover:bg-white/20 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-white"
                >
                  <input
                    type="radio"
                    name="tld"
                    value={opt}
                    checked={tld === opt}
                    onChange={() => setTld(opt)}
                    className="sr-only"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => onFindNames({ name, description, competitors, mood, tld })}
            onMouseMove={trackGlow}
            onMouseLeave={resetGlow}
            style={{ '--i': 7 }}
            className="reveal group relative mt-2 block w-full cursor-pointer overflow-hidden rounded-full border border-white/28 bg-white/10 p-4 text-center text-[15px] font-semibold text-hero-text shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_28px_rgba(0,0,0,0.4)] backdrop-blur-[20px] backdrop-saturate-[1.8] transition duration-200 enabled:hover:-translate-y-px enabled:hover:border-white/40 enabled:hover:bg-white/16 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            {canSubmit && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(140px_circle_at_var(--mx,50%)_var(--my,50%),rgba(255,255,255,0.5),rgba(255,255,255,0.06)_55%,transparent_75%)] opacity-0 transition-opacity duration-[250ms] group-hover:opacity-100"
              />
            )}
            <span className="relative">Find names</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenQuestions({ name, description, competitors, mood, tld })}
            style={{ '--i': 8 }}
            className="reveal mx-auto cursor-pointer text-[14px] text-hero-text/55 transition-colors duration-200 hover:text-hero-text"
          >
            Sharpen with brand questions →
          </button>
        </div>
      </section>
    </main>
  )
}
