import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import Landing from './screens/Landing.jsx'
import Brief from './screens/Brief.jsx'
import Generating from './screens/Generating.jsx'
import Results from './screens/Results.jsx'
import Shortlist from './screens/Shortlist.jsx'
import Compare from './screens/Compare.jsx'
import Questions from './screens/Questions.jsx'
import { INITIAL_BRIEF, QUESTIONS } from './data.js'
import { generateNames } from './services/gemini.js'
import { slugify, checkDomainsBatch, placeholderAlternates } from './services/domain.js'

const REGENS_BEFORE_QUESTION = 3
// Names shown per batch (first generation and every regenerate).
const BATCH_SIZE = 10
// The Generating screen stays up at least this long so a fast reply doesn't
// flash it for a split second.
const MIN_GENERATING_MS = 1500
// How long the bar rests at 100% before the names appear — long enough for the
// bar's final glide to land and be read.
const FINISH_HOLD_MS = 600

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const answeredPairs = (answers) =>
  QUESTIONS.map((q, i) => [q, (answers[i] || '').trim()]).filter(([, a]) => a)

export default function App() {
  const [view, setView] = useState('landing')
  // Where the Questions page returns to when the user is done with it.
  const [questionsFrom, setQuestionsFrom] = useState('results')

  const [brief, setBrief] = useState(INITIAL_BRIEF)
  const [results, setResults] = useState([])
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [primaryTld, setPrimaryTld] = useState('.com')
  const [shortlist, setShortlist] = useState([])
  const [compareSel, setCompareSel] = useState([])
  const [answers, setAnswers] = useState({})
  const [regenCount, setRegenCount] = useState(0)
  const [pendingQuestion, setPendingQuestion] = useState(null)

  // Every screen change goes through here so it gets the crossfade (styled in
  // index.css). Browsers without View Transitions, and users who prefer
  // reduced motion, get a plain instant swap.
  const go = (next) => {
    if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setView(next)
      return
    }
    document.startViewTransition(() => flushSync(() => setView(next)))
  }

  // generateBatch can run in the same tick as an answer being saved, so it
  // reads the latest answers from here rather than from a stale render.
  const answersRef = useRef(answers)
  answersRef.current = answers

  const answeredCount = answeredPairs(answers).length

  const firstUnanswered = (a) => {
    const idx = QUESTIONS.findIndex((_, i) => !(a[i] || '').trim())
    return idx === -1 ? null : idx
  }

  // One batch: real Gemini call for name ideas, then a real RDAP check per
  // resulting domain, appended to the list. Returns whether names were added.
  // Progress is reported as it goes: 0–60% while waiting on Gemini (which gives
  // no signal of its own, so it eases toward 60), 70% once names are back, then
  // 70–98% as each domain check finishes.
  const generateBatch = async (excludeNames, activeBrief) => {
    setError(null)
    let creep = 3
    setProgress(creep)
    const creepTimer = setInterval(() => {
      creep += (60 - creep) * 0.05
      setProgress(creep)
    }, 120)

    let names
    try {
      names = await generateNames({ ...activeBrief, answers: answeredPairs(answersRef.current) }, excludeNames)
    } catch (err) {
      setError(
        err.code === 'QUOTA_EXCEEDED'
          ? 'Daily Gemini limit reached — try again tomorrow.'
          : 'Could not generate names. Try again.'
      )
      return false
    } finally {
      clearInterval(creepTimer)
    }

    // Skip anything already on screen (or repeated within this reply), then
    // take a full batch from what is left.
    const seen = new Set(excludeNames.map(slugify))
    const candidates = []
    for (const name of names) {
      const domain = slugify(name)
      if (!domain || seen.has(domain)) continue
      seen.add(domain)
      candidates.push({ name, domain })
      if (candidates.length >= BATCH_SIZE) break
    }

    if (candidates.length === 0) {
      setError('Could not generate names. Try again.')
      return false
    }

    setProgress(70)
    const checked = await checkDomainsBatch(
      candidates.map((c) => c.domain),
      (done, total) => setProgress(70 + (28 * done) / total)
    )
    const statusByDomain = new Map(checked.map((c) => [c.domain, c.status]))

    const batch = candidates.map(({ name, domain }) => ({
      name,
      domain,
      status: statusByDomain.get(domain),
      tlds: placeholderAlternates(name),
    }))

    // `visual` fixes each name's colour/glyph at creation, so it looks the same
    // on every screen (Names list, Shortlist, Compare).
    setResults((prev) => {
      const have = new Set(prev.map((r) => r.domain))
      const fresh = batch.filter((b) => !have.has(b.domain)).map((b, i) => ({ ...b, visual: prev.length + i }))
      return [...prev, ...fresh]
    })
    return true
  }

  // Every trigger (Find names, regenerate, a follow-up answer, retry) shows the
  // Generating screen, then lands on Results — which has its own error/retry
  // state, so a failed batch still moves on after the minimum time.
  // activeBrief is passed explicitly by findNames because setBrief hasn't
  // landed yet in that same render.
  const runGeneration = async (excludeNames, activeBrief = brief, onSuccess) => {
    setProgress(0)
    go('generating')
    const startedAt = Date.now()
    const ok = await generateBatch(excludeNames, activeBrief)
    if (ok) {
      setProgress(100)
      onSuccess?.()
    }
    const remaining = MIN_GENERATING_MS - (Date.now() - startedAt)
    await sleep(Math.max(ok ? FINISH_HOLD_MS : 0, remaining))
    go('results')
  }

  const findNames = (values) => {
    setBrief(values)
    setPrimaryTld(values.tld || '.com')
    setResults([])
    setRegenCount(0)
    setPendingQuestion(null)
    runGeneration([], values)
  }

  const retry = () => {
    runGeneration(results.map((r) => r.name))
  }

  const regenerate = () => {
    if (pendingQuestion !== null) return
    runGeneration(
      results.map((r) => r.name),
      brief,
      () => {
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
      }
    )
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
    answersRef.current = { ...answers, [index]: value }
    saveAnswer(index, value)
    setPendingQuestion(null)
    runGeneration(results.map((r) => r.name))
  }

  const skipFollowUp = () => setPendingQuestion(null)

  // draft is the Brief form's unsaved values, kept so leaving it for the
  // Questions page doesn't lose what was typed.
  const openQuestions = (draft) => {
    if (draft) setBrief(draft)
    if (view !== 'questions') setQuestionsFrom(view)
    go('questions')
  }

  const navCounts = { shortlist: shortlist.length, compare: compareSel.length, questions: answeredCount }
  const nav = { navCounts, onNavigate: go, onOpenQuestions: openQuestions }

  return (
    <div className="min-h-full bg-ink">
      {view === 'landing' && <Landing onProceed={() => go('brief')} />}
      {view === 'brief' && (
        <Brief
          initial={brief}
          onFindNames={findNames}
          onOpenQuestions={openQuestions}
          onBack={() => go('landing')}
        />
      )}
      {view === 'generating' && <Generating progress={progress} />}
      {view === 'results' && (
        <Results
          {...nav}
          brief={brief}
          results={results}
          error={error}
          onRetry={retry}
          primaryTld={primaryTld}
          onPrimaryTldChange={setPrimaryTld}
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
        <Shortlist
          {...nav}
          shortlist={shortlist}
          compareSel={compareSel}
          onRemove={toggleShortlist}
          onToggleCompare={toggleCompare}
        />
      )}
      {view === 'compare' && (
        <Compare
          {...nav}
          compareSel={compareSel}
          shortlist={shortlist}
          onRemove={toggleCompare}
          onToggleShortlist={toggleShortlist}
        />
      )}
      {view === 'questions' && (
        <Questions {...nav} answers={answers} onSave={saveAnswer} onDone={() => go(questionsFrom)} />
      )}
    </div>
  )
}
