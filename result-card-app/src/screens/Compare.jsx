import TopBar from '../components/TopBar.jsx'
import { Glyph, gradientFor, VISUAL_FILTER } from '../components/nameVisuals.jsx'
import { OUTLINE_BTN, PAGE_H1, PANEL } from '../components/ui.js'
import { isTldAvailable, placeholderPrice } from '../services/domain.js'

const SLOT_BTN =
  'inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-full border px-4 font-hero-mono text-[12px] transition duration-200 active:scale-95'
const COLUMNS = 'lg:grid-cols-[180px_1fr_1fr] lg:gap-x-6'

const lengthOf = (item) => item.domain.replace(/\.com$/, '').length

function Status({ ok }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`size-1.5 rounded-full ${ok ? 'bg-status-ok' : 'bg-status-bad'}`} />
      {ok ? 'Available' : 'Taken'}
    </span>
  )
}

// Index of the better item (0 or 1), or null when it's a tie.
const better = (x, y, higherIsBetter = true) => (x === y ? null : (x > y) === higherIsBetter ? 0 : 1)

function buildRows(a, b) {
  const status = (ext) => (item) => <Status ok={isTldAvailable(item, ext)} />
  return [
    {
      key: 'com',
      label: '.com',
      live: true,
      render: status('.com'),
      winner: better(Number(isTldAvailable(a, '.com')), Number(isTldAvailable(b, '.com'))),
    },
    {
      key: 'length',
      label: 'Name length',
      live: true,
      render: (item) => `${lengthOf(item)} characters`,
      winner: better(lengthOf(a), lengthOf(b), false),
    },
    { key: 'io', label: '.io', render: status('.io') },
    { key: 'ai', label: '.ai', render: status('.ai') },
    { key: 'price', label: 'Price / yr', render: (item) => placeholderPrice(item.name) },
  ]
}

function SlotCard({ item, isShortlisted, onToggleShortlist, onRemove, revealIndex }) {
  const visual = item.visual ?? 0
  return (
    <article style={{ '--i': revealIndex }} className="reveal group overflow-hidden rounded-3xl border border-white/8 bg-[#0d0d0d] shadow-[0_14px_30px_rgba(0,0,0,0.35)]">
      <div
        className={`flex h-[132px] items-center justify-center ${VISUAL_FILTER}`}
        style={{ background: gradientFor(visual) }}
      >
        <div className="flex size-14 items-center justify-center rounded-2xl border border-white/16 bg-[linear-gradient(160deg,#3d3d3d,#161616)] text-hero-text shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_10px_26px_rgba(0,0,0,0.5)]">
          <Glyph visual={visual} size={22} />
        </div>
      </div>
      <div className="p-5">
        <h2 className="break-words font-hero text-[28px] font-normal leading-tight text-hero-text">{item.name}</h2>
        <p className="mt-1 font-hero-mono text-[12px] text-hero-text/45">{item.domain}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onToggleShortlist}
            aria-pressed={isShortlisted}
            className={`${SLOT_BTN} ${
              isShortlisted
                ? 'border-white/50 bg-hero-fill text-ink'
                : 'border-white/16 text-hero-text/70 hover:border-white/40 hover:text-hero-text'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill={isShortlisted ? 'currentColor' : 'none'} aria-hidden="true">
              <path d="M4 2.5H12C12.5523 2.5 13 2.94772 13 3.5V13.5L8 10.8L3 13.5V3.5C3 2.94772 3.44772 2.5 4 2.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
            {isShortlisted ? 'Shortlisted' : 'Shortlist'}
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${item.name} from compare`}
            className={`${SLOT_BTN} border-white/16 text-hero-text/70 hover:border-white/40 hover:text-hero-text`}
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  )
}

function EmptySlot({ onPick, label, revealIndex }) {
  return (
    <div style={{ '--i': revealIndex }} className="reveal flex min-h-[268px] flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-white/16 bg-white/3 p-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-white/16 text-hero-text/60">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="max-w-[220px] text-[15px] leading-normal text-hero-text/55">{label}</p>
      <button type="button" onClick={onPick} className={OUTLINE_BTN}>
        Pick from names
      </button>
    </div>
  )
}

