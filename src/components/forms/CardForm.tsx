import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { Tables } from "@/types/database.types"

export interface CardFormData {
  word: string
  meaning: string
  example: string
  pronunciation: string
  synonyms: string
  tags: string
}

const empty: CardFormData = {
  word: "",
  meaning: "",
  example: "",
  pronunciation: "",
  synonyms: "",
  tags: "",
}

interface CardFormProps {
  initialData?: Tables<"cards"> | null
  onSubmit?: (data: CardFormData) => void
  loading?: boolean
}

export default function CardForm({ initialData, onSubmit, loading }: CardFormProps) {
  const [form, setForm] = useState<CardFormData>(empty)

  useEffect(() => {
    if (initialData) {
      setForm({
        word: initialData.word,
        meaning: initialData.meaning,
        example: initialData.example ?? "",
        pronunciation: initialData.pronunciation ?? "",
        synonyms: initialData.synonyms?.join(", ") ?? "",
        tags: initialData.tags?.join(", ") ?? "",
      })
    } else {
      setForm(empty)
    }
  }, [initialData])

  const set = (field: keyof CardFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.word.trim() || !form.meaning.trim()) return
    onSubmit?.(form)
  }

  return (
    <form id="card-form" onSubmit={handleSubmit} className="px-7 pt-4">
      <div className="space-y-[10px]">
        <div>
          <Label>단어 *</Label>
          <Input
            placeholder="ubiquitous"
            className="font-display text-[16px] py-[14px]"
            value={form.word}
            onChange={set("word")}
            disabled={loading}
          />
        </div>
        <div>
          <Label>뜻 *</Label>
          <Input
            placeholder="어디에나 있는, 아주 흔한"
            value={form.meaning}
            onChange={set("meaning")}
            disabled={loading}
          />
        </div>
        <div>
          <Label>
            예문 <span className="opacity-40">(선택)</span>
          </Label>
          <Textarea
            placeholder="Smartphones have become ubiquitous in modern society."
            value={form.example}
            onChange={set("example")}
            disabled={loading}
          />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <Label>
              발음 <span className="opacity-40">(선택)</span>
            </Label>
            <Input
              placeholder="/juːˈbɪkwɪtəs/"
              value={form.pronunciation}
              onChange={set("pronunciation")}
              disabled={loading}
            />
          </div>
          <div className="flex-1">
            <Label>
              유의어 <span className="opacity-40">(선택)</span>
            </Label>
            <Input
              placeholder="쉼표로 구분"
              value={form.synonyms}
              onChange={set("synonyms")}
              disabled={loading}
            />
          </div>
        </div>
        <div>
          <Label>
            태그 <span className="opacity-40">(선택)</span>
          </Label>
          <Input
            placeholder="고급어휘"
            value={form.tags}
            onChange={set("tags")}
            disabled={loading}
          />
        </div>
      </div>
    </form>
  )
}
