import ResultCard from './components/ResultCard.jsx'
import { mockResults } from './data.js'

export default function App() {
  return (
    <div className="flex min-h-full flex-col items-center gap-[32px] p-[48px]">
      {mockResults.map((r) => (
        <ResultCard
          key={r.name}
          name={r.name}
          domain={r.domain}
          status={r.status}
          tlds={r.tlds}
          onCopy={() => {}}
          onShortlist={() => {}}
          onCompare={() => {}}
        />
      ))}
    </div>
  )
}
