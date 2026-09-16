function Row({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-meta text-[10px] font-semibold uppercase tracking-[0.8px] text-meta">{label}</p>
      <p className="font-meta text-[12px] leading-[18px] text-ink">{value}</p>
    </div>
  )
}

export default function Compare({ compareSel, onRemove, onNavigate }) {
  return (
    <main className="flex justify-center bg-canvas px-6 py-10 sm:px-16 sm:py-16">
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-[28px] font-bold leading-[30px] tracking-[-0.4px] text-ink">
          Compare
        </h1>

        {compareSel.length < 2 ? (
          <div className="border border-border bg-paper px-5 py-10 text-center">
            <p className="font-meta text-[12px] text-meta">
              {compareSel.length === 0
                ? 'Add two or more names to compare from the results screen.'
                : 'Add one more name to compare side by side.'}
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
          <div className="flex flex-wrap gap-5">
            {compareSel.map((item) => (
              <div key={item.domain} className="flex w-[260px] flex-col gap-4 border border-border bg-paper p-6">
                <div className="flex items-center justify-between">
                  <p className="font-meta text-[18px] font-semibold text-ink">{item.name}</p>
                  <button
                    type="button"
                    onClick={() => onRemove(item)}
                    className="font-meta text-[11px] font-semibold text-meta hover:text-ink"
                  >
                    Remove
                  </button>
                </div>
                <Row label="Domain status" value={item.status === 'available' ? 'Available' : 'Taken'} />
                <Row label="Domain" value={item.domain} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
