import { useState, useRef, useEffect } from "react"
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
  const { data: queue, isLoading } = useStudyQueue(deckId!)
  const submitReview = useSubmitReview()

  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)

  const reviewStartRef = useRef(Date.now())

  useEffect(() => {
    reviewStartRef.current = Date.now()
  }, [index])

  const total = queue?.length ?? 0
  const card = queue?.[index]
  const newCount = queue?.filter((c) => c.queue_type === "new").length ?? 0

  const handleResponse = (label: string) => {
    if (!card) return

    const rating = label.toLowerCase()
    const reviewDuration = Math.round((Date.now() - reviewStartRef.current) / 1000)

    submitReview.mutate({
      cardId: card.card_id,
      rating,
      reviewDuration,
    })

    const nextReviewed = reviewedCount + 1
    const nextCorrect = rating !== "again" ? correctCount + 1 : correctCount
    setReviewedCount(nextReviewed)
    setCorrectCount(nextCorrect)

    if (index + 1 >= total) {
      navigate("/study/complete", {
        state: {
          reviewed: nextReviewed,
          correct: nextCorrect,
          newCount,
          deckId,
        },
      })
    } else {
      setFlipped(false)
      setIndex((i) => i + 1)
    }
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
