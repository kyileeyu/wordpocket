import React, { useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Label } from "@/components/ui/Label";
import { Skeleton } from "@/components/ui/Skeleton";
import { useHeatmapData, useStreak, useTodayStats, useMemorizedWeekly } from "@/hooks/useStats";
import { useDeckProgress } from "@/hooks/useDecks";
import { useFolders } from "@/hooks/useFolders";
import { buildHeatmapCells } from "@/lib/heatmap";
import { colors } from "@/lib/theme";

const HEATMAP_COLORS = ["#F3F2FA", "#D4CEFA", "#A99BF0", "#7C6CE7"] as const;

function Heatmap({ cells }: { cells: (0 | 1 | 2 | 3)[] }) {
  return (
    <View className="flex-row flex-wrap gap-[4px]">
      {cells.map((level, i) => (
        <View
          key={i}
          className="w-[28px] h-[28px] rounded-[6px]"
          style={{ backgroundColor: HEATMAP_COLORS[level] }}
        />
      ))}
    </View>
  );
}

function WordsLearnedCard({
  mastered,
  total,
  memorizedToday,
  weeklyData,
}: {
  mastered: number;
  total: number;
  memorizedToday: number;
  weeklyData: { date: string; memorized_count: number }[];
}) {
  const maxCount = Math.max(...weeklyData.map((d) => d.memorized_count), 1);

  return (
    <View className="bg-accent rounded-xl p-5">
      <Text className="text-caption text-white/70 mb-1">암기 완료</Text>
      <View className="flex-row items-baseline gap-1 mb-1">
        <Text className="text-display-xl font-display text-white">{mastered}</Text>
        <Text className="text-body-sm text-white/70">/ {total}장</Text>
      </View>
      <Text className="text-mono-sm text-white/70 mb-4">오늘 +{memorizedToday}</Text>

      {/* Mini bar chart */}
      <View className="flex-row items-end gap-[6px] h-[60px]">
        {weeklyData.slice(-7).map((d, i) => {
          const height = Math.max(4, (d.memorized_count / maxCount) * 60);
          return (
            <View key={i} className="flex-1 items-center">
              <View
                className="w-full rounded-t-sm"
                style={{
                  height,
                  backgroundColor: "rgba(255,255,255,0.3)",
                }}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

function DeckProgressRow({
  name,
  memorized,
  total,
}: {
  name: string;
  memorized: number;
  total: number;
}) {
  const pct = total > 0 ? (memorized / total) * 100 : 0;
  return (
    <View className="flex-row items-center py-2 gap-3">
      <Text className="text-body-sm text-text-primary flex-1" numberOfLines={1}>
        {name}
      </Text>
      <View className="w-24 h-2 rounded-full bg-bg-subtle overflow-hidden">
        <View
          className="h-full rounded-full bg-accent"
          style={{ width: `${pct}%` }}
        />
      </View>
      <Text className="text-mono-sm text-text-secondary w-12 text-right">
        {memorized}/{total}
      </Text>
    </View>
  );
}

export default function StatsPage() {
  const { data: heatmapData, isLoading: heatmapLoading } = useHeatmapData(21);
  const { data: streakData } = useStreak();
  const { data: todayStats } = useTodayStats();
  const { data: weeklyData } = useMemorizedWeekly();
  const { data: deckProgress, isLoading: progressLoading } = useDeckProgress();
  const { data: folders } = useFolders();

  const streak = streakData?.current_streak ?? 0;
  const cells = buildHeatmapCells(heatmapData);

  const totalCards = deckProgress?.reduce((sum, d) => sum + d.total_cards, 0) ?? 0;
  const mastered = deckProgress?.reduce((sum, d) => sum + (d.memorized_count ?? 0), 0) ?? 0;

  const folderGroups = useMemo(() => {
    if (!deckProgress || !folders) return [];
    const folderMap = new Map(folders.map((f) => [f.id, f.name]));
    const groups = new Map<string, { folderId: string; name: string; decks: typeof deckProgress }>();

    for (const deck of deckProgress) {
      const folderId = deck.folder_id as string;
      if (!groups.has(folderId)) {
        groups.set(folderId, { folderId, name: folderMap.get(folderId) ?? "기타", decks: [] });
      }
      groups.get(folderId)!.decks.push(deck);
    }
    return Array.from(groups.values());
  }, [deckProgress, folders]);

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-12 gap-5">
        <Text className="text-display-xl font-display text-text-primary">학습 통계</Text>

        {/* Words Learned Card */}
        {progressLoading ? (
          <Skeleton className="h-[200px] rounded-xl" />
        ) : (
          <WordsLearnedCard
            mastered={mastered}
            total={totalCards}
            memorizedToday={todayStats?.memorized_today ?? 0}
            weeklyData={weeklyData ?? []}
          />
        )}

        {/* Heatmap */}
        <View>
          <Label>이번 달 · 🔥 {streak}일 연속</Label>
          <View className="mt-1">
            {heatmapLoading ? (
              <Skeleton className="h-[80px] rounded-icon" />
            ) : (
              <Heatmap cells={cells} />
            )}
          </View>
        </View>

        {/* Deck Progress */}
        <View>
          <Label>단어장별 진행률</Label>
          <View className="mt-1">
            {progressLoading ? (
              <View className="gap-2">
                <Skeleton className="h-[52px] rounded-xl" />
                <Skeleton className="h-[52px] rounded-xl" />
              </View>
            ) : folderGroups.length > 0 ? (
              folderGroups.map((group) => (
                <View key={group.folderId} className="mb-3">
                  <Text className="text-body-sm font-semibold text-text-primary mb-1">
                    {group.name}
                  </Text>
                  {group.decks.map((deck) => (
                    <DeckProgressRow
                      key={deck.deck_id}
                      name={deck.deck_name}
                      memorized={deck.memorized_count ?? 0}
                      total={deck.total_cards}
                    />
                  ))}
                </View>
              ))
            ) : (
              <Text className="text-body-sm text-text-secondary py-4 text-center">
                카드뭉치가 없습니다.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
