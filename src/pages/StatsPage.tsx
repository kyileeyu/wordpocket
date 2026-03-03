import { useMemo } from "react"
import { Heatmap, DeckProgressRow, WordsLearnedCard } from "@/components/stats"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useHeatmapData, useStreak } from "@/hooks/useStats"
import { useDeckProgress } from "@/hooks/useDecks"
import { useFolders } from "@/hooks/useFolders"
import { buildHeatmapCells } from "@/lib/heatmap"

export default function StatsPage() {
  const { data: heatmapData, isLoading: heatmapLoading } = useHeatmapData(21)
  const { data: streakData } = useStreak()
  const { data: deckProgress, isLoading: progressLoading } = useDeckProgress()
  const { data: folders } = useFolders()

  const streak = streakData?.current_streak ?? 0
  const cells = buildHeatmapCells(heatmapData)

  const totalCards = deckProgress?.reduce((sum, d) => sum + d.total_cards, 0) ?? 0
  const mastered = deckProgress?.reduce(
    (sum, d) => sum + (d.total_cards - d.new_count - d.learning_count),
    0,
  ) ?? 0

  // Group decks by folder
  const folderGroups = useMemo(() => {
    if (!deckProgress || !folders) return []

    const folderMap = new Map(folders.map((f: { id: string; name: string }) => [f.id, f.name]))
    const groups = new Map<string, { name: string; decks: typeof deckProgress }>()

    for (const deck of deckProgress) {
      const folderId = deck.folder_id as string
      if (!groups.has(folderId)) {
        groups.set(folderId, {
          name: folderMap.get(folderId) ?? "기타",
          decks: [],
        })
      }
      groups.get(folderId)!.decks.push(deck)
    }

    return Array.from(groups.values())
  }, [deckProgress, folders])

  return (
    <div>
      {/* Title */}
      <div className="px-7 pt-7">
        <h1 className="typo-display-xl text-text-primary mb-4">학습 통계</h1>
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

      {/* Deck Progress grouped by Folder */}
      <div className="px-7 mt-4">
        <Label>단어장별 진행률</Label>
        <div className="mt-1">
          {progressLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-[52px] rounded-[20px]" />
              <Skeleton className="h-[52px] rounded-[20px]" />
            </div>
          ) : folderGroups.length > 0 ? (
            folderGroups.map((group) => (
              <div key={group.name} className="mb-4">
                <h3 className="typo-body-sm font-semibold text-text-primary mb-1">
                  {group.name}
                </h3>
                {group.decks.map((deck) => (
                  <DeckProgressRow
                    key={deck.deck_id}
                    name={deck.deck_name}
                    totalCards={deck.total_cards}
                    newCount={deck.new_count}
                    learningCount={deck.learning_count}
                    matureCount={deck.review_count}
                  />
                ))}
              </div>
            ))
          ) : (
            <p className="typo-body-sm text-text-secondary py-4 text-center">카드뭉치가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  )
}
