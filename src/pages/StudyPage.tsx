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

  const [workingQueue, setWorkingQueue] = useState<NonNullable<typeof queue>>([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [newCount, setNewCount] = useState(0)
  const [againCount, setAgainCount] = useState(0)
  const initialTotalRef = useRef(0)

  const reviewStartRef = useRef(Date.now())
  const newCountTrackedRef = useRef(false)

  // 서버 큐 최초 로드 시에만 workingQueue 초기화
  useEffect(() => {
    if (queue && queue.length > 0 && !newCountTrackedRef.current) {
      setWorkingQueue(queue)
      setNewCount(queue.filter((c) => c.queue_type === "new").length)
      initialTotalRef.current = queue.length
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
          let nextQueue = [...workingQueue]
          if (rating === "again") {
            nextQueue = [...nextQueue, card]
            setAgainCount((c) => c + 1)
          }

          const nextIndex = index + 1
          if (nextIndex >= nextQueue.length) {
            // 로컬 큐 소진 → 서버 refetch
            refetch().then(({ data: serverQueue }) => {
              if (serverQueue && serverQueue.length > 0) {
                setWorkingQueue(serverQueue)
                setIndex(0)
                setFlipped(false)
              } else {
                goToComplete(nextReviewed, nextCorrect, newCount)
              }
            })
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
        <div className="px-5 space-y-4 mt-4">
          <Skeleton className="h-2 rounded-full" />
          <Skeleton className="h-[280px] rounded-[16px]" />
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
        <div className="px-5 space-y-4 mt-4">
          <Skeleton className="h-2 rounded-full" />
          <Skeleton className="h-[280px] rounded-[16px]" />
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
            {Math.min(index + 1, initialTotal)} / {initialTotal}
            {againCount > 0 && ` + 복습 ${againCount}`}
          </span>
        }
        right={
          <button className="w-7 h-7 rounded-[8px] bg-canvas border border-border flex items-center justify-center text-sepia">
            {flipped ? <Pencil className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
          </button>
        }
      />

      <StudyProgress current={Math.min(index + 1, initialTotal)} total={initialTotal} />

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
