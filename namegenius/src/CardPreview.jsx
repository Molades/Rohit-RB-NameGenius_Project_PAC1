import ResultCard from './ResultCard'
import { AVAILABLE_CARD, TAKEN_CARD } from './mocks/resultCards'

// Isolated preview of the S3 result card — visit /?preview=cards. Renders one
// Available and one Taken card (stacked, 16px apart) in the same white
// max-width shell the Results screen uses, so it reads like a slice of the
// real screen. Both status variants are covered.
function CardPreview() {
  return (
    <div className="min-h-screen bg-white text-[#0a0a0a]">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-8 sm:px-12">
        <div className="flex items-baseline justify-between">
          <div className="text-lg font-bold tracking-tight">NameGenius</div>
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9a9a9a]">
            Result card — preview
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <ResultCard {...AVAILABLE_CARD} variant="featured" />
          <ResultCard {...TAKEN_CARD} variant="featured" />
        </div>
      </div>
    </div>
  )
}

export default CardPreview
