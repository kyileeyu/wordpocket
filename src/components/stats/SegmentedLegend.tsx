interface SegmentedLegendProps {
  unknownCount: number
  learningCount: number
  upcomingCount: number
  memorizedCount: number
}

const LEGEND_ITEMS = [
  { key: "unknown", label: "모름", color: "#E57373" },
  { key: "learning", label: "배우는중", color: "#FFB74D" },
  { key: "upcoming", label: "복습예정", color: "#A99BF0" },
  { key: "memorized", label: "암기완료", color: "#7C6CE7" },
] as const

export default function SegmentedLegend({ unknownCount, learningCount, upcomingCount, memorizedCount }: SegmentedLegendProps) {
  const counts = [unknownCount, learningCount, upcomingCount, memorizedCount]

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
