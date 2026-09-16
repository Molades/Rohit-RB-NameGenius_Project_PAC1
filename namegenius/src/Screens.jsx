import { useState } from 'react'
import { QUESTIONS, availableTlds, domainFor, styleLabel } from './data'

// Shared shell: back link + heading.
function Shell({ title, meta, onBack, children }) {
  return (
    <div className="min-h-screen bg-white text-[#0a0a0a]">
      <div className="mx-auto w-full max-w-[1000px] px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold tracking-tight">NameGenius</div>
          <button
            type="button"
            onClick={onBack}
            className="text-[14px] text-[#6b6b6b] transition-colors hover:text-[#0a0a0a]"
          >
            ← Back
          </button>
        </div>
        <div className="mt-12 flex flex-wrap items-baseline gap-5">
          <h1 className="text-[2.5rem] font-extrabold leading-[1.0] tracking-[-0.04em] sm:text-[3.25rem]">
            {title}
          </h1>
          {meta && (
            <span className="text-[14px] font-semibold uppercase tracking-[0.14em] text-[#9a9a9a]">
              {meta}
            </span>
          )}
        </div>
        <div className="mt-10">{children}</div>
      </div>
    </div>
  )
}

function PrimaryButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-sm bg-[#0a0a0a] px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#333]"
    >
      {children}
    </button>
  )
}

function TldStrip({ item }) {
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
    </div>
  )
}

// S4 — Shortlist
export function Shortlist({ saved, onRemove, onBack, onNavigate }) {
  return (
    <Shell
      title="Shortlist"
      meta={saved.length > 0 ? `${saved.length} ${saved.length === 1 ? 'name' : 'names'}` : null}
      onBack={onBack}
    >
      {saved.length === 0 ? (
        <div className="border-2 border-dashed border-[#c9c9c9] py-24 text-center">
          <p className="text-[17px] text-[#6b6b6b]">No saved names yet.</p>
          <div className="mt-6">
            <PrimaryButton onClick={() => onNavigate('results')}>
              Browse results
            </PrimaryButton>
          </div>
        </div>
      ) : (
        <div className="border-t-[1.5px] border-[#0a0a0a]">
          {saved.map((item) => (
            <div
              key={item.slug}
              className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e4e4e4] px-1 py-7"
            >
              <div className="flex flex-wrap items-baseline gap-5">
                <span className="text-[30px] font-semibold tracking-[-0.02em]">
                  {item.name}
                </span>
                <span className="font-mono text-[16px] text-[#6b6b6b]">
                  {domainFor(item, 'any TLD')}
                </span>
              </div>
              <div className="flex items-center gap-7">
                <TldStrip item={item} />
                <button
                  type="button"
                  aria-label={`Remove ${item.name}`}
                  onClick={() => onRemove(item)}
                  className="text-[24px] leading-none text-[#9a9a9a] transition-colors hover:text-[#0a0a0a]"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          <div className="mt-8">
            <button
              type="button"
              onClick={() => onNavigate('results')}
              className="text-[14px] text-[#6b6b6b] underline decoration-[#c9c9c9] underline-offset-4 transition-colors hover:text-[#0a0a0a]"
            >
              Back to results
            </button>
          </div>
        </div>
      )}
    </Shell>
  )
}

// S5 — Compare
export function Compare({ compareSel, onClear, onBack, onNavigate }) {
  if (compareSel.length < 2) {
    return (
      <Shell title="Compare" onBack={onBack}>
        <div className="border-2 border-dashed border-[#c9c9c9] py-24 text-center">
          <p className="text-[17px] text-[#6b6b6b]">
            Pick two names to compare them side by side.
          </p>
          <div className="mt-6">
            <PrimaryButton onClick={() => onNavigate('results')}>
              Choose names
            </PrimaryButton>
          </div>
        </div>
      </Shell>
    )
  }

  const rows = [
    { label: 'Domain', get: (i) => domainFor(i, 'any TLD'), mono: true },
    {
      label: 'Available on',
      get: (i) => {
        const t = availableTlds(i)
        return t.length ? t.join('  ') : 'none'
      },
      mono: true,
    },
    { label: 'Length', get: (i) => `${i.slug.length} characters` },
    { label: 'Style', get: (i) => styleLabel(i) },
  ]

  return (
    <Shell title="Compare" onBack={onBack}>
      <div className="grid grid-cols-2 border-t-[1.5px] border-[#0a0a0a]">
        {compareSel.map((item, col) => (
          <div
            key={item.slug}
            className={
              'py-8 ' +
              (col === 0 ? 'border-r border-[#e4e4e4] pr-6 sm:pr-10' : 'pl-6 sm:pl-10')
            }
          >
            <div className="text-[28px] font-bold tracking-[-0.03em] sm:text-[34px]">
              {item.name}
            </div>
            <div className="mt-2 font-mono text-[16px] text-[#6b6b6b]">
              {domainFor(item, 'any TLD')}
            </div>
            <dl className="mt-8 flex flex-col gap-6">
              {rows.map((row) => (
                <div key={row.label}>
                  <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9a9a9a]">
                    {row.label}
                  </dt>
                  <dd
                    className={
                      'mt-2 text-[19px] tracking-[-0.01em] ' + (row.mono ? 'font-mono' : '')
                    }
                  >
                    {row.get(item)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <button
          type="button"
          onClick={onClear}
          className="text-[14px] text-[#6b6b6b] underline decoration-[#c9c9c9] underline-offset-4 transition-colors hover:text-[#0a0a0a]"
        >
          Clear selection
        </button>
      </div>
    </Shell>
  )
}

// S6 — Brand Discovery Questions
export function Questions({ answers, onSave, onBack }) {
  const [draft, setDraft] = useState(answers ?? {})
  const [savedFlash, setSavedFlash] = useState(false)

  const update = (i, value) => setDraft((d) => ({ ...d, [i]: value }))
  const handleSave = () => {
    onSave(draft)
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 1400)
  }
  const answeredCount = QUESTIONS.filter((_, i) => (draft[i] || '').trim()).length

  return (
    <Shell title="Brand Discovery" onBack={onBack}>
      <p className="-mt-4 mb-10 text-[16px] text-[#6b6b6b]">
        Optional — answers here sharpen the names we generate.
      </p>
      <div className="flex flex-col gap-9">
        {QUESTIONS.map((q, i) => (
          <label key={i} className="block">
            <span className="mb-2.5 block text-[17px] font-semibold tracking-[-0.01em]">
              {q}
            </span>
            <input
              type="text"
              value={draft[i] ?? ''}
              onChange={(e) => update(i, e.target.value)}
              placeholder="Your answer"
              className="h-12 w-full border-0 border-b-[1.5px] border-[#dcdcdc] bg-transparent text-[17px] outline-none placeholder:text-[#b3b3b3] focus:border-[#0a0a0a]"
            />
          </label>
        ))}
      </div>
      <div className="mt-10 flex items-center gap-5">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-sm bg-[#0a0a0a] px-7 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#333]"
        >
          Save answers
        </button>
        <span className="text-[15px] text-[#6b6b6b]">
          {savedFlash ? 'Saved.' : `${answeredCount} of ${QUESTIONS.length} answered`}
        </span>
      </div>
    </Shell>
  )
}
