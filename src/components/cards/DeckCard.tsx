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
      className="flex items-center gap-3 bg-white border border-border rounded-[14px] p-4 mb-[10px] hover:shadow-sm transition-shadow"
    >
      <div
        className="w-1 h-9 rounded-[2px] shrink-0"
        style={{ backgroundColor: stripeColor }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-ink">{name}</div>
        <div className="text-[10px] text-sepia mt-[1px]">
          {cardCount}장{reviewCount > 0 ? ` · 복습 ${reviewCount}장` : " · 복습 없음"}
        </div>
      </div>
      {reviewCount > 0 && (
        <div className="bg-moss-bg text-moss text-[10px] font-semibold px-2 py-[3px] rounded-full shrink-0">
          {reviewCount}
        </div>
      )}
      <ChevronRight className="w-[14px] h-[14px] text-dust shrink-0" />
    </Link>
  )
}
