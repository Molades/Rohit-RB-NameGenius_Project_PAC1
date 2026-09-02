import { brief } from '../data.js'

function Field({ label, value }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-meta text-[10px] font-semibold uppercase tracking-[0.8px] text-meta">{label}</p>
      <div className="border border-border bg-paper px-4 py-[14px]">
        <p className="font-meta text-[14px] leading-[20px] text-ink">{value}</p>
      </div>
    </div>
  )
}

export default function Brief() {
  return (
    <main className="flex justify-center bg-canvas px-6 py-10 sm:px-16 sm:py-16">
      <div className="flex w-full max-w-[600px] flex-col gap-8">
        <h1 className="font-display text-[28px] font-bold leading-[30px] tracking-[-0.4px] text-ink">
          Find a name you can own.
        </h1>
        <Field label="Name" value={brief.name} />
        <Field label="Description" value={brief.description} />
        <Field label="Competitors & keywords" value={brief.competitors} />
        <div className="flex items-center gap-3">
          <p className="font-meta text-[10px] font-semibold uppercase tracking-[0.8px] text-meta">Preferred TLD</p>
          {['.com', '.io', '.ai'].map((tld) => (
            <span
              key={tld}
              className={`border border-border px-[14px] py-[6px] font-meta text-[12px] font-semibold ${
                tld === brief.tld ? 'bg-ink text-paper' : 'bg-paper text-ink'
              }`}
            >
              {tld}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-5">
          <button className="bg-ink px-7 py-4 font-display text-[16px] font-semibold text-paper">
            Find names
          </button>
          <button className="font-meta text-[12px] font-semibold text-ink">
            Sharpen with brand questions →
          </button>
        </div>
      </div>
    </main>
  )
}
