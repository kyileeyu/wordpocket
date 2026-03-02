import { useState, useRef } from "react"
import { useParams, useNavigate } from "react-router"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import TopBar from "@/components/navigation/TopBar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { useExtractWords, type ExtractedWord } from "@/hooks/useExtractWords"

export default function PhotoImportPage() {
  const { id: deckId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [preview, setPreview] = useState<string | null>(null)
  const [words, setWords] = useState<ExtractedWord[]>([])
  const [saving, setSaving] = useState(false)

  const extract = useExtractWords()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setPreview(dataUrl)
      setWords([])
    }
    reader.readAsDataURL(file)
  }

  const handleExtract = () => {
    if (!preview) return
    // Strip "data:image/...;base64," prefix
    const base64 = preview.split(",")[1]
    extract.mutate(base64, {
      onSuccess: (data) => {
        if (data.length === 0) {
          toast.error("단어를 찾지 못했습니다. 다른 사진을 시도해보세요.")
        }
        setWords(data)
      },
      onError: () => {
        toast.error("단어 추출에 실패했습니다.")
      },
    })
  }

  const updateWord = (index: number, field: keyof ExtractedWord, value: string) => {
    setWords((prev) => prev.map((w, i) => (i === index ? { ...w, [field]: value } : w)))
  }

  const removeWord = (index: number) => {
    setWords((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!words.length || !deckId) return
    setSaving(true)
    try {
      const insertData = words.map((w) => ({
        deck_id: deckId,
        word: w.word,
        meaning: w.meaning,
        example: w.example || "",
        pronunciation: w.pronunciation || "",
        tags: [] as string[],
      }))

      const { error } = await supabase.from("cards").insert(insertData)
      if (error) throw error

      qc.invalidateQueries({ queryKey: ["cards", deckId] })
      qc.invalidateQueries({ queryKey: ["deck-progress"] })
      toast.success(`${words.length}장 카드 생성 완료`)
      navigate(-1)
    } catch {
      toast.error("카드 생성에 실패했습니다.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar left="back" title="사진으로 가져오기" />
      <div className="px-7 pt-7 pb-10">
        {/* File input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          variant="outline"
          className="w-full"
          onClick={() => fileRef.current?.click()}
        >
          사진 촬영 / 업로드
        </Button>

        {/* Image preview */}
        {preview && (
          <div className="mt-4">
            <img
              src={preview}
              alt="단어장 사진"
              className="w-full rounded-[10px] border border-border object-contain max-h-64"
            />
            <Button
              className="w-full mt-3"
              onClick={handleExtract}
              disabled={extract.isPending}
            >
              {extract.isPending ? "추출 중..." : "단어 추출하기"}
            </Button>
          </div>
        )}

        {/* Extracted words table */}
        {words.length > 0 && (
          <>
            <div className="mt-4">
              <Label>추출 결과 ({words.length}개)</Label>
              <div className="overflow-x-auto rounded-[10px] border border-border mt-1 mb-4">
                <table className="w-full typo-mono-sm">
                  <thead>
                    <tr>
                      <th className="typo-overline text-text-secondary text-left p-[6px_8px] border-b border-text-tertiary whitespace-nowrap">단어</th>
                      <th className="typo-overline text-text-secondary text-left p-[6px_8px] border-b border-text-tertiary whitespace-nowrap">뜻</th>
                      <th className="typo-overline text-text-secondary text-left p-[6px_8px] border-b border-text-tertiary whitespace-nowrap">예문</th>
                      <th className="typo-overline text-text-secondary text-left p-[6px_8px] border-b border-text-tertiary whitespace-nowrap">발음</th>
                      <th className="typo-overline text-text-secondary text-left p-[6px_8px] border-b border-text-tertiary whitespace-nowrap"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {words.map((w, i) => (
                      <tr key={i}>
                        <td className={`p-[4px_6px] ${i < words.length - 1 ? "border-b border-border" : ""}`}>
                          <input
                            className="w-full bg-transparent outline-none typo-mono-sm text-text-primary min-w-[60px]"
                            value={w.word}
                            onChange={(e) => updateWord(i, "word", e.target.value)}
                          />
                        </td>
                        <td className={`p-[4px_6px] ${i < words.length - 1 ? "border-b border-border" : ""}`}>
                          <input
                            className="w-full bg-transparent outline-none typo-mono-sm text-text-primary min-w-[60px]"
                            value={w.meaning}
                            onChange={(e) => updateWord(i, "meaning", e.target.value)}
                          />
                        </td>
                        <td className={`p-[4px_6px] ${i < words.length - 1 ? "border-b border-border" : ""}`}>
                          <input
                            className="w-full bg-transparent outline-none typo-mono-sm text-text-primary min-w-[80px]"
                            value={w.example}
                            onChange={(e) => updateWord(i, "example", e.target.value)}
                          />
                        </td>
                        <td className={`p-[4px_6px] ${i < words.length - 1 ? "border-b border-border" : ""}`}>
                          <input
                            className="w-full bg-transparent outline-none typo-mono-sm text-text-primary min-w-[60px]"
                            value={w.pronunciation}
                            onChange={(e) => updateWord(i, "pronunciation", e.target.value)}
                          />
                        </td>
                        <td className={`p-[4px_6px] ${i < words.length - 1 ? "border-b border-border" : ""}`}>
                          <button
                            className="text-danger typo-caption whitespace-nowrap"
                            onClick={() => removeWord(i)}
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Button className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? "저장 중..." : `${words.length}장 카드 생성`}
            </Button>
          </>
        )}
      </div>
    </>
  )
}
