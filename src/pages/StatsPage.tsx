import { StatBox, Heatmap, DeckProgressRow } from "@/components/stats"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useTodayStats, useHeatmapData, useStreak } from "@/hooks/useStats"
import { useDeckProgress } from "@/hooks/useDecks"

function buildHeatmapCells(
  heatmapData: { date: string; review_count: number }[] | undefined,
): (0 | 1 | 2 | 3)[] {
  const today = new Date()
  const cells: (0 | 1 | 2 | 3)[] = []

  const countByDate = new Map<string, number>()
  heatmapData?.forEach((d) => countByDate.set(d.date, d.review_count))

  for (let i = 27; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const key = date.toISOString().slice(0, 10)
    const count = countByDate.get(key) ?? 0
    let level: 0 | 1 | 2 | 3
    if (count === 0) level = 0
    else if (count <= 3) level = 1
    else if (count <= 9) level = 2
    else level = 3
    cells.push(level)
  }

  return cells
}

export default function StatsPage() {
  const { data: todayStats, isLoading: statsLoading } = useTodayStats()
  const { data: heatmapData, isLoading: heatmapLoading } = useHeatmapData(28)
  const { data: streakData } = useStreak()
  const { data: deckProgress, isLoading: progressLoading } = useDeckProgress()

  const streak = streakData?.current_streak ?? 0
  const cells = buildHeatmapCells(heatmapData)

  const reviewedCount = todayStats?.reviewed_count ?? 0
  const newLearnedCount = todayStats?.new_learned_count ?? 0
  const studySeconds = todayStats?.study_seconds ?? 0
  const reviewOnly = reviewedCount - newLearnedCount
  const avgTime = reviewedCount > 0 ? (studySeconds / reviewedCount).toFixed(1) + "s" : "0s"

  return (
    <div>
      {/* Title */}
      <div className="px-5 pt-3">
        <h1 className="font-display text-[20px] font-medium text-ink mb-4">학습 통계</h1>
      </div>

      {/* Today Stats */}
      <div className="px-5">
        <Label>오늘</Label>
        {statsLoading ? (
          <Skeleton className="h-[72px] rounded-[10px] mb-4" />
        ) : (
          <div className="flex gap-[6px] mb-4">
            <StatBox value={newLearnedCount} label="New" />
            <StatBox value={reviewOnly} label="복습" />
            <StatBox value={avgTime} label="평균" />
          </div>
        )}
      </div>

      {/* Heatmap */}
      <div className="px-5">
        <Label>이번 달 · 🔥 {streak}일 연속</Label>
        <div className="mt-1">
          {heatmapLoading ? (
            <Skeleton className="h-[80px] rounded-[10px]" />
          ) : (
            <Heatmap cells={cells} />
          )}
        </div>
      </div>

      {/* Deck Progress */}
      <div className="px-5 mt-4">
        <Label>덱별 진행률</Label>
        <div className="mt-1">
          {progressLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-[52px] rounded-[12px]" />
              <Skeleton className="h-[52px] rounded-[12px]" />
            </div>
          ) : deckProgress && deckProgress.length > 0 ? (
            deckProgress.map((deck) => {
              const mastered = deck.total_cards - deck.new_count - deck.learning_count
              const percent =
                deck.total_cards > 0 ? Math.round((mastered / deck.total_cards) * 100) : 0
              return (
                <DeckProgressRow
                  key={deck.deck_id}
                  name={deck.deck_name}
                  percent={percent}
                />
              )
            })
          ) : (
            <p className="text-[12px] text-sepia py-4 text-center">덱이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  )
}
