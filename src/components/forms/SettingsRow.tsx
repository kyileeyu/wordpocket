import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface SettingsRowProps {
  label: string
  description?: string
  value?: string | number
  toggle?: boolean
  toggleOn?: boolean
  chevron?: boolean
  danger?: boolean
  noBorder?: boolean
}

export default function SettingsRow({ label, description, value, toggle, toggleOn, chevron, danger, noBorder }: SettingsRowProps) {
  return (
    <div className={cn("flex items-center justify-between py-3", !noBorder && "border-b border-border")}>
      <div>
        <div className={cn("text-[13px]", danger ? "text-brick" : "text-ink")}>{label}</div>
        {description && (
          <div className="text-[10px] text-sepia">{description}</div>
        )}
      </div>
      <div className="shrink-0">
        {value !== undefined && (
          <span className="font-mono text-[14px] font-bold text-ink">{value}</span>
        )}
        {toggle && (
          <div className={cn(
            "w-10 h-[22px] rounded-full relative transition-colors",
            toggleOn ? "bg-moss" : "bg-dust"
          )}>
            <div className={cn(
              "w-[18px] h-[18px] rounded-full bg-white absolute top-[2px] transition-[left]",
              toggleOn ? "left-5" : "left-[2px]"
            )} />
          </div>
        )}
        {chevron && <ChevronRight className="w-[14px] h-[14px] text-dust" />}
      </div>
    </div>
  )
}
