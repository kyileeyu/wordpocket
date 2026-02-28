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
