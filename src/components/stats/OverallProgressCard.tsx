import SegmentedProgress from "./SegmentedProgress"
import SegmentedLegend from "./SegmentedLegend"

interface OverallProgressCardProps {
  totalCards: number
  newCount: number
  learningCount: number
  matureCount: number
}

export default function OverallProgressCard({
  totalCards,
  newCount,
  learningCount,
  matureCount,
}: OverallProgressCardProps) {
  return (
    <div className="bg-bg-subtle rounded-[20px] p-[14px]">
      <div className="flex justify-between mb-[6px]">
        <span className="typo-body-sm font-semibold">전체 진행</span>
        <span className="typo-caption text-text-secondary">{totalCards}장</span>
      </div>
      <SegmentedProgress
        segments={[
          { value: newCount, color: "#D4CEFA" },
          { value: learningCount, color: "#A99BF0" },
          { value: matureCount, color: "#7C6CE7" },
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
