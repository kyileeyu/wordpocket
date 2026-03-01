import { Link, useLocation } from "react-router"
import { Button } from "@/components/ui/button"
import { StatBox } from "@/components/stats"
import { useStreak } from "@/hooks/useStats"

export default function CompletePage() {
  const location = useLocation()
  const { reviewed = 0, correct = 0, newCount = 0 } = (location.state ?? {}) as {
    reviewed?: number
    correct?: number
    newCount?: number
    deckId?: string
  }

  const { data: streakData } = useStreak()
  const streak = streakData?.current_streak ?? 0

  const reviewCount = reviewed - newCount
  const accuracy = reviewed > 0 ? Math.round((correct / reviewed) * 100) : 0

  return (
    <>
      <div className="flex-1 flex flex-col justify-center px-7">
        {/* Celebration */}
        <div className="text-[48px] text-center mb-2">🎉</div>
        <h1 className="typo-display-xl text-center text-text-primary mb-1">학습 완료!</h1>
        <p className="typo-body-sm text-text-secondary text-center mb-5">오늘도 한 걸음 나아갔어요.</p>

        {/* Stats */}
        <div className="flex gap-[6px] mb-5">
          <StatBox value={newCount} label="New" />
          <StatBox value={reviewCount} label="복습" />
          <StatBox value={`${accuracy}%`} label="정답률" />
        </div>

        {/* Streak Card */}
        <div className="bg-bg-subtle border border-border rounded-[20px] p-4 text-center mb-5">
          <div className="typo-caption text-text-secondary mb-1">연속 학습</div>
          <div className="typo-stat-value text-[28px] text-accent">🔥 {streak}일</div>
        </div>

        {/* CTA */}
        <Button asChild className="w-full">
          <Link to="/">홈으로</Link>
        </Button>
      </div>
      <div className="h-5 shrink-0" />
    </>
  )
}
