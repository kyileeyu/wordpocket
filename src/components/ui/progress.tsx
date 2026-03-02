import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-bg-subtle", className)}
      {...props}
    >
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${value}%`, background: 'var(--gradient-progress)' }}
      />
    </div>
  )
)
Progress.displayName = "Progress"

export { Progress }
