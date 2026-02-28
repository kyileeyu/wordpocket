import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-ink text-parchment rounded-[12px] hover:bg-ink/90",
        secondary: "bg-badge-bg text-oak rounded-[12px] hover:bg-badge-bg/80",
        moss: "bg-moss-bg text-moss rounded-[12px] hover:bg-moss-bg/80",
        ghost: "text-sepia hover:text-ink",
        destructive: "bg-brick text-parchment rounded-[12px] hover:bg-brick/90",
        outline: "border border-border bg-transparent text-ink rounded-[12px] hover:bg-canvas",
      },
      size: {
        default: "h-12 px-4 py-3 text-[12px]",
        sm: "h-9 px-3 text-[11px]",
        lg: "h-[52px] px-4 py-[14px] text-[14px]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
