import { useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import TopBar from "@/components/navigation/TopBar"
import { Button } from "@/components/ui/button"
import { CsvDropZone } from "@/components/forms"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { parseCsv, type CsvRow } from "@/lib/csvParser"
import { useAuthStore } from "@/stores/authStore"

export default function FolderCsvImportPage() {
  const { id: folderId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [rows, setRows] = useState<CsvRow[]>([])
  const [loading, setLoading] = useState(false)

  const hasDeckColumn = useMemo(() => rows.some((r) => r.deck), [rows])

  const deckGroups = useMemo(() => {
    const groups = new Map<string, CsvRow[]>()
    rows.forEach((row) => {
      const deckName = row.deck?.trim() || "기본"
      if (!groups.has(deckName)) groups.set(deckName, [])
      groups.get(deckName)!.push(row)
    })
    return groups
  }, [rows])

  const handleFileSelect = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setRows(parseCsv(text))
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!rows.length || !folderId) return
    setLoading(true)
    try {
      const userId = useAuthStore.getState().user!.id

      for (const [deckName, deckRows] of deckGroups) {
        const { data: deck, error: deckErr } = await supabase
          .from("decks")
          .insert({ user_id: userId, folder_id: folderId, name: deckName })
          .select("id")
          .single()
        if (deckErr) throw deckErr

        const cardData = deckRows.map((row) => ({
          deck_id: deck.id,
          word: row.word,
          meaning: row.meaning,
          example: row.example || "",
          pronunciation: row.pronunciation || "",
          tags: row.tags ? row.tags.split(";").map((t) => t.trim()) : [],
        }))
        const { error: cardErr } = await supabase.from("cards").insert(cardData)
        if (cardErr) throw cardErr
      }

      qc.invalidateQueries({ queryKey: ["decks", folderId] })
      qc.invalidateQueries({ queryKey: ["deck-progress"] })
      toast.success(`${deckGroups.size}개 카드뭉치, ${rows.length}장 가져오기 완료`)
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
                      {hasDeckColumn && (
                        <th className="typo-overline text-text-secondary text-left p-[6px_8px] border-b border-text-tertiary whitespace-nowrap">카드뭉치</th>
                      )}
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
                        {hasDeckColumn && (
                          <td className={`p-[6px_8px] ${i < preview.length - 1 ? "border-b border-border" : ""}`}>{row.deck ?? ""}</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 덱 생성 예고 */}
            <div className="rounded-[10px] bg-bg-elevated p-3 mb-4">
              <div className="typo-body-sm text-text-primary font-medium mb-1">
                {deckGroups.size}개 카드뭉치 생성 예정
              </div>
              {!hasDeckColumn && (
                <p className="typo-caption text-text-secondary mb-2">
                  deck 컬럼이 없습니다. 모든 카드가 "기본" 카드뭉치에 추가됩니다.
                </p>
              )}
              <div className="flex flex-wrap gap-[6px]">
                {Array.from(deckGroups).map(([name, group]) => (
                  <span
                    key={name}
                    className="typo-caption text-text-secondary bg-bg-subtle rounded-full px-2 py-[2px]"
                  >
                    {name} ({group.length}장)
                  </span>
                ))}
              </div>
            </div>

            <p className="typo-caption text-text-secondary mb-4">
              총 <strong className="text-text-primary">{rows.length}</strong>장의 카드가 감지되었습니다.
            </p>

            <Button className="w-full" onClick={handleImport} disabled={loading}>
              {loading ? "가져오는 중..." : `${deckGroups.size}개 카드뭉치, ${rows.length}장 가져오기`}
            </Button>
          </>
        )}
      </div>
    </>
  )
}
