import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"

interface CsvDropZoneProps {
  onFileSelect?: (file: File) => void
}

export default function CsvDropZone({ onFileSelect }: CsvDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFileSelect?.(file)
    e.target.value = ""
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file?.name.endsWith(".csv")) onFileSelect?.(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`border-[1.5px] border-dashed rounded-[14px] py-7 px-5 text-center transition-colors ${dragging ? "border-accent bg-accent/5" : "border-accent-lighter"}`}
    >
      <div className="text-[28px] mb-2 opacity-50">📄</div>
      <div className="typo-body-sm text-text-secondary mb-2">{dragging ? "여기에 놓으세요" : "CSV 파일을 선택하세요"}</div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleChange}
      />
      <Button
        variant="secondary"
        size="sm"
        className="inline-flex px-5"
        onClick={() => inputRef.current?.click()}
      >
        파일 선택
      </Button>
    </div>
  )
}
