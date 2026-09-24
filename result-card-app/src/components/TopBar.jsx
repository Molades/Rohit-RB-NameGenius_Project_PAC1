import PillNav from './PillNav.jsx'

// Shared top chrome for the dark inner screens. The parent <main> must be `relative`.
export default function TopBar({ current, counts, onNavigate, onOpenQuestions }) {
  return (
    <>
      <button
        type="button"
        onClick={() => onNavigate('landing')}
        aria-label="Back to start"
        className="absolute left-6 top-8 z-10 flex cursor-pointer items-center gap-2 text-hero-text opacity-40 transition-opacity duration-200 hover:opacity-100 sm:left-14"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2 L14.3 9.7 L22 12 L14.3 14.3 L12 22 L9.7 14.3 L2 12 L9.7 9.7 Z" fill="currentColor" />
        </svg>
        <span className="font-hero-mono text-[12px] font-medium tracking-[0.1em]">INGENIO</span>
      </button>
      <button
        type="button"
        className="absolute right-6 top-8 z-10 inline-flex cursor-pointer items-center rounded-full border border-white/16 px-[18px] py-2 font-hero-mono text-[12px] tracking-[0.03em] text-hero-text/50 transition duration-200 hover:-translate-y-px hover:border-white/40 hover:bg-white/6 hover:text-hero-text active:translate-y-0 sm:right-14"
      >
        Contact Us
      </button>
      <div className="flex justify-center border-b border-white/8 px-6 pb-[22px] pt-[76px] sm:px-14 lg:pt-[22px]">
        <PillNav current={current} counts={counts} onNavigate={onNavigate} onOpenQuestions={onOpenQuestions} />
      </div>
    </>
  )
}
