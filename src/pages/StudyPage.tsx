import { useState, useRef, useEffect, useCallback } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router"
import TopBar from "@/components/navigation/TopBar"
import StudyProgress from "@/components/study/StudyProgress"
import { WordCard } from "@/components/cards"
import ResponseButtons from "@/components/study/ResponseButtons"
import EmptyState from "@/components/feedback/EmptyState"
import { Skeleton } from "@/components/ui/skeleton"
import { useStudyQueue, useAllCardsQueue, useReviewOnlyQueue, useSubmitReview } from "@/hooks/useStudy"
import { cn, timeAgo } from "@/lib/utils"

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
}

export default function StudyPage() {
  const { deckId } = useParams<{ deckId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = searchParams.get("mode")
  const isAllMode = mode === "all"
  const isReviewMode = mode === "review"
  const { data: srsQueue, isLoading: srsLoading, refetch: srsRefetch } = useStudyQueue(deckId!)
  const { data: allQueue, isLoading: allLoading } = useAllCardsQueue(deckId!, isAllMode)
  const { data: reviewQueue, isLoading: reviewLoading, refetch: reviewRefetch } = useReviewOnlyQueue(deckId!, isReviewMode)
  const queue: StudyCard[] | undefined = isReviewMode ? reviewQueue : isAllMode ? allQueue : srsQueue
  const isLoading = isReviewMode ? reviewLoading : isAllMode ? allLoading : srsLoading
  const refetch = isReviewMode ? reviewRefetch : srsRefetch
  const submitReview = useSubmitReview()

  const [workingQueue, setWorkingQueue] = useState<StudyCard[]>([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [newCount, setNewCount] = useState(0)
  const [lapCount, setLapCount] = useState(0)
  const [masteredCount, setMasteredCount] = useState(0)
  const initialTotalRef = useRef(0)
  const lapEndIndexRef = useRef(0)

  const reviewStartRef = useRef(Date.now())
  const newCountTrackedRef = useRef(false)

  useEffect(() => {
    if (queue && queue.length > 0 && !newCountTrackedRef.current) {
      setWorkingQueue(queue)
      setNewCount(queue.filter((c) => c.queue_type === "new").length)
      initialTotalRef.current = queue.length
      lapEndIndexRef.current = queue.length
      newCountTrackedRef.current = true
    }
  }, [queue])

  useEffect(() => {
    reviewStartRef.current = Date.now()
  }, [index])

  const initialTotal = initialTotalRef.current || (queue?.length ?? 0)
  const card = workingQueue[index]

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
          if (rating === "good" || rating === "easy") {
            setMasteredCount((c) => c + 1)
          }

          let nextQueue = [...workingQueue]
          if (rating === "again" || rating === "hard") {
            nextQueue = [...nextQueue, card]
          }

          const nextIndex = index + 1

          if (nextIndex >= lapEndIndexRef.current && nextIndex < nextQueue.length) {
            setLapCount((c) => c + 1)
            lapEndIndexRef.current = nextQueue.length
          }

          if (nextIndex >= nextQueue.length) {
            if (isAllMode) {
              goToComplete(nextReviewed, nextCorrect, newCount)
            } else {
              refetch().then(({ data: serverQueue }) => {
                if (serverQueue && serverQueue.length > 0) {
                  setWorkingQueue(serverQueue)
                  setIndex(0)
                  setFlipped(false)
                  lapEndIndexRef.current = serverQueue.length
                } else {
                  goToComplete(nextReviewed, nextCorrect, newCount)
                }
              })
            }
          } else {
            setWorkingQueue(nextQueue)
            setIndex(nextIndex)
            setFlipped(false)
          }
        },
        onError: () => {
          const nextIndex = index + 1
          if (nextIndex >= workingQueue.length) {
            goToComplete(nextReviewed, nextCorrect, newCount)
          } else {
            setFlipped(false)
            setIndex(nextIndex)
          }
        },
      },
    )
  }

  if (isLoading) {
    return (
      <>
        <TopBar left="close" />
        <div className="px-7 space-y-4 mt-4">
          <Skeleton className="h-2 rounded-full" />
          <Skeleton className="h-[280px] rounded-[24px]" />
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

  if (!card) {
    return (
      <>
        <TopBar left="close" />
        <div className="px-7 space-y-4 mt-4">
          <Skeleton className="h-2 rounded-full" />
          <Skeleton className="h-[280px] rounded-[24px]" />
        </div>
      </>
    )
  }

  return (
    <>
      <TopBar
        left="close"
        title={
          <span className="typo-mono-md text-text-secondary font-normal">
            {masteredCount} / {initialTotal}
            {lapCount > 0 && ` + 복습 ${["한", "두", "세", "네", "다섯"][lapCount - 1] ?? lapCount}바퀴`}
          </span>
        }
      />

      <StudyProgress current={masteredCount} total={initialTotal} />

      <div className="flex-1 flex flex-col items-center justify-center px-7">
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
      </div>

      <div className={cn("mb-2", !flipped && "invisible")}>
        <ResponseButtons onResponse={handleResponse} />
      </div>

      <div className="h-5 shrink-0" />
    </>
  )
}
