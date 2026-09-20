import { useId } from 'react'
import TopBar from '../components/TopBar.jsx'
import { BOTTOM_FADE, FILL_BTN, FLOAT_BAR, PAGE_H1, PANEL, PILL_FIELD } from '../components/ui.js'
import { QUESTIONS } from '../data.js'

function QuestionCard({ index, question, value, onChange }) {
  const id = useId()
  const answered = value.trim() !== ''
  return (
    <section
      style={{ '--i': 1 + (index % 6) }}
      className={`${PANEL} reveal flex flex-col gap-3.5 p-6 transition-colors duration-500 focus-within:border-white/30 ${
        answered ? 'border-white/16' : ''
      }`}
    >
      <div className="flex items-center justify-between font-hero-mono text-[11px] uppercase tracking-[0.08em] text-hero-text/45">
        <span>Q{String(index + 1).padStart(2, '0')}</span>
        <span className="inline-flex items-center gap-1.5">
          {answered && <span className="fade-swap size-1.5 rounded-full bg-status-ok" />}
          {answered ? 'Answered' : 'Optional'}
        </span>
      </div>
      <label htmlFor={id} className="font-hero text-[24px] italic leading-tight text-hero-text">
        {question}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        placeholder="Answer (optional)"
        className={`${PILL_FIELD} min-h-[68px] resize-y rounded-[34px] field-sizing-content`}
      />
    </section>
  )
}

export default function Questions({ answers, onSave, onDone, navCounts, onNavigate, onOpenQuestions }) {
  const answeredCount = QUESTIONS.filter((_, i) => (answers[i] || '').trim()).length
  const percent = (answeredCount / QUESTIONS.length) * 100

  return (
    <main className="relative min-h-dvh bg-ink font-meta text-hero-text">
      <TopBar current="questions" counts={navCounts} onNavigate={onNavigate} onOpenQuestions={onOpenQuestions} />

      <div style={{ '--i': 0 }} className="reveal flex flex-wrap items-end justify-between gap-5 px-6 pt-7 sm:px-14">
        <div>
          <h1 className={PAGE_H1}>Brand questions</h1>
          <p className="mt-2 max-w-[640px] text-[15px] leading-normal text-hero-text/55">
            Answer any subset, any time. Each answer sharpens the next batch of names.
          </p>
        </div>
        <div className="flex items-center gap-3 font-hero-mono text-[12px] tracking-[0.03em] text-hero-text/55">
          <span className="tabular-nums">
            {answeredCount} / {QUESTIONS.length} answered
          </span>
          <div
            role="progressbar"
            aria-label="Questions answered"
            aria-valuemin={0}
            aria-valuemax={QUESTIONS.length}
            aria-valuenow={answeredCount}
            className="h-1.5 w-28 overflow-hidden rounded-full bg-white/8"
          >
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,rgba(242,241,237,0.4),#f2f1ed)] transition-[width] duration-700"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 px-6 pb-[120px] pt-6 sm:px-14 lg:grid-cols-2">
        {QUESTIONS.map((q, i) => (
          <QuestionCard key={q} index={i} question={q} value={answers[i] || ''} onChange={(v) => onSave(i, v)} />
        ))}
      </div>

      <div aria-hidden="true" className={BOTTOM_FADE} />
      <div style={{ '--i': 7 }} className={`${FLOAT_BAR} reveal`}>
        <button type="button" onClick={onDone} className={FILL_BTN}>
          Done
        </button>
      </div>
    </main>
  )
}
