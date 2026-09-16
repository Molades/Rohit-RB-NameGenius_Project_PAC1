// S3 — Result card (Figma-faithful build).
//
// Source of truth: Figma frame "Results — Default" (node 45:64) in the
// Product-anatomy pro_track file. Every size, weight, tracking, gray, and gap
// below is transcribed from that frame via get_design_context — not approximated.
//
// Isolated on purpose: a parallel session owns src/ResultCard.jsx and is taking
// it toward a Mobbin layout. This file + its own preview entry keep the two
// directions from clobbering each other. See preview-figma.html.
//
// One component, two axes:
//   variant: 'featured' (the gray "TOP PICK" block) | 'row' (compact list line)
//   status:  'available' (solid black badge, free TLDs bold ink)
//          | 'taken'     (outlined muted badge, TLDs struck through)
//
// Mocked data in via props; action icons render + focus but are not wired yet.

function ResultCardFigma({
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
  const actions = (
    <Actions
      isShortlisted={isShortlisted}
      isComparing={isComparing}
      onCopy={onCopy}
      onShortlist={onShortlist}
      onCompare={onCompare}
    />
  )

  if (variant === 'featured') {
    // Frame 45:102 — gray block, 32/28 padding; left column stacks
    // eyebrow → name → domain → TLD strip; badge + actions clustered right.
    return (
      <div className="flex flex-wrap items-center justify-between gap-6 bg-[#f6f6f5] px-8 py-7">
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase leading-none tracking-[0.16em] text-[#0a0a0a]">
            TOP PICK
          </div>
          <div className="mt-2.5 text-[38px] font-bold leading-none tracking-[-0.03em] text-[#0a0a0a]">
            {name}
          </div>
          <div className="mt-2.5 font-mono text-[16px] leading-none text-[#6b6b6b]">
            {domain}
          </div>
          <div className="mt-4">
            <TldStrip tlds={tlds} showSummary />
          </div>
        </div>
        <div className="flex items-center gap-5">
          <StatusBadge status={status} />
          {actions}
        </div>
      </div>
    )
  }

  // 'row' — frame 47:64: 4/26 padding, hairline divider; name over domain on the
  // left, TLD strip + badge + actions grouped (gap 20) on the right.
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e4e4e4] px-1 py-[26px]">
      <div className="min-w-0">
        <div className="text-[28px] font-semibold leading-none tracking-[-0.02em] text-[#0a0a0a]">
          {name}
        </div>
        <div className="mt-1.5 font-mono text-[15px] leading-none text-[#6b6b6b]">
          {domain}
        </div>
      </div>
      <div className="flex items-center gap-5">
        <TldStrip tlds={tlds} />
        <StatusBadge status={status} />
        {actions}
      </div>
    </div>
  )
}

// Frame 45:116 / 47:161 — 12/6 padding, 2px radius, 11px bold, 0.1em tracking.
function StatusBadge({ status }) {
  return status === 'available' ? (
    <span className="rounded-[2px] bg-[#0a0a0a] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white">
      Available
    </span>
  ) : (
    <span className="rounded-[2px] border border-[#c2c2c2] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#9a9a9a]">
      Taken
    </span>
  )
}

// Frame 45:110 / 47:69 — mono 13px, gap 14. Free = bold ink; taken = struck #c2c2c2.
// Featured adds an Archivo 12px #9a9a9a summary ("all three free").
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
        <span className="font-sans text-[12px] text-[#9a9a9a]">
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

// Frame 45:118 / 47:75 — three icons, ~19px, gap 12. Real buttons for a11y;
// handlers are no-ops this phase.
function Actions({ isShortlisted, isComparing, onCopy, onShortlist, onCompare }) {
  return (
    <div className="flex items-center gap-0.5 text-[#9a9a9a]">
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
        'rounded-[2px] p-1.5 transition-colors ' +
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

export default ResultCardFigma
