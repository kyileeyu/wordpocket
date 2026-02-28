import { cn } from "@/lib/utils"

interface WordCardProps {
  word: string
  phonetic?: string
  meaning?: string
  example?: string
  flipped: boolean
  onFlip: () => void
}

export default function WordCard({ word, phonetic, meaning, example, flipped, onFlip }: WordCardProps) {
  return (
    <div
      className="bg-bg-elevated border border-border rounded-[24px] p-[28px_20px] text-center shadow-md cursor-pointer w-full"
      onClick={!flipped ? onFlip : undefined}
    >
      {/* Word */}
      <div className={cn(
        "font-display text-text-primary mb-1 font-medium",
        flipped ? "text-[26px]" : "text-[30px]"
      )}>
        {word}
      </div>

      {/* Phonetic */}
      {phonetic && (
        <div className="font-mono text-[11px] text-text-secondary mb-[14px]">{phonetic}</div>
      )}

      {flipped ? (
        <>
          {/* Divider */}
          <div className="w-9 h-[3px] bg-accent-lighter mx-auto mb-[14px] rounded-full" />

          {/* Meaning */}
          <div className="font-korean text-[14px] text-text-primary">{meaning}</div>

          {/* Example */}
          {example && (
            <div className="text-[11px] text-text-secondary mt-[10px] leading-relaxed italic">
              "{example}"
            </div>
          )}
        </>
      ) : (
        /* Hint */
        <div className="text-[10px] text-text-tertiary mt-4">탭하여 뜻 확인</div>
      )}
    </div>
  )
}
