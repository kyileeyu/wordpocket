import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownContext = React.createContext<DropdownContextType>({
  open: false,
  setOpen: () => {},
})

function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative">{children}</div>
    </DropdownContext.Provider>
  )
}

function DropdownMenuTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  const { setOpen, open } = React.useContext(DropdownContext)
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
      onClick: () => setOpen(!open),
    })
  }
  return <button onClick={() => setOpen(!open)}>{children}</button>
}

function DropdownMenuContent({ children, className, align = "end" }: {
  children: React.ReactNode
  className?: string
  align?: "start" | "end"
}) {
  const { open, setOpen } = React.useContext(DropdownContext)
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      <div className={cn(
        "absolute z-50 mt-1 min-w-[160px] rounded-[12px] border border-border bg-parchment p-1 shadow-md",
        align === "end" ? "right-0" : "left-0",
        className
      )}>
        {children}
      </div>
    </>
  )
}

function DropdownMenuItem({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = React.useContext(DropdownContext)
  return (
    <button
      className={cn(
        "flex w-full items-center rounded-[8px] px-3 py-2 text-[13px] text-ink hover:bg-canvas transition-colors",
        className
      )}
      onClick={(e) => {
        props.onClick?.(e)
        setOpen(false)
      }}
      {...props}
    >
      {children}
    </button>
  )
}

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem }
