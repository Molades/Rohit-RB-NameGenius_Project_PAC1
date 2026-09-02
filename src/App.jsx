import { useState } from 'react'
import Brief from './screens/Brief.jsx'
import Results from './screens/Results.jsx'
import Shortlist from './screens/Shortlist.jsx'
import Compare from './screens/Compare.jsx'
import QuestionsPanel from './screens/QuestionsPanel.jsx'

const SCREENS = { brief: Brief, results: Results, shortlist: Shortlist, compare: Compare }

export default function App() {
  const [view, setView] = useState('brief')
  const [questionsOpen, setQuestionsOpen] = useState(false)
  const Screen = SCREENS[view] ?? Brief

  return (
    <div className="min-h-full bg-canvas">
      <nav className="flex gap-4 border-b border-border bg-paper p-4 font-meta text-[12px]">
        {Object.keys(SCREENS).map((name) => (
          <button
            key={name}
            onClick={() => setView(name)}
            className={view === name ? 'font-semibold text-ink' : 'text-meta'}
          >
            {name}
          </button>
        ))}
        <button onClick={() => setQuestionsOpen(true)} className="text-meta">questions</button>
      </nav>
      {view === 'brief' ? (
        <Brief onOpenQuestions={() => setQuestionsOpen(true)} />
      ) : (
        <Screen />
      )}
      {questionsOpen && <QuestionsPanel onClose={() => setQuestionsOpen(false)} />}
    </div>
  )
}
