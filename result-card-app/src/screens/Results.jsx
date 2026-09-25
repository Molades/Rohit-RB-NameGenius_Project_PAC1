import { useEffect, useRef, useState } from 'react'
import NameCard from '../components/NameCard.jsx'
import TopBar from '../components/TopBar.jsx'
import { BOTTOM_FADE, FILL_BTN, FLOAT_BAR, OUTLINE_BTN, PAGE_H1, PANEL, PILL_FIELD } from '../components/ui.js'
import { TLDS } from '../services/domain.js'

const scrollBehavior = () => (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth')

function Spinner() {
  return (
    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export default function Results({
  brief,
  results,
  error,
  onRetry,
  primaryTld,
  onPrimaryTldChange,
  shortlist,
  compareSel,
  navCounts,
  onNavigate,
  onOpenQuestions,
  pendingQuestion,
  pendingPlaceholder,
  regenerating,
  onRegenerate,
  onToggleShortlist,
  onToggleCompare,
  onAnswerFollowUp,
  onSkipFollowUp,
}) {
  const [answerDraft, setAnswerDraft] = useState('')

  // The heading row sticks to the top from tablet width up. `stuck` flips once
  // the page has scrolled past it, so the frosted bar and its underline only
  // appear then and the resting layout is untouched.
  const sentinelRef = useRef(null)
  const [stuck, setStuck] = useState(false)
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Regenerating happens in place, so bring the result into view: the first new
  // card when more names were added, or the top of the page when something up
  // there needs attention (an error, or the next brand question).
  const gridRef = useRef(null)
  const previousCount = useRef(results.length)
  useEffect(() => {
    const before = previousCount.current
    previousCount.current = results.length
    if (before === 0 || results.length <= before || pendingQuestion !== null) return
    const card = gridRef.current?.children[before]
    if (!card) return
    const offset = window.innerWidth >= 640 ? 112 : 24
    // offsetTop, not getBoundingClientRect: the card is still mid entrance animation.
    window.scrollTo({ top: card.offsetTop - offset, behavior: scrollBehavior() })
  }, [results.length])
  useEffect(() => {
    if (error) window.scrollTo({ top: 0, behavior: scrollBehavior() })
  }, [error])

  const count = results.length
  const title = `${count} ${count === 1 ? 'name' : 'names'} for ${brief.name || 'your brand'}`

  return (
    <main className="relative min-h-dvh bg-ink font-meta text-hero-text">
      <TopBar current="results" counts={navCounts} onNavigate={onNavigate} onOpenQuestions={onOpenQuestions} />

      <div ref={sentinelRef} aria-hidden="true" className="h-px" />
      <div
        style={{ '--i': 0 }}
        className={`reveal mt-[11px] flex flex-wrap items-center justify-between gap-5 border-b border-transparent px-6 pb-[15px] pt-4 transition-[background-color,border-color] duration-300 sm:sticky sm:top-0 sm:z-[6] sm:px-14 ${
          stuck ? 'sm:border-white/8 sm:bg-ink/85 sm:backdrop-blur-[14px]' : ''
        }`}
      >
        <h1 className={PAGE_H1}>{title}</h1>
        <div
          role="group"
          aria-label="Primary TLD"
          className="relative inline-flex items-center gap-0.5 rounded-full border border-white/10 bg-white/5 p-1.5"
        >
          <span
            aria-hidden="true"
            className="absolute inset-y-1.5 left-1.5 w-[62px] rounded-full bg-white/8 transition-transform duration-500"
            style={{ transform: `translateX(${Math.max(0, TLDS.indexOf(primaryTld)) * 64}px)` }}
          />
          {TLDS.map((opt) => (
            <button
              key={opt}
              type="button"
              aria-pressed={primaryTld === opt}
              onClick={() => onPrimaryTldChange(opt)}
              className={`relative w-[62px] cursor-pointer whitespace-nowrap rounded-full py-2 text-center font-hero-mono text-[12px] transition-colors duration-300 ${
                primaryTld === opt ? 'font-semibold text-hero-text' : 'text-hero-text/50 hover:text-hero-text'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {pendingQuestion && (
        <div className={`${PANEL} reveal mx-6 mt-2 flex flex-col gap-3.5 p-6 sm:mx-14`}>
          <p className="font-hero-mono text-[11px] uppercase tracking-[0.08em] text-hero-text/45">Brand question</p>
          <p className="font-hero text-[24px] italic leading-tight text-hero-text">{pendingQuestion}</p>
          <textarea
            autoFocus
            value={answerDraft}
            onChange={(e) => setAnswerDraft(e.target.value)}
            rows={2}
            placeholder={pendingPlaceholder || 'Answer to sharpen the next batch...'}
            aria-label="Your answer"
            className={`${PILL_FIELD} min-h-[68px] resize-y rounded-[34px] field-sizing-content`}
          />
          <div className="flex items-center gap-4">
            <button
              type="button"
              disabled={!answerDraft.trim()}
              onClick={() => {
                onAnswerFollowUp(answerDraft)
                setAnswerDraft('')
              }}
              className={FILL_BTN}
            >
              Use this answer
            </button>
            <button
              type="button"
              onClick={onSkipFollowUp}
              className="cursor-pointer text-[14px] text-hero-text/55 transition-colors duration-200 hover:text-hero-text"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className={`${PANEL} reveal mx-6 mt-2 flex items-center gap-4 sm:mx-14 ${
            count === 0 ? 'flex-col px-6 py-14 text-center' : 'flex-wrap justify-between px-6 py-4'
          }`}
        >
          <p className="text-[15px] text-hero-text/55">{error}</p>
          <button type="button" onClick={onRetry} className={OUTLINE_BTN}>
            Try again
          </button>
        </div>
      )}

      {count === 0 ? (
        !error && (
          <div className={`${PANEL} mx-6 mt-2 flex flex-col items-center gap-4 px-6 py-14 text-center sm:mx-14`}>
            <p className="text-[15px] text-hero-text/55">No names yet — fill in a brief to generate some.</p>
            <button type="button" onClick={() => onNavigate('brief')} className={OUTLINE_BTN}>
              Go to brief
            </button>
          </div>
        )
      ) : (
        <div ref={gridRef} className="grid grid-cols-1 gap-5 px-6 pb-[110px] pt-1.5 sm:grid-cols-2 sm:px-14 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((item, i) => (
            <NameCard
              key={item.domain}
              item={item}
              index={i}
              revealIndex={1 + (i % 10) * 0.6}
              primaryTld={primaryTld}
              isShortlisted={shortlist.some((s) => s.domain === item.domain)}
              isCompared={compareSel.some((s) => s.domain === item.domain)}
              onToggleShortlist={() => onToggleShortlist(item)}
              onToggleCompare={() => onToggleCompare(item)}
            />
          ))}
        </div>
      )}

      <div aria-hidden="true" className={BOTTOM_FADE} />
      <div style={{ '--i': 6 }} className={`${FLOAT_BAR} reveal`}>
        <button
          type="button"
          onClick={onRegenerate}
          disabled={pendingQuestion !== null}
          aria-busy={regenerating}
          className={`${FILL_BTN} inline-flex min-w-[168px] items-center justify-center gap-2 ${regenerating ? 'pointer-events-none' : ''}`}
        >
          {regenerating ? (
            <>
              <Spinner />
              Regenerating
            </>
          ) : (
            'Regenerate more'
          )}
        </button>
        <span role="status" className="sr-only">
          {regenerating ? 'Regenerating names' : ''}
        </span>
        <button type="button" onClick={() => onNavigate('brief')} className={OUTLINE_BTN}>
          Change Details
        </button>
      </div>
    </main>
  )
}
