interface Segment {
  value: number
  color: string
}

interface SegmentedProgressProps {
  segments: Segment[]
}

export default function SegmentedProgress({ segments }: SegmentedProgressProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  if (total === 0) return null

  return (
    <div className="h-[6px] rounded-full bg-border overflow-hidden flex">
      {segments.map((seg, i) => (
        <div
          key={i}
          className="h-full"
          style={{
            width: `${(seg.value / total) * 100}%`,
            backgroundColor: seg.color,
          }}
        />
      ))}
    </div>
  )
}
