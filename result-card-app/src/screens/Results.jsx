import { useState } from 'react'
import NameCard from '../components/NameCard.jsx'
import TopBar from '../components/TopBar.jsx'
import { BOTTOM_FADE, FILL_BTN, FLOAT_BAR, OUTLINE_BTN, PAGE_H1, PANEL, PILL_FIELD } from '../components/ui.js'
import { TLDS } from '../services/domain.js'

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
  onRegenerate,
  onToggleShortlist,
  onToggleCompare,
  onAnswerFollowUp,
  onSkipFollowUp,
}) {
  const [answerDraft, setAnswerDraft] = useState('')

  const count = results.length
  const title = `${count} ${count === 1 ? 'name' : 'names'} for ${brief.name || 'your brand'}`

  return (
    <main className="relative min-h-dvh bg-ink font-meta text-hero-text">
      <TopBar current="results" counts={navCounts} onNavigate={onNavigate} onOpenQuestions={onOpenQuestions} />

      <div style={{ '--i': 0 }} className="reveal flex flex-wrap items-center justify-between gap-5 px-6 pt-7 sm:px-14">
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
        <div className={`${PANEL} reveal mx-6 mt-6 flex flex-col gap-3.5 p-6 sm:mx-14`}>
          <p className="font-hero-mono text-[11px] uppercase tracking-[0.08em] text-hero-text/45">Brand question</p>
          <p className="font-hero text-[24px] italic leading-tight text-hero-text">{pendingQuestion}</p>
          <textarea
            autoFocus
            value={answerDraft}
            onChange={(e) => setAnswerDraft(e.target.value)}
            rows={2}
            placeholder="Answer to sharpen the next batch..."
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
          className={`${PANEL} reveal mx-6 mt-6 flex items-center gap-4 sm:mx-14 ${
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
          <div className={`${PANEL} mx-6 mt-6 flex flex-col items-center gap-4 px-6 py-14 text-center sm:mx-14`}>
            <p className="text-[15px] text-hero-text/55">No names yet — fill in a brief to generate some.</p>
            <button type="button" onClick={() => onNavigate('brief')} className={OUTLINE_BTN}>
              Go to brief
            </button>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 gap-5 px-6 pb-[110px] pt-[22px] sm:grid-cols-2 sm:px-14 lg:grid-cols-3 xl:grid-cols-4">
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
        <button type="button" onClick={onRegenerate} disabled={pendingQuestion !== null} className={FILL_BTN}>
          Regenerate more
        </button>
        <button type="button" onClick={() => onNavigate('brief')} className={OUTLINE_BTN}>
          Change Details
        </button>
      </div>
    </main>
  )
}
