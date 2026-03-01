import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex w-full min-h-[60px] rounded-[12px] border border-border bg-bg-subtle px-[14px] py-[11px] typo-body-md text-text-primary transition-colors",
          "placeholder:text-text-tertiary",
          "focus:border-accent focus:ring-2 focus:ring-accent/10 focus:outline-none",
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
