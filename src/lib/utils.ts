import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const rtf = new Intl.RelativeTimeFormat("ko", { numeric: "always" })

export function timeAgo(date: string | Date): string {
  const seconds = Math.floor(
    (Date.now() - new Date(date).getTime()) / 1000,
  )

  if (seconds < 60) return "방금 전"

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return rtf.format(-minutes, "minute")

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return rtf.format(-hours, "hour")

  const days = Math.floor(hours / 24)
  if (days < 30) return rtf.format(-days, "day")

  const months = Math.floor(days / 30)
  return rtf.format(-months, "month")
}
