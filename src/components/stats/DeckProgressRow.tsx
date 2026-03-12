import SegmentedProgress from "./SegmentedProgress"
import SegmentedLegend from "./SegmentedLegend"

interface DeckProgressRowProps {
  name: string
  totalCards: number
  unknownCount: number
  learningCount: number
  upcomingCount: number
  memorizedCount: number
}

export default function DeckProgressRow({
  name,
  totalCards,
  unknownCount,
  learningCount,
  upcomingCount,
  memorizedCount,
}: DeckProgressRowProps) {
  return (
    <div className="bg-bg-subtle rounded-[20px] p-[14px] mb-2">
      <div className="flex justify-between mb-[6px]">
        <span className="typo-body-sm font-semibold">{name}</span>
        <span className="typo-caption text-text-secondary">{totalCards}장</span>
      </div>
      <SegmentedProgress
        segments={[
          { value: memorizedCount, color: "#7C6CE7" },
          { value: upcomingCount, color: "#A99BF0" },
          { value: learningCount, color: "#FFB74D" },
          { value: unknownCount, color: "#E57373" },
        ]}
      />
      <div className="mt-[6px]">
        <SegmentedLegend
          unknownCount={unknownCount}
          learningCount={learningCount}
          upcomingCount={upcomingCount}
          memorizedCount={memorizedCount}
        />
      </div>
    </div>
  )
}
