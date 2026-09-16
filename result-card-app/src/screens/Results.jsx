import { useState } from 'react'
import ResultCard from '../components/ResultCard.jsx'

const TLD_OPTIONS = ['any', '.com', '.io', '.ai']
const LENGTH_OPTIONS = [
  { key: 'any', label: 'Any' },
  { key: 'short', label: 'Short (≤10)' },
  { key: 'long', label: 'Long (>10)' },
]

function primaryTld(domain) {
  return '.' + domain.split('.').pop()
}
function nameLength(domain) {
  return domain.slice(0, domain.lastIndexOf('.')).length
}
function matchesFilters(item, filters) {
  if (filters.tld !== 'any' && primaryTld(item.domain) !== filters.tld) return false
  if (filters.length === 'short' && nameLength(item.domain) > 10) return false
  if (filters.length === 'long' && nameLength(item.domain) <= 10) return false
  return true
}

export default function Results({
  brief,
  results,
  isChecking,
  error,
  onRetry,
  filters,
  onFiltersChange,
  shortlist,
  compareSel,
  pendingQuestion,
  onRegenerate,
  onToggleShortlist,
  onToggleCompare,
  onAnswerFollowUp,
  onSkipFollowUp,
}) {
  const [answerDraft, setAnswerDraft] = useState('')
  const [copiedDomain, setCopiedDomain] = useState(null)

  const visible = results.filter((r) => matchesFilters(r, filters))

  const copy = async (domain) => {
    try {
      await navigator.clipboard.writeText(domain)
    } catch {
      // clipboard permission denied — the UI still confirms so the flow isn't blocked
    }
    setCopiedDomain(domain)
    setTimeout(() => setCopiedDomain((d) => (d === domain ? null : d)), 1500)
  }

  return (
    <main className="flex justify-center bg-canvas px-6 py-10 sm:px-16 sm:py-16">
      <div className="flex w-full max-w-[1080px] flex-col gap-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-[28px] font-bold leading-[30px] tracking-[-0.4px] text-ink">
            5 names for {brief.name || 'your brand'}
          </h1>
          <button
            type="button"
            onClick={onRegenerate}
            disabled={pendingQuestion !== null || isChecking}
            className="border border-ink bg-paper px-5 py-3 font-meta text-[12px] font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            Regenerate 5 more
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            {TLD_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onFiltersChange({ ...filters, tld: opt })}
                className={`border px-[14px] py-[6px] font-meta text-[12px] font-semibold ${
                  filters.tld === opt ? 'border-ink bg-ink text-paper' : 'border-border bg-paper text-meta'
                }`}
              >
                TLD: {opt === 'any' ? 'Any' : opt}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {LENGTH_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => onFiltersChange({ ...filters, length: opt.key })}
                className={`border px-[14px] py-[6px] font-meta text-[12px] font-semibold ${
                  filters.length === opt.key ? 'border-ink bg-ink text-paper' : 'border-border bg-paper text-meta'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <div className="flex flex-col items-center gap-3 border border-border bg-paper px-5 py-10 text-center">
            <p className="font-meta text-[12px] text-meta">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="border border-ink bg-paper px-5 py-2 font-meta text-[12px] font-semibold text-ink"
            >
              Try again
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="border border-border bg-paper px-5 py-8 text-center">
            <p className="font-meta text-[12px] text-meta">No results match these filters. Try widening them.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-5">
            {visible.map((r) => (
              <div key={r.domain} className="flex flex-col gap-1">
                <ResultCard
                  name={r.name}
                  domain={r.domain}
                  status={isChecking ? 'loading' : r.status}
                  tlds={r.tlds}
                  onCopy={() => copy(r.domain)}
                  onToggleShortlist={() => onToggleShortlist(r)}
                  isShortlisted={shortlist.some((s) => s.domain === r.domain)}
                  onToggleCompare={() => onToggleCompare(r)}
                  isCompared={compareSel.some((s) => s.domain === r.domain)}
                />
                {copiedDomain === r.domain && (
                  <p className="font-meta text-[11px] text-meta">Copied {r.domain}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {pendingQuestion ? (
          <div className="flex flex-col gap-3 border border-ink bg-paper px-5 py-5">
            <p className="font-meta text-[12px] font-semibold text-ink">{pendingQuestion}</p>
            <textarea
              autoFocus
              value={answerDraft}
              onChange={(e) => setAnswerDraft(e.target.value)}
              rows={2}
              placeholder="Answer to sharpen the next batch..."
              className="border border-border px-4 py-[10px] font-meta text-[12px] outline-none focus:border-ink"
            />
            <div className="flex items-center gap-4">
              <button
                type="button"
                disabled={!answerDraft.trim()}
                onClick={() => {
                  onAnswerFollowUp(answerDraft)
                  setAnswerDraft('')
                }}
                className="bg-ink px-5 py-[10px] font-meta text-[12px] font-semibold text-paper disabled:cursor-not-allowed disabled:opacity-40"
              >
                Use this answer
              </button>
              <button type="button" onClick={onSkipFollowUp} className="font-meta text-[12px] font-semibold text-meta">
                Skip
              </button>
            </div>
          </div>
        ) : (
          <div className="border border-border bg-paper px-5 py-4">
            <p className="font-meta text-[12px] leading-[20px] text-meta">
              After 3 regenerations with no pick, a brand question surfaces here.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
