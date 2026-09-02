import ResultCard from '../components/ResultCard.jsx'
import { results, brief } from '../data.js'

export default function Results() {
  return (
    <main className="flex justify-center bg-canvas px-6 py-10 sm:px-16 sm:py-16">
      <div className="flex w-full max-w-[1039px] flex-col gap-7">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-[20px] font-bold leading-[24px] tracking-[-0.2px] text-ink">
            5 names for {brief.name}
          </h1>
          <button className="border border-ink bg-paper px-5 py-3 font-meta text-[12px] font-semibold text-ink">
            Regenerate 5 more
          </button>
        </div>
        <div className="flex gap-3">
          <span className="border border-border bg-paper px-[14px] py-[6px] font-meta text-[12px] font-semibold text-meta">
            TLD: {brief.tld}
          </span>
          <span className="border border-border bg-paper px-[14px] py-[6px] font-meta text-[12px] font-semibold text-meta">
            Length: any
          </span>
        </div>
        <div className="flex flex-wrap gap-5">
          {results.map((r) => (
            <ResultCard key={r.id} name={r.name} domain={r.domain} tld={r.tld} state={r.state} />
          ))}
        </div>
        <div className="border border-border bg-paper px-5 py-4">
          <p className="font-meta text-[12px] leading-[20px] text-meta">
            After 3 regenerations with no pick, a brand question surfaces here.
          </p>
        </div>
      </div>
    </main>
  )
}
