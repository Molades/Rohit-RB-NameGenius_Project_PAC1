import { useState } from 'react'
import handsUrl from '../assets/hero-hands.png'

// Hand centres/radii as a share of the image itself (not the viewport), so the
// hover reveal stays on the hands however the image is cropped.
const REVEAL_MASK =
  'radial-gradient(ellipse 23.75% 42.2% at 22.5% 39.7%, #000 55%, transparent 100%), radial-gradient(ellipse 20% 35.6% at 76.25% 59.6%, #000 55%, transparent 100%)'

function StarMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2 L14.3 9.7 L22 12 L14.3 14.3 L12 22 L9.7 14.3 L2 12 L9.7 9.7 Z" fill="currentColor" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8H13M13 8L9 4M13 8L9 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Landing({ onProceed }) {
  const [reach, setReach] = useState(false)

  const trackGlow = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  const resetGlow = (e) => {
    e.currentTarget.style.removeProperty('--mx')
    e.currentTarget.style.removeProperty('--my')
    setReach(false)
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-black">
      <div
        aria-hidden="true"
        className="hero-in absolute left-1/2 top-[40%] aspect-video -translate-x-1/2 -translate-y-[40%]"
        style={{ width: 'max(100%, min(177.78dvh, 200%))' }}
      >
        <div
          className="absolute inset-0 bg-[length:100%_100%] brightness-[0.55] saturate-[0.6]"
          style={{ backgroundImage: `url(${handsUrl})` }}
        />
        <div
          className={`absolute inset-0 bg-[length:100%_100%] brightness-[1.3] saturate-[1.05] transition-opacity duration-700 ease-in-out motion-reduce:transition-none ${reach ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundImage: `url(${handsUrl})`, WebkitMaskImage: REVEAL_MASK, maskImage: REVEAL_MASK }}
        />
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_60%_46%_at_50%_46%,rgba(0,0,0,0.4)_0%,rgba(0,0,0,0)_70%)]"
      />

      <div style={{ '--i': 6 }} className="fade-in absolute left-6 top-8 z-10 flex items-center gap-2.5 text-hero-text sm:left-14">
        <StarMark />
        <span className="font-hero-mono text-[15px] font-semibold tracking-[0.14em]">INGENIO</span>
      </div>
      <button
        type="button"
        style={{ '--i': 7 }}
        className="fade-in absolute right-6 top-8 z-10 inline-flex cursor-pointer items-center rounded-full border border-white/40 px-[22px] py-2.5 font-meta text-[13px] tracking-[0.03em] text-hero-text transition duration-200 hover:-translate-y-px hover:border-white/65 hover:bg-white/8 active:translate-y-0 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:right-14"
      >
        Contact Us
      </button>

      <div className="relative z-10 flex flex-col items-center gap-10 px-6 text-center sm:px-16">
        <h1 style={{ '--i': 1 }} className="reveal-soft max-w-[900px] font-hero text-[44px] font-normal italic leading-[1.08] text-hero-text text-balance sm:text-[64px] lg:text-[78px]">
          Great names, minus the guesswork.
          <span className="mt-3.5 block text-[24px] text-hero-text/60 sm:text-[32px] lg:text-[40px]">
            Unique, available, yours.
          </span>
        </h1>

        <button
          type="button"
          onClick={onProceed}
          onMouseEnter={() => setReach(true)}
          onMouseMove={trackGlow}
          onMouseLeave={resetGlow}
          onFocus={() => setReach(true)}
          onBlur={() => setReach(false)}
          style={{ '--i': 5 }}
          className="reveal group relative inline-flex cursor-pointer items-center overflow-hidden rounded-full border border-white/40 bg-[linear-gradient(135deg,rgba(255,255,255,0.22),rgba(255,255,255,0.04)_60%,rgba(0,0,0,0.12))] px-[34px] py-[17px] font-meta text-[16px] font-semibold tracking-[0.01em] text-hero-text shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-1px_12px_rgba(255,255,255,0.05),0_8px_28px_rgba(0,0,0,0.35)] backdrop-blur-[18px] backdrop-saturate-[1.6] transition duration-200 hover:-translate-y-px hover:border-white/65 hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.3),rgba(255,255,255,0.06)_60%,rgba(0,0,0,0.14))] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-1px_14px_rgba(255,255,255,0.08),0_10px_34px_rgba(0,0,0,0.4)] active:translate-y-0 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(120px_circle_at_var(--mx,50%)_var(--my,50%),rgba(255,255,255,0.55),rgba(255,255,255,0.08)_55%,transparent_75%)] opacity-0 transition-opacity duration-[250ms] group-hover:opacity-100"
          />
          <span className="relative inline-flex items-center gap-2.5">
            <span>Proceed</span>
            <ArrowIcon />
          </span>
        </button>
      </div>
    </main>
  )
}
