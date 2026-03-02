import { useRef, useState, useCallback } from "react"
import { Check, ChevronDown, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CardDraft } from "@/types/photo-import"

interface CardDraftItemProps {
  card: CardDraft
  onToggleCheck: () => void
  onToggleExpand: () => void
  onUpdateField: (field: keyof CardDraft, value: string | string[]) => void
  onDelete: () => void
}

const SWIPE_THRESHOLD = 120

export default function CardDraftItem({
  card,
  onToggleCheck,
  onToggleExpand,
  onUpdateField,
  onDelete,
}: CardDraftItemProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [translateX, setTranslateX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const touchStartRef = useRef({ x: 0, y: 0 })
  const isHorizontalRef = useRef<boolean | null>(null)

  // --- Swipe handlers ---
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
    isHorizontalRef.current = null
    setIsSwiping(false)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartRef.current.x
    const dy = e.touches[0].clientY - touchStartRef.current.y

    // Determine direction on first significant movement
    if (isHorizontalRef.current === null) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        isHorizontalRef.current = Math.abs(dx) > Math.abs(dy)
      }
      return
    }

    if (!isHorizontalRef.current) return

    e.preventDefault()
    setIsSwiping(true)
    // Only allow left swipe (negative)
    setTranslateX(Math.min(0, dx))
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (translateX < -SWIPE_THRESHOLD) {
      // Animate off-screen then delete
      setTranslateX(-400)
      setTimeout(() => {
        onDelete()
        setTranslateX(0)
        setIsSwiping(false)
      }, 200)
    } else {
      setTranslateX(0)
      setIsSwiping(false)
    }
  }, [translateX, onDelete])

  const deleteVisible = translateX < -40

  return (
    <div className="relative overflow-hidden rounded-[14px]">
      {/* Delete background */}
      {deleteVisible && (
        <div className="absolute inset-0 bg-danger flex items-center justify-end pr-5 rounded-[14px]">
          <span className="text-white typo-body-sm font-semibold">삭제</span>
        </div>
      )}

      {/* Card content */}
      <div
        ref={containerRef}
        className={cn(
          "bg-bg-elevated rounded-[14px] shadow-soft transition-transform",
          card.isDuplicate && "opacity-50",
          !isSwiping && "duration-200"
        )}
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Collapsed row */}
        <div
          className="flex items-center gap-2 p-[10px_12px] cursor-pointer"
          onClick={onToggleExpand}
        >
          {/* Checkbox */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleCheck()
            }}
            className={cn(
              "w-[18px] h-[18px] rounded-[5px] border-[1.5px] flex items-center justify-center shrink-0 transition-colors",
              card.isChecked
                ? "bg-accent border-accent"
                : "bg-transparent border-text-tertiary"
            )}
          >
            {card.isChecked && <Check className="w-3 h-3 text-white" />}
          </button>

          {/* Word + Meaning */}
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <span className="typo-body-md font-semibold text-text-primary truncate">
              {card.word}
            </span>
            <span className="typo-body-sm text-text-secondary truncate">
              {card.meaning}
            </span>
          </div>

          {/* Duplicate badge */}
          {card.isDuplicate && (
            <span className="flex items-center gap-1 shrink-0 px-[6px] py-[2px] rounded-full bg-danger-bg typo-overline text-danger">
              <AlertTriangle className="w-[10px] h-[10px]" />
              이미 존재
            </span>
          )}

          {/* Expand toggle */}
          <ChevronDown
            className={cn(
              "w-4 h-4 text-text-tertiary shrink-0 transition-transform duration-200",
              card.isExpanded && "rotate-180"
            )}
          />
        </div>

        {/* Expanded form */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-200",
            card.isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="px-3 pb-3 flex flex-col gap-2">
            <FieldRow
              label="단어"
              value={card.word}
              onChange={(v) => onUpdateField("word", v)}
            />
            <FieldRow
              label="뜻"
              value={card.meaning}
              onChange={(v) => onUpdateField("meaning", v)}
            />
            <FieldRow
              label="발음"
              value={card.pronunciation}
              onChange={(v) => onUpdateField("pronunciation", v)}
              mono
            />
            <FieldRow
              label="예문"
              value={card.example}
              onChange={(v) => onUpdateField("example", v)}
              multiline
            />
            <FieldRow
              label="유의어"
              value={card.synonyms.join(", ")}
              onChange={(v) =>
                onUpdateField(
                  "synonyms",
                  v ? v.split(",").map((s) => s.trim()) : []
                )
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Field row sub-component ---
function FieldRow({
  label,
  value,
  onChange,
  mono,
  multiline,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  mono?: boolean
  multiline?: boolean
}) {
  const inputClass = cn(
    "flex-1 bg-bg-subtle border-[1.5px] border-border rounded-[8px] p-[8px_10px] typo-body-sm text-text-primary outline-none transition-colors",
    "focus:bg-bg-elevated focus:border-accent-light focus:ring-1 focus:ring-accent-light/30",
    mono && "font-mono"
  )

  return (
    <div className="flex items-start gap-2">
      <span className="w-9 shrink-0 typo-overline text-text-tertiary pt-[10px]">
        {label}
      </span>
      {multiline ? (
        <textarea
          className={cn(inputClass, "resize-none min-h-[60px]")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
        />
      ) : (
        <input
          className={inputClass}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  )
}
