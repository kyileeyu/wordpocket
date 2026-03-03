import { useState, useMemo, useRef, useCallback } from "react"
import { Link, useParams, useNavigate } from "react-router"
import TopBar from "@/components/navigation/TopBar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { StatBox, SegmentedProgress } from "@/components/stats"
import { CardListItem, TagFilterBar } from "@/components/cards"
import FAB from "@/components/feedback/FAB"
import EmptyState from "@/components/feedback/EmptyState"
import InputDialog from "@/components/feedback/InputDialog"
import ConfirmDialog from "@/components/feedback/ConfirmDialog"
import ActionSheet from "@/components/feedback/ActionSheet"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, FileText, Camera, Trash2 } from "lucide-react"
import { useDeck, useDeckProgress, useUpdateDeck, useDeleteDeck } from "@/hooks/useDecks"
import { useCardsByDeck, useDeleteCard } from "@/hooks/useCards"
import { useAllCardsQueue } from "@/hooks/useStudy"
import { cn } from "@/lib/utils"

function mapStatus(status: string | undefined): "new" | "learning" | "mature" {
  if (status === "review") return "mature"
  if (status === "learning") return "learning"
  return "new"
}

// --- SwipeableCard ---
const SNAP_OPEN = -72 // delete button width exposed on snap
const SWIPE_THRESHOLD = 40 // min drag to snap open

function SwipeableCard({
  card,
  deckId,
  onNavigate,
}: {
  card: { id: string; word: string; meaning: string; tags?: string[]; card_states?: { status?: string }[] }
  deckId: string
  onNavigate: (path: string) => void
}) {
  const [translateX, setTranslateX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const [snapped, setSnapped] = useState(false)
  const touchStartRef = useRef({ x: 0, y: 0 })
  const isHorizontalRef = useRef<boolean | null>(null)
  const didSwipeRef = useRef(false)
  const deleteCard = useDeleteCard()

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }
      isHorizontalRef.current = null
      didSwipeRef.current = false
      setIsSwiping(false)
    },
    [],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const dx = e.touches[0].clientX - touchStartRef.current.x
      const dy = e.touches[0].clientY - touchStartRef.current.y

      if (isHorizontalRef.current === null) {
        if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
          isHorizontalRef.current = Math.abs(dx) > Math.abs(dy)
        }
        return
      }

      if (!isHorizontalRef.current) return

      e.preventDefault()
      setIsSwiping(true)
      didSwipeRef.current = true
      // If already snapped open, offset from snap position
      const base = snapped ? SNAP_OPEN : 0
      setTranslateX(Math.min(0, Math.max(SNAP_OPEN * 2, base + dx)))
    },
    [snapped],
  )

  const handleTouchEnd = useCallback(() => {
    if (translateX < -SWIPE_THRESHOLD) {
      // Snap open — reveal delete button
      setTranslateX(SNAP_OPEN)
      setSnapped(true)
    } else {
      // Snap closed
      setTranslateX(0)
      setSnapped(false)
    }
    setIsSwiping(false)
  }, [translateX])

  const handleDelete = () => {
    setTranslateX(-400)
    setTimeout(() => {
      deleteCard.mutate({ id: card.id, deckId })
    }, 200)
  }

  const handleClick = () => {
    if (didSwipeRef.current) return
    if (snapped) {
      // Tap card while open → close
      setTranslateX(0)
      setSnapped(false)
      return
    }
    onNavigate(`/deck/${deckId}/edit/${card.id}`)
  }

  const state = card.card_states?.[0]

  return (
    <div className="relative overflow-hidden rounded-[20px] mb-2">
      {/* Delete button behind card — only rendered when swiped */}
      {translateX < 0 && (
      <button
        className="absolute right-0 top-0 bottom-0 w-[72px] bg-danger flex items-center justify-center rounded-r-[20px]"
        onClick={handleDelete}
      >
        <Trash2 className="w-5 h-5 text-white" />
      </button>
      )}

      {/* Sliding card */}
      <div
        className={cn(
          "relative bg-bg-elevated rounded-[20px] transition-transform",
          !isSwiping && "duration-200",
        )}
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        <CardListItem
          word={card.word}
          meaning={card.meaning}
          status={mapStatus(state?.status)}
          tags={card.tags}
        />
      </div>
    </div>
  )
}

