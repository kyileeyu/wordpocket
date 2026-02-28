import { Plus } from "lucide-react"
import { Link } from "react-router"

interface FABProps {
  to: string
}

export default function FAB({ to }: FABProps) {
  return (
    <Link
      to={to}
      className="absolute bottom-[72px] right-5 w-12 h-12 rounded-[14px] bg-ink text-parchment flex items-center justify-center shadow-lg hover:bg-ink/90 transition-colors"
    >
      <Plus className="w-[22px] h-[22px]" strokeWidth={1.5} />
    </Link>
  )
}
