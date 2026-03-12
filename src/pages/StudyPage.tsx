import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router"
import { Pencil } from "lucide-react"
import TopBar from "@/components/navigation/TopBar"
import StudyProgress from "@/components/study/StudyProgress"
import { WordCard } from "@/components/cards"
import ResponseButtons from "@/components/study/ResponseButtons"
import EmptyState from "@/components/feedback/EmptyState"
import { Skeleton } from "@/components/ui/skeleton"
import PageContent from "@/components/layouts/PageContent"
import { useStudyQueue, useReviewOnlyQueue, useFolderReviewQueue, useReviewBatch } from "@/hooks/useStudy"
import ConfirmDialog from "@/components/feedback/ConfirmDialog"
import { cn, timeAgo, computeIntervals } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

interface StudyCard {
  card_id: string
  word: string
  meaning: string
  pronunciation: string | null
  example: string | null
  synonyms?: string[]
  tags?: string[]
  queue_type: string
  last_reviewed_at?: string | null
  status: string
  ease_factor: number
  interval: number
  step_index: number
}

export default function StudyPage() {
  const { deckId, folderId } = useParams<{ deckId?: string; folderId?: string }>()
  const isFolderMode = !!folderId
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = searchParams.get("mode")
  const isReviewMode = mode === "review"
  const { data: srsQueue, isLoading: srsLoading, refetch: srsRefetch } = useStudyQueue(deckId ?? "", !isFolderMode)
  const { data: reviewQueue, isLoading: reviewLoading, refetch: reviewRefetch } = useReviewOnlyQueue(deckId ?? "", isReviewMode && !isFolderMode)
  const { data: folderQueue, isLoading: folderLoading, refetch: folderRefetch } = useFolderReviewQueue(folderId ?? "", isFolderMode)
  const queue: StudyCard[] | undefined = isFolderMode ? folderQueue : isReviewMode ? reviewQueue : srsQueue
  const isLoading = isFolderMode ? folderLoading : isReviewMode ? reviewLoading : srsLoading
  const refetch = isFolderMode ? folderRefetch : isReviewMode ? reviewRefetch : srsRefetch
  const batch = useReviewBatch()

  const [workingQueue, setWorkingQueue] = useState<StudyCard[]>([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [newCount, setNewCount] = useState(0)
  const [lapCount, setLapCount] = useState(0)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [exitLoading, setExitLoading] = useState(false)
  const [lapStartIndex, setLapStartIndex] = useState(0)
  const [lapEndIndex, setLapEndIndex] = useState(0)
  const reviewStartRef = useRef(Date.now())
  const newCountTrackedRef = useRef(false)

  useEffect(() => {
    if (queue && queue.length > 0 && !newCountTrackedRef.current) {
      setWorkingQueue(queue)
      setNewCount(queue.filter((c) => c.queue_type === "new").length)
      setLapEndIndex(queue.length)
      newCountTrackedRef.current = true
    }
  }, [queue])

  useEffect(() => {
    reviewStartRef.current = Date.now()
  }, [index])

  const card = workingQueue[index]

  const intervals = useMemo(() => {
    if (!card) return undefined
    return computeIntervals({
      status: card.status,
      ease_factor: card.ease_factor,
      interval: card.interval,
      step_index: card.step_index,
    })
  }, [card?.card_id, card?.status, card?.ease_factor, card?.interval, card?.step_index])

  const goToComplete = useCallback((reviewed: number, correct: number, newCards: number) => {
    navigate("/study/complete", {
      state: { reviewed, correct, newCount: newCards, deckId, folderId },
    })
  }, [navigate, deckId, folderId])

  const handleEdit = useCallback(async () => {
    if (!card) return
    // 수정 전 배치 저장
    if (batch.getPendingCount() > 0) {
      try { await batch.flush() } catch { /* noop */ }
    }
    if (deckId) {
      navigate(`/deck/${deckId}/edit/${card.card_id}`)
    } else {
      // 폴더 모드: card_id로 deck_id 조회
      const { data } = await supabase
        .from("cards")
        .select("deck_id")
        .eq("id", card.card_id)
        .single()
      if (data) {
        navigate(`/deck/${data.deck_id}/edit/${card.card_id}`)
      }
    }
  }, [card, deckId, batch, navigate])

  const handleExit = useCallback(async () => {
    if (batch.getPendingCount() === 0) {
      navigate(-1)
      return
    }
    setShowExitDialog(true)
  }, [batch, navigate])

  const handleExitConfirm = useCallback(async () => {
    setExitLoading(true)
    try {
      await batch.flush()
    } catch {
      // 실패해도 나가기
    }
    navigate(-1)
  }, [batch, navigate])

  const handleResponse = async (label: string) => {
    if (!card) return

    const rating = label.toLowerCase()
    const reviewDuration = Date.now() - reviewStartRef.current

    const nextReviewed = reviewedCount + 1
    const nextCorrect = rating !== "again" ? correctCount + 1 : correctCount
    setReviewedCount(nextReviewed)
    setCorrectCount(nextCorrect)

    batch.addReview(card.card_id, rating, reviewDuration)

    let nextQueue = [...workingQueue]
    if (rating === "again" || rating === "hard") {
      nextQueue = [...nextQueue, card]
    }

    const nextIndex = index + 1

    if (nextIndex >= lapEndIndex && nextIndex < nextQueue.length) {
      setLapCount((c) => c + 1)
      setLapStartIndex(lapEndIndex)
      setLapEndIndex(nextQueue.length)
    }

    if (nextIndex >= nextQueue.length) {
      try {
        await batch.flush()
      } catch {
        // flush 실패해도 계속 진행
      }
      const { data: serverQueue } = await refetch()
      if (serverQueue && serverQueue.length > 0) {
        setWorkingQueue(serverQueue)
        setIndex(0)
        setFlipped(false)
        setLapStartIndex(0)
        setLapEndIndex(serverQueue.length)
      } else {
        goToComplete(nextReviewed, nextCorrect, newCount)
      }
    } else {
      setWorkingQueue(nextQueue)
      setIndex(nextIndex)
      setFlipped(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <TopBar left="close" />
        <PageContent className="space-y-4">
          <Skeleton className="h-2 rounded-full" />
          <Skeleton className="h-[280px] rounded-[24px]" />
        </PageContent>
      </>
    )
  }

  if (!queue || queue.length === 0) {
    return (
      <>
        <TopBar left="close" />
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon="📚"
            text="오늘 학습할 카드가 없습니다."
          />
        </div>
      </>
    )
  }

  if (!card) {
    return (
      <>
        <TopBar left="close" />
        <PageContent className="space-y-4">
          <Skeleton className="h-2 rounded-full" />
          <Skeleton className="h-[280px] rounded-[24px]" />
        </PageContent>
      </>
    )
  }

  return (
    <>
      <TopBar
        left="close"
        onLeftClick={handleExit}
        title={
          <span className="typo-mono-md text-text-secondary font-normal">
            {index - lapStartIndex + 1} / {lapEndIndex - lapStartIndex}
            {lapCount > 0 && ` + 복습 ${["한", "두", "세", "네", "다섯"][lapCount - 1] ?? lapCount}바퀴`}
          </span>
        }
        right={
          <button
            onClick={handleEdit}
            className="w-11 h-11 rounded-full bg-bg-subtle flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          >
            <Pencil className="w-[18px] h-[18px]" />
          </button>
        }
      />

      <StudyProgress
        current={index - lapStartIndex + 1}
        total={lapEndIndex - lapStartIndex}
        lapCount={lapCount}
      />

      <PageContent className="flex-1 flex flex-col items-center justify-center pt-0">
        {card.last_reviewed_at && (
          <div className="w-full text-right mb-1 pr-3">
            <span className="typo-caption text-text-tertiary">
              {timeAgo(card.last_reviewed_at)}
            </span>
          </div>
        )}
        <WordCard
          word={card!.word}
          phonetic={card!.pronunciation ?? undefined}
          meaning={card!.meaning}
          example={card!.example ?? undefined}
          synonyms={card!.synonyms ?? undefined}
          tags={card!.tags ?? undefined}
          flipped={flipped}
          onFlip={() => setFlipped((f) => !f)}
        />
      </PageContent>

      <div className={cn("mb-2", !flipped && "invisible")}>
        <ResponseButtons onResponse={handleResponse} intervals={intervals} />
      </div>

      <div className="h-5 shrink-0" />

      <ConfirmDialog
        open={showExitDialog}
        onOpenChange={setShowExitDialog}
        title="학습을 종료하시겠습니까?"
        description="지금까지의 학습 내용이 저장됩니다."
        onConfirm={handleExitConfirm}
        loading={exitLoading}
        confirmLabel="종료"
      />
    </>
  )
}
