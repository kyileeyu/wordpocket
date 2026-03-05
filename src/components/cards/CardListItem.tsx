import { Badge } from "@/components/ui/badge"

interface CardListItemProps {
  word: string
  meaning: string
  status: "new" | "learning" | "memorized"
}

const statusLabel = {
  new: "새 단어",
  learning: "학습중",
  memorized: "암기 완료",
} as const

export default function CardListItem({ word, meaning, status }: CardListItemProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <div className="min-w-0 flex-1 flex items-center gap-2">
        <span className="typo-body-lg font-display shrink-0">{word}</span>
        <span className="typo-mono-sm text-text-secondary truncate">{meaning}</span>
      </div>
      <Badge variant={status} className="shrink-0">{statusLabel[status]}</Badge>
    </div>
  )
}
