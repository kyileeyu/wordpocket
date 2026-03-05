import { useState, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router";
import TopBar from "@/components/navigation/TopBar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatBox, SegmentedProgress } from "@/components/stats";
import { CardListItem, TagFilterBar } from "@/components/cards";
import FAB from "@/components/feedback/FAB";
import EmptyState from "@/components/feedback/EmptyState";
import InputDialog from "@/components/feedback/InputDialog";
import ConfirmDialog from "@/components/feedback/ConfirmDialog";
import ActionSheet from "@/components/feedback/ActionSheet";
import SortSheet from "@/components/feedback/SortSheet";
import PageContent from "@/components/layouts/PageContent";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Plus,
  FileText,
  Camera,
  ChevronDown,
} from "lucide-react";
import {
  useDeck,
  useDeckProgress,
  useUpdateDeck,
  useDeleteDeck,
} from "@/hooks/useDecks";
import { useCardsByDeck } from "@/hooks/useCards";
import { useStudyQueue, useReviewOnlyQueue } from "@/hooks/useStudy";
import { mapCardStatus } from "@/lib/utils";

const STATUS_ORDER: Record<string, number> = { new: 0, learning: 1, review: 2 };

const SORT_OPTIONS = [
  { value: "created", label: "추가일순", description: "최신 먼저" },
  {
    value: "status",
    label: "상태순",
    description: "새 단어 → 학습중 → 암기 완료",
  },
  { value: "alpha", label: "알파벳순", description: "A → Z" },
  { value: "due", label: "복습일순", description: "오래된 먼저" },
] as const;

type SortKey = (typeof SORT_OPTIONS)[number]["value"];

