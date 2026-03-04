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
        .select("id, word, meaning, pronunciation, example, synonyms, tags, card_states(status, due_date, last_reviewed_at)")
        .eq("deck_id", deckId)
        .order("created_at", { ascending: true })
      if (error) throw error
      const STATUS_PRIORITY: Record<string, number> = { new: 0, learning: 1 }
      return data
        .filter((c) => {
          const status = (c.card_states as { status: string }[] | null)?.[0]?.status
          return status !== "review"
        })
        .sort((a, b) => {
          const stateA = (a.card_states as { status: string; due_date: string | null }[] | null)?.[0]
          const stateB = (b.card_states as { status: string; due_date: string | null }[] | null)?.[0]
          const sp = (STATUS_PRIORITY[stateA?.status ?? "new"] ?? 0) - (STATUS_PRIORITY[stateB?.status ?? "new"] ?? 0)
          if (sp !== 0) return sp
          const da = stateA?.due_date ? new Date(stateA.due_date).getTime() : Infinity
          const db = stateB?.due_date ? new Date(stateB.due_date).getTime() : Infinity
          return da - db
        })
        .map((c) => {
          const state = (c.card_states as { status: string; due_date: string | null; last_reviewed_at: string | null }[] | null)?.[0]
          return {
            card_id: c.id,
            word: c.word,
            meaning: c.meaning,
            pronunciation: c.pronunciation,
            example: c.example,
            synonyms: c.synonyms,
            tags: c.tags,
            queue_type: "new" as const,
            last_reviewed_at: state?.last_reviewed_at ?? null,
          }
        })
    },
    staleTime: 0,
    enabled,
  })
}

export function useReviewOnlyQueue(deckId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["review-only-queue", deckId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_study_queue", {
        p_deck_id: deckId,
        p_limit: 100,
      })
      if (error) throw error
      const now = new Date()
      return (data ?? []).filter(
        (c: { queue_type: string; due_date: string | null }) =>
          c.queue_type !== "new" && (!c.due_date || new Date(c.due_date) <= now)
      )
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
