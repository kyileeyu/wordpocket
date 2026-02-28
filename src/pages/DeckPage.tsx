import { Link } from "react-router"
import TopBar from "@/components/navigation/TopBar"
import { Button } from "@/components/ui/button"
import StatBox from "@/components/stats/StatBox"
import SegmentedProgress from "@/components/stats/SegmentedProgress"
import CardListItem from "@/components/cards/CardListItem"
import FAB from "@/components/feedback/FAB"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

export default function DeckPage() {
  return (
    <>
      <TopBar
        left="back"
        title="TOEIC 필수"
        right={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-7 h-7 rounded-[8px] bg-canvas border border-border flex items-center justify-center text-sepia">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>이름 편집</DropdownMenuItem>
              <DropdownMenuItem className="text-brick">삭제</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      {/* Stat Boxes */}
      <div className="px-5 pt-2">
        <div className="flex gap-[6px] mb-2">
          <StatBox value={42} label="New" color="#3A4A6B" />
          <StatBox value={28} label="Learning" color="#6B5F4F" />
          <StatBox value={50} label="Mature" color="#3A6B4A" />
        </div>
      </div>

      {/* Segmented Progress */}
      <div className="px-5 mb-4">
        <SegmentedProgress
          segments={[
            { value: 35, color: "#3A4A6B" },
            { value: 23, color: "#6B5F4F" },
            { value: 42, color: "#3A6B4A" },
          ]}
        />
      </div>

      {/* CTA Buttons */}
      <div className="px-5 mb-4">
        <Button asChild className="w-full mb-2">
          <Link to="/study/toeic">▶ 학습 시작 · 8장</Link>
        </Button>
        <div className="flex gap-2">
          <Button asChild variant="secondary" size="sm" className="flex-1">
            <Link to="/deck/toeic/import">📤 CSV 가져오기</Link>
          </Button>
          <Button variant="secondary" size="sm" className="flex-1">🔍 검색</Button>
        </div>
      </div>

      {/* Card List */}
      <div className="px-5">
        <div className="font-mono text-[8px] tracking-[2px] uppercase text-sepia opacity-50 mb-[6px]">카드 120장</div>
        <CardListItem word="Ephemeral" meaning="덧없는, 순간적인" status="mature" />
        <CardListItem word="Ubiquitous" meaning="어디에나 있는" status="learning" />
        <CardListItem word="Pragmatic" meaning="실용적인" status="new" />
      </div>

      <FAB to="/deck/toeic/add" />
    </>
  )
}
