import { cn } from "@/lib/utils"
import PronunciationButton from "./PronunciationButton"

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
      className="bg-bg-elevated rounded-[24px] p-[32px_24px] text-center shadow-[0_2px_16px_rgba(26,26,46,0.08)] cursor-pointer w-full h-[380px] flex flex-col items-center justify-center overflow-hidden"
      onClick={onFlip}
    >
      {/* Word + Pronunciation */}
      <div className="flex items-center justify-center gap-1 mb-1">
        <div className={cn(
          "text-text-primary",
          flipped ? "typo-display-xl text-[28px]" : "typo-display-xl"
        )}>
          {word}
        </div>
        <PronunciationButton word={word} size="md" />
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
            <div className="typo-caption text-text-secondary mt-[10px] italic line-clamp-3">
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
