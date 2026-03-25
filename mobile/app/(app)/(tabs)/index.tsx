import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Search } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatPill } from "@/components/stats/StatPill";
import { FolderListItem } from "@/components/cards/FolderListItem";
import { EmptyState } from "@/components/feedback/EmptyState";
import { FAB } from "@/components/feedback/FAB";
import { InputDialog } from "@/components/feedback/InputDialog";
import { useFolders, useCreateFolder } from "@/hooks/useFolders";
import { useDeckProgress } from "@/hooks/useDecks";
import { useTodayStats, useStreak } from "@/hooks/useStats";
import { colors } from "@/lib/theme";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning,";
  if (h < 18) return "Good afternoon,";
  return "Good evening,";
}

export default function HomePage() {
  const { data: folders, isLoading: foldersLoading } = useFolders();
  const { data: deckProgress } = useDeckProgress();
  const createFolder = useCreateFolder();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: todayStats } = useTodayStats();
  const { data: streakData } = useStreak();
  const reviewedCount = todayStats?.reviewed_count ?? 0;
  const newLearnedCount = todayStats?.new_learned_count ?? 0;
  const streak = streakData?.current_streak ?? 0;
  const studySeconds = todayStats?.study_seconds ?? 0;
  const studyMin = Math.round(studySeconds / 60);

  const totalDue = deckProgress?.reduce((sum, d) => sum + d.due_today, 0) ?? 0;
  const firstDueDeck = deckProgress?.find((d) => d.due_today > 0);

  const folderDueMap = new Map<string, number>();
  const folderDeckCountMap = new Map<string, number>();
  deckProgress?.forEach((d) => {
    if (!d.folder_id) return;
    folderDueMap.set(d.folder_id, (folderDueMap.get(d.folder_id) ?? 0) + d.due_today);
    folderDeckCountMap.set(d.folder_id, (folderDeckCountMap.get(d.folder_id) ?? 0) + 1);
  });

  const handleCreate = (name: string) => {
    createFolder.mutate(name, {
      onSuccess: () => setDialogOpen(false),
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-24 gap-5">
        {/* Greeting */}
        <View className="flex-row items-start justify-between">
          <View>
            <Text className="text-body-lg font-display text-text-secondary italic mb-[2px]">
              {getGreeting()}
            </Text>
            <Text className="text-display-xl font-display text-text-primary">오늘의 학습</Text>
          </View>
          <Pressable
            onPress={() => {/* TODO: SearchOverlay */}}
            className="mt-1 p-2 -mr-2 rounded-full"
          >
            <Search size={24} color={colors.text.secondary} />
          </Pressable>
        </View>

        {/* Stat Pills */}
        <View className="flex-row flex-wrap gap-[6px]">
          <StatPill emoji="📖" value={reviewedCount} label="복습" />
          <StatPill emoji="🆕" value={newLearnedCount} label="신규" />
          <StatPill emoji="🔥" value={streak} label="일 연속" />
          <StatPill emoji="⏱" value={`${studyMin}m`} label="학습" />
        </View>

        {/* Study CTA */}
        {totalDue > 0 && firstDueDeck && (
          <Button
            variant="default"
            size="lg"
            className="w-full"
            onPress={() => router.push(`/(app)/study/${firstDueDeck.deck_id}`)}
          >
            {`▶ 학습 시작 · ${totalDue}장`}
          </Button>
        )}

        {/* Folder List */}
        <View>
          <Label>단어장</Label>
          <View className="mt-2">
            {foldersLoading ? (
              <View className="gap-3">
                <Skeleton className="h-14 rounded-xl" />
                <Skeleton className="h-14 rounded-xl" />
              </View>
            ) : folders && folders.length > 0 ? (
              folders.map((folder) => (
                <FolderListItem
                  key={folder.id}
                  id={folder.id}
                  emoji="📁"
                  name={folder.name}
                  deckCount={folderDeckCountMap.get(folder.id) ?? 0}
                  reviewCount={folderDueMap.get(folder.id) ?? 0}
                />
              ))
            ) : (
              <EmptyState
                icon="📂"
                text="아직 단어장이 없습니다. 첫 단어장을 만들어보세요!"
                actionLabel="단어장 만들기"
                onAction={() => setDialogOpen(true)}
              />
            )}
          </View>
        </View>
      </ScrollView>

      <FAB onPress={() => setDialogOpen(true)} />

      <InputDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="새 단어장"
        placeholder="단어장 이름"
        submitLabel="만들기"
        onSubmit={handleCreate}
        loading={createFolder.isPending}
      />
    </SafeAreaView>
  );
}
