interface WordsLearnedCardProps {
  mastered: number
  total: number
}

export default function WordsLearnedCard({ mastered, total }: WordsLearnedCardProps) {
  const percent = total > 0 ? Math.round((mastered / total) * 100) : 0
  const filledCells = Math.min(7, Math.max(0, Math.round((mastered / Math.max(total, 1)) * 7)))

  return (
    <div
      className="rounded-[20px] p-5"
      style={{ background: "linear-gradient(135deg, #EDEAFC 0%, #F8F0FC 100%)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[28px] leading-none">📖</span>
          <span className="typo-body-sm font-semibold text-text-primary leading-tight whitespace-pre-line">
            {"Words\nLearned"}
          </span>
        </div>
        <span className="bg-text-primary text-white rounded-full px-3 py-1 typo-body-sm">
          {percent}% Done
        </span>
      </div>

      {/* Large number */}
      <div className="mb-4">
        <span className="font-display text-[48px] font-bold leading-none text-text-primary">
          {mastered}
        </span>
        <span className="text-[20px] text-text-tertiary">/{total}</span>
      </div>

      {/* Cell visualization */}
      <div className="grid grid-cols-7 gap-[6px]">
        {Array.from({ length: 7 }, (_, i) =>
          i < filledCells ? (
            <div
              key={i}
              className="aspect-square rounded-[12px]"
              style={{ background: "linear-gradient(135deg, #D45FA0, #9B6CE7)" }}
            />
          ) : (
            <div
              key={i}
              className="aspect-square rounded-[12px] border-2 border-dashed border-border"
            />
          ),
        )}
      </div>
    </div>
  )
}
