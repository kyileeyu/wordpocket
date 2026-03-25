import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { ArrowLeft, MoreHorizontal, ChevronRight } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { CardListItem } from "@/components/cards/CardListItem";
import { FAB } from "@/components/feedback/FAB";
import { InputDialog } from "@/components/feedback/InputDialog";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { useDeck, useDeckProgress, useUpdateDeck, useDeleteDeck } from "@/hooks/useDecks";
import { useCardsByDeck } from "@/hooks/useCards";
import { useStudyQueue } from "@/hooks/useStudy";
import { mapCardStatus } from "@/lib/utils";
import { colors, shadows } from "@/lib/theme";

export default function DeckPage() {
  const { id: deckId } = useLocalSearchParams<{ id: string }>();
  const { data: deck } = useDeck(deckId!);
  const { data: cards, isLoading: cardsLoading } = useCardsByDeck(deckId!);
  const { data: studyQueue } = useStudyQueue(deckId!);
  const { data: deckProgress } = useDeckProgress();
  const updateDeck = useUpdateDeck();
  const deleteDeck = useDeleteDeck();

  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const progress = deckProgress?.find((d) => d.deck_id === deckId);
  const totalCards = progress?.total_cards ?? 0;
  const studyableCount = studyQueue?.length ?? 0;

  const sortedCards = useMemo(() => {
    if (!cards) return [];
    return [...cards].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [cards]);

  const handleRename = (name: string) => {
    updateDeck.mutate(
      { id: deckId!, name },
      { onSuccess: () => setRenameOpen(false) },
    );
  };

  const handleDelete = () => {
    deleteDeck.mutate(deckId!, {
      onSuccess: () => router.back(),
    });
  };

  const showMenu = () => {
    Alert.alert("", "", [
      { text: "이름 편집", onPress: () => setRenameOpen(true) },
      { text: "삭제", style: "destructive", onPress: () => setDeleteOpen(true) },
      { text: "취소", style: "cancel" },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text className="text-body-md font-semibold text-text-primary flex-1 text-center" numberOfLines={1}>
          {deck?.name ?? ""}
        </Text>
        <Pressable onPress={showMenu} className="w-11 h-11 rounded-full bg-bg-subtle items-center justify-center">
          <MoreHorizontal size={18} color={colors.text.secondary} />
        </Pressable>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-24 gap-5">
        {cardsLoading ? (
          <View className="gap-2">
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
          </View>
        ) : cards && cards.length > 0 ? (
          <>
            <View className="flex-row gap-[6px]">
              {[
                { v: progress?.unknown_count ?? 0, l: "모름" },
                { v: progress?.learning_count ?? 0, l: "배우는중" },
                { v: progress?.upcoming_count ?? 0, l: "복습예정" },
                { v: progress?.memorized_count ?? 0, l: "암기완료" },
              ].map((s) => (
                <View key={s.l} className="flex-1 items-center py-2 rounded-lg bg-bg-elevated" style={shadows.soft}>
                  <Text className="text-stat-value font-bold text-text-primary">{s.v}</Text>
                  <Text className="text-mono-sm text-text-secondary">{s.l}</Text>
                </View>
              ))}
            </View>

            {studyableCount > 0 && (
              <Button
                variant="default"
                size="lg"
                className="w-full"
                onPress={() => router.push(`/(app)/study/${deckId}`)}
              >
                {`▶ 학습 시작 · ${studyableCount}장`}
              </Button>
            )}

            <View>
              <Text className="text-body-sm text-text-secondary mb-3">카드 {totalCards}장</Text>
              <View className="rounded-xl bg-bg-elevated overflow-hidden">
                {sortedCards.map((card, i) => {
                  const state = (card as any).card_states?.[0];
                  return (
                    <Pressable
                      key={card.id}
                      onPress={() => router.push(`/(app)/deck/${deckId}/edit/${card.id}`)}
                      className={i < sortedCards.length - 1 ? "border-b border-border" : ""}
                    >
                      <CardListItem
                        word={card.word}
                        meaning={card.meaning}
                        status={mapCardStatus(state?.status, state?.interval, state?.step_index)}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </>
        ) : (
          <View className="flex-1 items-center justify-center py-12">
            <Text className="text-[40px] mb-2">📖</Text>
            <Text className="text-body-lg font-semibold text-text-primary mt-2">아직 비어있어요</Text>
            <Text className="text-body-sm text-text-secondary mt-1 mb-6">첫 단어를 추가하면 학습이 시작됩니다</Text>
            {[
              { emoji: "✏️", label: "직접 입력", desc: "단어와 뜻을 하나씩 추가", path: `/(app)/deck/${deckId}/add` },
              { emoji: "📷", label: "사진으로 가져오기", desc: "교재 사진에서 단어 자동 추출", path: `/(app)/deck/${deckId}/photo-import` },
              { emoji: "📄", label: "CSV 파일 가져오기", desc: "엑셀이나 CSV 파일로 한번에 추가", path: `/(app)/deck/${deckId}/import` },
            ].map((item) => (
              <Pressable
                key={item.label}
                onPress={() => router.push(item.path as any)}
                className="w-full flex-row items-center gap-4 rounded-xl bg-bg-elevated p-4 mb-3"
              >
                <View className="w-11 h-11 rounded-md bg-accent-bg items-center justify-center">
                  <Text className="text-[20px]">{item.emoji}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-body-md font-semibold text-text-primary">{item.label}</Text>
                  <Text className="text-caption text-text-secondary">{item.desc}</Text>
                </View>
                <ChevronRight size={16} color={colors.text.tertiary} />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {totalCards > 0 && <FAB onPress={() => router.push(`/(app)/deck/${deckId}/add`)} />}

      <InputDialog
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        title="카드뭉치 이름 편집"
        placeholder="카드뭉치 이름"
        submitLabel="저장"
        onSubmit={handleRename}
        loading={updateDeck.isPending}
      />
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="카드뭉치 삭제"
        description="이 카드뭉치와 포함된 모든 카드가 삭제됩니다."
        onConfirm={handleDelete}
        loading={deleteDeck.isPending}
      />
    </SafeAreaView>
  );
}
