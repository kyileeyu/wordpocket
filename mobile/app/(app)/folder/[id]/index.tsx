import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { ArrowLeft, MoreHorizontal } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatPill } from "@/components/stats/StatPill";
import { DeckCard } from "@/components/cards/DeckCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { FAB } from "@/components/feedback/FAB";
import { InputDialog } from "@/components/feedback/InputDialog";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { useFolders, useUpdateFolder, useDeleteFolder } from "@/hooks/useFolders";
import { useDecksByFolder, useDeckProgress, useCreateDeck } from "@/hooks/useDecks";
import { colors } from "@/lib/theme";

export default function FolderPage() {
  const { id: folderId } = useLocalSearchParams<{ id: string }>();
  const { data: folders } = useFolders();
  const { data: decks, isLoading: decksLoading } = useDecksByFolder(folderId!);
  const { data: deckProgress } = useDeckProgress();
  const createDeck = useCreateDeck();
  const updateFolder = useUpdateFolder();
  const deleteFolder = useDeleteFolder();

  const [deckDialogOpen, setDeckDialogOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const folder = folders?.find((f) => f.id === folderId);
  const folderProgress = deckProgress?.filter((d) => d.folder_id === folderId);
  const totalDue = folderProgress?.reduce((sum, d) => sum + d.due_today, 0) ?? 0;
  const totalCards = folderProgress?.reduce((sum, d) => sum + d.total_cards, 0) ?? 0;

  const deckDueMap = new Map<string, number>();
  const deckTotalMap = new Map<string, number>();
  folderProgress?.forEach((d) => {
    deckDueMap.set(d.deck_id, d.due_today);
    deckTotalMap.set(d.deck_id, d.total_cards);
  });

  const handleCreateDeck = (name: string) => {
    createDeck.mutate(
      { folderId: folderId!, name },
      { onSuccess: () => setDeckDialogOpen(false) },
    );
  };

  const handleRename = (name: string) => {
    updateFolder.mutate(
      { id: folderId!, name },
      { onSuccess: () => setRenameOpen(false) },
    );
  };

  const handleDelete = () => {
    deleteFolder.mutate(folderId!, {
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
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text className="text-body-md font-semibold text-text-primary flex-1 text-center" numberOfLines={1}>
          📁 {folder?.name ?? ""}
        </Text>
        <Pressable onPress={showMenu} className="w-11 h-11 rounded-full bg-bg-subtle items-center justify-center">
          <MoreHorizontal size={18} color={colors.text.secondary} />
        </Pressable>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-24 gap-5">
        {/* Stats */}
        <View className="flex-row flex-wrap gap-[6px]">
          <StatPill emoji="📖" value={totalDue} label="학습 대기" />
          <StatPill emoji="📦" value={totalCards} label="전체 카드" />
        </View>

        {/* Study CTA */}
        {totalDue > 0 && (
          <Button
            variant="default"
            size="lg"
            className="w-full"
            onPress={() => router.push(`/(app)/study/folder/${folderId}`)}
          >
            {`▶ 복습 시작 · ${totalDue}장`}
          </Button>
        )}

        {/* Deck List */}
        {decksLoading ? (
          <View className="gap-3">
            <Skeleton className="h-[72px] rounded-xl" />
            <Skeleton className="h-[72px] rounded-xl" />
          </View>
        ) : decks && decks.length > 0 ? (
          <View>
            <Label>{decks.length}개의 카드뭉치</Label>
            <View className="mt-1">
              {decks.map((deck) => (
                <DeckCard
                  key={deck.id}
                  id={deck.id}
                  name={deck.name}
                  cardCount={deckTotalMap.get(deck.id) ?? 0}
                  reviewCount={deckDueMap.get(deck.id) ?? 0}
                />
              ))}
            </View>
          </View>
        ) : (
          <EmptyState
            icon="📚"
            text="아직 카드뭉치가 없습니다. 첫 카드뭉치를 만들어보세요!"
            actionLabel="카드뭉치 만들기"
            onAction={() => setDeckDialogOpen(true)}
          />
        )}
      </ScrollView>

      <FAB onPress={() => setDeckDialogOpen(true)} />

      <InputDialog
        open={deckDialogOpen}
        onClose={() => setDeckDialogOpen(false)}
        title="새 카드뭉치"
        placeholder="카드뭉치 이름"
        submitLabel="만들기"
        onSubmit={handleCreateDeck}
        loading={createDeck.isPending}
      />

      <InputDialog
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        title="단어장 이름 편집"
        placeholder="단어장 이름"
        submitLabel="저장"
        onSubmit={handleRename}
        loading={updateFolder.isPending}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="단어장 삭제"
        description="이 단어장과 포함된 모든 카드뭉치/카드가 삭제됩니다. 되돌릴 수 없습니다."
        onConfirm={handleDelete}
        loading={deleteFolder.isPending}
      />
    </SafeAreaView>
  );
}
