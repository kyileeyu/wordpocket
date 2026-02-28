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
  onPress?: () => void
}

export default function SettingsRow({ label, description, value, toggle, toggleOn, chevron, danger, noBorder, onPress }: SettingsRowProps) {
  return (
    <div
      className={cn("flex items-center justify-between py-3", !noBorder && "border-b border-border", onPress && "cursor-pointer")}
      onClick={onPress}
    >
      <div>
        <div className={cn("text-[13px]", danger ? "text-danger" : "text-text-primary")}>{label}</div>
        {description && (
          <div className="text-[10px] text-text-secondary">{description}</div>
        )}
      </div>
      <div className="shrink-0">
        {value !== undefined && (
          <span className="font-mono text-[14px] font-bold text-text-primary">{value}</span>
        )}
        {toggle && (
          <div className={cn(
            "w-11 h-[26px] rounded-full relative transition-colors",
            toggleOn ? "bg-accent" : "bg-text-tertiary"
          )}>
            <div className={cn(
              "w-5 h-5 rounded-full bg-white absolute top-[3px] transition-[left]",
              toggleOn ? "left-[22px]" : "left-[3px]"
            )} />
          </div>
        )}
        {chevron && <ChevronRight className="w-[14px] h-[14px] text-text-tertiary" />}
      </div>
    </div>
  )
}
