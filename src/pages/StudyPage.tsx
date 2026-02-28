import { useState, useRef, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router"
import TopBar from "@/components/navigation/TopBar"
import StudyProgress from "@/components/study/StudyProgress"
import { WordCard } from "@/components/cards"
import ResponseButtons from "@/components/study/ResponseButtons"
import EmptyState from "@/components/feedback/EmptyState"
import { Skeleton } from "@/components/ui/skeleton"
import { useStudyQueue, useSubmitReview } from "@/hooks/useStudy"
import { RotateCcw, Pencil } from "lucide-react"

export default function StudyPage() {
  const { deckId } = useParams<{ deckId: string }>()
  const navigate = useNavigate()
  const { data: queue, isLoading, refetch } = useStudyQueue(deckId!)
  const submitReview = useSubmitReview()

  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [newCount, setNewCount] = useState(0)
  const [isRefetching, setIsRefetching] = useState(false)

  const reviewStartRef = useRef(Date.now())
  const newCountTrackedRef = useRef(false)

  // 첫 큐 로드 시 새 카드 수 기록
  useEffect(() => {
    if (queue && !newCountTrackedRef.current) {
      setNewCount(queue.filter((c) => c.queue_type === "new").length)
      newCountTrackedRef.current = true
    }
  }, [queue])

  useEffect(() => {
    reviewStartRef.current = Date.now()
  }, [index])

  const total = queue?.length ?? 0
  const card = queue?.[index]

  const goToComplete = useCallback((reviewed: number, correct: number, newCards: number) => {
    navigate("/study/complete", {
      state: { reviewed, correct, newCount: newCards, deckId },
    })
  }, [navigate, deckId])

  const handleResponse = (label: string) => {
    if (!card) return

    const rating = label.toLowerCase()
    const reviewDuration = Math.round((Date.now() - reviewStartRef.current) / 1000)

    const nextReviewed = reviewedCount + 1
    const nextCorrect = rating !== "again" ? correctCount + 1 : correctCount
    setReviewedCount(nextReviewed)
    setCorrectCount(nextCorrect)

    submitReview.mutate(
      { cardId: card.card_id, rating, reviewDuration },
      {
        onSuccess: () => {
          if (index + 1 >= total) {
            // 마지막 카드 → 큐 재조회하여 learning 카드 확인
            setIsRefetching(true)
            setTimeout(() => {
              refetch().then(({ data: newQueue }) => {
                setIsRefetching(false)
                if (newQueue && newQueue.length > 0) {
                  setNewCount((prev) => prev + newQueue.filter((c) => c.queue_type === "new").length)
                  setIndex(0)
                  setFlipped(false)
                } else {
                  goToComplete(nextReviewed, nextCorrect, newCount)
                }
              })
            }, 1500)
          } else {
            setFlipped(false)
            setIndex((i) => i + 1)
          }
        },
        onError: () => {
          if (index + 1 >= total) {
            goToComplete(nextReviewed, nextCorrect, newCount)
          } else {
            setFlipped(false)
            setIndex((i) => i + 1)
          }
        },
      },
    )
  }

  if (isLoading) {
    return (
      <>
        <TopBar left="close" />
        <div className="px-5 space-y-4 mt-4">
          <Skeleton className="h-2 rounded-full" />
          <Skeleton className="h-[280px] rounded-[16px]" />
        </div>
      </>
    )
  }

  if (isRefetching) {
    return (
      <>
        <TopBar left="close" />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="text-[32px]">⏳</div>
          <p className="text-[13px] text-sepia">틀린 카드를 다시 준비하고 있어요...</p>
        </div>
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

  return (
    <>
      <TopBar
        left="close"
        title={
          <span className="font-mono text-[11px] text-sepia font-normal">
            {index + 1} / {total}
          </span>
        }
        right={
          <button className="w-7 h-7 rounded-[8px] bg-canvas border border-border flex items-center justify-center text-sepia">
            {flipped ? <Pencil className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
          </button>
        }
      />

      <StudyProgress current={index + 1} total={total} />

      <div className="flex-1 flex items-center justify-center px-5">
        <WordCard
          word={card!.word}
          phonetic={card!.pronunciation ?? undefined}
          meaning={card!.meaning}
          example={card!.example ?? undefined}
          flipped={flipped}
          onFlip={() => setFlipped(true)}
        />
      </div>

      {flipped ? (
        <div className="mb-2">
          <ResponseButtons onResponse={handleResponse} />
        </div>
      ) : (
        <div className="h-10" />
      )}

      <div className="h-5 shrink-0" />
    </>
  )
}
