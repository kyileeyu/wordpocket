import { useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router"
import { DndContext, closestCenter, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core"
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import TopBar from "@/components/navigation/TopBar"
import PageContent from "@/components/layouts/PageContent"

import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { StatPill } from "@/components/stats"
import { DeckCard } from "@/components/cards"
import FAB from "@/components/feedback/FAB"
import ActionSheet from "@/components/feedback/ActionSheet"
import EmptyState from "@/components/feedback/EmptyState"
import InputDialog from "@/components/feedback/InputDialog"
import ConfirmDialog from "@/components/feedback/ConfirmDialog"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ArrowDownUp, Check, FileText, MoreHorizontal, Play, Plus } from "lucide-react"
import { useFolders, useUpdateFolder, useDeleteFolder } from "@/hooks/useFolders"
import { useDecksByFolder, useDeckProgress, useCreateDeck, useReorderDecks } from "@/hooks/useDecks"

const STRIPE_COLOR = "#7C6CE7"

function SortableDeckCard({ deck, cardCount, reviewCount }: { deck: any; cardCount: number; reviewCount: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: deck.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    touchAction: "none" as const,
    cursor: "grab",
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <DeckCard
        id={deck.id}
        name={deck.name}
        cardCount={cardCount}
        reviewCount={reviewCount}
        stripeColor={STRIPE_COLOR}
        disableLink
      />
    </div>
  )
}

export default function FolderPage() {
  const { id: folderId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: folders } = useFolders()
  const { data: decks, isLoading: decksLoading } = useDecksByFolder(folderId!)
  const { data: deckProgress } = useDeckProgress()
  const createDeck = useCreateDeck()
  const updateFolder = useUpdateFolder()
  const deleteFolder = useDeleteFolder()
  const reorderDecks = useReorderDecks(folderId!)

  const [deckDialogOpen, setDeckDialogOpen] = useState(false)
  const [actionSheetOpen, setActionSheetOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [reorderMode, setReorderMode] = useState(false)
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null)

  const folder = folders?.find((f) => f.id === folderId)

  // Stats for this folder
  const folderProgress = deckProgress?.filter((d) => d.folder_id === folderId)
  const totalDue = folderProgress?.reduce((sum, d) => sum + d.due_today, 0) ?? 0
  const totalCards = folderProgress?.reduce((sum, d) => sum + d.total_cards, 0) ?? 0

  // Map deck progress for review counts
  const deckDueMap = new Map<string, number>()
  const deckTotalMap = new Map<string, number>()
  folderProgress?.forEach((d) => {
    deckDueMap.set(d.deck_id, d.due_today)
    deckTotalMap.set(d.deck_id, d.total_cards)
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  const actionSheetItems = useMemo(() => [
    {
      label: "카드뭉치 만들기",
      icon: Plus,
      onClick: () => setDeckDialogOpen(true),
    },
    {
      label: "CSV 가져오기",
      icon: FileText,
      onClick: () => navigate(`/folder/${folderId}/import`),
    },
  ], [folderId, navigate])

  const handleCreateDeck = (name: string) => {
    createDeck.mutate(
      { folderId: folderId!, name },
      { onSuccess: () => setDeckDialogOpen(false) },
    )
  }

  const handleRename = (name: string) => {
    updateFolder.mutate(
      { id: folderId!, name },
      { onSuccess: () => setRenameOpen(false) },
    )
  }

  const handleDelete = () => {
    deleteFolder.mutate(folderId!, {
      onSuccess: () => navigate("/", { replace: true }),
    })
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDeckId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDeckId(null)
    const { active, over } = event
    if (!over || active.id === over.id || !decks) return

    const oldIndex = decks.findIndex((d) => d.id === active.id)
    const newIndex = decks.findIndex((d) => d.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(decks, oldIndex, newIndex)
    reorderDecks.mutate(reordered)
  }

  const activeDeck = activeDeckId ? decks?.find((d) => d.id === activeDeckId) : null

  return (
    <>
      <TopBar
        left="back"
        title={folder ? `📁 ${folder.name}` : ""}
        right={
          reorderMode ? (
            <button
              onClick={() => setReorderMode(false)}
              className="w-11 h-11 rounded-full bg-accent text-white flex items-center justify-center"
            >
              <Check className="w-[18px] h-[18px]" />
            </button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-11 h-11 rounded-full bg-bg-subtle flex items-center justify-center text-text-secondary">
                  <MoreHorizontal className="w-[18px] h-[18px]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {decks && decks.length > 1 && (
                  <DropdownMenuItem onClick={() => setReorderMode(true)}>
                    <ArrowDownUp className="w-4 h-4 mr-2" />
                    순서 변경
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setRenameOpen(true)}>이름 편집</DropdownMenuItem>
                <DropdownMenuItem className="text-danger" onClick={() => setDeleteOpen(true)}>삭제</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }
      />

      <PageContent>
        {/* Stats */}
        <div className="flex gap-[6px] flex-wrap">
          <StatPill emoji="📖" value={totalDue} label="복습 대기" />
          <StatPill emoji="📦" value={totalCards} label="전체 카드" />
        </div>

        {/* Review CTA */}
        {totalCards > 0 && (
          totalDue > 0 ? (
            <Button
              className="w-full"
              onClick={() => navigate(`/study/folder/${folderId}`)}
            >
              <Play className="w-4 h-4 mr-1" />
              단어장 전체 복습 · {totalDue}장
            </Button>
          ) : (
            <div className="text-center py-3">
              <span className="typo-body-sm text-text-secondary">오늘의 학습을 끝냈어요!</span>
            </div>
          )
        )}

        {/* Deck List */}
        {decksLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-[72px] rounded-[20px]" />
            <Skeleton className="h-[72px] rounded-[20px]" />
          </div>
        ) : decks && decks.length > 0 ? (
          <div>
            <Label>{reorderMode ? "드래그하여 순서를 변경하세요" : `${decks.length}개의 카드뭉치`}</Label>
            {reorderMode ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={decks.map((d) => d.id)} strategy={verticalListSortingStrategy}>
                  {decks.map((deck) => (
                    <SortableDeckCard
                      key={deck.id}
                      deck={deck}
                      cardCount={deckTotalMap.get(deck.id) ?? 0}
                      reviewCount={deckDueMap.get(deck.id) ?? 0}
                    />
                  ))}
                </SortableContext>
                <DragOverlay>
                  {activeDeck && (
                    <DeckCard
                      id={activeDeck.id}
                      name={activeDeck.name}
                      cardCount={deckTotalMap.get(activeDeck.id) ?? 0}
                      reviewCount={deckDueMap.get(activeDeck.id) ?? 0}
                      stripeColor={STRIPE_COLOR}
                      disableLink
                    />
                  )}
                </DragOverlay>
              </DndContext>
            ) : (
              decks.map((deck) => (
                <DeckCard
                  key={deck.id}
                  id={deck.id}
                  name={deck.name}
                  cardCount={deckTotalMap.get(deck.id) ?? 0}
                  reviewCount={deckDueMap.get(deck.id) ?? 0}
                  stripeColor={STRIPE_COLOR}
                />
              ))
            )}
          </div>
        ) : (
          <EmptyState
            icon="📚"
            text="아직 카드뭉치가 없습니다. 첫 카드뭉치를 만들어보세요!"
            actionLabel="카드뭉치 만들기"
            onAction={() => setDeckDialogOpen(true)}
            secondaryActionLabel="CSV 가져오기"
            onSecondaryAction={() => navigate(`/folder/${folderId}/import`)}
          />
        )}
      </PageContent>

      {!reorderMode && (
        <>
          <FAB onClick={() => setActionSheetOpen((v) => !v)} isOpen={actionSheetOpen} />
          <ActionSheet open={actionSheetOpen} onClose={() => setActionSheetOpen(false)} items={actionSheetItems} />
        </>
      )}

      <InputDialog
        open={deckDialogOpen}
        onOpenChange={setDeckDialogOpen}
        title="새 카드뭉치"
        placeholder="카드뭉치 이름"
        submitLabel="만들기"
        onSubmit={handleCreateDeck}
        loading={createDeck.isPending}
      />

      <InputDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        title="단어장 이름 편집"
        placeholder="단어장 이름"
        defaultValue={folder?.name}
        submitLabel="저장"
        onSubmit={handleRename}
        loading={updateFolder.isPending}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="단어장 삭제"
        description="이 단어장과 포함된 모든 카드뭉치/카드가 삭제됩니다. 되돌릴 수 없습니다."
        onConfirm={handleDelete}
        loading={deleteFolder.isPending}
      />
    </>
  )
}
