import { useState } from "react"
import { useParams, useNavigate } from "react-router"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import TopBar from "@/components/navigation/TopBar"
import { Button } from "@/components/ui/button"
import { CsvDropZone } from "@/components/forms"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

interface CsvRow {
  word: string
  meaning: string
  example?: string
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split("\n")
  if (lines.length < 2) return []

  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""))
    return { word: cols[0] ?? "", meaning: cols[1] ?? "", example: cols[2] }
  }).filter((r) => r.word && r.meaning)
}

export default function CsvImportPage() {
  const { id: deckId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [rows, setRows] = useState<CsvRow[]>([])
  const [loading, setLoading] = useState(false)

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
      const { error } = await supabase.functions.invoke("import-csv", {
        body: { deck_id: deckId, rows },
      })
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
      <div className="px-7 pt-4">
        <CsvDropZone onFileSelect={handleFileSelect} />

        {rows.length > 0 && (
          <>
            <div className="mt-4">
              <Label>미리보기 (처음 3행)</Label>
              <div className="overflow-hidden rounded-[10px] border border-border mt-1 mb-4">
                <table className="w-full typo-mono-sm">
                  <thead>
                    <tr>
                      <th className="typo-overline text-text-secondary text-left p-[6px_8px] border-b border-text-tertiary">단어</th>
                      <th className="typo-overline text-text-secondary text-left p-[6px_8px] border-b border-text-tertiary">뜻</th>
                      <th className="typo-overline text-text-secondary text-left p-[6px_8px] border-b border-text-tertiary">예문</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i}>
                        <td className={`p-[6px_8px] ${i < preview.length - 1 ? "border-b border-border" : ""}`}>{row.word}</td>
                        <td className={`p-[6px_8px] ${i < preview.length - 1 ? "border-b border-border" : ""}`}>{row.meaning}</td>
                        <td className={`p-[6px_8px] ${i < preview.length - 1 ? "border-b border-border" : ""}`}>{row.example ?? ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="typo-caption text-text-secondary mb-4">
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
