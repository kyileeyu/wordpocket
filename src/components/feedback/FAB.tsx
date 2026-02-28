import { Plus } from "lucide-react"
import { Link } from "react-router"

interface FABProps {
  to?: string
  onClick?: () => void
}

export default function FAB({ to, onClick }: FABProps) {
  const className =
    "absolute bottom-[72px] right-5 w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center shadow-lg hover:bg-accent-hover transition-colors"

  if (to) {
    return (
      <Link to={to} className={className} aria-label="추가">
        <Plus className="w-[22px] h-[22px]" strokeWidth={1.5} />
      </Link>
    )
  }

  return (
    <button onClick={onClick} className={className} aria-label="추가">
      <Plus className="w-[22px] h-[22px]" strokeWidth={1.5} />
    </button>
  )
}
