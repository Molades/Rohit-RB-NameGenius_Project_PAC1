import { useEffect, useId, useRef, useState } from 'react'
import orbUrl from '../assets/brief-orb.png'
import { BRIEF_EXAMPLES } from '../data.js'
import { ExampleControls, HELP, LabelRow, StrengthMeter, TIPS, Tip, prefersReducedMotion } from '../components/guided.jsx'

const FIELD_INPUT =
  'w-full border border-white/10 bg-white/6 px-5 py-3.5 font-meta text-[15px] text-hero-text outline-none transition-[border-color,background-color,box-shadow] duration-300 placeholder:text-hero-text/38 focus:border-white/40 focus:bg-white/9'
// Glow on the field the example is currently typing into.
const FIELD_TYPING = 'border-white/45 bg-white/9 shadow-[0_0_0_4px_rgba(255,255,255,0.05),0_0_28px_rgba(255,255,255,0.07)]'
const ORB_MASK = 'radial-gradient(ellipse 80% 75% at 50% 50%, #000 50%, transparent 100%)'
// The order an example fills in, and the number shown on each note.
const ORDER = ['businessType', 'name', 'description', 'competitors', 'mood', 'tld']
const EMPTY = { businessType: '', name: '', description: '', competitors: '', mood: '', tld: '' }

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function TextField({ fieldKey, label, aside, value, onChange, placeholder, multiline, i, typing, tipEx, tipOpen }) {
  const id = useId()
  const ref = useRef(null)
  const Tag = multiline ? 'textarea' : 'input'

  // Bring the field being typed into view (the card is taller than short windows).
  useEffect(() => {
    if (typing) ref.current?.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }, [typing])

  return (
    <div style={{ '--i': i }} className="reveal">
      <LabelRow htmlFor={id} label={label} help={HELP[fieldKey]} aside={aside} />
      <Tag
        ref={ref}
        id={id}
        type={multiline ? undefined : 'text'}
        rows={multiline ? 2 : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className={`${FIELD_INPUT} ${
          multiline ? 'min-h-[68px] resize-y rounded-[34px] leading-normal field-sizing-content' : 'rounded-full'
        } ${typing ? FIELD_TYPING : ''}`}
      />
      <Tip open={tipOpen} n={ORDER.indexOf(fieldKey) + 1}>
        {TIPS[fieldKey](tipEx)}
      </Tip>
    </div>
  )
}

export default function Brief({ initial, onFindNames, onOpenQuestions, onBack }) {
  const [businessType, setBusinessType] = useState(initial.businessType ?? '')
  const [name, setName] = useState(initial.name)
  const [description, setDescription] = useState(initial.description)
  const [competitors, setCompetitors] = useState(initial.competitors)
  const [mood, setMood] = useState(initial.mood)
  const [tld, setTld] = useState(initial.tld)

  // Guided example. `mode` is idle → filling (being typed) → filled. `shown`
  // says which fields' notes are open; `typing` is the field being typed into;
  // `mine` keeps whatever the user had written before an example replaced it.
  const [mode, setMode] = useState('idle')
  const [exIndex, setExIndex] = useState(0)
  const [shown, setShown] = useState({})
  const [typing, setTyping] = useState(null)
  const [tldPop, setTldPop] = useState(false)
  const [mine, setMine] = useState(null)
  // Bumped to cancel a run in progress (Clear, another example, unmount).
  const runRef = useRef(0)
  const skipRef = useRef(false)
  useEffect(
    () => () => {
      runRef.current += 1
    },
    []
  )

  const setters = { businessType: setBusinessType, name: setName, description: setDescription, competitors: setCompetitors, mood: setMood }
  const example = BRIEF_EXAMPLES[exIndex]

  const values = { businessType, name, description, competitors, mood, tld }
  const hasText = Object.values(values).some((v) => v.trim())
  const canSubmit = businessType.trim() || name.trim() || description.trim() || competitors.trim()

  const setAll = (v) => {
    setBusinessType(v.businessType)
    setName(v.name)
    setDescription(v.description)
    setCompetitors(v.competitors)
    setMood(v.mood)
    setTld(v.tld)
  }

  // A note fades once its field is being edited by hand — the lesson was
  // taught, and it shouldn't sit under the cursor.
  const hideTip = (key) => setShown((s) => (s[key] ? { ...s, [key]: false } : s))

  const edit = (key) => (value) => {
    setters[key](value)
    hideTip(key)
  }

  const chooseTld = (opt) => {
    setTld(opt)
    setTldPop(false)
    hideTip('tld')
  }

  const fillExample = async (index) => {
    if (mode === 'filling') return
    const run = ++runRef.current
    skipRef.current = false
    // Only remember the user's own text, never a previous example's.
    if (mode === 'idle') setMine(hasText ? values : null)

    const ex = BRIEF_EXAMPLES[index]
    const instant = () => skipRef.current || prefersReducedMotion()
    const cancelled = () => runRef.current !== run

    setExIndex(index)
    setMode('filling')
    setShown({})
    setTldPop(false)
    setAll(EMPTY)

    for (const key of ORDER) {
      if (key === 'tld') {
        setTld(ex.tld)
        setTldPop(true)
      } else {
        setTyping(key)
        if (!instant()) {
          const step = ex[key].length > 60 ? 9 : 16
          for (let n = 1; n < ex[key].length && !instant(); n++) {
            setters[key](ex[key].slice(0, n))
            await sleep(step)
            if (cancelled()) return
          }
        }
        if (cancelled()) return
        setters[key](ex[key])
        setTyping(null)
      }
      setShown((s) => ({ ...s, [key]: true }))
      if (!instant()) await sleep(160)
      if (cancelled()) return
    }
    setMode('filled')
  }

  const leaveExample = (nextValues) => {
    runRef.current += 1
    setAll(nextValues)
    setShown({})
    setTyping(null)
    setTldPop(false)
    setMine(null)
    setMode('idle')
  }

  // Touching the card while an example is being typed lets the rest land at once.
  const skipAhead = (e) => {
    if (mode === 'filling' && !e.target.closest('[data-example-controls]')) skipRef.current = true
  }

  const strength = [!!businessType.trim(), !!name.trim(), description.trim().length >= 30, !!competitors.trim(), !!mood.trim()]

  const trackGlow = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  const resetGlow = (e) => {
    e.currentTarget.style.removeProperty('--mx')
    e.currentTarget.style.removeProperty('--my')
  }

  const field = (key) => ({
    fieldKey: key,
    value: values[key],
    onChange: edit(key),
    typing: typing === key,
    tipEx: example,
    tipOpen: !!shown[key],
  })

  return (
    <main className="relative flex min-h-dvh flex-col overflow-x-clip bg-ink font-meta lg:flex-row">
      <button
        type="button"
        onClick={onBack}
        aria-label="Back to start"
        style={{ '--i': 5 }}
        className="fade-in absolute left-6 top-8 z-10 flex cursor-pointer items-center gap-2 text-hero-text opacity-40 transition-opacity duration-200 hover:opacity-100 sm:left-14 lg:fixed"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2 L14.3 9.7 L22 12 L14.3 14.3 L12 22 L9.7 14.3 L2 12 L9.7 9.7 Z" fill="currentColor" />
        </svg>
        <span className="font-hero-mono text-[12px] font-medium tracking-[0.1em]">INGENIO</span>
      </button>

      {/* Pinned to the window and top-anchored, so its top edge lines up with the
          form card's and it never moves however tall the card grows. The solid
          background is what the orb's screen blend needs to blend against. */}
      <section className="flex flex-col justify-start border-white/8 bg-ink px-6 pb-8 pt-24 sm:px-14 lg:sticky lg:top-0 lg:h-dvh lg:w-2/5 lg:self-start lg:overflow-hidden lg:border-r lg:p-16">
        <h1
          style={{ '--i': 0 }}
          className="reveal-soft font-hero text-[44px] font-normal italic leading-[1.06] text-hero-text sm:text-[52px] lg:text-[46px] xl:text-[60px]"
        >
          Find a name
          <br />
          you can own.
        </h1>
        <p style={{ '--i': 1 }} className="reveal mt-[18px] max-w-[380px] text-[17px] leading-normal text-hero-text/55">
          Tell us about the business and we&apos;ll generate names that fit — checked for domain availability as you go.
        </p>
        <div
          style={{ '--i': 4 }}
          className="fade-in mt-6 hidden w-full max-w-[440px] lg:block lg:[@media(max-height:600px)]:hidden"
        >
          <img
            src={orbUrl}
            alt=""
            className="block aspect-[506/387] w-[min(506px,calc(100%+66px))] max-w-none animate-brief-float object-cover mix-blend-screen motion-reduce:animate-none"
            style={{ objectPosition: '10.1722% 50%', WebkitMaskImage: ORB_MASK, maskImage: ORB_MASK }}
          />
        </div>
      </section>

      <section className="flex items-start px-6 pb-16 sm:px-14 lg:w-3/5 lg:p-16">
        <div
          onPointerDown={skipAhead}
          style={{ '--i': 1 }}
          className="fade-in flex w-full flex-col gap-[22px] rounded-3xl border border-white/8 bg-white/3 p-6 sm:p-10"
        >
          <TextField
            label="Business type"
            placeholder="e.g. Furniture studio, neighbourhood café, invoicing app"
            i={1.5}
            aside={
              <ExampleControls
                mode={mode}
                hasMine={!!mine}
                onFill={() => fillExample(0)}
                onAnother={() => fillExample((exIndex + 1) % BRIEF_EXAMPLES.length)}
                onClear={() => leaveExample(EMPTY)}
                onRestore={() => leaveExample(mine)}
              />
            }
            {...field('businessType')}
          />
          <TextField label="Name" placeholder="e.g. Loom & Carbon" i={2} {...field('name')} />
          <TextField
            label="Description"
            placeholder="What does the business do, and for whom? A sentence or two is plenty."
            multiline
            i={3}
            {...field('description')}
          />
          <TextField
            label="Competitors & keywords"
            placeholder="e.g. Article, Floyd, sustainable, heirloom"
            i={4}
            {...field('competitors')}
          />
          <TextField
            label="Nature & mood"
            placeholder="How should it feel? e.g. warm, minimal, premium, playful"
            i={5}
            {...field('mood')}
          />

          <fieldset style={{ '--i': 6 }} className="reveal min-w-0">
            <LabelRow as="legend" label="Preferred TLD" help={HELP.tld} />
            <div className="flex gap-2.5">
              {['.com', '.io', '.ai'].map((opt) => (
                <label
                  key={opt}
                  className={`relative inline-flex cursor-pointer items-center justify-center rounded-full border border-white/14 px-5 py-[9px] font-hero-mono text-[13px] text-hero-text/60 transition-colors duration-200 hover:border-white/28 hover:bg-white/6 hover:text-hero-text has-checked:border-white/50 has-checked:bg-white/15 has-checked:font-semibold has-checked:text-hero-text has-checked:hover:bg-white/20 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-white ${
                    tldPop && tld === opt ? 'animate-[pop_500ms_cubic-bezier(0.22,1,0.36,1)]' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="tld"
                    value={opt}
                    checked={tld === opt}
                    onChange={() => chooseTld(opt)}
                    className="sr-only"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
            <Tip open={!!shown.tld} n={ORDER.indexOf('tld') + 1}>
              {TIPS.tld(example)}
            </Tip>
          </fieldset>

          <StrengthMeter checks={strength} hasDescription={!!description.trim()} />

          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => onFindNames(values)}
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
            onClick={() => onOpenQuestions(values)}
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
