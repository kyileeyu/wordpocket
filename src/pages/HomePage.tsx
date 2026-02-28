import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import StatPill from "@/components/stats/StatPill"
import FolderListItem from "@/components/cards/FolderListItem"

export default function HomePage() {
  return (
    <div>
      {/* Greeting + Title */}
      <div className="px-5 pt-3">
        <div className="font-display text-[11px] text-sepia italic mb-[2px]">Good morning,</div>
        <h1 className="font-display text-[20px] font-medium text-ink">오늘의 복습</h1>
      </div>

      {/* Stat Pills */}
      <div className="px-5 mt-4">
        <div className="flex gap-[6px] flex-wrap">
          <StatPill emoji="📖" value={24} label="카드" />
          <StatPill emoji="🔥" value={7} label="일 연속" />
          <StatPill emoji="⏱" value="~8" label="분" />
        </div>
      </div>

      {/* Study CTA */}
      <div className="px-5 mt-4 mb-4">
        <Button asChild size="lg" className="w-full">
          <Link to="/study/all">▶ 학습 시작</Link>
        </Button>
      </div>

      {/* Folder List */}
      <div className="px-5">
        <div className="font-mono text-[8px] tracking-[2px] uppercase text-sepia opacity-50 mb-[6px]">단어장</div>
        <FolderListItem
          id="english"
          emoji="🇺🇸"
          name="영어"
          deckCount={3}
          reviewCount={18}
          iconBg="#E8E3D9"
        />
        <FolderListItem
          id="japanese"
          emoji="🇯🇵"
          name="일본어"
          deckCount={2}
          reviewCount={6}
          iconBg="#E3E8EE"
        />
      </div>
    </div>
  )
}
