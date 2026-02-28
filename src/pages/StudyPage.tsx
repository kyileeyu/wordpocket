import { useState } from "react"
import TopBar from "@/components/navigation/TopBar"
import StudyProgress from "@/components/study/StudyProgress"
import WordCard from "@/components/cards/WordCard"
import ResponseButtons from "@/components/study/ResponseButtons"
import { RotateCcw, Pencil } from "lucide-react"

export default function StudyPage() {
  const [flipped, setFlipped] = useState(false)

  return (
    <div className="min-h-dvh bg-canvas flex justify-center">
      <div className="w-full max-w-[480px] bg-parchment min-h-dvh flex flex-col">
        <TopBar
          left="close"
          title={
            <span className="font-mono text-[11px] text-sepia font-normal">8 / 24</span>
          }
          right={
            <button className="w-7 h-7 rounded-[8px] bg-canvas border border-border flex items-center justify-center text-sepia">
              {flipped ? <Pencil className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
            </button>
          }
        />

        <StudyProgress current={8} total={24} />

        {/* Card Area */}
        <div className="flex-1 flex items-center justify-center px-5">
          <WordCard
            word="Ephemeral"
            phonetic="/ɪˈfɛmərəl/"
            meaning="덧없는, 순간적인"
            example="The ephemeral beauty of cherry blossoms reminds us to cherish each moment."
            flipped={flipped}
            onFlip={() => setFlipped(true)}
          />
        </div>

        {/* Response Buttons (only when flipped) */}
        {flipped ? (
          <div className="mb-2">
            <ResponseButtons onResponse={() => setFlipped(false)} />
          </div>
        ) : (
          <div className="h-10" />
        )}

        {/* Safe area */}
        <div className="h-5 shrink-0" />
      </div>
    </div>
  )
}
