import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

export interface SortOption {
  value: string
  label: string
  description: string
}

interface SortSheetProps {
  open: boolean
  onClose: () => void
  value: string
  onChange: (value: string) => void
  options: SortOption[]
}

export default function SortSheet({
  open,
  onClose,
  value,
  onChange,
  options,
}: SortSheetProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 200)
  }

  const handleSelect = (v: string) => {
    onChange(v)
    handleClose()
  }

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

        <h3 className="typo-body-lg font-semibold text-text-primary mb-4">
          정렬
        </h3>

        {/* Radio options */}
        <div className="flex flex-col gap-2">
          {options.map((opt) => (
            <button
              key={opt.value}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-[12px] border transition-colors text-left",
                value === opt.value
                  ? "border-accent bg-accent-bg"
                  : "border-border bg-bg-elevated"
              )}
              onClick={() => handleSelect(opt.value)}
            >
              {/* Radio circle */}
              <div
                className={cn(
                  "w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0",
                  value === opt.value
                    ? "border-accent"
                    : "border-text-tertiary"
                )}
              >
                {value === opt.value && (
                  <div className="w-[10px] h-[10px] rounded-full bg-accent" />
                )}
              </div>
              <div>
                <div className="typo-body-sm font-semibold text-text-primary">
                  {opt.label}
                </div>
                <div className="typo-caption text-text-secondary">
                  {opt.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  )
}
