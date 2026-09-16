import { CircleIndicator, CopyIcon, FavoriteIcon, SettingsIcon } from '../assets/icons.jsx'

/**
 * ResultCard — S3, one component, three states via the `status` prop.
 *
 * Every size, weight, tracking, color, and gap below is pulled from the Figma
 * frame "nimbusly-domain-card" (node 248:670) via get_design_context, not
 * eyeballed. That frame only shows the `taken` state — the `available` and
 * `loading` treatments extend its token language (same badge shape, same
 * grays) rather than introducing new ones. Layout is identical across all
 * three states; only color, border style, and text content change, so the
 * card cannot reflow when a domain check resolves.
 */

const STATUS = {
  available: {
    label: 'AVAILABLE',
    badgeClass: 'border-on-surface bg-on-surface',
    dotClass: 'text-surface',
    labelClass: 'text-surface',
    domainClass: 'text-on-surface',
  },
  taken: {
    label: 'TAKEN',
    badgeClass: 'border-[#c0c0c0] bg-transparent',
    dotClass: 'text-muted',
    labelClass: 'text-muted',
    domainClass:
      'text-muted line-through decoration-solid [text-decoration-skip-ink:none] [text-underline-position:from-font]',
  },
  loading: {
    label: 'CHECKING',
    badgeClass: 'border-dashed border-outline-variant bg-transparent',
    dotClass: 'text-muted animate-pulse',
    labelClass: 'text-muted',
    domainClass: 'text-muted',
  },
}

export default function ResultCard({
  name,
  domain,
  status = 'available',
  tlds = [],
  onCopy = () => {},
  onShortlist = () => {},
  onCompare = () => {},
}) {
  const s = STATUS[status] ?? STATUS.available
  const isLoading = status === 'loading'

  return (
    <div className="flex w-[530px] flex-col items-start gap-[20px] rounded-[12px] border border-outline-variant bg-surface px-[36px] py-[32px]">
      {/* header-section */}
      <p className="w-full break-words font-display text-[44px] font-extrabold leading-none tracking-[-1px] text-on-surface">
        {name}
      </p>

      {/* domain-status-row */}
      <div className="flex w-full items-center justify-between gap-[12px]">
        <p className={`whitespace-nowrap font-mono text-[20px] ${s.domainClass}`}>{domain}</p>

        <div className={`flex shrink-0 items-center gap-[8px] rounded-[6px] border px-[16px] py-[8px] ${s.badgeClass}`}>
          <CircleIndicator className={`size-[8px] ${s.dotClass}`} />
          <p className={`whitespace-nowrap font-display text-[12px] font-bold tracking-[0.5px] ${s.labelClass}`}>
            {s.label}
          </p>
        </div>
      </div>

      {/* alternatives-section */}
      <div className="flex w-full items-baseline gap-[16px]">
        <p className="whitespace-nowrap font-display text-[13px] font-bold tracking-[0.5px] text-muted">ALSO FREE</p>
        <div className="flex items-start gap-[16px] text-[18px]">
          {tlds.map((t) => (
            <p
              key={t.ext}
              className={
                isLoading
                  ? 'font-display font-normal text-muted'
                  : t.available
                    ? 'font-display font-bold text-on-surface'
                    : 'font-display font-normal text-taken line-through decoration-solid [text-decoration-skip-ink:none] [text-underline-position:from-font]'
              }
            >
              {t.ext}
            </p>
          ))}
        </div>
      </div>

      {/* Horizontal/Inset divider */}
      <div className="w-[320px] border-t border-outline-variant" />

      {/* footer-actions */}
      <div className="flex w-full items-center gap-[20px] text-muted">
        <button
          type="button"
          aria-label="Copy domain"
          onClick={onCopy}
          className="flex size-[32px] items-center justify-center transition-colors hover:text-on-surface"
        >
          <CopyIcon className="size-[22px]" />
        </button>
        <button
          type="button"
          aria-label="Save to shortlist"
          onClick={onShortlist}
          className="flex size-[24px] items-center justify-center transition-colors hover:text-on-surface"
        >
          <FavoriteIcon className="size-[24px]" />
        </button>
        <button
          type="button"
          aria-label="Add to compare"
          onClick={onCompare}
          className="flex size-[24px] items-center justify-center transition-colors hover:text-on-surface"
        >
          <SettingsIcon className="size-[24px]" />
        </button>
      </div>
    </div>
  )
}
