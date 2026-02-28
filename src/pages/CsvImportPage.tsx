import TopBar from "@/components/navigation/TopBar"
import { Button } from "@/components/ui/button"
import CsvDropZone from "@/components/forms/CsvDropZone"
import { Label } from "@/components/ui/label"

export default function CsvImportPage() {
  return (
    <div className="min-h-dvh bg-canvas flex justify-center">
      <div className="w-full max-w-[480px] bg-parchment min-h-dvh flex flex-col">
        <TopBar left="back" title="CSV 가져오기" />
        <div className="px-5 pt-4">
          <CsvDropZone />

          <div className="mt-4">
            <Label>미리보기 (처음 3행)</Label>
            <div className="overflow-hidden rounded-[10px] border border-border mt-1 mb-4">
              <table className="w-full text-[10px]">
                <thead>
                  <tr>
                    <th className="font-mono text-[8px] tracking-[1px] uppercase text-sepia text-left p-[6px_8px] border-b border-dust">단어</th>
                    <th className="font-mono text-[8px] tracking-[1px] uppercase text-sepia text-left p-[6px_8px] border-b border-dust">뜻</th>
                    <th className="font-mono text-[8px] tracking-[1px] uppercase text-sepia text-left p-[6px_8px] border-b border-dust">예문</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-[6px_8px] border-b border-border">ephemeral</td>
                    <td className="p-[6px_8px] border-b border-border">덧없는</td>
                    <td className="p-[6px_8px] border-b border-border">The beauty was...</td>
                  </tr>
                  <tr>
                    <td className="p-[6px_8px] border-b border-border">ubiquitous</td>
                    <td className="p-[6px_8px] border-b border-border">어디에나 있는</td>
                    <td className="p-[6px_8px] border-b border-border">Smartphones...</td>
                  </tr>
                  <tr>
                    <td className="p-[6px_8px]">pragmatic</td>
                    <td className="p-[6px_8px]">실용적인</td>
                    <td className="p-[6px_8px]">A pragmatic...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-[11px] text-sepia mb-4">
            총 <strong className="text-ink">48</strong>장의 카드가 감지되었습니다.
          </p>

          <Button className="w-full">48장 가져오기</Button>
        </div>
      </div>
    </div>
  )
}
