import { Plus } from "lucide-react"
import { Link } from "react-router"
import { cn } from "@/lib/utils"

interface FABProps {
  to?: string
  onClick?: () => void
  isOpen?: boolean
}

export default function FAB({ to, onClick, isOpen }: FABProps) {
  const wrapper =
    "fixed bottom-[calc(env(safe-area-inset-bottom)+100px)] left-1/2 -translate-x-1/2 w-full max-w-[480px] sm:max-w-[640px] lg:max-w-[768px] z-30 pointer-events-none"

  const base =
    "absolute right-5 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 pointer-events-auto"

  if (to) {
    return (
      <div className={wrapper}>
        <Link to={to} className={cn(base, "bg-accent text-white hover:bg-accent-hover")} aria-label="추가">
          <Plus className="w-[22px] h-[22px]" strokeWidth={1.5} />
        </Link>
      </div>
    )
  }

  return (
    <div className={wrapper}>
      <button
        onClick={onClick}
        className={cn(
          base,
          isOpen
            ? "bg-bg-elevated text-text-primary shadow-md"
            : "bg-accent text-white hover:bg-accent-hover",
        )}
        aria-label={isOpen ? "닫기" : "추가"}
      >
        <Plus
          className={cn(
            "w-[22px] h-[22px] transition-transform duration-200",
            isOpen && "rotate-45",
          )}
          strokeWidth={1.5}
        />
      </button>
    </div>
  )
}
