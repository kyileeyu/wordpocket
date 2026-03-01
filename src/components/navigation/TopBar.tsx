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
    <div className="flex items-center justify-between px-7 pt-2 pb-1">
      <div className="w-11">
        {left && (
          <button
            onClick={handleLeft}
            className="w-11 h-11 rounded-full bg-bg-subtle flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          >
            {left === "back" ? <ArrowLeft className="w-[18px] h-[18px]" /> : <X className="w-[18px] h-[18px]" />}
          </button>
        )}
      </div>
      <div className="typo-body-md font-semibold text-text-primary truncate">{title}</div>
      <div className="w-11 flex justify-end">{right}</div>
    </div>
  )
}