function Cell({ item, win, badge = true, children }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-hero-mono text-[10px] uppercase tracking-[0.06em] text-hero-text/35 lg:hidden">
        {item.name}
      </span>
      <span className={`inline-flex items-center gap-2.5 text-[15px] ${win ? 'text-hero-text' : 'text-hero-text/55'}`}>
        {children}
        {win && badge && (
          <span className="rounded-full bg-hero-fill px-2 py-0.5 font-hero-mono text-[10px] uppercase tracking-[0.06em] text-ink">
            Better
          </span>
        )}
      </span>
    </div>
  )
}

export default function Compare({
  compareSel,
  shortlist,
  onRemove,
  onToggleShortlist,
  navCounts,
  onNavigate,
  onOpenQuestions,
}) {
  const [a, b] = compareSel
  const ready = compareSel.length === 2

  const rows = ready ? buildRows(a, b) : []
  const winsA = rows.filter((r) => r.live && r.winner === 0).length
  const winsB = rows.filter((r) => r.live && r.winner === 1).length
  const edge = winsA === winsB ? null : winsA > winsB ? 0 : 1

  const subtitle = ready ? `${a.name} vs ${b.name}` : 'Pick two names to see them side by side.'

  return (
    <main className="relative min-h-dvh bg-ink font-meta text-hero-text">
      <TopBar current="compare" counts={navCounts} onNavigate={onNavigate} onOpenQuestions={onOpenQuestions} />

      <div style={{ '--i': 0 }} className="reveal px-6 pt-7 sm:px-14">
        <h1 className={PAGE_H1}>Compare</h1>
        <p className="mt-2 font-hero-mono text-[12px] tracking-[0.03em] text-hero-text/45">{subtitle}</p>
      </div>

      <div className="mx-6 mb-16 mt-6 sm:mx-14">
        <div className={`grid grid-cols-1 gap-5 md:grid-cols-2 lg:px-[21px] ${COLUMNS}`}>
          <div style={{ '--i': 2 }} className="fade-in hidden items-center justify-center font-hero text-[44px] italic text-hero-text/25 lg:flex">
            vs
          </div>
          {[0, 1].map((slot) => {
            const item = compareSel[slot]
            return item ? (
              <SlotCard
                key={item.domain}
                item={item}
                revealIndex={slot + 1}
                isShortlisted={shortlist.some((s) => s.domain === item.domain)}
                onToggleShortlist={() => onToggleShortlist(item)}
                onRemove={() => onRemove(item)}
              />
            ) : (
              <EmptySlot
                key={`empty-${slot}`}
                revealIndex={slot + 1}
                onPick={() => onNavigate('results')}
                label={slot === 0 ? 'Add two names to compare them side by side.' : 'Add one more name to compare.'}
              />
            )
          })}
        </div>

        {ready && (
          <>
            <div style={{ '--i': 3 }} className={`${PANEL} reveal mt-6 overflow-hidden`}>
              {rows.map((row) => (
                <div
                  key={row.key}
                  className={`grid grid-cols-2 gap-x-6 gap-y-2 border-b border-white/8 px-5 py-4 lg:items-center ${COLUMNS}`}
                >
                  <span className="col-span-2 flex items-center gap-2 font-hero-mono text-[11px] uppercase tracking-[0.08em] text-hero-text/45 lg:col-span-1">
                    {row.label}
                    {!row.live && (
                      <span className="rounded-full border border-white/10 px-1.5 py-px text-[9px] tracking-[0.06em] text-hero-text/35">
                        sample
                      </span>
                    )}
                  </span>
                  {[a, b].map((item, i) => (
                    <Cell key={item.domain} item={item} win={row.winner === i}>
                      {row.render(item)}
                    </Cell>
                  ))}
                </div>
              ))}
              <div className={`grid grid-cols-2 gap-x-6 gap-y-2 bg-white/3 px-5 py-4 lg:items-center ${COLUMNS}`}>
                <span className="col-span-2 font-hero-mono text-[11px] uppercase tracking-[0.08em] text-hero-text/45 lg:col-span-1">
                  Edge
                </span>
                {[a, b].map((item, i) => (
                  <Cell key={item.domain} item={item} win={edge === i} badge={false}>
                    {edge === null ? 'Even' : edge === i ? 'Leads on live data' : '—'}
                  </Cell>
                ))}
              </div>
            </div>
            <p style={{ '--i': 5 }} className="reveal mt-4 font-hero-mono text-[11px] leading-normal text-hero-text/35">
              Live: .com availability is a real registry lookup. Sample: .io, .ai and price are illustrative.
            </p>
          </>
        )}
      </div>
    </main>
  )
}
