import { Link } from "react-router"
import { ChevronRight } from "lucide-react"

interface FolderListItemProps {
  id: string
  emoji: string
  name: string
  deckCount: number
  reviewCount: number
  iconBg?: string
}

export default function FolderListItem({ id, emoji, name, deckCount, reviewCount, iconBg = "#EDEAFC" }: FolderListItemProps) {
  return (
    <Link
      to={`/folder/${id}`}
      className="flex items-center gap-3 bg-bg-elevated rounded-[20px] p-[14px] mb-[10px] shadow-soft"
    >
      <div
        className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[16px] shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="typo-body-md font-semibold text-text-primary">{name}</div>
        <div className="typo-mono-sm text-text-secondary mt-[1px]">{deckCount}개 덱 · 복습 {reviewCount}장</div>
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
