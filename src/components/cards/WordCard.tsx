import { cn } from "@/lib/utils"
import PronunciationButton from "./PronunciationButton"

interface WordCardProps {
  word: string
  phonetic?: string
  meaning?: string
  example?: string
  synonyms?: string[]
  tags?: string[]
  flipped: boolean
  onFlip: () => void
}

export default function WordCard({ word, phonetic, meaning, example, synonyms, tags, flipped, onFlip }: WordCardProps) {
  return (
    <div
      className="relative bg-bg-elevated rounded-[24px] p-[32px_24px] text-center shadow-[0_2px_16px_rgba(26,26,46,0.08)] cursor-pointer w-full h-[380px] flex flex-col items-center justify-center overflow-hidden"
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
          <div
            className="w-9 h-[3px] mx-auto mt-[10px] mb-[14px] rounded-full"
            style={{ background: 'var(--gradient-divider)' }}
          />

          {/* Meaning */}
          <div className="font-korean text-[18px] font-medium text-text-primary">{meaning}</div>

          {/* Example */}
          {example && (
            <div className="typo-body-md text-text-tertiary mt-[10px] line-clamp-3">
              "{example}"
            </div>
          )}

          {/* Synonyms */}
          {synonyms && synonyms.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-[10px]">
              {synonyms.map((syn, i) => (
                <span
                  key={syn}
                  className={cn(
                    "px-3 py-1 rounded-full typo-body-sm",
                    i === 0
                      ? "bg-text-primary text-white"
                      : "bg-bg-subtle text-text-primary"
                  )}
                >
                  {syn}
                </span>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Hint */
        <div className="typo-mono-sm text-text-tertiary mt-4">탭하여 뜻 확인</div>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="absolute bottom-4 right-4 typo-caption text-text-tertiary">
          {tags.join(", ")}
        </div>
      )}
    </div>
  )
}
