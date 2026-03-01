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
      className="bg-bg-elevated border border-border rounded-[24px] p-[32px_24px] text-center shadow-md cursor-pointer w-full"
      onClick={!flipped ? onFlip : undefined}
    >
      {/* Word */}
      <div className={cn(
        "text-text-primary mb-1",
        flipped ? "typo-display-xl text-[28px]" : "typo-display-xl"
      )}>
        {word}
      </div>

      {/* Phonetic */}
      {phonetic && (
        <div className="typo-mono-md text-text-secondary mb-[14px]">{phonetic}</div>
      )}

      {flipped ? (
        <>
          {/* Divider */}
          <div className="w-9 h-[3px] bg-accent-lighter mx-auto mb-[14px] rounded-full" />

          {/* Meaning */}
          <div className="font-korean text-[18px] font-medium text-text-primary">{meaning}</div>

          {/* Example */}
          {example && (
            <div className="typo-caption text-text-secondary mt-[10px] italic">
              "{example}"
            </div>
          )}
        </>
      ) : (
        /* Hint */
        <div className="typo-mono-sm text-text-tertiary mt-4">탭하여 뜻 확인</div>
      )}
    </div>
  )
}
