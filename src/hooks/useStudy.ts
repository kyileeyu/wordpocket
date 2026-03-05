import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRef, useCallback } from "react"
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

export function useReviewOnlyQueue(deckId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["review-only-queue", deckId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_study_queue", {
        p_deck_id: deckId,
        p_limit: 100,
      })
      if (error) throw error
      return (data ?? []).filter(
        (c: { queue_type: string }) => c.queue_type !== "new"
      )
    },
    staleTime: 0,
    enabled,
  })
}

interface ReviewEntry {
  card_id: string
  rating: string
  review_duration: number
}

export function useReviewBatch() {
  const qc = useQueryClient()
  const reviewsRef = useRef<ReviewEntry[]>([])
  const pendingCountRef = useRef(0)

  const addReview = useCallback(
    (cardId: string, rating: string, duration: number) => {
      reviewsRef.current.push({
        card_id: cardId,
        rating,
        review_duration: duration,
      })
      pendingCountRef.current = reviewsRef.current.length
    },
    [],
  )

  const flush = useCallback(async () => {
    const reviews = reviewsRef.current
    if (reviews.length === 0) return

    reviewsRef.current = []
    pendingCountRef.current = 0

    const { error } = await supabase.rpc("submit_reviews_batch", {
      p_reviews: reviews as unknown as string,
    })
    if (error) throw error

    qc.invalidateQueries({ queryKey: ["deck-progress"] })
    qc.invalidateQueries({ queryKey: ["today-stats"] })
  }, [qc])

  const getPendingCount = useCallback(() => pendingCountRef.current, [])

  return { addReview, flush, getPendingCount }
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
