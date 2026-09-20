const ITEMS = ['brief', 'results', 'shortlist', 'compare', 'questions']

export default function PillNav({ current, counts = {}, onNavigate, onOpenQuestions }) {
  return (
    <nav
      aria-label="Sections"
      className="inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full [scrollbar-width:none] border border-white/10 bg-white/5 p-1.5"
    >
      {ITEMS.map((name) => {
        const active = name === current
        const count = counts[name] || 0
        return (
          <button
            key={name}
            type="button"
            aria-current={active ? 'page' : undefined}
            onClick={() => (name === 'questions' ? onOpenQuestions() : onNavigate(name))}
            className={`shrink-0 cursor-pointer whitespace-nowrap rounded-full px-5 py-[9px] font-hero-mono text-[13px] tracking-[0.04em] transition-colors duration-200 ${
              active ? 'bg-white/8 font-semibold text-hero-text' : 'text-hero-text/50 hover:text-hero-text'
            }`}
          >
            {name}
            {count > 0 ? ` (${count})` : ''}
          </button>
        )
      })}
    </nav>
  )
}
