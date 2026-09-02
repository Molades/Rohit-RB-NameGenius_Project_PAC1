import { shortlist } from '../data.js'

export default function Shortlist() {
  return (
    <main className="flex justify-center bg-canvas px-16 py-16">
      <div className="flex w-[600px] flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-[28px] font-bold leading-[30px] tracking-[-0.4px] text-ink">
            Shortlist
          </h1>
          <button className="border border-ink bg-paper px-[18px] py-[10px] font-meta text-[12px] font-semibold text-ink">
            Copy list
          </button>
        </div>
        <div className="flex flex-col">
          {shortlist.map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b border-border py-4">
              <div className="flex flex-col gap-0.5">
                <p className="font-meta text-[14px] font-semibold text-ink">{item.name}</p>
                <p className="font-meta text-[12px] text-meta">{item.domain}</p>
              </div>
              <button className="font-meta text-[12px] font-semibold text-meta">Remove</button>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
