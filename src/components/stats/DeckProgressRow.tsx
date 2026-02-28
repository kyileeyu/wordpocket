interface DeckProgressRowProps {
  name: string
  percent: number
}

export default function DeckProgressRow({ name, percent }: DeckProgressRowProps) {
  return (
    <div className="bg-bg-subtle rounded-[20px] p-[14px] mb-2">
      <div className="flex justify-between mb-[6px]">
        <span className="text-[12px] font-semibold">{name}</span>
        <span className="text-[11px] text-accent">{percent}%</span>
      </div>
      <div className="h-1 rounded-full bg-border overflow-hidden">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
