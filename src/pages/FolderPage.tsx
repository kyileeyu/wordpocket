import { useState } from "react"
import { Link, useParams, useNavigate } from "react-router"
import TopBar from "@/components/navigation/TopBar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { StatPill } from "@/components/stats"
import { DeckCard } from "@/components/cards"
import FAB from "@/components/feedback/FAB"
import EmptyState from "@/components/feedback/EmptyState"
import InputDialog from "@/components/feedback/InputDialog"
import ConfirmDialog from "@/components/feedback/ConfirmDialog"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { useFolders, useUpdateFolder, useDeleteFolder } from "@/hooks/useFolders"
import { useDecksByFolder, useDeckProgress, useCreateDeck } from "@/hooks/useDecks"

const STRIPE_COLORS = ["#3A6B4A", "#3A4A6B", "#6B5F4F", "#6B3A4A", "#4A6B5F"]

export default function FolderPage() {
  const { id: folderId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: folders } = useFolders()
  const { data: decks, isLoading: decksLoading } = useDecksByFolder(folderId!)
  const { data: deckProgress } = useDeckProgress()
  const createDeck = useCreateDeck()
  const updateFolder = useUpdateFolder()
  const deleteFolder = useDeleteFolder()

  const [deckDialogOpen, setDeckDialogOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

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

  return (
    <>
      <TopBar
        left="back"
        title={folder ? `📁 ${folder.name}` : ""}
        right={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-7 h-7 rounded-[8px] bg-canvas border border-border flex items-center justify-center text-sepia">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setRenameOpen(true)}>이름 편집</DropdownMenuItem>
              <DropdownMenuItem className="text-brick" onClick={() => setDeleteOpen(true)}>삭제</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      {/* Stats + CTA */}
      <div className="px-5 pt-2">
        <div className="flex gap-[6px] flex-wrap mb-3">
          <StatPill emoji="📖" value={totalDue} label="복습 대기" />
          <StatPill emoji="📦" value={totalCards} label="전체 카드" />
        </div>
        {totalDue > 0 && (
          <Button asChild variant="moss" className="w-full mb-4">
            <Link to={`/study/${folderId}`}>▶ 전체 학습 시작</Link>
          </Button>
        )}
      </div>

      {/* Deck List */}
      <div className="px-5">
        {decksLoading ? (
          <div className="space-y-3 mt-2">
            <Skeleton className="h-[72px] rounded-[14px]" />
            <Skeleton className="h-[72px] rounded-[14px]" />
          </div>
        ) : decks && decks.length > 0 ? (
          <>
            <Label>{decks.length}개의 덱</Label>
            {decks.map((deck, i) => (
              <DeckCard
                key={deck.id}
                id={deck.id}
                name={deck.name}
                cardCount={deckTotalMap.get(deck.id) ?? 0}
                reviewCount={deckDueMap.get(deck.id) ?? 0}
                stripeColor={STRIPE_COLORS[i % STRIPE_COLORS.length]}
              />
            ))}
          </>
        ) : (
          <EmptyState
            icon="📚"
            text="아직 덱이 없습니다. 첫 덱을 만들어보세요!"
            actionLabel="덱 만들기"
            onAction={() => setDeckDialogOpen(true)}
          />
        )}
      </div>

      <FAB onClick={() => setDeckDialogOpen(true)} />

      <InputDialog
        open={deckDialogOpen}
        onOpenChange={setDeckDialogOpen}
        title="새 덱"
        placeholder="덱 이름"
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
        description="이 단어장과 포함된 모든 덱/카드가 삭제됩니다. 되돌릴 수 없습니다."
        onConfirm={handleDelete}
        loading={deleteFolder.isPending}
      />
    </>
  )
}
