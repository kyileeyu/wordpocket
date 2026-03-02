import { useState } from "react"
import { useParams, useNavigate } from "react-router"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import TopBar from "@/components/navigation/TopBar"
import { Button } from "@/components/ui/button"
import { CsvDropZone } from "@/components/forms"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { parseCsv, type CsvRow } from "@/lib/csvParser"

export default function CsvImportPage() {
  const { id: deckId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [rows, setRows] = useState<CsvRow[]>([])
  const [loading, setLoading] = useState(false)
  const [autoTag, setAutoTag] = useState(false)
  const [batchSize, setBatchSize] = useState(30)

  const handleFileSelect = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setRows(parseCsv(text))
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!rows.length || !deckId) return
    setLoading(true)
    try {
      const insertData = rows.map((row, index) => {
        const csvTags = row.tags ? row.tags.split(";").map((t) => t.trim()) : []
        const dayTag = autoTag ? [`Day ${Math.floor(index / batchSize) + 1}`] : []
        const tags = [...new Set([...dayTag, ...csvTags])]
        return {
          deck_id: deckId,
          word: row.word,
          meaning: row.meaning,
          example: row.example || "",
          pronunciation: row.pronunciation || "",
          tags,
          synonyms: row.synonyms ? row.synonyms.split(";").map((s) => s.trim()) : [],
        }
      })

      const { error } = await supabase.from("cards").insert(insertData)
      if (error) throw error

      qc.invalidateQueries({ queryKey: ["cards", deckId] })
      qc.invalidateQueries({ queryKey: ["deck-progress"] })
      toast.success(`${rows.length}장 가져오기 완료`)
      navigate(-1)
    } catch {
      toast.error("가져오기에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const preview = rows.slice(0, 3)

  return (
    <>
      <TopBar left="back" title="CSV 가져오기" />
      <div className="px-7 pt-7">
        <CsvDropZone onFileSelect={handleFileSelect} />

        {rows.length > 0 && (
          <>
            <div className="mt-4">
              <Label>미리보기 (처음 3행)</Label>
              <div className="overflow-x-auto rounded-[10px] border border-border mt-1 mb-4">
                <table className="w-full typo-mono-sm">
                  <thead>
                    <tr>
                      <th className="typo-overline text-text-secondary text-left p-[6px_8px] border-b border-text-tertiary whitespace-nowrap">단어</th>
                      <th className="typo-overline text-text-secondary text-left p-[6px_8px] border-b border-text-tertiary whitespace-nowrap">뜻</th>
                      <th className="typo-overline text-text-secondary text-left p-[6px_8px] border-b border-text-tertiary whitespace-nowrap">예문</th>
                      <th className="typo-overline text-text-secondary text-left p-[6px_8px] border-b border-text-tertiary whitespace-nowrap">발음</th>
                      <th className="typo-overline text-text-secondary text-left p-[6px_8px] border-b border-text-tertiary whitespace-nowrap">유의어</th>
                      <th className="typo-overline text-text-secondary text-left p-[6px_8px] border-b border-text-tertiary whitespace-nowrap">태그</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i}>
                        <td className={`p-[6px_8px] ${i < preview.length - 1 ? "border-b border-border" : ""}`}>{row.word}</td>
                        <td className={`p-[6px_8px] ${i < preview.length - 1 ? "border-b border-border" : ""}`}>{row.meaning}</td>
                        <td className={`p-[6px_8px] ${i < preview.length - 1 ? "border-b border-border" : ""}`}>{row.example ?? ""}</td>
                        <td className={`p-[6px_8px] ${i < preview.length - 1 ? "border-b border-border" : ""}`}>{row.pronunciation ?? ""}</td>
                        <td className={`p-[6px_8px] ${i < preview.length - 1 ? "border-b border-border" : ""}`}>{row.synonyms ?? ""}</td>
                        <td className={`p-[6px_8px] ${i < preview.length - 1 ? "border-b border-border" : ""}`}>
                          {(() => {
                            const csvTags = row.tags ? row.tags.split(";").map((t) => t.trim()) : []
                            const rowIndex = rows.indexOf(row)
                            const dayTag = autoTag ? [`Day ${Math.floor(rowIndex / batchSize) + 1}`] : []
                            return [...new Set([...dayTag, ...csvTags])].join("; ") || ""
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Day 태그 자동 생성 옵션 */}
            <div className="border-b border-border">
              <div
                className="flex items-center justify-between py-3 cursor-pointer"
                onClick={() => setAutoTag(!autoTag)}
              >
                <div>
                  <div className="typo-body-md text-text-primary">Day 태그 자동 생성</div>
                  <div className="typo-mono-sm text-text-secondary">N개씩 묶어 Day 1, Day 2... 태그 부여</div>
                </div>
                <div className={`w-11 h-[26px] rounded-full relative transition-colors shrink-0 ${autoTag ? "bg-accent" : "bg-text-tertiary"}`}>
                  <div className={`w-5 h-5 rounded-full bg-white absolute top-[3px] transition-[left] ${autoTag ? "left-[22px]" : "left-[3px]"}`} />
                </div>
              </div>
              {autoTag && (
                <div className="flex items-center gap-2 pb-3">
                  <label className="typo-body-sm text-text-secondary shrink-0">묶음 크기</label>
                  <input
                    type="number"
                    min={1}
                    value={batchSize}
                    onChange={(e) => setBatchSize(Math.max(1, Number(e.target.value)))}
                    className="w-16 rounded-lg border border-border bg-bg-elevated px-2 py-1 typo-body-sm text-center text-text-primary"
                  />
                  <span className="typo-caption text-text-secondary">
                    → {Math.ceil(rows.length / batchSize)} Days 생성
                  </span>
                </div>
              )}
            </div>

            <p className="typo-caption text-text-secondary mt-3 mb-4">
              총 <strong className="text-text-primary">{rows.length}</strong>장의 카드가 감지되었습니다.
            </p>

            <Button className="w-full" onClick={handleImport} disabled={loading}>
              {loading ? "가져오는 중..." : `${rows.length}장 가져오기`}
            </Button>
          </>
        )}
      </div>
    </>
  )
}