// --- DeckPage ---
export default function DeckPage() {
  const { id: deckId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: deck } = useDeck(deckId!)
  const { data: cards, isLoading: cardsLoading } = useCardsByDeck(deckId!)
  const { data: studyQueue } = useAllCardsQueue(deckId!, true)
  const { data: deckProgress } = useDeckProgress()
  const updateDeck = useUpdateDeck()
  const deleteDeck = useDeleteDeck()

  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [actionSheetOpen, setActionSheetOpen] = useState(false)

  const allTags = useMemo(() => {
    if (!cards) return []
    const tagSet = new Set<string>()
    cards.forEach((c) => c.tags?.forEach((t: string) => tagSet.add(t)))
    return [...tagSet].sort((a, b) => {
      const dayA = a.match(/^Day (\d+)$/)
      const dayB = b.match(/^Day (\d+)$/)
      if (dayA && dayB) return Number(dayA[1]) - Number(dayB[1])
      if (dayA) return -1
      if (dayB) return 1
      return a.localeCompare(b)
    })
  }, [cards])

  const filteredCards = useMemo(() => {
    if (!cards) return []
    if (!selectedTag) return cards
    return cards.filter((c) => c.tags?.includes(selectedTag))
  }, [cards, selectedTag])

  const progress = deckProgress?.find((d) => d.deck_id === deckId)
  const newCount = progress?.new_count ?? 0
  const learningCount = progress?.learning_count ?? 0
  const reviewCount = progress?.review_count ?? 0
  const totalCards = progress?.total_cards ?? 0

  const studyableCount = studyQueue?.length ?? 0

  const handleRename = (name: string) => {
    updateDeck.mutate(
      { id: deckId!, name },
      { onSuccess: () => setRenameOpen(false) },
    )
  }

  const handleDelete = () => {
    deleteDeck.mutate(deckId!, {
      onSuccess: () => navigate(-1),
    })
  }

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
  )

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
              <DropdownMenuItem onClick={() => setRenameOpen(true)}>이름 편집</DropdownMenuItem>
              <DropdownMenuItem className="text-danger" onClick={() => setDeleteOpen(true)}>삭제</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      {/* Stat Boxes */}
      <div className="px-7 pt-7">
        <div className="flex gap-[6px] mb-2">
          <StatBox value={newCount} label="New" />
          <StatBox value={learningCount} label="Learning" />
          <StatBox value={reviewCount} label="Mature" />
        </div>
      </div>

      {/* Segmented Progress */}
      <div className="px-7 mb-4">
        <SegmentedProgress
          segments={[
            { value: newCount, color: "#D4CEFA" },
            { value: learningCount, color: "#A99BF0" },
            { value: reviewCount, color: "#7C6CE7" },
          ]}
        />
      </div>

      {/* CTA Button */}
      {studyableCount > 0 && (
        <div className="px-7 mb-4">
          <Button asChild className="w-full">
            <Link to={`/study/${deckId}?mode=all`}>▶ 학습 시작 · {studyableCount}장</Link>
          </Button>
        </div>
      )}

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div className="px-7 mb-3">
          <TagFilterBar tags={allTags} selected={selectedTag} onSelect={setSelectedTag} />
        </div>
      )}

      {/* Card List */}
      <div className="px-7">
        {cardsLoading ? (
          <div className="space-y-2 mt-2">
            <Skeleton className="h-14 rounded-[20px]" />
            <Skeleton className="h-14 rounded-[20px]" />
            <Skeleton className="h-14 rounded-[20px]" />
          </div>
        ) : cards && cards.length > 0 ? (
          <>
            <Label>
              {selectedTag
                ? `${filteredCards.length}/${totalCards}장 · ${selectedTag}`
                : `카드 ${totalCards}장`}
            </Label>
            {filteredCards.map((card) => (
              <SwipeableCard
                key={card.id}
                card={card}
                deckId={deckId!}
                onNavigate={navigate}
              />
            ))}
          </>
        ) : (
          <EmptyState
            icon="🃏"
            text="아직 카드가 없습니다. 첫 카드를 추가해보세요!"
          />
        )}
      </div>

      <FAB onClick={() => setActionSheetOpen((v) => !v)} isOpen={actionSheetOpen} />

      <ActionSheet
        open={actionSheetOpen}
        onClose={() => setActionSheetOpen(false)}
        items={actionSheetItems}
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
  )
}
