import { useState } from "react"
import { useParams, useNavigate } from "react-router"
import { toast } from "sonner"
import TopBar from "@/components/navigation/TopBar"
import CardForm from "@/components/forms/CardForm"
import type { CardFormData } from "@/components/forms/CardForm"
import { useCard, useCreateCard, useUpdateCard } from "@/hooks/useCards"

export default function CardFormPage() {
  const { id: deckId, cardId } = useParams<{ id: string; cardId: string }>()
  const navigate = useNavigate()
  const isEdit = !!cardId
  const { data: card } = useCard(cardId)
  const createCard = useCreateCard()
  const updateCard = useUpdateCard()
  const [key, setKey] = useState(0)

  const loading = createCard.isPending || updateCard.isPending

  const handleSubmit = (data: CardFormData) => {
    const tags = data.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
    const synonyms = data.synonyms
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    if (isEdit) {
      updateCard.mutate(
        {
          id: cardId!,
          deckId: deckId!,
          word: data.word,
          meaning: data.meaning,
          example: data.example || null,
          pronunciation: data.pronunciation || null,
          tags,
          synonyms,
        },
        {
          onSuccess: () => navigate(-1),
        },
      )
    } else {
      createCard.mutate(
        {
          deck_id: deckId!,
          word: data.word,
          meaning: data.meaning,
          example: data.example || null,
          pronunciation: data.pronunciation || null,
          tags,
          synonyms,
        },
        {
          onSuccess: () => {
            toast.success(`${data.word} 추가 완료`)
            setKey((k) => k + 1)
          },
        },
      )
    }
  }

  return (
    <>
      <TopBar
        left="close"
        title={isEdit ? "카드 편집" : "카드 추가"}
        right={
          <button
            type="submit"
            form="card-form"
            className="typo-caption text-accent font-semibold cursor-pointer"
            disabled={loading}
          >
            {loading ? "저장 중..." : "저장"}
          </button>
        }
      />
      <CardForm
        key={key}
        initialData={isEdit ? card : null}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </>
  )
}
