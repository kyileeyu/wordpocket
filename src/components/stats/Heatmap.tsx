import { cn } from "@/lib/utils"

interface HeatmapProps {
  cells: (0 | 1 | 2 | 3)[]
}

const levelClass = {
  0: "bg-border",
  1: "bg-accent-lighter",
  2: "bg-accent-light",
  3: "bg-accent",
} as const

export default function Heatmap({ cells }: HeatmapProps) {
  return (
    <div>
      <div className="grid grid-cols-7 gap-[3px]">
        {cells.map((level, i) => (
          <div
            key={i}
            className={cn("aspect-square rounded-[8px]", levelClass[level])}
          />
        ))}
      </div>
      <div className="flex justify-between text-[9px] text-text-tertiary mt-1">
        <span>4주 전</span>
        <span>오늘</span>
      </div>
    </div>
  )
}
