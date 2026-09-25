import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import Landing from './screens/Landing.jsx'
import Brief from './screens/Brief.jsx'
import Generating from './screens/Generating.jsx'
import Results from './screens/Results.jsx'
import Shortlist from './screens/Shortlist.jsx'
import Compare from './screens/Compare.jsx'
import Questions from './screens/Questions.jsx'
import { INITIAL_BRIEF, QUESTIONS, QUESTION_PLACEHOLDERS } from './data.js'
import { generateNames } from './services/names.js'
import { slugify, checkDomainsBatch, TLDS } from './services/domain.js'
import { preloadPrices } from './services/pricing.js'

const REGENS_BEFORE_QUESTION = 3
// Names shown per batch (first generation and every regenerate).
const BATCH_SIZE = 10
// The Generating screen stays up at least this long so a fast reply doesn't
// flash it for a split second.
const MIN_GENERATING_MS = 1500
// How long the bar rests at 100% before the names appear — long enough for the
// bar's final glide to land and be read.
const FINISH_HOLD_MS = 600
// An in-place regenerate keeps its spinner up at least this long, so a fast
// reply reads as "working" rather than a flicker.
const MIN_REGEN_MS = 900

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
  // True while "Regenerate more" is fetching in place on the Names list.
  const [regenerating, setRegenerating] = useState(false)
  // Each generation takes a number; if a newer one starts (say a new brief while
  // a regenerate is still in flight), the older one drops its result.
  const genRun = useRef(0)

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

  // Prices come from a slow feed, so start fetching as soon as the form opens —
  // by the time names are generated they are usually ready.
  useEffect(() => {
    if (view === 'brief') preloadPrices()
  }, [view])

  // generateBatch can run in the same tick as an answer being saved, so it
  // reads the latest answers from here rather than from a stale render.
  const answersRef = useRef(answers)
  answersRef.current = answers

  const answeredCount = answeredPairs(answers).length

  // The answers the newest names were generated with (as JSON), so we can tell
  // when the user has answered something since — see answersPending below.
  const usedAnswers = useRef('[]')
  const answersPending = () => {
    const pairs = answeredPairs(answers)
    return pairs.length > 0 && JSON.stringify(pairs) !== usedAnswers.current
  }

  const firstUnanswered = (a) => {
    const idx = QUESTIONS.findIndex((_, i) => !(a[i] || '').trim())
    return idx === -1 ? null : idx
  }

  // One batch: real Gemini call for name ideas, then a real RDAP check per
  // resulting domain. Returns the batch (append it with commitBatch), or null
  // if it failed or was superseded.
  // Progress goes to `report` as it runs: 0–60% while waiting on Gemini (which
  // gives no signal of its own, so it eases toward 60), 70% once names are back,
  // then 70–98% as each domain check finishes.
  const generateBatch = async (excludeNames, activeBrief, run, report = () => {}) => {
    const current = () => genRun.current === run
    setError(null)
    let creep = 3
    report(creep)
    const creepTimer = setInterval(() => {
      creep += (60 - creep) * 0.05
      report(creep)
    }, 120)

    let names
    const pairs = answeredPairs(answersRef.current)
    try {
      names = await generateNames({ ...activeBrief, answers: pairs }, excludeNames)
      usedAnswers.current = JSON.stringify(pairs)
    } catch (err) {
      if (current()) {
        setError(
          err.code === 'QUOTA_EXCEEDED'
            ? 'Daily name-generation limit reached — try again tomorrow.'
            : 'Could not generate names. Try again.'
        )
      }
      return null
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
      if (current()) setError('Could not generate names. Try again.')
      return null
    }

    // Every name is checked on every TLD we show, so the whole batch is one
    // set of parallel registry lookups. `domain` is the .com (the name's key).
    const slugOf = (domain) => domain.replace(/.com$/, '')
    report(70)
    const checked = await checkDomainsBatch(
      candidates.flatMap((c) => TLDS.map((ext) => slugOf(c.domain) + ext)),
      (done, total) => report(70 + (28 * done) / total)
    )
    const statusByDomain = new Map(checked.map((c) => [c.domain, c.status]))

    return candidates.map(({ name, domain }) => ({
      name,
      domain,
      status: statusByDomain.get(domain),
      tlds: TLDS.filter((ext) => ext !== '.com').map((ext) => ({
        ext,
        available: statusByDomain.get(slugOf(domain) + ext) === 'available',
      })),
    }))
  }

  // `visual` fixes each name's colour/glyph at creation, so it looks the same
  // on every screen (Names list, Shortlist, Compare).
  const commitBatch = (batch) =>
    setResults((prev) => {
      const have = new Set(prev.map((r) => r.domain))
      const fresh = batch.filter((b) => !have.has(b.domain)).map((b, i) => ({ ...b, visual: prev.length + i }))
      return [...prev, ...fresh]
    })

  // Every trigger (Find names, regenerate, a follow-up answer, retry) shows the
  // Generating screen, then lands on Results — which has its own error/retry
  // state, so a failed batch still moves on after the minimum time.
  // activeBrief is passed explicitly by findNames because setBrief hasn't
  // landed yet in that same render.
  const runGeneration = async (excludeNames, activeBrief = brief, onSuccess) => {
    const run = ++genRun.current
    preloadPrices()
    setRegenerating(false)
    setProgress(0)
    go('generating')
    const startedAt = Date.now()
    const batch = await generateBatch(excludeNames, activeBrief, run, setProgress)
    if (genRun.current !== run) return
    if (batch) {
      commitBatch(batch)
      setProgress(100)
      onSuccess?.()
    }
    const remaining = MIN_GENERATING_MS - (Date.now() - startedAt)
    await sleep(Math.max(batch ? FINISH_HOLD_MS : 0, remaining))
    if (genRun.current !== run) return
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

  // Every third regenerate without a shortlist/compare action surfaces the next
  // unanswered brand question.
  const noteRegeneration = () => {
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

  // "Regenerate more" stays on the Names list: the button shows its own busy
  // state, and the new names are appended below when they arrive. A failure
  // leaves the list as it was and shows the error banner (with Try again).
  // `countAsRegen` is false when the refresh comes from answering the brand
  // questions, which shouldn't count towards the "3 regenerates, then a question".
  const regenerateInPlace = async ({ countAsRegen = true } = {}) => {
    if (regenerating) return
    const run = ++genRun.current
    setRegenerating(true)
    const startedAt = Date.now()
    const batch = await generateBatch(
      results.map((r) => r.name),
      brief,
      run
    )
    await sleep(Math.max(0, MIN_REGEN_MS - (Date.now() - startedAt)))
    if (genRun.current !== run) return
    if (batch) {
      commitBatch(batch)
      if (countAsRegen) noteRegeneration()
    }
    setRegenerating(false)
  }

  const regenerate = () => {
    if (pendingQuestion === null) regenerateInPlace()
  }

  // Answering brand questions should visibly change the names. When the user
  // leaves the Questions page for the Names list with answers the current names
  // were not built from, refresh them in place — the "Regenerating" button shows
  // it, and the new names arrive below the old ones. (Leaving for the Brief form
  // needs nothing: Find names uses the answers.) A follow-up question answered
  // here no longer needs asking on the Names list.
  const previousView = useRef(view)
  useEffect(() => {
    const from = previousView.current
    previousView.current = view
    if (from !== 'questions' || view !== 'results') return
    if (pendingQuestion !== null && (answers[pendingQuestion] || '').trim()) setPendingQuestion(null)
    if (results.length > 0 && answersPending()) regenerateInPlace({ countAsRegen: false })
  }, [view])

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

  // Leaving Questions would refresh the names (see the effect above).
  const refreshesNames = questionsFrom !== 'brief' && results.length > 0 && answersPending()

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
          pendingPlaceholder={pendingQuestion !== null ? QUESTION_PLACEHOLDERS[pendingQuestion] : undefined}
          regenerating={regenerating}
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
        <Questions
          {...nav}
          answers={answers}
          onSave={saveAnswer}
          refreshesNames={refreshesNames}
          onDone={() => go(refreshesNames ? 'results' : questionsFrom)}
        />
      )}
    </div>
  )
}
