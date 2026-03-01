import * as React from "react"
import { cn } from "@/lib/utils"

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "typo-overline text-text-secondary opacity-50 mb-[6px] block",
      className
    )}
    {...props}
  />
))
Label.displayName = "Label"

export { Label }
