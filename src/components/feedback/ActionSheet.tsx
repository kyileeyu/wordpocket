import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface ActionSheetItem {
  label: string
  icon?: LucideIcon
  onClick: () => void
}

interface ActionSheetProps {
  open: boolean
  onClose: () => void
  items: ActionSheetItem[]
}

export default function ActionSheet({ open, onClose, items }: ActionSheetProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
    }
  }, [open])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 150)
  }

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-30">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-text-primary/40 transition-opacity duration-150",
          visible ? "opacity-100" : "opacity-0",
        )}
        onClick={handleClose}
      />

      {/* Floating menu — positioned above FAB */}
      <div
        className={cn(
          "absolute bottom-[132px] right-5 rounded-[16px] bg-bg-elevated shadow-lg py-2 px-1 min-w-[200px] transition-all duration-150 origin-bottom-right",
          visible ? "opacity-100 scale-100" : "opacity-0 scale-90",
        )}
      >
        {items.map((item) => (
          <button
            key={item.label}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-[12px] text-left transition-colors active:bg-bg-subtle"
            onClick={() => {
              handleClose()
              item.onClick()
            }}
          >
            {item.icon && <item.icon className="w-5 h-5 text-accent shrink-0" />}
            <span className="typo-body-md text-text-primary">{item.label}</span>
          </button>
        ))}
      </div>
    </div>,
    document.body,
  )
}
