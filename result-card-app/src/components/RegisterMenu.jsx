import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { REGISTRARS } from '../services/registrars.js'

const PANEL_WIDTH = 248
// Open upward when there is at least this much room above the button.
const ROOM_ABOVE = 230

function ArrowOut() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 12L12 4M12 4H5M12 4V11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// The Register button on an available name card. It opens a small menu of
// registrars, each a link to that registrar's search page for this domain.
// The menu is portalled to <body> (cards clip their contents) and positioned
// from the button, so it closes on scroll or resize rather than drifting.
// `hoverClass` carries the card-hover styling from the parent group.
export default function RegisterMenu({ domain, hoverClass }) {
  const [pos, setPos] = useState(null)
  const buttonRef = useRef(null)
  const panelRef = useRef(null)
  const open = pos !== null

  const close = (refocus) => {
    setPos(null)
    if (refocus) buttonRef.current?.focus()
  }

  const toggle = () => {
    if (open) return close(false)
    const rect = buttonRef.current.getBoundingClientRect()
    const right = Math.max(8, document.documentElement.clientWidth - rect.right)
    setPos(rect.top > ROOM_ABOVE ? { right, bottom: window.innerHeight - rect.top + 8 } : { right, top: rect.bottom + 8 })
  }

  useEffect(() => {
    if (!open) return
    panelRef.current?.querySelector('a')?.focus()
    const inside = (node) => panelRef.current?.contains(node) || buttonRef.current?.contains(node)
    const onPointerDown = (e) => {
      if (!inside(e.target)) close(false)
    }
    const onFocusIn = (e) => {
      if (!inside(e.target)) close(false)
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') close(true)
    }
    const dismiss = () => close(false)
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('scroll', dismiss, { passive: true })
    window.addEventListener('resize', dismiss)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', dismiss)
      window.removeEventListener('resize', dismiss)
    }
  }, [open])

  // Arrow keys move between registrars.
  const onPanelKeyDown = (e) => {
    const links = [...panelRef.current.querySelectorAll('a')]
    const at = links.indexOf(document.activeElement)
    const next = { ArrowDown: at + 1, ArrowUp: at - 1, Home: 0, End: links.length - 1 }[e.key]
    if (next === undefined) return
    e.preventDefault()
    links[(next + links.length) % links.length].focus()
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Register ${domain}`}
        className={`inline-flex h-[30px] cursor-pointer items-center overflow-hidden rounded-full border border-transparent p-0 transition-[background,padding,color,border-color] duration-[250ms] [@media(hover:none)]:pr-3.5 ${hoverClass} ${
          open ? 'bg-hero-fill pr-3.5 text-ink' : 'bg-white/7 text-hero-text'
        }`}
      >
        <span className="flex size-[30px] shrink-0 items-center justify-center">
          <ArrowOut />
        </span>
        <span
          className={`overflow-hidden whitespace-nowrap font-meta text-[12px] font-semibold transition-[max-width,opacity] duration-300 group-hover:max-w-[140px] group-hover:opacity-100 group-focus-within:max-w-[140px] group-focus-within:opacity-100 [@media(hover:none)]:max-w-[140px] [@media(hover:none)]:opacity-100 ${
            open ? 'max-w-[140px] opacity-100' : 'max-w-0 opacity-0'
          }`}
        >
          Register
        </span>
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            role="menu"
            aria-label={`Register ${domain}`}
            onKeyDown={onPanelKeyDown}
            style={{ position: 'fixed', width: PANEL_WIDTH, right: pos.right, top: pos.top, bottom: pos.bottom }}
            className="fade-swap z-50 rounded-2xl border border-white/14 bg-[rgba(20,20,20,0.96)] p-1.5 font-meta shadow-[0_24px_54px_rgba(0,0,0,0.6)] backdrop-blur-[16px]"
          >
            <p className="truncate px-3 pb-1.5 pt-2 font-hero-mono text-[10px] uppercase tracking-[0.06em] text-hero-text/45">
              Register <span className="normal-case text-hero-text/80">{domain}</span>
            </p>
            {REGISTRARS.map((registrar) => (
              <a
                key={registrar.id}
                role="menuitem"
                href={registrar.url(domain)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => close(false)}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-semibold text-hero-text transition-colors duration-150 hover:bg-white/8 focus-visible:bg-white/8 focus-visible:outline-none"
              >
                {registrar.name}
                <ArrowOut />
              </a>
            ))}
            <p className="px-3 pb-2 pt-1.5 text-[11px] leading-snug text-hero-text/40">
              Opens in a new tab. The registrar sets the final price.
            </p>
          </div>,
          document.body
        )}
    </>
  )
}
