import { useState } from 'react'
import Brief from './screens/Brief.jsx'
import Results from './screens/Results.jsx'
import Shortlist from './screens/Shortlist.jsx'
import Compare from './screens/Compare.jsx'
import QuestionsPanel from './screens/QuestionsPanel.jsx'
import { INITIAL_BRIEF, QUESTIONS } from './data.js'
import { generateNames } from './services/gemini.js'
import { slugify, checkDomainsBatch, placeholderAlternates } from './services/domain.js'

const REGENS_BEFORE_QUESTION = 3

export default function App() {
  const [view, setView] = useState('brief')
  const [questionsOpen, setQuestionsOpen] = useState(false)

  const [brief, setBrief] = useState(INITIAL_BRIEF)
  const [results, setResults] = useState([])
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({ tld: 'any', length: 'any' })
  const [shortlist, setShortlist] = useState([])
  const [compareSel, setCompareSel] = useState([])
  const [answers, setAnswers] = useState({})
  const [regenCount, setRegenCount] = useState(0)
  const [pendingQuestion, setPendingQuestion] = useState(null)

  const firstUnanswered = (a) => {
    const idx = QUESTIONS.findIndex((_, i) => !(a[i] || '').trim())
    return idx === -1 ? null : idx
  }

  // Every batch fetch (first generation, regenerate, answering a follow-up, or
  // retry) goes through here: real Gemini call for name ideas, then a real
  // RDAP check per resulting domain.
  const generateBatch = async (excludeNames, onSuccess) => {
    setIsChecking(true)
    setError(null)

    let names
    try {
      names = await generateNames(brief, excludeNames)
    } catch (err) {
      setError(
        err.code === 'QUOTA_EXCEEDED'
          ? 'Daily Gemini limit reached — try again tomorrow.'
          : 'Could not generate names. Try again.'
      )
      setIsChecking(false)
      return
    }

    const seen = new Set()
    const candidates = []
    for (const name of names) {
      const domain = slugify(name)
      if (!domain || seen.has(domain)) continue
      seen.add(domain)
      candidates.push({ name, domain })
      if (candidates.length >= 8) break
    }

    if (candidates.length === 0) {
      setError('Could not generate names. Try again.')
      setIsChecking(false)
      return
    }

    const checked = await checkDomainsBatch(candidates.map((c) => c.domain))
    const statusByDomain = new Map(checked.map((c) => [c.domain, c.status]))

    const batch = candidates.slice(0, 5).map(({ name, domain }) => ({
      name,
      domain,
      status: statusByDomain.get(domain),
      tlds: placeholderAlternates(name),
    }))

    setResults(batch)
    setIsChecking(false)
    onSuccess?.()
  }

  const findNames = (values) => {
    setBrief(values)
    setFilters({ tld: 'any', length: 'any' })
    setRegenCount(0)
    setPendingQuestion(null)
    setView('results')
    generateBatch([])
  }

  const retry = () => {
    generateBatch(results.map((r) => r.name))
  }

  const regenerate = () => {
    if (pendingQuestion !== null) return
    generateBatch(results.map((r) => r.name), () => {
      setRegenCount((n) => {
        const next = n + 1
        if (next >= REGENS_BEFORE_QUESTION) {
          const idx = firstUnanswered(answers)
          if (idx !== null) {
            setPendingQuestion(idx)
            return 0
          }
        }
        return next
      })
    })
  }

  const registerSelection = () => setRegenCount(0)

  const toggleShortlist = (item) => {
    registerSelection()
    setShortlist((list) =>
      list.some((s) => s.domain === item.domain)
        ? list.filter((s) => s.domain !== item.domain)
        : [...list, item]
    )
  }

  const toggleCompare = (item) => {
    registerSelection()
    setCompareSel((sel) => {
      if (sel.some((s) => s.domain === item.domain)) return sel.filter((s) => s.domain !== item.domain)
      if (sel.length < 2) return [...sel, item]
      return [sel[1], item]
    })
  }

  const saveAnswer = (index, value) => setAnswers((a) => ({ ...a, [index]: value }))

  const answerFollowUp = (index, value) => {
    saveAnswer(index, value)
    setPendingQuestion(null)
    generateBatch(results.map((r) => r.name))
  }

  const skipFollowUp = () => setPendingQuestion(null)

  return (
    <div className="min-h-full bg-canvas">
      <nav className="flex gap-4 border-b border-border bg-paper p-4 font-meta text-[12px]">
        {['brief', 'results', 'shortlist', 'compare'].map((name) => (
          <button
            key={name}
            onClick={() => setView(name)}
            className={view === name ? 'font-semibold text-ink' : 'text-meta'}
          >
            {name}
            {name === 'shortlist' && shortlist.length > 0 ? ` (${shortlist.length})` : ''}
            {name === 'compare' && compareSel.length > 0 ? ` (${compareSel.length})` : ''}
          </button>
        ))}
        <button onClick={() => setQuestionsOpen(true)} className="text-meta">
          questions{Object.keys(answers).length > 0 ? ` (${Object.keys(answers).length})` : ''}
        </button>
      </nav>

      {view === 'brief' && (
        <Brief initial={brief} onFindNames={findNames} onOpenQuestions={() => setQuestionsOpen(true)} />
      )}
      {view === 'results' && (
        <Results
          brief={brief}
          results={results}
          isChecking={isChecking}
          error={error}
          onRetry={retry}
          filters={filters}
          onFiltersChange={setFilters}
          shortlist={shortlist}
          compareSel={compareSel}
          pendingQuestion={pendingQuestion !== null ? QUESTIONS[pendingQuestion] : null}
          onRegenerate={regenerate}
          onToggleShortlist={toggleShortlist}
          onToggleCompare={toggleCompare}
          onAnswerFollowUp={(value) => answerFollowUp(pendingQuestion, value)}
          onSkipFollowUp={skipFollowUp}
        />
      )}
      {view === 'shortlist' && (
        <Shortlist shortlist={shortlist} onRemove={toggleShortlist} onNavigate={setView} />
      )}
      {view === 'compare' && (
        <Compare compareSel={compareSel} onRemove={toggleCompare} onNavigate={setView} />
      )}

      {questionsOpen && (
        <QuestionsPanel answers={answers} onSave={saveAnswer} onClose={() => setQuestionsOpen(false)} />
      )}
    </div>
  )
}
