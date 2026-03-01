import { cn } from "@/lib/utils"

interface StatBoxProps {
  value: string | number
  label: string
  color?: string
  className?: string
}

export default function StatBox({ value, label, className }: StatBoxProps) {
  return (
    <div className={cn("flex-1 bg-bg-elevated rounded-[20px] py-3 px-2 text-center shadow-[0_1px_4px_rgba(26,26,46,0.06)]", className)}>
      <div className="font-display text-[24px] font-bold leading-[1.2] text-text-primary">
        {value}
      </div>
      <div className="typo-overline text-text-primary mt-[2px]">
        {label}
      </div>
    </div>
  )
}
