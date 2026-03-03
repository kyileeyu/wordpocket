interface SegmentedLegendProps {
  newCount: number
  learningCount: number
  matureCount: number
}

const LEGEND_ITEMS = [
  { key: "new", label: "New", color: "#D4CEFA" },
  { key: "learning", label: "Learning", color: "#A99BF0" },
  { key: "mature", label: "Mature", color: "#7C6CE7" },
] as const

export default function SegmentedLegend({ newCount, learningCount, matureCount }: SegmentedLegendProps) {
  const counts = [newCount, learningCount, matureCount]

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
