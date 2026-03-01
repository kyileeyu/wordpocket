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
    <div className="flex items-center justify-between bg-bg-elevated rounded-[20px] p-[14px] mb-2 shadow-[0_1px_4px_rgba(26,26,46,0.06)]">
      <div>
        <div className="typo-body-lg font-display">{word}</div>
        <div className="typo-mono-sm text-text-secondary">{meaning}</div>
      </div>
      <Badge variant={status}>{statusLabel[status]}</Badge>
    </div>
  )
}