export default function DeckPage() {
  const { id: deckId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: deck } = useDeck(deckId!);
  const { data: cards, isLoading: cardsLoading } = useCardsByDeck(deckId!);
  const { data: studyQueue } = useStudyQueue(deckId!);
  const { data: reviewQueue } = useReviewOnlyQueue(deckId!, true);
  const { data: deckProgress } = useDeckProgress();
  const updateDeck = useUpdateDeck();
  const deleteDeck = useDeleteDeck();

  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("created");
  const [sortSheetOpen, setSortSheetOpen] = useState(false);

  const allTags = useMemo(() => {
    if (!cards) return [];
    const tagSet = new Set<string>();
    cards.forEach((c) => c.tags?.forEach((t: string) => tagSet.add(t)));
    return [...tagSet].sort((a, b) => {
      const dayA = a.match(/^Day (\d+)$/);
      const dayB = b.match(/^Day (\d+)$/);
      if (dayA && dayB) return Number(dayA[1]) - Number(dayB[1]);
      if (dayA) return -1;
      if (dayB) return 1;
      return a.localeCompare(b);
    });
  }, [cards]);

  const filteredCards = useMemo(() => {
    if (!cards) return [];
    const base = selectedTag
      ? cards.filter((c) => c.tags?.includes(selectedTag))
      : [...cards];

    switch (sortKey) {
      case "status":
        return base.sort(
          (a, b) =>
            (STATUS_ORDER[a.card_states?.[0]?.status ?? "new"] ?? 0) -
            (STATUS_ORDER[b.card_states?.[0]?.status ?? "new"] ?? 0),
        );
      case "alpha":
        return base.sort((a, b) => a.word.localeCompare(b.word));
      case "created":
        return base.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
      case "due":
        return base.sort((a, b) => {
          const da = a.card_states?.[0]?.due_date;
          const db = b.card_states?.[0]?.due_date;
          if (!da && !db) return 0;
          if (!da) return 1;
          if (!db) return -1;
          return new Date(da).getTime() - new Date(db).getTime();
        });
      default:
        return base;
    }
  }, [cards, selectedTag, sortKey]);

  const progress = deckProgress?.find((d) => d.deck_id === deckId);
  const newCount = progress?.new_count ?? 0;
  const learningCount = progress?.learning_count ?? 0;
  const memorizedCount = progress?.memorized_count ?? 0;
  const totalCards = progress?.total_cards ?? 0;

  const studyableCount = studyQueue?.length ?? 0;
  const reviewableCount = reviewQueue?.length ?? 0;

  const handleRename = (name: string) => {
    updateDeck.mutate(
      { id: deckId!, name },
      { onSuccess: () => setRenameOpen(false) },
    );
  };

  const handleDelete = () => {
    deleteDeck.mutate(deckId!, {
      onSuccess: () => navigate(-1),
    });
  };

  const actionSheetItems = useMemo(
    () => [
      {
        label: "단어 개별추가",
        icon: Plus,
        onClick: () => navigate(`/deck/${deckId}/add`),
      },
      {
        label: "CSV 가져오기",
        icon: FileText,
        onClick: () => navigate(`/deck/${deckId}/import`),
      },
      {
        label: "사진으로 가져오기",
        icon: Camera,
        onClick: () => navigate(`/deck/${deckId}/photo-import`),
      },
    ],
    [deckId, navigate],
  );

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortKey)!.label;

  return (
    <>
      <TopBar
        left="back"
        title={deck?.name ?? ""}
        right={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-11 h-11 rounded-full bg-bg-subtle flex items-center justify-center text-text-secondary">
                <MoreHorizontal className="w-[18px] h-[18px]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setRenameOpen(true)}>
                이름 편집
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-danger"
                onClick={() => setDeleteOpen(true)}
              >
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <PageContent>
        {/* Stat Boxes */}
        <div className="flex gap-[6px]">
          <StatBox value={newCount} label="새 단어" />
          <StatBox value={learningCount} label="학습중" />
          <StatBox value={memorizedCount} label="암기 완료" />
        </div>

        {/* Segmented Progress */}
        <SegmentedProgress
          segments={[
            { value: newCount, color: "#D4CEFA" },
            { value: learningCount, color: "#A99BF0" },
            { value: memorizedCount, color: "#7C6CE7" },
          ]}
        />

        {/* CTA Buttons */}
        {studyableCount > 0 || reviewableCount > 0 ? (
          <div className="flex gap-2">
            {reviewableCount > 0 && (
              <Button asChild variant="outline" className="flex-1">
                <Link to={`/study/${deckId}?mode=review`}>
                  ▶ 오늘 복습 · {reviewableCount}장
                </Link>
              </Button>
            )}
            {studyableCount > 0 && (
              <Button asChild className="flex-1">
                <Link to={`/study/${deckId}`}>
                  ▶ 전체 학습 · {studyableCount}장
                </Link>
              </Button>
            )}
          </div>
        ) : totalCards > 0 ? (
          <div className="rounded-2xl bg-bg-elevated px-4 py-3 text-center">
            <span className="typo-body-sm text-text-secondary">
              오늘의 학습을 끝냈어요!
            </span>
          </div>
        ) : null}

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <TagFilterBar
            tags={allTags}
            selected={selectedTag}
            onSelect={setSelectedTag}
          />
        )}

        {/* Card List */}
        {cardsLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 rounded-[20px]" />
            <Skeleton className="h-14 rounded-[20px]" />
            <Skeleton className="h-14 rounded-[20px]" />
          </div>
        ) : cards && cards.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="typo-body-sm text-text-secondary">
                {selectedTag
                  ? `${filteredCards.length}/${totalCards}장 · ${selectedTag}`
                  : `카드 ${totalCards}장`}
              </span>
              <button
                className="flex items-center gap-1 rounded-full border border-border px-3 py-1 typo-body-sm text-text-primary"
                onClick={() => setSortSheetOpen(true)}
              >
                {currentSortLabel}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="rounded-[20px] bg-bg-elevated overflow-hidden mb-6">
              {filteredCards.map((card, i) => {
                const state = card.card_states?.[0];
                return (
                  <Link
                    key={card.id}
                    to={`/deck/${deckId}/edit/${card.id}`}
                    className={`block ${i < filteredCards.length - 1 ? "border-b border-border" : ""}`}
                  >
                    <CardListItem
                      word={card.word}
                      meaning={card.meaning}
                      status={mapCardStatus(state?.status, state?.interval)}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <EmptyState
            icon="🃏"
            text="아직 카드가 없습니다. 첫 카드를 추가해보세요!"
          />
        )}
      </PageContent>

      <FAB
        onClick={() => setActionSheetOpen((v) => !v)}
        isOpen={actionSheetOpen}
      />

      <ActionSheet
        open={actionSheetOpen}
        onClose={() => setActionSheetOpen(false)}
        items={actionSheetItems}
      />

      <SortSheet
        open={sortSheetOpen}
        onClose={() => setSortSheetOpen(false)}
        value={sortKey}
        onChange={(v) => setSortKey(v as SortKey)}
        options={[...SORT_OPTIONS]}
      />

      <InputDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        title="카드뭉치 이름 편집"
        placeholder="카드뭉치 이름"
        defaultValue={deck?.name}
        submitLabel="저장"
        onSubmit={handleRename}
        loading={updateDeck.isPending}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="카드뭉치 삭제"
        description="이 카드뭉치와 포함된 모든 카드가 삭제됩니다. 되돌릴 수 없습니다."
        onConfirm={handleDelete}
        loading={deleteDeck.isPending}
      />
    </>
  );
}
