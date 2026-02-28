import { useRef } from "react"
import { Button } from "@/components/ui/button"

interface CsvDropZoneProps {
  onFileSelect?: (file: File) => void
}

export default function CsvDropZone({ onFileSelect }: CsvDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFileSelect?.(file)
    e.target.value = ""
  }

  return (
    <div className="border-[1.5px] border-dashed border-dust rounded-[14px] py-7 px-5 text-center">
      <div className="text-[28px] mb-2 opacity-50">📄</div>
      <div className="text-[12px] text-sepia mb-2">CSV 파일을 선택하세요</div>
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
