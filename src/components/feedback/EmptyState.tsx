import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon: string
  text: string
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
}

export default function EmptyState({ icon, text, actionLabel, onAction, secondaryActionLabel, onSecondaryAction }: EmptyStateProps) {
  return (
    <div className="text-center py-8 px-7">
      <div className="text-[40px] mb-3 opacity-60">{icon}</div>
      <p className="typo-body-md text-text-secondary mb-4">{text}</p>
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-col items-center gap-2">
          {actionLabel && (
            <Button variant="secondary" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && (
            <Button variant="secondary" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
