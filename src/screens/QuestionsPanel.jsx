import { QUESTIONS } from '../data.js'

export default function QuestionsPanel({ onClose }) {
  return (
    <div className="fixed inset-0 flex items-start justify-center overflow-auto bg-ink/40 py-16">
      <div className="flex w-full max-w-[640px] flex-col gap-5 border border-border bg-paper p-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[20px] font-bold leading-[24px] tracking-[-0.2px] text-ink">
            Brand-discovery questions
          </h2>
          <button onClick={onClose} className="font-meta text-[12px] font-semibold text-meta">
            Close
          </button>
        </div>
        {QUESTIONS.map(({ q, a }) => (
          <div key={q} className="flex flex-col gap-2">
            <p className="font-meta text-[12px] font-semibold text-ink">{q}</p>
            <div className="border border-border bg-paper px-4 py-[14px]">
              <p className="font-meta text-[14px] leading-[20px] text-meta">{a}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
