import { useEffect, useRef, useState } from 'react'

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// The copy leaves as the hands start to move: it fades, softens and lifts away.
const leaving = (playing) =>
  `transition-[opacity,filter,translate] duration-[750ms] ease-[cubic-bezier(0.33,0,0.2,1)] motion-reduce:transition-none ${
    playing ? 'pointer-events-none -translate-y-2 opacity-0 blur-[6px]' : ''
  }`

function ProceedButton({ onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-hero-fill font-hero-mono text-[14px] font-semibold text-ink transition-[translate,background-color] duration-[250ms] hover:-translate-y-px hover:bg-white ${className}`}
    >
      Proceed <span aria-hidden="true">→</span>
    </button>
  )
}

// Decorative for now — no action wired up yet, same as on every other screen's nav.
function ContactUs({ className = '' }) {
  return (
    <button
      type="button"
      className={`inline-flex cursor-pointer items-center rounded-full border border-white/40 font-meta text-[13px] tracking-[0.03em] text-hero-text transition duration-200 hover:-translate-y-px hover:border-white/65 hover:bg-white/8 active:translate-y-0 active:scale-95 ${className}`}
    >
      Contact Us
    </button>
  )
}

// Home page. Two hands drawn in type (◆ where light falls, · in shadow) rest
// apart like the "Creation of Adam"; Proceed plays a handshake, then moves on
// to the Brief form once it settles. Clicking or pressing Enter, Space or
// Escape during the handshake skips straight to the form. Without WebGL, or
// with reduced motion, Proceed goes straight there.
export default function Landing({ onProceed }) {
  const canvasRef = useRef(null)
  const hands = useRef(null) // the 3D scene, once its model has loaded
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)

  // Move on once, however many ways the user (or the animation) asks to.
  const onProceedRef = useRef(onProceed)
  onProceedRef.current = onProceed
  const left = useRef(false)
  const proceed = useRef(() => {
    if (left.current) return
    left.current = true
    onProceedRef.current()
  }).current

  // Three.js loads only with this page, so the rest of the app never carries it.
  useEffect(() => {
    let live = true
    let scene = null
    import('../components/handshakeScene.js')
      .then(({ createHandshake }) => {
        if (!live) return
        scene = createHandshake(canvasRef.current, {
          modelUrl: `${import.meta.env.BASE_URL}models/hand-right.glb`,
          onReady: () => {
            if (!live) return
            hands.current = scene
            setReady(true)
          },
          onDone: () => live && proceed(),
        })
      })
      .catch(() => {}) // no WebGL: the page works without the hands
    return () => {
      live = false
      hands.current = null
      scene?.dispose()
    }
  }, [])

  // During the handshake, a click or Enter/Space/Escape skips to the form. Added
  // a tick later so the click that started the handshake doesn't count.
  useEffect(() => {
    if (!playing) return
    const skip = (e) => {
      if (e.type === 'keydown' && !['Enter', ' ', 'Escape'].includes(e.key)) return
      proceed()
    }
    const id = setTimeout(() => {
      window.addEventListener('click', skip)
      window.addEventListener('keydown', skip)
    })
    return () => {
      clearTimeout(id)
      window.removeEventListener('click', skip)
      window.removeEventListener('keydown', skip)
    }
  }, [playing])

  const start = () => {
    if (playing) return
    if (!hands.current || prefersReducedMotion()) {
      proceed()
      return
    }
    setPlaying(true)
    hands.current.play()
  }

  return (
    <main className="relative h-dvh min-h-[560px] overflow-hidden bg-ink text-hero-text">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`absolute inset-0 block size-full transition-opacity duration-1000 ease-out ${ready ? 'opacity-100' : 'opacity-0'}`}
      />

      <header className={`absolute inset-x-0 top-0 z-10 flex items-center justify-between px-[22px] pt-6 min-[900px]:px-[78px] min-[900px]:pt-10 ${leaving(playing)}`}>
        <span aria-hidden="true" className="flex w-9 flex-col items-start gap-[7px]">
          <span className="block h-0.5 w-9 bg-[#9a9a97]" />
          <span className="block h-0.5 w-6 bg-[#9a9a97]" />
        </span>
        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 font-hero-mono text-[15px] font-medium tracking-[0.14em] text-[#d8d6d0] min-[900px]:flex">
          <span aria-hidden="true" className="text-[17px] text-hero-text">
            ✦
          </span>
          INGENIO
        </div>
        <ContactUs className="px-[18px] py-2.5 min-[900px]:px-[22px]" />
      </header>

      <div className="pointer-events-none absolute inset-x-0 top-[13vh] z-10 flex flex-col items-center gap-[22px] min-[900px]:top-[15vh]">
        <h1
          className={`m-0 flex flex-col px-[22px] text-center font-hero text-[clamp(36px,10vw,56px)] font-normal italic leading-[1.04] tracking-[-0.02em] min-[900px]:px-0 min-[900px]:text-[clamp(44px,5.4vw,84px)] ${leaving(playing)}`}
        >
          <em className="text-[#7a7a76]">Find a name that fits</em>
          <span>your vision</span>
        </h1>
        <div className={`pointer-events-auto flex w-[min(470px,calc(100%-44px))] flex-col items-center gap-5 text-center ${leaving(playing)}`}>
          <p className="m-0 font-meta text-[16px] leading-normal text-[#8d8d8a] min-[900px]:text-[18px]">
            Explore, generate, claim — a name that turns your idea into a brand people remember.
          </p>
          <ProceedButton onClick={start} className="px-7 py-[15px]" />
        </div>
      </div>
    </main>
  )
}
