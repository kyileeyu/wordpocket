interface WordsLearnedCardProps {
  mastered: number
  total: number
  memorizedToday: number
  weeklyData: { date: string; memorized_count: number }[]
}

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"]

export default function WordsLearnedCard({
  mastered,
  total,
  memorizedToday,
  weeklyData,
}: WordsLearnedCardProps) {
  const percent = total > 0 ? Math.round((mastered / total) * 100) : 0
  const maxCount = Math.max(1, ...weeklyData.map((d) => d.memorized_count))

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

      {/* Today's memorized label */}
      <div className="mb-2">
        <span className="typo-body-xs text-text-secondary">
          오늘 외운 단어 {memorizedToday}개
        </span>
      </div>

      {/* Weekly bar chart */}
      <div className="flex items-end gap-[6px]" style={{ height: 56 }}>
        {weeklyData.map((day) => {
          const ratio = day.memorized_count / maxCount
          const minHeight = 8
          const barHeight = day.memorized_count > 0
            ? minHeight + ratio * (56 - minHeight)
            : minHeight

          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-[8px]"
                style={{
                  height: barHeight,
                  background:
                    day.memorized_count > 0
                      ? "linear-gradient(135deg, #D45FA0, #9B6CE7)"
                      : undefined,
                  border: day.memorized_count === 0 ? "2px dashed var(--color-border)" : undefined,
                }}
              />
            </div>
          )
        })}
      </div>

      {/* Day labels */}
      <div className="flex gap-[6px] mt-1">
        {weeklyData.map((day) => {
          const d = new Date(day.date + "T00:00:00")
          return (
            <div key={day.date} className="flex-1 text-center">
              <span className="text-[10px] text-text-tertiary">
                {DAY_LABELS[d.getDay()]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
