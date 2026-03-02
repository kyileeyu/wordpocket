import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"

export function useStudyQueue(deckId: string) {
  return useQuery({
    queryKey: ["study-queue", deckId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_study_queue", {
        p_deck_id: deckId,
        p_limit: 100,
      })
      if (error) throw error
      return data
    },
    staleTime: 0,
  })
}

export function useAllCardsQueue(deckId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["all-cards-queue", deckId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cards")
        .select("id, word, meaning, pronunciation, example, synonyms, tags, card_states(status)")
        .eq("deck_id", deckId)
        .order("created_at", { ascending: true })
      if (error) throw error
      return data
        .filter((c) => {
          const status = (c.card_states as { status: string }[] | null)?.[0]?.status
          return status !== "review"
        })
        .map((c) => ({
          card_id: c.id,
          word: c.word,
          meaning: c.meaning,
          pronunciation: c.pronunciation,
          example: c.example,
          synonyms: c.synonyms,
          tags: c.tags,
          queue_type: "new" as const,
        }))
    },
    staleTime: 0,
    enabled,
  })
}

export function useSubmitReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      cardId,
      rating,
      reviewDuration,
    }: {
      cardId: string
      rating: string
      reviewDuration: number
    }) => {
      const { data, error } = await supabase.rpc("submit_review", {
        p_card_id: cardId,
        p_rating: rating,
        p_review_duration: reviewDuration,
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deck-progress"] })
      qc.invalidateQueries({ queryKey: ["today-stats"] })
    },
  })
}
