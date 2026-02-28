import { Plus } from "lucide-react"
import { Link } from "react-router"

interface FABProps {
  to?: string
  onClick?: () => void
}

export default function FAB({ to, onClick }: FABProps) {
  const className =
    "absolute bottom-[72px] right-5 w-12 h-12 rounded-[14px] bg-ink text-parchment flex items-center justify-center shadow-lg hover:bg-ink/90 transition-colors"

  if (to) {
    return (
      <Link to={to} className={className}>
        <Plus className="w-[22px] h-[22px]" strokeWidth={1.5} />
      </Link>
    )
  }

  return (
    <button onClick={onClick} className={className}>
      <Plus className="w-[22px] h-[22px]" strokeWidth={1.5} />
    </button>
  )
}
