import { compareItems } from '../data.js'

function Row({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-meta text-[10px] font-semibold uppercase tracking-[0.8px] text-meta">{label}</p>
      <p className="font-meta text-[12px] leading-[18px] text-ink">{value}</p>
    </div>
  )
}

export default function Compare() {
  return (
    <main className="flex justify-center bg-canvas px-16 py-16">
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-[28px] font-bold leading-[30px] tracking-[-0.4px] text-ink">
          Compare
        </h1>
        <div className="flex gap-5">
          {compareItems.map((item) => (
            <div key={item.id} className="flex w-[260px] flex-col gap-4 border border-border bg-paper p-6">
              <p className="font-meta text-[18px] font-semibold text-ink">{item.name}</p>
              <Row label="Domain status" value={item.status} />
              <Row label="Available TLDs" value={item.tlds} />
              <Row label="Why it fits" value={item.fit} />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
