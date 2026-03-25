import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronDown } from "lucide-react-native";
import { Label } from "@/components/ui/Label";
import { Skeleton } from "@/components/ui/Skeleton";
import { useHeatmapData, useStreak, useTodayStats, useMemorizedWeekly } from "@/hooks/useStats";
import { useDeckProgress } from "@/hooks/useDecks";
import { useFolders } from "@/hooks/useFolders";
import { buildHeatmapCells } from "@/lib/heatmap";
import { colors, shadows } from "@/lib/theme";

/* ── Heatmap with gradients ── */

const HEATMAP_GRADIENTS: Record<0 | 1 | 2 | 3, [string, string]> = {
  0: ["#F0EEF6", "#F0EEF6"],
  1: ["#E8E0FC", "#F0E8FA"],
  2: ["#C4B0F5", "#D8C4F8"],
  3: ["#D45FA0", "#9B6CE7"],
};

function Heatmap({ cells }: { cells: (0 | 1 | 2 | 3)[] }) {
  const { width } = useWindowDimensions();
  const cellSize = Math.floor((width - 48 - 36) / 7);

  return (
    <View>
      <View className="flex-row flex-wrap gap-[6px]">
        {cells.map((level, i) => (
          <LinearGradient
            key={i}
            colors={[HEATMAP_GRADIENTS[level][0], HEATMAP_GRADIENTS[level][1]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: cellSize, height: cellSize, borderRadius: 12 }}
          />
        ))}
      </View>
      <View className="flex-row justify-between mt-1">
        <Text className="text-[9px] text-text-tertiary">3주 전</Text>
        <Text className="text-[9px] text-text-tertiary">오늘</Text>
      </View>
    </View>
  );
}

/* ── Words Learned Card ── */

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
      <Text className="text-[10px] text-white/70 mb-4">오늘 +{memorizedToday}</Text>

      <View className="flex-row items-end gap-[6px] h-[60px]">
        {weeklyData.slice(-7).map((d, i) => {
          const height = Math.max(4, (d.memorized_count / maxCount) * 60);
          return (
            <View key={i} className="flex-1 items-center">
              <View
                className="w-full rounded-t-sm"
                style={{ height, backgroundColor: "rgba(255,255,255,0.3)" }}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

/* ── Segmented Progress Bar ── */

function SegmentedProgressBar({ segments }: { segments: { value: number; color: string }[] }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return null;
  return (
    <View className="h-[6px] rounded-full bg-border overflow-hidden flex-row">
      {segments.map((seg, i) => (
        <View
          key={i}
          style={{
            width: `${(seg.value / total) * 100}%`,
            backgroundColor: seg.color,
            height: "100%",
          }}
        />
      ))}
    </View>
  );
}

/* ── Segmented Legend ── */

const LEGEND_ITEMS = [
  { label: "모름", color: "#E57373" },
  { label: "배우는중", color: "#FFB74D" },
  { label: "복습예정", color: "#A99BF0" },
  { label: "암기완료", color: "#7C6CE7" },
] as const;

function SegmentedLegend({ counts }: { counts: number[] }) {
  return (
    <View className="flex-row items-center gap-3 flex-wrap">
      {LEGEND_ITEMS.map((item, i) => (
        <View key={item.label} className="flex-row items-center gap-1">
          <View className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: item.color }} />
          <Text className="text-[11px] text-text-secondary">{counts[i]} {item.label}</Text>
        </View>
      ))}
    </View>
  );
}

/* ── Deck Progress Row (expanded) ── */

function DeckProgressRow({
  name,
  totalCards,
  unknownCount,
  learningCount,
  upcomingCount,
  memorizedCount,
}: {
  name: string;
  totalCards: number;
  unknownCount: number;
  learningCount: number;
  upcomingCount: number;
  memorizedCount: number;
}) {
  return (
    <View className="bg-bg-subtle rounded-xl p-[14px] mb-2">
      <View className="flex-row justify-between mb-[6px]">
        <Text className="text-body-sm font-semibold text-text-primary">{name}</Text>
        <Text className="text-caption text-text-secondary">{totalCards}장</Text>
      </View>
      <SegmentedProgressBar
        segments={[
          { value: memorizedCount, color: "#7C6CE7" },
          { value: upcomingCount, color: "#A99BF0" },
          { value: learningCount, color: "#FFB74D" },
          { value: unknownCount, color: "#E57373" },
        ]}
      />
      <View className="mt-[6px]">
        <SegmentedLegend counts={[unknownCount, learningCount, upcomingCount, memorizedCount]} />
      </View>
    </View>
  );
}

/* ── Folder Progress Card (collapsible) ── */

function FolderProgressCard({
  name,
  decks,
}: {
  name: string;
  decks: any[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const totalCards = decks.reduce((sum: number, d: any) => sum + d.total_cards, 0);
  const totalUnknown = decks.reduce((sum: number, d: any) => sum + d.unknown_count, 0);
  const totalLearning = decks.reduce((sum: number, d: any) => sum + d.learning_count, 0);
  const totalUpcoming = decks.reduce((sum: number, d: any) => sum + d.upcoming_count, 0);
  const totalMemorized = decks.reduce((sum: number, d: any) => sum + (d.memorized_count ?? 0), 0);
  const memorizedPercent = totalCards > 0 ? Math.round((totalMemorized / totalCards) * 100) : 0;

  return (
    <Pressable
      onPress={() => setIsExpanded((prev) => !prev)}
      className="bg-bg-elevated rounded-xl p-[14px] mb-2"
      style={shadows.soft}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <Text className="text-body-sm font-semibold text-text-primary">{name}</Text>
        <View className="flex-row items-center gap-2">
          <Text className="text-caption text-text-secondary">
            {memorizedPercent}% · {totalCards}장
          </Text>
          <ChevronDown
            size={16}
            color={colors.text.tertiary}
            style={{ transform: [{ rotate: isExpanded ? "180deg" : "0deg" }] }}
          />
        </View>
      </View>

      {/* Collapsed: folder-level segmented bar */}
      {!isExpanded && (
        <View className="mt-[6px]">
          <SegmentedProgressBar
            segments={[
              { value: totalMemorized, color: "#7C6CE7" },
              { value: totalUpcoming, color: "#A99BF0" },
              { value: totalLearning, color: "#FFB74D" },
              { value: totalUnknown, color: "#E57373" },
            ]}
          />
        </View>
      )}

      {/* Expanded: per-deck rows */}
      {isExpanded && (
        <View className="mt-2">
          {decks.map((deck: any) => (
            <DeckProgressRow
              key={deck.deck_id}
              name={deck.deck_name}
              totalCards={deck.total_cards}
              unknownCount={deck.unknown_count}
              learningCount={deck.learning_count}
              upcomingCount={deck.upcoming_count}
              memorizedCount={deck.memorized_count ?? 0}
            />
          ))}
        </View>
      )}
    </Pressable>
  );
}

/* ── Stats Page ── */

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
                <FolderProgressCard
                  key={group.folderId}
                  name={group.name}
                  decks={group.decks}
                />
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
