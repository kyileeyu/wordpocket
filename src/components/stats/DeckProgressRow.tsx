interface DeckProgressRowProps {
  name: string
  percent: number
}

export default function DeckProgressRow({ name, percent }: DeckProgressRowProps) {
  return (
    <div className="bg-canvas rounded-[12px] p-[14px] mb-2">
      <div className="flex justify-between mb-[6px]">
        <span className="text-[12px] font-semibold">{name}</span>
        <span className="text-[11px] text-moss">{percent}%</span>
      </div>
      <div className="h-1 rounded-[2px] bg-border overflow-hidden">
        <div
          className="h-full rounded-[2px] bg-moss"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
