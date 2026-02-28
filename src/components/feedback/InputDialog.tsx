import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface InputDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  placeholder?: string
  defaultValue?: string
  submitLabel?: string
  onSubmit: (value: string) => void
  loading?: boolean
}

export default function InputDialog({
  open,
  onOpenChange,
  title,
  placeholder,
  defaultValue = "",
  submitLabel = "확인",
  onSubmit,
  loading,
}: InputDialogProps) {
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    if (open) setValue(defaultValue)
  }, [open, defaultValue])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-3 space-y-3">
          <Input
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
          />
          <Button type="submit" className="w-full" disabled={loading || !value.trim()}>
            {loading ? "저장 중..." : submitLabel}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
