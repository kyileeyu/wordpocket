import { Badge } from "@/components/ui/badge"

interface CardListItemProps {
  word: string
  meaning: string
  status: "new" | "learning" | "mature"
}

const statusLabel = {
  new: "New",
  learning: "Learning",
  mature: "Mature",
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
