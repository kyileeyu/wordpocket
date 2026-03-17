import { useState, useEffect, useMemo } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface Deck {
  id: string
  name: string
}

interface RangePickerSheetProps {
  open: boolean
  onClose: () => void
  decks: Deck[]
  deckDueMap: Map<string, number>
  onConfirm: (fromIdx: number, toIdx: number) => void
}

export default function RangePickerSheet({
  open,
  onClose,
  decks,
  deckDueMap,
  onConfirm,
}: RangePickerSheetProps) {
  const [visible, setVisible] = useState(false)
  const [fromIndex, setFromIndex] = useState(0)
  const [toIndex, setToIndex] = useState(0)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
      setFromIndex(0)
      setToIndex(decks.length - 1)
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open, decks.length])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 200)
  }

  const handleFromChange = (idx: number) => {
    setFromIndex(idx)
    if (idx > toIndex) setToIndex(idx)
  }

  const handleToChange = (idx: number) => {
    setToIndex(idx)
    if (idx < fromIndex) setFromIndex(idx)
  }

  const totalDue = useMemo(() => {
    let sum = 0
    for (let i = fromIndex; i <= toIndex; i++) {
      sum += deckDueMap.get(decks[i]?.id) ?? 0
    }
    return sum
  }, [fromIndex, toIndex, decks, deckDueMap])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-text-primary/40 transition-opacity duration-200",
          visible ? "opacity-100" : "opacity-0"
        )}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 rounded-t-[32px] bg-bg-elevated p-6 transition-transform duration-200",
          visible ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Handle bar */}
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 rounded-full bg-text-tertiary/30" />
        </div>

        <h3 className="typo-body-lg font-semibold text-text-primary mb-5">
          구간 복습
        </h3>

        <div className="space-y-4 mb-5">
          {/* From selector */}
          <div className="flex items-center gap-3">
            <span className="typo-body-sm font-medium text-text-secondary w-8 shrink-0">
              시작
            </span>
            <select
              value={fromIndex}
              onChange={(e) => handleFromChange(Number(e.target.value))}
              className="flex-1 h-11 rounded-[12px] bg-bg-subtle px-3 typo-body-sm text-text-primary border-0 outline-none"
            >
              {decks.map((deck, idx) => (
                <option key={deck.id} value={idx}>
                  {deck.name}
                </option>
              ))}
            </select>
          </div>

          {/* To selector */}
          <div className="flex items-center gap-3">
            <span className="typo-body-sm font-medium text-text-secondary w-8 shrink-0">
              끝
            </span>
            <select
              value={toIndex}
              onChange={(e) => handleToChange(Number(e.target.value))}
              className="flex-1 h-11 rounded-[12px] bg-bg-subtle px-3 typo-body-sm text-text-primary border-0 outline-none"
            >
              {decks.map((deck, idx) => (
                <option key={deck.id} value={idx}>
                  {deck.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Due count */}
        <p className="typo-body-sm text-text-secondary text-center mb-4">
          복습 대상 <span className="font-semibold text-accent">{totalDue}</span>장
        </p>

        {/* Confirm button */}
        <Button
          className="w-full"
          disabled={totalDue === 0}
          onClick={() => {
            onConfirm(fromIndex, toIndex)
            handleClose()
          }}
        >
          복습 시작 · {totalDue}장
        </Button>
      </div>
    </div>,
    document.body
  )
}
