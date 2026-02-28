import { useNavigate } from "react-router"
import { ArrowLeft, X } from "lucide-react"
import type { ReactNode } from "react"

interface TopBarProps {
  left?: "back" | "close"
  title?: ReactNode
  right?: ReactNode
  onLeftClick?: () => void
}

export default function TopBar({ left, title, right, onLeftClick }: TopBarProps) {
  const navigate = useNavigate()
  const handleLeft = onLeftClick ?? (() => navigate(-1))

  return (
    <div className="flex items-center justify-between px-5 pt-2 pb-1">
      <div className="w-7">
        {left && (
          <button
            onClick={handleLeft}
            className="w-7 h-7 rounded-[8px] bg-canvas border border-border flex items-center justify-center text-sepia hover:text-ink transition-colors"
          >
            {left === "back" ? <ArrowLeft className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </button>
        )}
      </div>
      <div className="text-[13px] font-semibold text-ink truncate">{title}</div>
      <div className="w-7 flex justify-end">{right}</div>
    </div>
  )
}
