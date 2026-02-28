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

export default function FolderListItem({ id, emoji, name, deckCount, reviewCount, iconBg = "#E8E3D9" }: FolderListItemProps) {
  return (
    <Link
      to={`/folder/${id}`}
      className="flex items-center gap-3 py-[14px] border-b border-border last:border-b-0"
    >
      <div
        className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[16px] shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-ink">{name}</div>
        <div className="text-[10px] text-sepia mt-[1px]">{deckCount}개 덱 · 복습 {reviewCount}장</div>
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
