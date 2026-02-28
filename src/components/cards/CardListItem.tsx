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
    <div className="flex items-center justify-between bg-canvas rounded-[12px] p-[14px] mb-2">
      <div>
        <div className="font-display text-[14px]">{word}</div>
        <div className="text-[10px] text-sepia">{meaning}</div>
      </div>
      <Badge variant={status}>{statusLabel[status]}</Badge>
    </div>
  )
}
