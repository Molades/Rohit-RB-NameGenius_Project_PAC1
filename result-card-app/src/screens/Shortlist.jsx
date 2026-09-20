import { useState } from 'react'
import TopBar from '../components/TopBar.jsx'
import { Glow, Glyph } from '../components/nameVisuals.jsx'
import { OUTLINE_BTN, PAGE_H1, PANEL } from '../components/ui.js'
import { TLDS, isTldAvailable, placeholderPrice } from '../services/domain.js'

const ROW_BTN =
  'inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border px-3.5 font-hero-mono text-[12px] transition duration-200 active:scale-95'

export default function Shortlist({
  shortlist,
  compareSel,
  onRemove,
  onToggleCompare,
  navCounts,
  onNavigate,
  onOpenQuestions,
}) {
  const [copied, setCopied] = useState(false)
  const [leaving, setLeaving] = useState(null)

  // Let the row fade and collapse before it is actually removed.
  const remove = (item) => {
    if (leaving) return
    setLeaving(item.domain)
    setTimeout(() => {
      onRemove(item)
      setLeaving(null)
    }, 420)
  }

  const copyList = async () => {
    const text = shortlist.map((s) => s.domain).join('\n')
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // clipboard permission denied — still confirm so the flow isn't blocked
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const count = shortlist.length
  const availableCount = shortlist.filter((s) => s.status === 'available').length

  return (
    <main className="relative min-h-dvh bg-ink font-meta text-hero-text">
      <TopBar current="shortlist" counts={navCounts} onNavigate={onNavigate} onOpenQuestions={onOpenQuestions} />

      <div style={{ '--i': 0 }} className="reveal flex flex-wrap items-end justify-between gap-5 px-6 pt-7 sm:px-14">
        <div>
          <h1 className={PAGE_H1}>Shortlist</h1>
          {count > 0 && (
            <p className="mt-2 font-hero-mono text-[12px] tracking-[0.03em] text-hero-text/45">
              {count} saved · {availableCount} available on .com
            </p>
          )}
        </div>
        {count > 0 && (
          <button type="button" onClick={copyList} className={OUTLINE_BTN}>
            {copied ? 'Copied ✓' : 'Copy list'}
          </button>
        )}
      </div>

      {count === 0 ? (
        <div style={{ '--i': 1 }} className={`${PANEL} reveal mx-6 mt-6 flex flex-col items-center gap-4 px-6 py-16 text-center sm:mx-14`}>
          <div className="flex size-16 items-center justify-center rounded-[18px] border border-white/16 bg-[linear-gradient(160deg,#3d3d3d,#161616)] text-hero-text shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_10px_26px_rgba(0,0,0,0.5)]">
            <svg width="26" height="26" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 2.5H12C12.5523 2.5 13 2.94772 13 3.5V13.5L8 10.8L3 13.5V3.5C3 2.94772 3.44772 2.5 4 2.5Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="font-hero text-[28px] italic text-hero-text">Nothing saved yet</h2>
          <p className="max-w-[360px] text-[15px] leading-normal text-hero-text/55">
            Tap the bookmark on any name to keep it here while you keep exploring.
          </p>
          <button type="button" onClick={() => onNavigate('results')} className={OUTLINE_BTN}>
            Go to names
          </button>
        </div>
      ) : (
        <ul className={`${PANEL} mx-6 mb-16 mt-6 overflow-hidden sm:mx-14`}>
          {shortlist.map((item, idx) => {
            const slug = item.domain.replace(/\.com$/, '')
            const visual = item.visual ?? 0
            const isCompared = compareSel.some((s) => s.domain === item.domain)
            const isLeaving = leaving === item.domain
            return (
              <li
                key={item.domain}
                style={{ '--i': idx + 1 }}
                className={`reveal grid border-b transition-[grid-template-rows,opacity,border-color] duration-[420ms] last:border-b-0 ${
                  isLeaving ? 'grid-rows-[0fr] border-transparent opacity-0' : 'grid-rows-[1fr] border-white/8'
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                <div className="group flex flex-wrap items-center gap-x-5 gap-y-4 px-4 py-4 sm:px-5">
                <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-[18px] border border-white/10 bg-[#0d0d0d]">
                  <Glow visual={visual} />
                  <div className="relative flex size-9 items-center justify-center rounded-xl border border-white/16 bg-ink/45 text-hero-text backdrop-blur-[6px]">
                    <Glyph visual={visual} size={18} />
                  </div>
                </div>

                <div className="min-w-0 flex-1 basis-[200px]">
                  <h2 className="break-words font-hero text-[26px] font-normal leading-tight text-hero-text">
                    {item.name}
                  </h2>
                  <p className="mt-0.5 font-hero-mono text-[12px] text-hero-text/45">{item.domain}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {TLDS.map((ext) => {
                    const ok = isTldAvailable(item, ext)
                    return (
                      <span
                        key={ext}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 font-hero-mono text-[11px] text-hero-text/60"
                      >
                        <span className={`size-1.5 rounded-full ${ok ? 'bg-status-ok' : 'bg-status-bad'}`} />
                        {ext}
                        <span className="sr-only">{ok ? 'available' : 'taken'}</span>
                      </span>
                    )
                  })}
                </div>

                <span className="w-[76px] shrink-0 font-hero-mono text-[13px] text-hero-text/55">
                  {placeholderPrice(item.name)}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleCompare(item)}
                    aria-pressed={isCompared}
                    className={`${ROW_BTN} ${
                      isCompared
                        ? 'border-white/50 bg-hero-fill text-ink'
                        : 'border-white/16 text-hero-text/70 hover:border-white/40 hover:text-hero-text'
                    }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <rect x="2" y="3" width="5" height="10" rx="1" stroke="currentColor" strokeWidth="1.4" />
                      <rect x="9" y="3" width="5" height="10" rx="1" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                    Compare
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(item)}
                    aria-label={`Remove ${item.name} from shortlist`}
                    className={`${ROW_BTN} border-white/16 text-hero-text/70 hover:border-white/40 hover:text-hero-text`}
                  >
                    Remove
                  </button>
                </div>
                </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
