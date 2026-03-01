import { cn } from "@/lib/utils"

interface StatBoxProps {
  value: string | number
  label: string
  color?: string
  className?: string
}

export default function StatBox({ value, label, className }: StatBoxProps) {
  return (
    <div className={cn("flex-1 bg-bg-subtle rounded-[20px] py-[10px] px-2 text-center", className)}>
      <div className="typo-stat-value text-text-primary">
        {value}
      </div>
      <div className="typo-overline text-text-secondary mt-[2px]">
        {label}
      </div>
    </div>
  )
}
