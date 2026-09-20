import { memo, useEffect, useRef } from 'react'

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

const GLOSS =
  "radial-gradient(ellipse 75% 46% at 30% 10%, rgba(255,255,255,0.24), transparent 62%), url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 2 L14.3 9.7 L22 12 L14.3 14.3 L12 22 L9.7 14.3 L2 12 L9.7 9.7 Z' fill='black' fill-opacity='0.55'/%3E%3C/svg%3E\") no-repeat center 44% / 30px 30px"

// [name, from, via, to] — decorative sample names, not real results.
const ROW_ONE = [
  ['Fieldnote', '#ded6a6', '#96906a', '#6d6850'],
  ['Nimbusly', '#bcc6f4', '#6c63aa', '#493a54'],
  ['Heirlume', '#f2babf', '#ba646f', '#5c3038'],
  ['Loamwright', '#9fd8cf', '#4a9a8f', '#23524c'],
  ['Solidgrain', '#f1ede0', '#bab09b', '#8f8570'],
  ['Burlkin', '#d7b8f0', '#8a5fc2', '#402868'],
  ['Grainhouse', '#f5c98a', '#c17f3a', '#6e451c'],
]
const ROW_TWO = [
  ['Kerfwood', '#a9b8c9', '#5c7089', '#2c3a4a'],
  ['Timberkin', '#c3d1ad', '#7c9463', '#3e4f2f'],
  ['Knotwell', '#e3a68a', '#a35d3c', '#562e1c'],
  ['Woodkin', '#ded6a6', '#96906a', '#6d6850'],
  ['Maplekin', '#bcc6f4', '#6c63aa', '#493a54'],
  ['Reclaimwright', '#f2babf', '#ba646f', '#5c3038'],
  ['Hearthstead', '#9fd8cf', '#4a9a8f', '#23524c'],
]

// One full set of cards is 7 × (180px card + 56px gap) = 1652px, so the
// scroll keyframes translate by exactly that for a seamless loop. Repeated
// three times so the track still covers very wide screens.
const repeated = (row) => [...row, ...row, ...row]

function WheelCard({ name, from, via, to }) {
  return (
    <div
      className="relative isolate flex h-[250px] w-[180px] shrink-0 items-end overflow-hidden rounded-[22px] border border-white/22 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-28px_48px_rgba(0,0,0,0.18),0_16px_30px_rgba(0,0,0,0.4)] backdrop-blur-[24px] backdrop-saturate-[0.95] [filter:saturate(0.55)_brightness(0.88)]"
      style={{ background: `linear-gradient(160deg, ${from}, ${via} 55%, ${to} 100%)` }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.16] mix-blend-overlay"
        style={{ backgroundImage: NOISE, backgroundSize: '140px 140px' }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] mix-blend-soft-light"
        style={{ background: GLOSS }}
      />
      <span className="relative z-[2] rounded-full bg-ink/40 px-2.5 py-1 font-hero-mono text-[12px] text-hero-text backdrop-blur-[6px]">
        {name}
      </span>
    </div>
  )
}

function stageLabel(progress) {
  if (progress >= 100) return 'Ready'
  if (progress >= 70) return 'Checking domains'
  return 'Generating names'
}

// Critically damped spring toward `target` (the "SmoothDamp" used in game
// cameras): it accelerates into a new target and eases out of it, with no
// abrupt change of speed when the target jumps — which is what makes stage
// changes feel like one continuous motion instead of a snap.
function smoothDamp(current, target, velocity, smoothTime, dt) {
  const omega = 2 / smoothTime
  const x = omega * dt
  const decay = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x)
  const change = current - target
  const temp = (velocity + omega * change) * dt
  let nextVelocity = (velocity - omega * temp) * decay
  let value = target + (change + temp) * decay
  if (target - current > 0 === value > target) {
    value = target
    nextVelocity = 0
  }
  return [value, nextVelocity]
}

