import SegmentedProgress from "./SegmentedProgress"
import SegmentedLegend from "./SegmentedLegend"

interface OverallProgressCardProps {
  totalCards: number
  unknownCount: number
  learningCount: number
  upcomingCount: number
  memorizedCount: number
}

export default function OverallProgressCard({
  totalCards,
  unknownCount,
  learningCount,
  upcomingCount,
  memorizedCount,
}: OverallProgressCardProps) {
  return (
    <div className="bg-bg-subtle rounded-[20px] p-[14px]">
      <div className="flex justify-between mb-[6px]">
        <span className="typo-body-sm font-semibold">전체 진행</span>
        <span className="typo-caption text-text-secondary">{totalCards}장</span>
      </div>
      <SegmentedProgress
        segments={[
          { value: unknownCount, color: "#E57373" },
          { value: learningCount, color: "#FFB74D" },
          { value: upcomingCount, color: "#A99BF0" },
          { value: memorizedCount, color: "#7C6CE7" },
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
