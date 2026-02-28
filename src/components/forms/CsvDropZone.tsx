import { Button } from "@/components/ui/button"

export default function CsvDropZone() {
  return (
    <div className="border-[1.5px] border-dashed border-dust rounded-[14px] py-7 px-5 text-center">
      <div className="text-[28px] mb-2 opacity-50">📄</div>
      <div className="text-[12px] text-sepia mb-2">CSV 파일을 선택하세요</div>
      <Button variant="secondary" size="sm" className="inline-flex px-5">
        파일 선택
      </Button>
    </div>
  )
}
