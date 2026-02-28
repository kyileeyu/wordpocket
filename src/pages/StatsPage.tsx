import { StatBox, Heatmap, DeckProgressRow } from "@/components/stats"
import { Label } from "@/components/ui/label"

const heatmapData: (0 | 1 | 2 | 3)[] = [
  3, 2, 3, 1, 2, 3, 1,
  2, 1, 3, 2, 1, 0, 0,
  1, 2, 3, 1, 2, 3, 2,
  1, 3, 2, 1, 2, 3, 2,
]

export default function StatsPage() {
  return (
    <div>
      {/* Title */}
      <div className="px-5 pt-3">
        <h1 className="font-display text-[20px] font-medium text-ink mb-4">학습 통계</h1>
      </div>

      {/* Today Stats */}
      <div className="px-5">
        <Label>오늘</Label>
        <div className="flex gap-[6px] mb-4">
          <StatBox value={5} label="New" />
          <StatBox value={19} label="복습" />
          <StatBox value="87%" label="정답률" />
          <StatBox value="4.2s" label="평균" />
        </div>
      </div>

      {/* Heatmap */}
      <div className="px-5">
        <Label>이번 주 · 🔥 7일 연속</Label>
        <div className="mt-1">
          <Heatmap cells={heatmapData} />
        </div>
      </div>

      {/* Deck Progress */}
      <div className="px-5 mt-4">
        <Label>덱별 진행률</Label>
        <div className="mt-1">
          <DeckProgressRow name="TOEIC 필수" percent={42} />
          <DeckProgressRow name="비즈니스 영어" percent={68} />
        </div>
      </div>
    </div>
  )
}
