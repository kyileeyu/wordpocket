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
      <div className="text-[18px] font-bold font-body text-text-primary">
        {value}
      </div>
      <div className="font-mono text-[8px] tracking-[1px] uppercase text-text-secondary mt-[2px]">
        {label}
      </div>
    </div>
  )
}
