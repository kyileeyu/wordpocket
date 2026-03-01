interface StatPillProps {
  emoji: string
  value: string | number
  label: string
}

export default function StatPill({ emoji, value, label }: StatPillProps) {
  return (
    <div className="bg-accent-bg rounded-full px-3 py-[6px] typo-mono-sm text-text-secondary flex items-center gap-[5px] font-medium">
      {emoji} <strong className="text-text-primary font-semibold">{value}</strong> {label}
    </div>
  )
}
