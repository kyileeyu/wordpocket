import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface PickerItem {
  id: string
  label: string
  sublabel?: string
}

interface PickerSheetProps {
  open: boolean
  onClose: () => void
  title: string
  items: PickerItem[]
  selectedId?: string
  onSelect: (id: string) => void
}

export default function PickerSheet({
  open,
  onClose,
  title,
  items,
  selectedId,
  onSelect,
}: PickerSheetProps) {
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

  const handleSelect = (id: string) => {
    if (id === selectedId) {
      handleClose()
      return
    }
    onSelect(id)
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
          {title}
        </h3>

        <div className="flex flex-col gap-1 max-h-[50vh] overflow-y-auto">
          {items.map((item) => (
            <button
              key={item.id}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-[12px] transition-colors text-left",
                item.id === selectedId
                  ? "bg-accent-bg"
                  : "bg-bg-elevated active:bg-bg-subtle"
              )}
              onClick={() => handleSelect(item.id)}
            >
              <div>
                <div className="typo-body-sm font-semibold text-text-primary">
                  {item.label}
                </div>
                {item.sublabel && (
                  <div className="typo-caption text-text-secondary">
                    {item.sublabel}
                  </div>
                )}
              </div>
              {item.id === selectedId && (
                <Check className="w-4 h-4 text-accent shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  )
}
