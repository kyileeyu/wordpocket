import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default: "btn-glass text-text-primary rounded-full",
        solid: "bg-accent text-white rounded-full hover:bg-accent-hover",
        secondary: "bg-bg-subtle text-text-secondary rounded-full hover:bg-bg-subtle/80",
        ghost: "text-text-secondary hover:text-text-primary",
        destructive: "bg-danger text-white rounded-full hover:bg-danger/90",
        outline: "border border-border bg-transparent text-text-primary rounded-full hover:bg-bg-subtle",
      },
      size: {
        default: "h-12 px-4 py-3 text-[length:var(--font-size-body-sm)]",
        sm: "h-9 px-3 text-[length:var(--font-size-caption)]",
        lg: "h-[52px] px-4 py-[14px] text-[length:var(--font-size-body-lg)]",
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
