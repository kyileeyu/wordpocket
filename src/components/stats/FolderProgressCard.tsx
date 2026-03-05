import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import DeckProgressRow from "./DeckProgressRow"
import SegmentedProgress from "./SegmentedProgress"

interface Deck {
  deck_id: string
  deck_name: string
  total_cards: number
  new_count: number
  learning_count: number
  memorized_count: number
}

interface FolderProgressCardProps {
  name: string
  decks: Deck[]
}

export default function FolderProgressCard({ name, decks }: FolderProgressCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const totalCards = decks.reduce((sum, d) => sum + d.total_cards, 0)
  const totalNew = decks.reduce((sum, d) => sum + d.new_count, 0)
  const totalLearning = decks.reduce((sum, d) => sum + d.learning_count, 0)
  const totalMemorized = decks.reduce((sum, d) => sum + (d.memorized_count ?? 0), 0)
  const memorizedPercent = totalCards > 0 ? Math.round((totalMemorized / totalCards) * 100) : 0

  return (
    <div className="bg-bg-elevated rounded-[20px] p-[14px] mb-2 shadow-soft">
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <span className="typo-body-sm font-semibold text-text-primary">{name}</span>
        <div className="flex items-center gap-2">
          <span className="typo-caption text-text-secondary">
            {memorizedPercent}% · {totalCards}장
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-text-tertiary shrink-0 transition-transform duration-200",
              isExpanded && "rotate-180",
            )}
          />
        </div>
      </div>

      {/* Folder-level progress bar (collapsed only) */}
      {!isExpanded && (
        <div className="mt-[6px]">
          <SegmentedProgress
            segments={[
              { value: totalMemorized, color: "#7C6CE7" },
              { value: totalLearning, color: "#A99BF0" },
              { value: totalNew, color: "#D4CEFA" },
            ]}
          />
        </div>
      )}

      {/* Expanded deck list */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="mt-2">
          {decks.map((deck) => (
            <DeckProgressRow
              key={deck.deck_id}
              name={deck.deck_name}
              totalCards={deck.total_cards}
              newCount={deck.new_count}
              learningCount={deck.learning_count}
              memorizedCount={deck.memorized_count ?? 0}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