// The scrolling wall of cards never changes, so it is memoised: the App
// re-renders several times a second with new progress and this stays untouched.
const Wheel = memo(function Wheel() {
  return (
    <div
      aria-hidden="true"
      style={{ '--i': 4 }}
      className="fade-in absolute left-0 top-[300px] h-[662px] w-full overflow-hidden bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(255,255,255,0.03),transparent_70%)]"
    >
      <div className="pointer-events-none absolute inset-0 z-[3] bg-[linear-gradient(to_right,#0a0a0a_0%,transparent_8%,transparent_92%,#0a0a0a_100%)]" />
      <div className="absolute left-0 top-[53px] h-[250px] w-full">
        <div className="flex w-max gap-14 animate-row-scroll-left motion-reduce:animate-none">
          {repeated(ROW_ONE).map(([name, from, via, to], i) => (
            <WheelCard key={i} name={name} from={from} via={via} to={to} />
          ))}
        </div>
      </div>
      <div className="absolute left-0 top-[359px] h-[250px] w-full">
        <div className="-ml-[118px] flex w-max gap-14 animate-row-scroll-right motion-reduce:animate-none">
          {repeated(ROW_TWO).map(([name, from, via, to], i) => (
            <WheelCard key={i} name={name} from={from} via={via} to={to} />
          ))}
        </div>
      </div>
    </div>
  )
})

export default function Generating({ progress = 0 }) {
  const barRef = useRef(null)
  const pctRef = useRef(null)
  const targetRef = useRef(progress)
  targetRef.current = progress
  const done = progress >= 100

  // The bar and number follow the real progress with spring physics each frame
  // (via refs, so React isn't involved 60 times a second). It settles faster
  // for the final leg so 100% lands, and is readable, before we move on.
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let value = 0
    let velocity = 0
    let last = performance.now()
    let raf
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const target = targetRef.current
      if (reduceMotion) {
        value = target
      } else {
        ;[value, velocity] = smoothDamp(value, target, velocity, target >= 100 ? 0.18 : 0.42, dt)
        if (Math.abs(target - value) < 0.05) {
          value = target
          velocity = 0
        }
      }
      barRef.current.style.width = `${value}%`
      pctRef.current.textContent = `${Math.round(value)}%`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <main className="relative h-dvh min-h-[560px] overflow-hidden bg-ink font-meta">
      <div className="fade-in absolute left-6 top-8 z-10 flex items-center gap-2 text-hero-text opacity-40 sm:left-14">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2 L14.3 9.7 L22 12 L14.3 14.3 L12 22 L9.7 14.3 L2 12 L9.7 9.7 Z" fill="currentColor" />
        </svg>
        <span className="font-hero-mono text-[12px] font-medium tracking-[0.1em]">INGENIO</span>
      </div>

      <Wheel />

      <div
        role="status"
        className="absolute left-1/2 top-24 z-[5] w-[440px] max-w-[calc(100%-48px)] -translate-x-1/2 text-center"
      >
        <h1 style={{ '--i': 0 }} className="reveal-soft font-hero text-[30px] font-normal italic text-hero-text sm:text-[36px]">
          Crafting names for your business
        </h1>
        <p style={{ '--i': 1 }} className="reveal mt-2.5 text-[16px] text-hero-text/40">
          This usually takes a few seconds.
        </p>
        <div style={{ '--i': 3 }} className="reveal mx-auto mt-[26px] w-[min(360px,100%)]">
          <div
            role="progressbar"
            aria-label="Generating names"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            className="h-1.5 rounded-full bg-white/8"
          >
            <div
              ref={barRef}
              className="relative h-full w-0 overflow-hidden rounded-full bg-[linear-gradient(90deg,rgba(242,241,237,0.4),#f2f1ed)] shadow-[0_0_14px_rgba(242,241,237,0.3)]"
            >
              <span
                aria-hidden="true"
                className={`absolute inset-y-0 left-0 w-2/5 animate-sheen bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.8),transparent)] transition-opacity duration-500 ${
                  done ? 'opacity-0' : 'opacity-100'
                }`}
              />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between font-hero-mono text-[11px] uppercase tracking-[0.08em] text-hero-text/45">
            <span key={stageLabel(progress)} className="fade-swap">
              {stageLabel(progress)}
            </span>
            <span ref={pctRef} aria-hidden="true" className="tabular-nums text-hero-text/70">
              0%
            </span>
          </div>
        </div>
      </div>
    </main>
  )
}
