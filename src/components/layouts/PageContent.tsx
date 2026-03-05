import { cn } from "@/lib/utils"

export default function PageContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-7 pt-7 space-y-4", className)}>{children}</div>
}
