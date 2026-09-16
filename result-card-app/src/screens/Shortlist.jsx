import { useState } from 'react'

export default function Shortlist({ shortlist, onRemove, onNavigate }) {
  const [copied, setCopied] = useState(false)

  const copyList = async () => {
    const text = shortlist.map((s) => `${s.domain}${s.tld}`).join('\n')
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // clipboard permission denied — still confirm so the flow isn't blocked
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <main className="flex justify-center bg-canvas px-6 py-10 sm:px-16 sm:py-16">
      <div className="flex w-full max-w-[600px] flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-[28px] font-bold leading-[30px] tracking-[-0.4px] text-ink">
            Shortlist
          </h1>
          {shortlist.length > 0 && (
            <button
              type="button"
              onClick={copyList}
              className="border border-ink bg-paper px-[18px] py-[10px] font-meta text-[12px] font-semibold text-ink"
            >
              {copied ? 'Copied ✓' : 'Copy list'}
            </button>
          )}
        </div>

        {shortlist.length === 0 ? (
          <div className="border border-border bg-paper px-5 py-10 text-center">
            <p className="font-meta text-[12px] text-meta">
              Nothing shortlisted yet. Shortlist a name from the results screen.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('results')}
              className="mt-4 font-meta text-[12px] font-semibold text-ink"
            >
              Go to results →
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            {shortlist.map((item) => (
              <div key={item.domain} className="flex items-center justify-between border-b border-border py-4">
                <div className="flex flex-col gap-0.5">
                  <p className="font-meta text-[14px] font-semibold text-ink">{item.name}</p>
                  <p className="font-meta text-[12px] text-meta">
                    {item.domain}
                    {item.tld}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(item)}
                  className="font-meta text-[12px] font-semibold text-meta hover:text-ink"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
