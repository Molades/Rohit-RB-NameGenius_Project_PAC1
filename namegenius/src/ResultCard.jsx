// S3 — Result card. A single, self-contained component whose layout and
// hierarchy are borrowed from real product screens on Mobbin, then rendered in
// the repo's strictly monochrome, typographic design system.
//
// Reference (layout + hierarchy only — no color, gradient, or shadow taken):
//   • Preply "saved tutor" card  — master layout: a bordered result card with a
//     dominant name headline, a chip/badge row directly beneath it, and an
//     action cluster to the right.
//     https://mobbin.com/screens/4678dc04-b586-4928-880c-526517fd9433
//   • Apple Store "Top Result"   — the labeled-indicator idea for the TLD row.
//     https://mobbin.com/screens/168b3f82-185a-4c24-ba33-86dd4573013a
//   • Vercel domain search       — weighting the TLD bold against the name in
//     the domain string (northpeak.com).
//     https://mobbin.com/screens/68fb3e43-4f7f-4319-8504-a8909187e432
//
// Two axes, one component:
//   status:  'available' (solid badge, free TLDs bold, domain TLD bold)
//          | 'taken'     (outlined muted badge, TLDs + domain struck through)
//   variant: 'featured' (Preply-style bordered "Top pick" card)
//          | 'row'       (compact list line)
//
// Data is mocked and the action icons are not wired this phase — the buttons
// render, focus, and carry labels, but their handlers default to no-ops.

function ResultCard({
  name,
  domain,
  status,
  tlds,
  variant = 'row',
  isShortlisted = false,
  isComparing = false,
  onCopy = () => {},
  onShortlist = () => {},
  onCompare = () => {},
}) {
  const taken = status === 'taken'

  const actions = (
    <Actions
      taken={taken}
      isShortlisted={isShortlisted}
      isComparing={isComparing}
      onCopy={onCopy}
      onShortlist={onShortlist}
      onCompare={onCompare}
    />
  )

  if (variant === 'featured') {
    // Preply hierarchy: eyebrow → name headline → domain, with the badge + TLD
    // indicators on the row beneath, and the actions clustered top-right.
    return (
      <div className="flex flex-wrap items-start justify-between gap-6 border border-[#e4e4e4] bg-white px-8 py-7">
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9a9a9a]">
            Top pick
          </div>
          <div
            className={
              'mt-2.5 text-[38px] font-bold leading-none tracking-[-0.03em] ' +
              (taken ? 'text-[#9a9a9a]' : 'text-[#0a0a0a]')
            }
          >
            {name}
          </div>
          <div className="mt-3">
            <Domain domain={domain} taken={taken} size="lg" />
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2.5">
            <StatusBadge taken={taken} />
            <TldStrip tlds={tlds} showSummary />
          </div>
        </div>
        <div className="shrink-0">{actions}</div>
      </div>
    )
  }

  // 'row'
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e4e4e4] px-1 py-6">
      <div className="min-w-0">
        <div
          className={
            'text-[28px] font-semibold tracking-[-0.02em] ' +
            (taken ? 'text-[#9a9a9a]' : 'text-[#0a0a0a]')
          }
        >
          {name}
        </div>
        <div className="mt-1.5">
          <Domain domain={domain} taken={taken} />
        </div>
      </div>
      <div className="flex items-center gap-5">
        <TldStrip tlds={tlds} />
        <StatusBadge taken={taken} />
        {actions}
      </div>
    </div>
  )
}

// Domain string with the extension weighted against the name (Vercel move).
// Available: name muted, TLD bold ink. Taken: whole string muted, TLD struck.
function Domain({ domain, taken, size = 'md' }) {
  const dot = domain.lastIndexOf('.')
  const base = dot === -1 ? domain : domain.slice(0, dot)
  const ext = dot === -1 ? '' : domain.slice(dot)
  const cls = size === 'lg' ? 'text-[16px]' : 'text-[15px]'
  return (
    <span className={'font-mono ' + cls + (taken ? ' text-[#c2c2c2]' : ' text-[#6b6b6b]')}>
      {base}
      <span
        className={
          (taken ? 'line-through ' : 'font-bold ') + (taken ? '' : 'text-[#0a0a0a]')
        }
      >
        {ext}
      </span>
    </span>
  )
}

function StatusBadge({ taken }) {
  return taken ? (
    <span className="rounded-sm border border-[#c2c2c2] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#9a9a9a]">
      Taken
    </span>
  ) : (
    <span className="rounded-sm bg-[#0a0a0a] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white">
      Available
    </span>
  )
}

function TldStrip({ tlds, showSummary = false }) {
  const freeCount = tlds.filter((t) => t.available).length
  return (
    <div className="flex items-center gap-3.5 font-mono text-[13px]">
      {tlds.map(({ ext, available }) =>
        available ? (
          <span key={ext} className="font-bold text-[#0a0a0a]">
            {ext}
          </span>
        ) : (
          <span key={ext} className="text-[#c2c2c2] line-through">
            {ext}
          </span>
        )
      )}
      {showSummary && (
        <span className="text-[12px] text-[#9a9a9a]">
          {freeCount === 0
            ? 'none free'
            : freeCount === tlds.length
              ? 'all three free'
              : `${freeCount} free`}
        </span>
      )}
    </div>
  )
}

function Actions({ taken, isShortlisted, isComparing, onCopy, onShortlist, onCompare }) {
  // On a taken result the actions read as secondary — muted, but still present
  // and operable (monochrome, no disabled greying-out beyond the muted ink).
  return (
    <div className={'flex items-center gap-2 ' + (taken ? 'text-[#c2c2c2]' : 'text-[#9a9a9a]')}>
      <IconBtn label="Copy domain" onClick={onCopy}>
        <CopyIcon />
      </IconBtn>
      <IconBtn
        label={isShortlisted ? 'Remove from shortlist' : 'Save to shortlist'}
        active={isShortlisted}
        onClick={onShortlist}
      >
        <HeartIcon filled={isShortlisted} />
      </IconBtn>
      <IconBtn
        label={isComparing ? 'Remove from compare' : 'Add to compare'}
        active={isComparing}
        onClick={onCompare}
      >
        <CompareIcon />
      </IconBtn>
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

export default ResultCard
