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
      className="bg-white border border-border rounded-[16px] p-[28px_20px] text-center shadow-md cursor-pointer w-full"
      onClick={!flipped ? onFlip : undefined}
    >
      {/* Word */}
      <div className="font-display text-ink mb-1" style={{ fontSize: flipped ? 26 : 30, fontWeight: 500 }}>
        {word}
      </div>

      {/* Phonetic */}
      {phonetic && (
        <div className="font-mono text-[11px] text-sepia mb-[14px]">{phonetic}</div>
      )}

      {flipped ? (
        <>
          {/* Divider */}
          <div className="w-9 h-px bg-dust mx-auto mb-[14px]" />

          {/* Meaning */}
          <div className="font-korean text-[14px] text-[#3A3632]">{meaning}</div>

          {/* Example */}
          {example && (
            <div className="text-[11px] text-sepia mt-[10px] leading-relaxed italic">
              "{example}"
            </div>
          )}
        </>
      ) : (
        /* Hint */
        <div className="text-[10px] text-dust mt-4">탭하여 뜻 확인</div>
      )}
    </div>
  )
}
