interface StatPillProps {
  emoji: string
  value: string | number
  label: string
}

export default function StatPill({ emoji, value, label }: StatPillProps) {
  return (
    <div className="bg-badge-bg rounded-full px-3 py-[6px] text-[10px] text-oak flex items-center gap-[5px] font-medium">
      {emoji} <strong className="text-ink font-semibold">{value}</strong> {label}
    </div>
  )
}
