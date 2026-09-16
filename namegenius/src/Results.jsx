import { useMemo, useState } from 'react'
import { QUESTIONS, availableTlds, domainFor, isAvailable, matchesLength } from './data'
import { generateNames } from './generator'

const TLD_FILTERS = ['any TLD', '.com', '.io', '.co']
const LENGTH_FILTERS = ['any', 'short', 'catchy']
const PAGE_SIZE = 6

function Results({
  brief,
  answers,
  saved,
  compareSel,
  generation,
  pendingQuestion,
  onRegenerate,
  onAnswerFollowUp,
  onSkipFollowUp,
  onToggleSaved,
  onToggleCompare,
  onNewSearch,
  onNavigate,
}) {
  const [tldFilter, setTldFilter] = useState('any TLD')
  const [lengthFilter, setLengthFilter] = useState('any')

  const generated = useMemo(
    () => generateNames(brief, generation, answers),
    [brief, generation, answers]
  )

  const filtered = generated.filter((i) => matchesLength(i, lengthFilter))
  const shown = filtered.slice(0, PAGE_SIZE)
  // Strongest first: the name available on the most TLDs leads as the top pick.
  const sorted = [...shown].sort(
    (a, b) => availableTlds(b).length - availableTlds(a).length
  )
  const topPick = sorted[0]
  const rest = sorted.slice(1)

  const isSaved = (item) => saved.some((s) => s.slug === item.slug)
  const isComparing = (item) => compareSel.some((s) => s.slug === item.slug)
  const canCompare = compareSel.length === 2

  return (
    <div className="min-h-screen bg-white text-[#0a0a0a]">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-8 sm:px-12">
        {/* header */}
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold tracking-tight">NameGenius</div>
          <div className="flex items-center gap-5 text-[14px] text-[#6b6b6b] sm:gap-7">
            <NavLink onClick={() => onNavigate('shortlist')}>
              Shortlist{' '}
              {saved.length > 0 && (
                <span className="font-semibold text-[#0a0a0a]">{saved.length}</span>
              )}
            </NavLink>
            <NavLink onClick={() => onNavigate('compare')}>
              Compare{' '}
              {compareSel.length > 0 && (
                <span className="font-semibold text-[#0a0a0a]">
                  {compareSel.length}
                </span>
              )}
            </NavLink>
            <NavLink onClick={() => onNavigate('questions')}>Questions</NavLink>
          </div>
        </div>

        {/* back + hero */}
        <button
          type="button"
          onClick={onNewSearch}
          className="mt-10 text-[14px] text-[#6b6b6b] transition-colors hover:text-[#0a0a0a]"
        >
          ← New search
        </button>
        <div className="mt-4 flex flex-wrap items-baseline gap-4">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a9a9a]">
            Ideas for
          </span>
          <h1 className="text-[2.6rem] font-extrabold leading-[1.0] tracking-[-0.04em] sm:text-[3.25rem]">
            {brief?.name || 'your idea'}
          </h1>
        </div>

        {/* filter bar */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y-[1.5px] border-[#0a0a0a] py-4">
          <div className="flex flex-wrap items-center gap-x-9 gap-y-3">
            <FilterTabs
              label="TLD"
              options={TLD_FILTERS}
              value={tldFilter}
              onChange={setTldFilter}
              short={{ 'any TLD': 'any' }}
              monoFor={['.com', '.io', '.co']}
            />
            <FilterTabs
              label="Length"
              options={LENGTH_FILTERS}
              value={lengthFilter}
              onChange={setLengthFilter}
            />
          </div>
          <button
            type="button"
            onClick={onRegenerate}
            disabled={pendingQuestion !== null}
            className={
              'flex items-center gap-2 text-[14px] font-semibold ' +
              (pendingQuestion !== null
                ? 'cursor-not-allowed text-[#b3b3b3]'
                : 'text-[#0a0a0a]')
            }
          >
            <RegenerateIcon />
            Regenerate
          </button>
        </div>

        {/* follow-up question band (after 3 regenerations) */}
        {pendingQuestion !== null ? (
          <FollowUpBand
            question={QUESTIONS[pendingQuestion]}
            onSubmit={onAnswerFollowUp}
            onSkip={onSkipFollowUp}
          />
        ) : (
          <>
            {shown.length === 0 ? (
              <div className="mt-8 border-2 border-dashed border-[#c9c9c9] py-24 text-center text-[17px] text-[#6b6b6b]">
                No names match this filter. Try “any” length or Regenerate.
              </div>
            ) : (
              <>
                {topPick && (
                  <TopPick
                    item={topPick}
                    tldFilter={tldFilter}
                    isSaved={isSaved(topPick)}
                    isComparing={isComparing(topPick)}
                    onToggleSaved={() => onToggleSaved(topPick)}
                    onToggleCompare={() => onToggleCompare(topPick)}
                  />
                )}
                <div>
                  {rest.map((item) => (
                    <ResultRow
                      key={item.slug}
                      item={item}
                      tldFilter={tldFilter}
                      isSaved={isSaved(item)}
                      isComparing={isComparing(item)}
                      onToggleSaved={() => onToggleSaved(item)}
                      onToggleCompare={() => onToggleCompare(item)}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* compare action bar */}
        {compareSel.length > 0 && pendingQuestion === null && (
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-2 border-[#0a0a0a] bg-[#f6f6f5] px-6 py-4">
            <span className="text-[15px]">
              {compareSel.length === 1
                ? 'Select one more name to compare.'
                : 'Two names selected.'}
            </span>
            <button
              type="button"
              disabled={!canCompare}
              onClick={() => onNavigate('compare')}
              className={
                'rounded-sm px-6 py-2.5 text-[15px] font-semibold transition-colors ' +
                (canCompare
                  ? 'bg-[#0a0a0a] text-white hover:bg-[#333]'
                  : 'cursor-not-allowed bg-[#e0e0e0] text-[#9a9a9a]')
              }
            >
              Compare selected
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function FollowUpBand({ question, onSubmit, onSkip }) {
  const [value, setValue] = useState('')
  const submit = (e) => {
    e.preventDefault()
    if (!value.trim()) return
    onSubmit(value.trim())
  }
  return (
    <form onSubmit={submit} className="mt-8 border-2 border-[#0a0a0a] bg-[#f6f6f5] p-8">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#6b6b6b]">
        One quick question to sharpen these
      </div>
      <h2 className="mt-3 text-[26px] font-bold tracking-[-0.02em]">{question}</h2>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Your answer"
          className="h-[52px] flex-1 rounded-sm border-[1.5px] border-[#0a0a0a] bg-white px-4 text-[17px] outline-none placeholder:text-[#b3b3b3] focus:ring-2 focus:ring-[#0a0a0a] focus:ring-offset-2"
        />
        <button
          type="submit"
          className="h-[52px] rounded-sm bg-[#0a0a0a] px-7 text-[15px] font-semibold text-white transition-colors hover:bg-[#333]"
        >
          Refine names
        </button>
      </div>
      <button
        type="button"
        onClick={onSkip}
        className="mt-4 text-[14px] text-[#6b6b6b] underline decoration-[#c9c9c9] underline-offset-4 transition-colors hover:text-[#0a0a0a]"
      >
        Skip for now
      </button>
    </form>
  )
}

function NavLink({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="underline decoration-[#c9c9c9] underline-offset-4 transition-colors hover:text-[#0a0a0a] hover:decoration-[#0a0a0a]"
    >
      {children}
    </button>
  )
}

function FilterTabs({ label, options, value, onChange, short = {}, monoFor = [] }) {
  return (
    <div className="flex items-center gap-3.5">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9a9a9a]">
        {label}
      </span>
      {options.map((option) => {
        const active = value === option
        const isMono = monoFor.includes(option)
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={active}
            className={
              (isMono ? 'font-mono text-[14px] ' : 'text-[15px] ') +
              (active ? 'font-semibold text-[#0a0a0a]' : 'text-[#9a9a9a] hover:text-[#0a0a0a]')
            }
            style={
              active
                ? { boxShadow: 'inset 0 -0.1em 0 #0a0a0a', paddingBottom: '2px' }
                : undefined
            }
          >
            {short[option] || option}
          </button>
        )
      })}
    </div>
  )
}

function TldStrip({ item, bold }) {
  return (
    <div className="flex items-center gap-3.5 font-mono text-[13px]">
      {['.com', '.io', '.co'].map((t) =>
        item.tlds[t] ? (
          <span key={t} className="font-bold text-[#0a0a0a]">
            {t}
          </span>
        ) : (
          <span key={t} className="text-[#c2c2c2] line-through">
            {t}
          </span>
        )
      )}
      {bold && (
        <span className="text-[12px] text-[#9a9a9a]">
          {availableTlds(item).length === 3
            ? 'all three free'
            : `${availableTlds(item).length} free`}
        </span>
      )}
    </div>
  )
}

function StatusTag({ available }) {
  return available ? (
    <span className="rounded-sm bg-[#0a0a0a] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white">
      Available
    </span>
  ) : (
    <span className="rounded-sm border border-[#c2c2c2] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#9a9a9a]">
      Taken
    </span>
  )
}

function useCopy(domain) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(domain)
    } catch {
      // Clipboard may be unavailable (insecure context) — fail silently.
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }
  return [copied, copy]
}

function Actions({ domain, isSaved, isComparing, onToggleSaved, onToggleCompare }) {
  const [copied, copy] = useCopy(domain)
  return (
    <div className="flex items-center gap-2 text-[#9a9a9a]">
      {copied && (
        <span className="mr-1 text-[13px] font-bold text-[#0a0a0a]">Copied</span>
      )}
      <IconBtn label="Copy domain" onClick={copy}>
        <CopyIcon />
      </IconBtn>
      <IconBtn
        label={isSaved ? 'Remove from shortlist' : 'Save to shortlist'}
        active={isSaved}
        onClick={onToggleSaved}
      >
        <HeartIcon filled={isSaved} />
      </IconBtn>
      <IconBtn
        label={isComparing ? 'Remove from compare' : 'Add to compare'}
        active={isComparing}
        onClick={onToggleCompare}
      >
        <CompareIcon />
      </IconBtn>
    </div>
  )
}

function TopPick({ item, tldFilter, isSaved, isComparing, onToggleSaved, onToggleCompare }) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-6 bg-[#f6f6f5] px-8 py-7">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-[0.16em]">Top pick</div>
        <div className="mt-2.5 text-[38px] font-bold leading-none tracking-[-0.03em]">
          {item.name}
        </div>
        <div className="mt-2.5 font-mono text-[16px] text-[#6b6b6b]">
          {domainFor(item, tldFilter)}
        </div>
        <div className="mt-4">
          <TldStrip item={item} bold />
        </div>
      </div>
      <div className="flex items-center gap-5">
        <StatusTag available={isAvailable(item, tldFilter)} />
        <Actions
          domain={domainFor(item, tldFilter)}
          isSaved={isSaved}
          isComparing={isComparing}
          onToggleSaved={onToggleSaved}
          onToggleCompare={onToggleCompare}
        />
      </div>
    </div>
  )
}

function ResultRow({ item, tldFilter, isSaved, isComparing, onToggleSaved, onToggleCompare }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e4e4e4] px-1 py-6">
      <div>
        <div className="text-[28px] font-semibold tracking-[-0.02em]">{item.name}</div>
        <div className="mt-1.5 font-mono text-[15px] text-[#6b6b6b]">
          {domainFor(item, tldFilter)}
        </div>
      </div>
      <div className="flex items-center gap-5">
        <TldStrip item={item} />
        <StatusTag available={isAvailable(item, tldFilter)} />
        <Actions
          domain={domainFor(item, tldFilter)}
          isSaved={isSaved}
          isComparing={isComparing}
          onToggleSaved={onToggleSaved}
          onToggleCompare={onToggleCompare}
        />
      </div>
    </div>
  )
}

function IconBtn({ label, children, onClick, active }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={onClick}
      className={
        'rounded-sm p-2 transition-colors ' +
        (active ? 'bg-[#0a0a0a] text-white' : 'hover:bg-[#e0e0e0] hover:text-[#0a0a0a]')
      }
    >
      {children}
    </button>
  )
}

const iconProps = {
  width: 19,
  height: 19,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

function CopyIcon() {
  return (
    <svg {...iconProps}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function HeartIcon({ filled }) {
  return (
    <svg {...iconProps} fill={filled ? 'currentColor' : 'none'}>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  )
}

function CompareIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 6h18M3 12h18M3 18h18" />
      <circle cx="8" cy="6" r="2" fill="currentColor" stroke="none" />
      <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none" />
      <circle cx="8" cy="18" r="2" fill="currentColor" stroke="none" />
    </svg>
  )
}

function RegenerateIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 4v5h-5" />
    </svg>
  )
}

export default Results
