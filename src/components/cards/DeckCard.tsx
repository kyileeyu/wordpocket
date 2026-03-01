import { Link } from "react-router"
import { ChevronRight } from "lucide-react"

interface DeckCardProps {
  id: string
  name: string
  cardCount: number
  reviewCount: number
  stripeColor: string
}

export default function DeckCard({ id, name, cardCount, reviewCount, stripeColor }: DeckCardProps) {
  return (
    <Link
      to={`/deck/${id}`}
      className="flex items-center gap-3 bg-bg-elevated border border-border rounded-[20px] p-4 mb-[10px] shadow-soft hover:shadow-md transition-shadow"
    >
      <div
        className="w-1 h-9 rounded-[2px] shrink-0"
        style={{ backgroundColor: stripeColor }}
      />
      <div className="flex-1 min-w-0">
        <div className="typo-body-md font-semibold text-text-primary">{name}</div>
        <div className="typo-mono-sm text-text-secondary mt-[1px]">
          {cardCount}장{reviewCount > 0 ? ` · 복습 ${reviewCount}장` : " · 복습 없음"}
        </div>
      </div>
      {reviewCount > 0 && (
        <div className="bg-accent-bg text-accent typo-mono-sm font-semibold px-2 py-[3px] rounded-full shrink-0">
          {reviewCount}
        </div>
      )}
      <ChevronRight className="w-[14px] h-[14px] text-text-tertiary shrink-0" />
    </Link>
  )
}
