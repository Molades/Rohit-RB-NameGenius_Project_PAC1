import ResultCardFigma from './ResultCardFigma'
import { FEATURED_CARD, ROW_CARDS } from './mocks/resultCardsFigma'

// Isolated preview of the Figma-faithful S3 card — served at /preview-figma.html.
// Renders the featured "Top pick" block over the compact rows in the same white
// max-w-[1200px] shell the real Results screen uses. Both status variants are
// covered: available rows plus one taken row (UseNorthwind).
function CardPreviewFigma() {
  return (
    <div className="min-h-screen bg-white text-[#0a0a0a]">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-8 sm:px-12">
        <div className="flex items-baseline justify-between">
          <div className="text-lg font-bold tracking-tight">NameGenius</div>
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9a9a9a]">
            Result card — Figma 45:64
          </div>
        </div>

        <div className="mt-8">
          <ResultCardFigma {...FEATURED_CARD} variant="featured" isShortlisted />
        </div>

        <div className="mt-2">
          {ROW_CARDS.map((card) => (
            <ResultCardFigma key={card.slug} {...card} variant="row" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default CardPreviewFigma
