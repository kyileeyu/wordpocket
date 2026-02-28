import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-[12px] border border-border bg-bg-subtle px-[14px] py-[11px] font-body text-[13px] text-text-primary transition-colors",
          "placeholder:text-text-tertiary",
          "focus:border-accent focus:ring-2 focus:ring-accent/10 focus:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
