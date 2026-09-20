import { useState } from 'react'
import { TLDS, isTldAvailable, placeholderPrice } from '../services/domain.js'
import { Glow, Glyph } from './nameVisuals.jsx'

const ROUND_BTN =
  'inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full border p-0 backdrop-blur-[6px] transition duration-200 active:scale-90'
const ROUND_BTN_IDLE = 'border-white/18 bg-ink/45 text-white/85 hover:border-white/40 hover:bg-ink/65 hover:text-hero-text'
const ROUND_BTN_ON = 'border-white/50 bg-hero-fill text-ink'

function ArrowOut() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 12L12 4M12 4H5M12 4V11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function NameCard({
  item,
  index,
  primaryTld,
  isShortlisted,
  isCompared,
  revealIndex = 0,
  onToggleShortlist,
  onToggleCompare,
}) {
  const [copied, setCopied] = useState(false)

  const slug = item.domain.replace(/\.com$/, '')
  const isAvailable = (ext) => isTldAvailable(item, ext)
  const visual = item.visual ?? index

  const primaryDomain = slug + primaryTld
  const primaryAvailable = isAvailable(primaryTld)
  const alternates = TLDS.filter((ext) => ext !== primaryTld)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(primaryDomain)
    } catch {
      // clipboard permission denied — the UI still confirms so the flow isn't blocked
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const ctaHover =
    'group-hover:pr-3.5 group-focus-within:pr-3.5 ' +
    (primaryAvailable
      ? 'group-hover:bg-hero-fill group-hover:text-ink group-focus-within:bg-hero-fill group-focus-within:text-ink'
      : 'group-hover:border-white/30 group-hover:bg-transparent group-focus-within:border-white/30 group-focus-within:bg-transparent')

  return (
    <article
      style={{ '--i': revealIndex }}
      className="reveal group overflow-hidden rounded-3xl border border-white/8 bg-[#0d0d0d] shadow-[0_14px_30px_rgba(0,0,0,0.35)] transition-[translate,box-shadow,border-color] duration-500 hover:-translate-y-1 hover:border-white/16 hover:shadow-[0_26px_54px_rgba(0,0,0,0.55)]"
    >
      <div className="relative flex h-[168px] items-center justify-center">
        <Glow visual={visual} />
        <div className="absolute inset-x-4 top-3.5 flex items-center justify-between">
          <span
            key={primaryTld}
            className="fade-swap inline-flex items-center gap-1.5 font-hero-mono text-[10px] uppercase tracking-[0.05em] text-white/85"
          >
            <span className={`size-1.5 rounded-full ${primaryAvailable ? 'bg-status-ok' : 'bg-status-bad'}`} />
            {primaryAvailable ? 'Available' : 'Taken'}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-hero-mono text-[10px] text-white/45">{String(index + 1).padStart(2, '0')}</span>
            <button
              type="button"
              onClick={onToggleCompare}
              aria-pressed={isCompared}
              aria-label={isCompared ? 'Remove from compare' : 'Add to compare'}
              title={isCompared ? 'Remove from compare' : 'Add to compare'}
              className={`${ROUND_BTN} ${isCompared ? ROUND_BTN_ON : ROUND_BTN_IDLE}`}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="2" y="3" width="5" height="10" rx="1" stroke="currentColor" strokeWidth="1.4" />
                <rect x="9" y="3" width="5" height="10" rx="1" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onToggleShortlist}
              aria-pressed={isShortlisted}
              aria-label={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
              title={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
              className={`${ROUND_BTN} ${isShortlisted ? ROUND_BTN_ON : ROUND_BTN_IDLE}`}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill={isShortlisted ? 'currentColor' : 'none'} aria-hidden="true">
                <path d="M4 2.5H12C12.5523 2.5 13 2.94772 13 3.5V13.5L8 10.8L3 13.5V3.5C3 2.94772 3.44772 2.5 4 2.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
        <div className="relative z-[1] flex size-16 items-center justify-center rounded-[18px] border border-white/16 bg-[rgba(18,18,18,0.55)] text-hero-text shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_10px_26px_rgba(0,0,0,0.35)] backdrop-blur-[10px]">
          <Glyph visual={visual} />

        </div>
      </div>

      <div className="p-5">
        <h3 className="mb-[5px] break-words font-hero text-[23px] font-normal text-hero-text">{item.name}</h3>
        <div className="flex items-center gap-1.5">
          <span key={primaryDomain} className="fade-swap font-hero-mono text-[12px] text-hero-text/45">
            {primaryDomain}
          </span>
          <button
            type="button"
            onClick={copy}
            aria-label="Copy domain"
            title="Copy domain"
            className={`inline-flex size-5 cursor-pointer items-center justify-center rounded-full p-0 transition-colors duration-200 hover:bg-white/10 ${
              copied ? 'text-status-ok' : 'text-hero-text/45 hover:text-hero-text'
            }`}
          >
            {copied ? (
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M3 10.5V3.5C3 2.94772 3.44772 2.5 4 2.5H10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>

        <div key={primaryTld} className="fade-swap mt-[9px] flex flex-col gap-1">
          {alternates.map((ext) => (
            <div key={ext} className="flex items-center justify-between gap-2.5 font-hero-mono text-[11px]">
              <span className="text-hero-text/40">{slug + ext}</span>
              <span
                className={`text-[10px] uppercase tracking-[0.04em] ${isAvailable(ext) ? 'text-status-ok' : 'text-status-bad'}`}
              >
                {isAvailable(ext) ? 'Available' : 'Taken'}
              </span>
            </div>
          ))}
        </div>

        <hr className="mb-3.5 mt-4 border-0 border-t border-white/8" />
        <div className="flex items-center justify-between">
          <span className="font-hero-mono text-[13px] text-hero-text/55">{placeholderPrice(item.name)}</span>
          <button
            type="button"
            className={`inline-flex h-[30px] cursor-pointer items-center overflow-hidden rounded-full border border-transparent bg-white/7 p-0 text-hero-text transition-[background,padding,color,border-color] duration-[250ms] ${ctaHover}`}
          >
            <span className="flex size-[30px] shrink-0 items-center justify-center">
              <ArrowOut />
            </span>
            <span className="max-w-0 overflow-hidden whitespace-nowrap font-meta text-[12px] font-semibold opacity-0 transition-[max-width,opacity] duration-300 group-hover:max-w-[140px] group-hover:opacity-100 group-focus-within:max-w-[140px] group-focus-within:opacity-100">
              {primaryAvailable ? 'Register' : 'Whois'}
            </span>
          </button>
        </div>
      </div>
    </article>
  )
}
