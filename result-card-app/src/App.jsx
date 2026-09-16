import { useState } from 'react'
import Brief from './screens/Brief.jsx'
import Results from './screens/Results.jsx'
import Shortlist from './screens/Shortlist.jsx'
import Compare from './screens/Compare.jsx'
import QuestionsPanel from './screens/QuestionsPanel.jsx'
import { CANDIDATE_POOL, INITIAL_BRIEF, QUESTIONS, pickBatch } from './data.js'

const REGENS_BEFORE_QUESTION = 3
// Mocked domain-check delay + failure rate — stands in for the real RDAP call's
// loading/error states (Phase 3) without an actual network request.
const CHECK_DELAY_MS = 700
const SIMULATED_FAILURE_RATE = 0.15

export default function App() {
  const [view, setView] = useState('brief')
  const [questionsOpen, setQuestionsOpen] = useState(false)

  const [brief, setBrief] = useState(INITIAL_BRIEF)
  const [results, setResults] = useState(() => pickBatch(CANDIDATE_POOL))
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

  // Every batch fetch (first generation, regenerate, or answering a follow-up)
  // goes through here: a brief "checking" state, then either a fresh batch or
  // a simulated failure — the same shape a real RDAP call would have.
  const runBatch = (excludeDomains, onSuccess) => {
    setIsChecking(true)
    setError(null)
    setTimeout(() => {
      if (Math.random() < SIMULATED_FAILURE_RATE) {
        setError('Domain check failed. Try again.')
        setIsChecking(false)
        return
      }
      setResults(pickBatch(CANDIDATE_POOL, excludeDomains))
      setIsChecking(false)
      onSuccess?.()
    }, CHECK_DELAY_MS)
  }

  const findNames = (values) => {
    setBrief(values)
    setFilters({ tld: 'any', length: 'any' })
    setRegenCount(0)
    setPendingQuestion(null)
    setView('results')
    runBatch([])
  }

  const retry = () => {
    runBatch(results.map((r) => r.domain))
  }

  const regenerate = () => {
    if (pendingQuestion !== null) return
    runBatch(results.map((r) => r.domain), () => {
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
    runBatch(results.map((r) => r.domain))
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
