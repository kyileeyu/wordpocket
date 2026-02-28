import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex w-full min-h-[60px] rounded-[10px] border border-border bg-canvas px-[14px] py-[11px] font-body text-[13px] text-ink transition-colors",
          "placeholder:text-dust",
          "focus:border-ink focus:ring-2 focus:ring-ink/6 focus:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "resize-none",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
