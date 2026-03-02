import { StatBox, Heatmap, DeckProgressRow, WordsLearnedCard } from "@/components/stats"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useTodayStats, useHeatmapData, useStreak } from "@/hooks/useStats"
import { useDeckProgress } from "@/hooks/useDecks"
import { buildHeatmapCells } from "@/lib/heatmap"

export default function StatsPage() {
  const { data: todayStats, isLoading: statsLoading } = useTodayStats()
  const { data: heatmapData, isLoading: heatmapLoading } = useHeatmapData(21)
  const { data: streakData } = useStreak()
  const { data: deckProgress, isLoading: progressLoading } = useDeckProgress()

  const streak = streakData?.current_streak ?? 0
  const cells = buildHeatmapCells(heatmapData)

  const totalCards = deckProgress?.reduce((sum, d) => sum + d.total_cards, 0) ?? 0
  const mastered = deckProgress?.reduce(
    (sum, d) => sum + (d.total_cards - d.new_count - d.learning_count),
    0,
  ) ?? 0

  const reviewedCount = todayStats?.reviewed_count ?? 0
  const newLearnedCount = todayStats?.new_learned_count ?? 0
  const studySeconds = todayStats?.study_seconds ?? 0
  const reviewOnly = reviewedCount - newLearnedCount
  const avgTime = reviewedCount > 0 ? (studySeconds / reviewedCount).toFixed(1) + "s" : "0s"

  return (
    <div>
      {/* Title */}
      <div className="px-7 pt-7">
        <h1 className="typo-display-xl text-text-primary mb-4">학습 통계</h1>
      </div>

      {/* Today Stats */}
      <div className="px-7">
        <Label>오늘</Label>
        {statsLoading ? (
          <Skeleton className="h-[72px] rounded-[20px] mb-4" />
        ) : (
          <div className="flex gap-[6px] mb-4">
            <StatBox value={newLearnedCount} label="New" />
            <StatBox value={reviewOnly} label="복습" />
            <StatBox value={avgTime} label="평균" />
          </div>
        )}
      </div>

      {/* Words Learned */}
      <div className="px-7 mb-4">
        {progressLoading ? (
          <Skeleton className="h-[200px] rounded-[20px]" />
        ) : (
          <WordsLearnedCard mastered={mastered} total={totalCards} />
        )}
      </div>

      {/* Heatmap */}
      <div className="px-7">
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
      <div className="px-7 mt-4">
        <Label>카드뭉치별 진행률</Label>
        <div className="mt-1">
          {progressLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-[52px] rounded-[20px]" />
              <Skeleton className="h-[52px] rounded-[20px]" />
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
            <p className="typo-body-sm text-text-secondary py-4 text-center">카드뭉치가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  )
}
