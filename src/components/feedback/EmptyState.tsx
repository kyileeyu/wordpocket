import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon: string
  text: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({ icon, text, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="text-center py-8 px-5">
      <div className="text-[40px] mb-3 opacity-60">{icon}</div>
      <p className="text-[13px] text-text-secondary mb-4 leading-relaxed">{text}</p>
      {actionLabel && (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
