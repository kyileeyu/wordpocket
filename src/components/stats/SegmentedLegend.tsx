interface SegmentedLegendProps {
  newCount: number
  learningCount: number
  memorizedCount: number
}

const LEGEND_ITEMS = [
  { key: "new", label: "새 단어", color: "#D4CEFA" },
  { key: "learning", label: "학습중", color: "#A99BF0" },
  { key: "memorized", label: "암기 완료", color: "#7C6CE7" },
] as const

export default function SegmentedLegend({ newCount, learningCount, memorizedCount }: SegmentedLegendProps) {
  const counts = [newCount, learningCount, memorizedCount]

  return (
    <div className="flex items-center gap-3">
      {LEGEND_ITEMS.map((item, i) => (
        <div key={item.key} className="flex items-center gap-1">
          <span
            className="inline-block w-[6px] h-[6px] rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="typo-caption text-text-secondary">
            {counts[i]} {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}
