/**
 * ResultCard — one component, three states driven by the `state` prop.
 *
 * Values are taken from the Figma component set `result-card` (node 95:88):
 * card 333px wide, 24px padding, 12px gap, 1px #e5e5e5 border, no radius.
 * Layout is identical in every state — only the status label and a
 * zero-layout treatment on the domain change — so the card cannot reflow
 * when the availability check resolves.
 */

const STATES = {
  available: {
    label: 'AVAILABLE',
    labelColor: 'text-[#0a0a0a]',
    sldColor: 'text-[#737373]',
    tldColor: 'text-[#171717]',
    struck: false,
  },
  taken: {
    label: 'TAKEN',
    labelColor: 'text-[#4a4a4a]',
    sldColor: 'text-[#737373]',
    tldColor: 'text-[#171717]',
    struck: true,
  },
  loading: {
    label: 'CHECKING',
    labelColor: 'text-[#757575]',
    // Deliberately below the 4.5:1 contrast floor: a pending value
    // is not yet meant to be read.
    sldColor: 'text-[#9a9a9a]',
    tldColor: 'text-[#9a9a9a]',
    struck: false,
  },
}

export default function ResultCard({
  name,
  domain,
  tld = '.com',
  state = 'available',
  className = '',
  onCopy,
  onToggleShortlist,
  isShortlisted = false,
  onToggleCompare,
  isCompared = false,
}) {
  const s = STATES[state] ?? STATES.available
  const hasActions = onCopy || onToggleShortlist || onToggleCompare

  return (
    <div
      className={`flex w-[333px] flex-col items-start gap-[12px] border border-solid border-[#e5e5e5] bg-white p-[24px] ${className}`}
    >
      <p className="w-full overflow-hidden text-ellipsis whitespace-nowrap font-display text-[28px] font-bold leading-[30px] tracking-[-0.4px] text-[#0a0a0a]">
        {name}
      </p>

      <div className="flex w-full items-baseline justify-between gap-[12px] overflow-hidden">
        <p
          className={`min-w-0 flex-1 overflow-hidden whitespace-nowrap font-meta text-[12px] leading-[20px] ${
            s.struck ? 'line-through' : ''
          }`}
        >
          <span className={`font-normal ${s.sldColor}`}>{domain}</span>
          <span className={`font-semibold ${s.tldColor}`}>{tld}</span>
        </p>

        <div className="flex h-[20px] w-[64px] shrink-0 items-center justify-end overflow-hidden">
          <p
            className={`w-full text-right font-meta text-[10px] font-semibold leading-[20px] tracking-[0.8px] ${s.labelColor}`}
          >
            {s.label}
          </p>
        </div>
      </div>

      {hasActions && (
        <div className="flex w-full items-center gap-[16px] border-t border-[#e5e5e5] pt-[12px] font-meta text-[11px] font-semibold">
          {onCopy && (
            <button
              type="button"
              onClick={() => onCopy(`${domain}${tld}`)}
              className="text-[#4a4a4a] hover:text-[#0a0a0a]"
            >
              Copy
            </button>
          )}
          {onToggleShortlist && (
            <button
              type="button"
              onClick={onToggleShortlist}
              className={isShortlisted ? 'text-[#0a0a0a]' : 'text-[#4a4a4a] hover:text-[#0a0a0a]'}
            >
              {isShortlisted ? 'Shortlisted ✓' : 'Shortlist'}
            </button>
          )}
          {onToggleCompare && (
            <button
              type="button"
              onClick={onToggleCompare}
              className={isCompared ? 'text-[#0a0a0a]' : 'text-[#4a4a4a] hover:text-[#0a0a0a]'}
            >
              {isCompared ? 'Comparing ✓' : 'Compare'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
