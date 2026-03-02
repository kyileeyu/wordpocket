import { Badge } from "@/components/ui/badge"

interface CardListItemProps {
  word: string
  meaning: string
  status: "new" | "learning" | "mature"
  tags?: string[]
}

const statusLabel = {
  new: "New",
  learning: "Learning",
  mature: "Mature",
} as const

export default function CardListItem({ word, meaning, status, tags }: CardListItemProps) {
  return (
    <div className="flex items-center justify-between bg-bg-elevated rounded-[20px] p-[14px] mb-2 shadow-[0_1px_4px_rgba(26,26,46,0.06)]">
      <div className="min-w-0 flex-1">
        <div className="typo-body-lg font-display">{word}</div>
        <div className="typo-mono-sm text-text-secondary">{meaning}</div>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {tags.map((tag) => (
              <span key={tag} className="bg-accent-bg text-accent typo-caption px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <Badge variant={status}>{statusLabel[status]}</Badge>
    </div>
  )
}
