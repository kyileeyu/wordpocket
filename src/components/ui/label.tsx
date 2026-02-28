import * as React from "react"
import { cn } from "@/lib/utils"

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "font-mono text-[8px] tracking-[2px] uppercase text-sepia opacity-50 mb-[6px] block",
      className
    )}
    {...props}
  />
))
Label.displayName = "Label"

export { Label }
