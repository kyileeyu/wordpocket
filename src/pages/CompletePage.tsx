import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import StatBox from "@/components/stats/StatBox"

export default function CompletePage() {
  return (
    <div className="min-h-dvh bg-canvas flex justify-center">
      <div className="w-full max-w-[480px] bg-parchment min-h-dvh flex flex-col">
        <div className="flex-1 flex flex-col justify-center px-7">
          {/* Celebration */}
          <div className="text-[48px] text-center mb-2">🎉</div>
          <h1 className="font-display text-[22px] text-center text-ink mb-1">학습 완료!</h1>
          <p className="text-[12px] text-sepia text-center mb-5">오늘도 한 걸음 나아갔어요.</p>

          {/* Stats */}
          <div className="flex gap-[6px] mb-5">
            <StatBox value={5} label="New" />
            <StatBox value={19} label="복습" />
            <StatBox value="87%" label="정답률" />
          </div>

          {/* Streak Card */}
          <div className="bg-white border border-border rounded-[14px] p-4 text-center mb-5">
            <div className="text-[11px] text-sepia mb-1">연속 학습</div>
            <div className="text-[28px] font-bold text-moss">🔥 7일</div>
          </div>

          {/* CTA */}
          <Button asChild className="w-full">
            <Link to="/">홈으로</Link>
          </Button>
        </div>
        <div className="h-5 shrink-0" />
      </div>
    </div>
  )
}
