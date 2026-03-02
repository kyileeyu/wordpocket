interface HeatmapProps {
  cells: (0 | 1 | 2 | 3)[]
}

const levelStyle: Record<0 | 1 | 2 | 3, React.CSSProperties> = {
  0: { background: "#F0EEF6" },
  1: { background: "linear-gradient(135deg, #E8E0FC, #F0E8FA)" },
  2: { background: "linear-gradient(135deg, #C4B0F5, #D8C4F8)" },
  3: { background: "linear-gradient(135deg, #D45FA0, #9B6CE7)" },
}

export default function Heatmap({ cells }: HeatmapProps) {
  return (
    <div>
      <div className="grid grid-cols-7 gap-[6px]">
        {cells.map((level, i) => (
          <div
            key={i}
            className="aspect-square rounded-[12px]"
            style={levelStyle[level]}
          />
        ))}
      </div>
      <div className="flex justify-between typo-nav-label text-text-tertiary mt-1">
        <span>3주 전</span>
        <span>오늘</span>
      </div>
    </div>
  )
}
