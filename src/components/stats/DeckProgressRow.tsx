import SegmentedProgress from "./SegmentedProgress"
import SegmentedLegend from "./SegmentedLegend"

interface DeckProgressRowProps {
  name: string
  totalCards: number
  newCount: number
  learningCount: number
  matureCount: number
}

export default function DeckProgressRow({
  name,
  totalCards,
  newCount,
  learningCount,
  matureCount,
}: DeckProgressRowProps) {
  return (
    <div className="bg-bg-subtle rounded-[20px] p-[14px] mb-2">
      <div className="flex justify-between mb-[6px]">
        <span className="typo-body-sm font-semibold">{name}</span>
        <span className="typo-caption text-text-secondary">{totalCards}장</span>
      </div>
      <SegmentedProgress
        segments={[
          { value: matureCount, color: "#7C6CE7" },
          { value: learningCount, color: "#A99BF0" },
          { value: newCount, color: "#D4CEFA" },
        ]}
      />
      <div className="mt-[6px]">
        <SegmentedLegend
          newCount={newCount}
          learningCount={learningCount}
          matureCount={matureCount}
        />
      </div>
    </div>
  )
}
