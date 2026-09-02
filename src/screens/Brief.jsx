import { useState } from 'react'
import { brief as initialBrief } from '../data.js'

function TextField({ label, value, onChange, multiline }) {
  const Tag = multiline ? 'textarea' : 'input'
  return (
    <div className="flex flex-col gap-2">
      <label className="font-meta text-[10px] font-semibold uppercase tracking-[0.8px] text-meta">
        {label}
      </label>
      <Tag
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={multiline ? 3 : undefined}
        className="border border-border bg-paper px-4 py-[14px] font-meta text-[14px] leading-[20px] text-ink outline-none focus:border-ink"
      />
    </div>
  )
}

export default function Brief({ onOpenQuestions } = {}) {
  const [name, setName] = useState(initialBrief.name)
  const [description, setDescription] = useState(initialBrief.description)
  const [competitors, setCompetitors] = useState(initialBrief.competitors)
  const [tld, setTld] = useState(initialBrief.tld)

  return (
    <main className="flex justify-center bg-canvas px-6 py-10 sm:px-16 sm:py-16">
      <div className="flex w-full max-w-[600px] flex-col gap-8">
        <h1 className="font-display text-[28px] font-bold leading-[30px] tracking-[-0.4px] text-ink">
          Find a name you can own.
        </h1>
        <TextField label="Name" value={name} onChange={setName} />
        <TextField label="Description" value={description} onChange={setDescription} multiline />
        <TextField label="Competitors & keywords" value={competitors} onChange={setCompetitors} />
        <div className="flex items-center gap-3">
          <p className="font-meta text-[10px] font-semibold uppercase tracking-[0.8px] text-meta">Preferred TLD</p>
          {['.com', '.io', '.ai'].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setTld(opt)}
              className={`border border-border px-[14px] py-[6px] font-meta text-[12px] font-semibold ${
                opt === tld ? 'bg-ink text-paper' : 'bg-paper text-ink'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-5">
          <button className="bg-ink px-7 py-4 font-display text-[16px] font-semibold text-paper">
            Find names
          </button>
          <button onClick={onOpenQuestions} className="font-meta text-[12px] font-semibold text-ink">
            Sharpen with brand questions →
          </button>
        </div>
      </div>
    </main>
  )
}
