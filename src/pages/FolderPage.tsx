import { Link } from "react-router"
import TopBar from "@/components/navigation/TopBar"
import { Button } from "@/components/ui/button"
import StatPill from "@/components/stats/StatPill"
import DeckCard from "@/components/cards/DeckCard"
import FAB from "@/components/feedback/FAB"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

export default function FolderPage() {
  return (
    <>
      <TopBar
        left="back"
        title="🇺🇸 영어"
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

      {/* Stats + CTA */}
      <div className="px-5 pt-2">
        <div className="flex gap-[6px] flex-wrap mb-3">
          <StatPill emoji="📖" value={18} label="복습 대기" />
          <StatPill emoji="📦" value={340} label="전체 카드" />
        </div>
        <Button asChild variant="moss" className="w-full mb-4">
          <Link to="/study/english">▶ 전체 학습 시작</Link>
        </Button>
      </div>

      {/* Deck List */}
      <div className="px-5">
        <div className="font-mono text-[8px] tracking-[2px] uppercase text-sepia opacity-50 mb-[6px]">3개의 덱</div>
        <DeckCard id="toeic" name="TOEIC 필수" cardCount={120} reviewCount={8} stripeColor="#3A6B4A" />
        <DeckCard id="business" name="비즈니스 영어" cardCount={95} reviewCount={10} stripeColor="#3A4A6B" />
        <DeckCard id="daily" name="일상 회화" cardCount={125} reviewCount={0} stripeColor="#6B5F4F" />
      </div>

      <FAB to="/deck/new/add" />
    </>
  )
}
