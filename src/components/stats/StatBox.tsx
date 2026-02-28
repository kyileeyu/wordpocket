import { cn } from "@/lib/utils"

interface StatBoxProps {
  value: string | number
  label: string
  color?: string
  className?: string
}

export default function StatBox({ value, label, color, className }: StatBoxProps) {
  return (
    <div className={cn("flex-1 bg-canvas rounded-[10px] py-[10px] px-2 text-center", className)}>
      <div className="text-[18px] font-bold font-body" style={color ? { color } : undefined}>
        {value}
      </div>
      <div className="font-mono text-[8px] tracking-[1px] uppercase text-sepia mt-[2px]">
        {label}
      </div>
    </div>
  )
}
