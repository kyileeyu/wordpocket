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
  pronunciation?: string
  tags?: string
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"'
        i++
      } else if (char === '"') {
        inQuotes = false
      } else {
        current += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ",") {
        result.push(current)
        current = ""
      } else {
        current += char
      }
    }
  }
  result.push(current)
  return result
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split("\n")
  if (lines.length < 2) return []

  const header = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase())

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line)
    const row: Record<string, string> = {}
    header.forEach((h, idx) => {
      row[h] = values[idx]?.trim() ?? ""
    })
    return {
      word: row.word ?? "",
      meaning: row.meaning ?? "",
      example: row.example || undefined,
      pronunciation: row.pronunciation || undefined,
      tags: row.tags || undefined,
    }
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
      const insertData = rows.map((row) => ({
        deck_id: deckId,
        word: row.word,
        meaning: row.meaning,
        example: row.example || "",
        pronunciation: row.pronunciation || "",
        tags: row.tags ? row.tags.split(";").map((t) => t.trim()) : [],
      }))

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
                        <td className={`p-[6px_8px] ${i < preview.length - 1 ? "border-b border-border" : ""}`}>{row.tags ?? ""}</td>
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
