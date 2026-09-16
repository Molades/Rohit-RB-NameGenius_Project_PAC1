import { useState } from 'react'

const TLDS = ['.com', '.io', '.co', 'any TLD']

function Brief({ initial, onFindNames, onQuestions }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [competitors, setCompetitors] = useState(initial?.competitors ?? '')
  const [tld, setTld] = useState(initial?.tld ?? '.com')
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)

  // Validation lives in one place so inline fields and submit agree.
  const errors = {}
  if (name.trim().length === 0) {
    errors.name = 'Enter a name or keyword to check.'
  } else if (name.trim().length < 2) {
    errors.name = 'That’s a little short — try at least 2 characters.'
  }
  const isValid = Object.keys(errors).length === 0
  const showError = (field) => (touched[field] || submitted) && errors[field]

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    if (!isValid) return
    onFindNames({
      name: name.trim(),
      description: description.trim(),
      competitors: competitors.trim(),
      tld,
    })
  }

  return (
    <div className="min-h-screen bg-white text-[#0a0a0a]">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-8 sm:px-12">
        {/* header */}
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold tracking-tight">NameGenius</div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a9a9a]">
            Domain naming
          </div>
        </div>

        {/* editorial column */}
        <div className="mx-auto mt-16 max-w-[600px] sm:mt-24">
          <h1 className="text-center text-[2.75rem] font-extrabold leading-[1.0] tracking-[-0.04em] sm:text-[4.4rem]">
            Find a name
            <br />
            you can{' '}
            <span style={{ boxShadow: 'inset 0 -0.1em 0 #0a0a0a' }}>own</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-[440px] text-center text-[17px] leading-[1.5] text-[#6b6b6b]">
            Type a name or keyword. We check the domains you can actually get.
          </p>

          {submitted && !isValid && (
            <div
              role="alert"
              className="mt-10 border-2 border-[#0a0a0a] bg-[#f6f6f5] px-5 py-3 text-[15px] font-semibold"
            >
              Please complete the required field below to continue.
            </div>
          )}

          {/* form */}
          <form className="mt-14 flex flex-col gap-8" onSubmit={handleSubmit} noValidate>
            <label className="block">
              <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.1em]">
                Name to check
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                placeholder="e.g. Northwind"
                aria-invalid={showError('name') ? 'true' : undefined}
                className={
                  'h-[58px] w-full rounded-sm border-[1.5px] bg-white px-[18px] text-[18px] tracking-[-0.01em] outline-none placeholder:text-[#b3b3b3] ' +
                  (showError('name')
                    ? 'border-[#0a0a0a] ring-2 ring-[#0a0a0a] ring-offset-2'
                    : 'border-[#0a0a0a] focus:ring-2 focus:ring-[#0a0a0a] focus:ring-offset-2')
                }
              />
              {showError('name') && (
                <span className="mt-3 block text-[15px] font-semibold">
                  {errors.name}
                </span>
              )}
            </label>

            <UnderlineField
              label="Description"
              value={description}
              onChange={setDescription}
              placeholder="What does it do, in a sentence?"
            />
            <UnderlineField
              label="Competitors & keywords"
              value={competitors}
              onChange={setCompetitors}
              placeholder="Names or words to steer toward — or away from"
            />

            {/* TLD preference as typographic tabs */}
            <div>
              <span className="mb-3.5 block text-xs font-semibold uppercase tracking-[0.1em]">
                TLD preference
              </span>
              <div className="flex flex-wrap items-center gap-7">
                {TLDS.map((option) => {
                  const active = tld === option
                  const isMono = option !== 'any TLD'
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setTld(option)}
                      aria-pressed={active}
                      className={
                        (isMono ? 'font-mono text-[17px] ' : 'text-[15px] ') +
                        (active
                          ? 'font-bold text-[#0a0a0a]'
                          : 'text-[#9a9a9a] hover:text-[#0a0a0a]')
                      }
                      style={
                        active
                          ? { boxShadow: 'inset 0 -0.12em 0 #0a0a0a', paddingBottom: '2px' }
                          : undefined
                      }
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 h-[60px] w-full rounded-sm bg-[#0a0a0a] text-[16px] font-semibold tracking-[0.01em] text-white transition-colors hover:bg-[#333]"
            >
              Find names
            </button>
          </form>

          <div className="mt-7 text-center">
            <button
              type="button"
              onClick={onQuestions}
              className="text-[14px] text-[#6b6b6b] underline decoration-[#c9c9c9] underline-offset-4 transition-colors hover:text-[#0a0a0a] hover:decoration-[#0a0a0a]"
            >
              Questions to sharpen results
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function UnderlineField({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-2.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#9a9a9a]">
        {label}{' '}
        <span className="font-normal normal-case tracking-normal">(optional)</span>
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full border-0 border-b-[1.5px] border-[#dcdcdc] bg-transparent text-[17px] outline-none placeholder:text-[#b3b3b3] focus:border-[#0a0a0a]"
      />
    </label>
  )
}

export default Brief
