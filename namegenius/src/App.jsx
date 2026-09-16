import { useState } from 'react'
import Brief from './Brief'
import Results from './Results'
import { Shortlist, Compare, Questions } from './Screens'
import { QUESTIONS } from './data'

const EMPTY_BRIEF = { name: '', description: '', competitors: '', tld: '.com' }
const REGENS_BEFORE_QUESTION = 3

function App() {
  const [view, setView] = useState('brief')
  const [history, setHistory] = useState([])

  // Shared, app-wide state so every screen works off the same data.
  const [brief, setBrief] = useState(EMPTY_BRIEF)
  const [saved, setSaved] = useState([]) // name items on the shortlist
  const [compareSel, setCompareSel] = useState([]) // up to 2 name items
  const [answers, setAnswers] = useState({}) // brand-discovery answers by index
  const [generation, setGeneration] = useState(0) // bump to reshuffle results
  const [regenCount, setRegenCount] = useState(0) // regens since last question
  const [pendingQuestion, setPendingQuestion] = useState(null) // index or null

  // History-aware navigation: Back always returns to the previous screen.
  const navigate = (next) => {
    setHistory((h) => [...h, view])
    setView(next)
  }
  const back = () => {
    setHistory((h) => {
      if (h.length === 0) {
        setView('brief')
        return h
      }
      const copy = h.slice()
      const prev = copy.pop()
      setView(prev)
      return copy
    })
  }

  const startSearch = (values) => {
    setBrief(values)
    setGeneration(0)
    setRegenCount(0)
    setPendingQuestion(null)
    navigate('results')
  }

  const firstUnanswered = () =>
    QUESTIONS.findIndex((_, i) => !(answers[i] || '').trim())

  const regenerate = () => {
    if (pendingQuestion !== null) return // resolve the follow-up first
    setGeneration((g) => g + 1)
    const next = regenCount + 1
    const q = firstUnanswered()
    if (next >= REGENS_BEFORE_QUESTION && q !== -1) {
      setPendingQuestion(q)
      setRegenCount(0)
    } else {
      setRegenCount(next)
    }
  }

  const answerFollowUp = (value) => {
    if (pendingQuestion === null) return
    setAnswers((a) => ({ ...a, [pendingQuestion]: value }))
    setPendingQuestion(null)
    setRegenCount(0)
    setGeneration((g) => g + 1) // regenerate, now shaped by the answer
  }

  const skipFollowUp = () => {
    setPendingQuestion(null)
    setRegenCount(0)
  }

  const toggleSaved = (item) =>
    setSaved((list) =>
      list.some((s) => s.slug === item.slug)
        ? list.filter((s) => s.slug !== item.slug)
        : [...list, item]
    )

  const toggleCompare = (item) =>
    setCompareSel((sel) => {
      if (sel.some((s) => s.slug === item.slug)) {
        return sel.filter((s) => s.slug !== item.slug)
      }
      if (sel.length < 2) return [...sel, item]
      return [sel[1], item] // keep it to two: drop the oldest
    })

  switch (view) {
    case 'results':
      return (
        <Results
          brief={brief}
          answers={answers}
          saved={saved}
          compareSel={compareSel}
          generation={generation}
          pendingQuestion={pendingQuestion}
          onRegenerate={regenerate}
          onAnswerFollowUp={answerFollowUp}
          onSkipFollowUp={skipFollowUp}
          onToggleSaved={toggleSaved}
          onToggleCompare={toggleCompare}
          onNewSearch={() => navigate('brief')}
          onNavigate={navigate}
        />
      )
    case 'shortlist':
      return (
        <Shortlist
          saved={saved}
          onRemove={toggleSaved}
          onBack={back}
          onNavigate={navigate}
        />
      )
    case 'compare':
      return (
        <Compare
          compareSel={compareSel}
          onClear={() => setCompareSel([])}
          onBack={back}
          onNavigate={navigate}
        />
      )
    case 'questions':
      return <Questions answers={answers} onSave={setAnswers} onBack={back} />
    case 'brief':
    default:
      return (
        <Brief
          initial={brief}
          onFindNames={startSearch}
          onQuestions={() => navigate('questions')}
        />
      )
  }
}

export default App
