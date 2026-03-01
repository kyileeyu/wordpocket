import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-[3px] typo-mono-sm font-semibold",
  {
    variants: {
      variant: {
        default: "bg-accent-bg text-accent",
        muted: "bg-bg-subtle text-text-secondary",
        new: "bg-accent-bg text-accent",
        learning: "bg-bg-subtle text-text-secondary",
        mature: "bg-accent-bg text-accent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
